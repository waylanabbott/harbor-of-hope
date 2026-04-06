using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class ReportsController(AppDbContext db) : ControllerBase
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
                g.Sum(d => d.Amount ?? 0),
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
    /// Returns pre-computed churn predictions from the predictions table (DONR-06).
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

        var predictions = await db.DonorChurnPredictions
            .Where(p => request.SupporterIds.Contains(p.SupporterId))
            .Select(p => new ChurnPredictionDto(
                p.SupporterId,
                p.ChurnRiskLevel ?? "Unknown",
                p.ChurnProbability
            ))
            .ToListAsync();

        // For supporters without predictions, return "Unknown"
        var foundIds = predictions.Select(p => p.SupporterId).ToHashSet();
        foreach (var id in request.SupporterIds.Where(id => !foundIds.Contains(id)))
        {
            predictions.Add(new ChurnPredictionDto(id, "Unknown", 0));
        }

        return Ok(predictions);
    }
}
