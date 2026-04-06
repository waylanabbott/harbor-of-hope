using System.Text.Json;
using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicController(AppDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<PublicStatsDto>> GetPublicStats()
    {
        var totalResidents = await db.Residents.CountAsync();

        decimal totalDonations;
        try
        {
            totalDonations = await db.Donations.SumAsync(d => d.Amount ?? 0);
        }
        catch
        {
            totalDonations = 0;
        }

        var successfulReintegrations = await db.Residents
            .CountAsync(r => r.ReintegrationStatus == "Completed");

        var reintegrationRate = totalResidents > 0
            ? Math.Round((double)successfulReintegrations / totalResidents * 100, 1)
            : 0;

        return Ok(new PublicStatsDto
        {
            TotalResidentsServed = totalResidents,
            TotalDonationsReceived = totalDonations,
            SuccessfulReintegrations = successfulReintegrations,
            ReintegrationRate = reintegrationRate
        });
    }

    [HttpGet("impact")]
    public async Task<ActionResult<List<PublicImpactSnapshotDto>>> GetImpactSnapshots()
    {
        var snapshots = await db.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .ToListAsync();

        var result = snapshots.Select(s =>
        {
            var dto = new PublicImpactSnapshotDto
            {
                SnapshotDate = s.SnapshotDate,
                Headline = s.Headline,
                SummaryText = s.SummaryText
            };

            if (!string.IsNullOrWhiteSpace(s.MetricPayloadJson))
            {
                try
                {
                    // Python dict format uses single quotes -- replace with double quotes for JSON parsing
                    var jsonStr = s.MetricPayloadJson.Replace("'", "\"");
                    var metrics = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonStr);

                    if (metrics != null)
                    {
                        if (metrics.TryGetValue("month", out var month))
                            dto.Month = month.GetString();

                        if (metrics.TryGetValue("avg_health_score", out var health))
                            dto.AvgHealthScore = health.TryGetDouble(out var hv) ? hv : null;

                        if (metrics.TryGetValue("education_progress", out var edu))
                            dto.EducationProgress = edu.TryGetDouble(out var ev) ? ev : null;

                        if (metrics.TryGetValue("total_residents", out var residents))
                            dto.TotalResidents = residents.TryGetInt32(out var rv) ? rv : null;

                        if (metrics.TryGetValue("donations_total", out var donations))
                            dto.DonationsTotal = donations.TryGetDecimal(out var dv) ? dv : null;
                    }
                }
                catch
                {
                    // Parsing failed -- return nulls for parsed fields but keep Headline/SummaryText/SnapshotDate
                }
            }

            return dto;
        }).ToList();

        return Ok(result);
    }
}
