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
    [HttpGet("donation-trends")]
    public async Task<ActionResult<List<DonationTrendDto>>> GetDonationTrends()
    {
        var donations = await db.Donations
            .Where(d => d.DonationDate != null)
            .Select(d => new { d.DonationDate!.Value.Year, d.DonationDate!.Value.Month, d.Amount })
            .ToListAsync();

        var trends = donations
            .GroupBy(d => new { d.Year, d.Month })
            .Select(g => new DonationTrendDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(d => d.Amount ?? 0),
                g.Count()
            ))
            .OrderBy(t => t.Month)
            .ToList();

        return Ok(trends);
    }

    [HttpGet("resident-outcomes")]
    public async Task<ActionResult<List<ResidentOutcomeDto>>> GetResidentOutcomes()
    {
        var residents = await db.Residents
            .Where(r => r.ReintegrationStatus != null)
            .Select(r => r.ReintegrationStatus!)
            .ToListAsync();

        var outcomes = residents
            .GroupBy(s => s)
            .Select(g => new ResidentOutcomeDto(g.Key, g.Count()))
            .OrderByDescending(o => o.Count)
            .ToList();

        return Ok(outcomes);
    }

    [HttpGet("safehouse-comparison")]
    public async Task<ActionResult<List<SafehouseComparisonDto>>> GetSafehouseComparison()
    {
        var safehouses = await db.Safehouses
            .Include(s => s.Residents)
            .Include(s => s.MonthlyMetrics)
            .ToListAsync();

        var comparisons = safehouses.Select(s =>
        {
            var healthScores = s.MonthlyMetrics
                .Where(m => m.AvgHealthScore != null)
                .Select(m => (double)m.AvgHealthScore!.Value)
                .ToList();

            var eduProgress = s.MonthlyMetrics
                .Where(m => m.AvgEducationProgress != null)
                .Select(m => (double)m.AvgEducationProgress!.Value)
                .ToList();

            var incidents = s.MonthlyMetrics
                .Where(m => m.IncidentCount != null)
                .Sum(m => m.IncidentCount!.Value);

            return new SafehouseComparisonDto(
                s.SafehouseId,
                s.Name ?? "Unknown",
                s.Residents.Count,
                healthScores.Count > 0 ? (decimal)healthScores.Average() : 0m,
                eduProgress.Count > 0 ? (decimal)eduProgress.Average() : 0m,
                incidents
            );
        })
        .OrderByDescending(c => c.ResidentCount)
        .ToList();

        return Ok(comparisons);
    }

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

        var foundIds = predictions.Select(p => p.SupporterId).ToHashSet();
        foreach (var id in request.SupporterIds.Where(id => !foundIds.Contains(id)))
        {
            predictions.Add(new ChurnPredictionDto(id, "Unknown", 0));
        }

        return Ok(predictions);
    }
}
