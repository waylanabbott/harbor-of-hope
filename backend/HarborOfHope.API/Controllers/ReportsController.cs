using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using HarborOfHope.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class ReportsController(AppDbContext db, MlPredictionService mlService) : ControllerBase
{
    /// <summary>
    /// GET /api/reports/donation-trends
    /// Returns monthly donation amounts sorted chronologically (RPT-01).
    /// </summary>
    [HttpGet("donation-trends")]
    public async Task<ActionResult<List<DonationTrendDto>>> GetDonationTrends()
    {
        var trends = await db.Donations
            .Where(d => d.DonationDate != null)
            .GroupBy(d => new { d.DonationDate!.Value.Year, d.DonationDate!.Value.Month })
            .Select(g => new DonationTrendDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(d => d.Amount),
                g.Count()
            ))
            .OrderBy(t => t.Month)
            .ToListAsync();

        return Ok(trends);
    }

    /// <summary>
    /// GET /api/reports/resident-outcomes
    /// Returns reintegration status counts grouped by status (RPT-02).
    /// </summary>
    [HttpGet("resident-outcomes")]
    public async Task<ActionResult<List<ResidentOutcomeDto>>> GetResidentOutcomes()
    {
        var outcomes = await db.Residents
            .Where(r => r.ReintegrationStatus != null)
            .GroupBy(r => r.ReintegrationStatus!)
            .Select(g => new ResidentOutcomeDto(g.Key, g.Count()))
            .OrderByDescending(o => o.Count)
            .ToListAsync();

        return Ok(outcomes);
    }

    /// <summary>
    /// GET /api/reports/safehouse-comparison
    /// Returns per-safehouse metrics (RPT-03).
    /// </summary>
    [HttpGet("safehouse-comparison")]
    public async Task<ActionResult<List<SafehouseComparisonDto>>> GetSafehouseComparison()
    {
        var comparisons = await db.Safehouses
            .Include(s => s.Residents)
            .Include(s => s.MonthlyMetrics)
            .Select(s => new SafehouseComparisonDto(
                s.SafehouseId,
                s.Name ?? "Unknown",
                s.Residents.Count,
                s.MonthlyMetrics.Any(m => m.AvgHealthScore != null)
                    ? (decimal)s.MonthlyMetrics.Where(m => m.AvgHealthScore != null).Average(m => (double)m.AvgHealthScore!.Value)
                    : 0m,
                s.MonthlyMetrics.Any(m => m.AvgEducationProgress != null)
                    ? (decimal)s.MonthlyMetrics.Where(m => m.AvgEducationProgress != null).Average(m => (double)m.AvgEducationProgress!.Value)
                    : 0m,
                s.MonthlyMetrics.Any(m => m.IncidentCount != null)
                    ? s.MonthlyMetrics.Where(m => m.IncidentCount != null).Sum(m => m.IncidentCount!.Value)
                    : 0
            ))
            .OrderByDescending(c => c.ResidentCount)
            .ToListAsync();

        return Ok(comparisons);
    }

    /// <summary>
    /// POST /api/reports/batch-churn
    /// Accepts supporter IDs and returns churn risk levels from ML API (DONR-06).
    /// Max 100 supporters per request.
    /// </summary>
    [HttpPost("batch-churn")]
    public async Task<ActionResult<List<ChurnPredictionDto>>> GetBatchChurnPredictions(
        [FromBody] BatchChurnRequest request)
    {
        if (request.SupporterIds == null || request.SupporterIds.Count == 0)
            return BadRequest("At least one supporter ID is required.");

        if (request.SupporterIds.Count > 100)
            return BadRequest("Maximum 100 supporter IDs per request.");

        // Bulk-load all supporters and their monetary donations to avoid N+1
        var supporterIds = request.SupporterIds;

        var supporters = await db.Supporters
            .Where(s => supporterIds.Contains(s.SupporterId))
            .ToDictionaryAsync(s => s.SupporterId);

        var allDonations = await db.Donations
            .Where(d => supporterIds.Contains(d.SupporterId) && d.DonationType == "Monetary")
            .ToListAsync();

        var donationsBySupporter = allDonations
            .GroupBy(d => d.SupporterId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Compute reference date from all monetary donations
        var referenceDate = allDonations
            .Where(d => d.DonationDate != null)
            .Select(d => d.DonationDate!.Value)
            .DefaultIfEmpty(DateTime.UtcNow)
            .Max();

        var predictions = new List<ChurnPredictionDto>();

        // Call ML API sequentially (Flask is single-threaded)
        foreach (var id in supporterIds)
        {
            supporters.TryGetValue(id, out var supporter);
            donationsBySupporter.TryGetValue(id, out var donations);

            var monetaryDonations = donations ?? new List<Data.Entities.Donation>();
            var datesPresent = monetaryDonations.Where(d => d.DonationDate != null).ToList();

            // Compute RFM features
            double recency = datesPresent.Count > 0
                ? (referenceDate - datesPresent.Max(d => d.DonationDate!.Value)).TotalDays
                : 9999;
            int frequency = monetaryDonations.Count;
            double monetaryTotal = (double)monetaryDonations.Sum(d => d.Amount);
            double monetaryAvg = monetaryDonations.Count > 0
                ? (double)monetaryDonations.Average(d => d.Amount)
                : 0;
            double monetaryStd = ComputeStdDev(monetaryDonations.Select(d => (double)d.Amount).ToList());
            double tenureDays = datesPresent.Count > 0
                ? (referenceDate - datesPresent.Min(d => d.DonationDate!.Value)).TotalDays
                : 0;

            var features = new Dictionary<string, object>
            {
                ["recency"] = recency,
                ["frequency"] = frequency,
                ["monetary_total"] = monetaryTotal,
                ["monetary_avg"] = monetaryAvg,
                ["monetary_std"] = monetaryStd,
                ["tenure_days"] = tenureDays,
                ["supporter_type"] = (object)(supporter?.SupporterType ?? "Unknown"),
                ["acquisition_channel"] = (object)(supporter?.AcquisitionChannel ?? "Unknown"),
                ["region"] = (object)(supporter?.Region ?? "Unknown")
            };

            var result = await mlService.PredictAsync("donor-churn", features);

            if (result == null)
            {
                predictions.Add(new ChurnPredictionDto(id, "Unknown", 0));
            }
            else
            {
                var riskLevel = result.RiskLevel ?? "Unknown";
                var churnProb = result.Probabilities is { Count: > 0 } && result.Probabilities[0].Count > 1
                    ? result.Probabilities[0][1]
                    : 0;
                predictions.Add(new ChurnPredictionDto(id, riskLevel, churnProb));
            }
        }

        return Ok(predictions);
    }

    /// <summary>
    /// Compute population standard deviation for a list of values.
    /// Returns 0 if fewer than 2 values.
    /// </summary>
    private static double ComputeStdDev(List<double> values)
    {
        if (values.Count < 2) return 0;
        var avg = values.Average();
        var sumSquares = values.Sum(v => (v - avg) * (v - avg));
        return Math.Sqrt(sumSquares / values.Count);
    }
}
