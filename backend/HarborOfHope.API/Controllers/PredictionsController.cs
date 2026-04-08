using HarborOfHope.API.Data;
using HarborOfHope.API.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

/// <summary>
/// Serves pre-computed ML predictions from PostgreSQL tables.
/// Predictions are generated offline by Python scripts in jobs/.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class PredictionsController(AppDbContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/predictions/churn
    /// Returns donor churn predictions enriched with supporter info.
    /// </summary>
    [HttpGet("churn")]
    public async Task<IActionResult> GetChurnPredictions()
    {
        var predictions = await db.DonorChurnPredictions
            .OrderByDescending(p => p.ChurnProbability)
            .ToListAsync();

        var supporterIds = predictions.Select(p => p.SupporterId).Distinct().ToList();
        var supporters = await db.Supporters
            .Where(s => supporterIds.Contains(s.SupporterId))
            .ToDictionaryAsync(s => s.SupporterId);

        var result = predictions.Select(p =>
        {
            supporters.TryGetValue(p.SupporterId, out var s);
            var name = s?.DisplayName
                ?? $"{s?.FirstName} {s?.LastName}".Trim()
                ?? "Unknown";
            if (string.IsNullOrWhiteSpace(name)) name = "Unknown";

            return new
            {
                p.Id,
                p.SupporterId,
                supporterName = name,
                supporterType = s?.SupporterType,
                email = s?.Email,
                p.ChurnProbability,
                p.ChurnPrediction,
                p.ChurnRiskLevel,
                p.PredictionTimestamp,
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// GET /api/predictions/incident-risk
    /// Returns incident risk predictions enriched with resident info.
    /// </summary>
    [HttpGet("incident-risk")]
    public async Task<IActionResult> GetIncidentRiskPredictions()
    {
        var predictions = await db.IncidentRiskPredictions
            .OrderByDescending(p => p.RiskProbability)
            .ToListAsync();

        var residentIds = predictions.Select(p => p.ResidentId).Distinct().ToList();
        var residents = await db.Residents
            .Where(r => residentIds.Contains(r.ResidentId))
            .ToDictionaryAsync(r => r.ResidentId);

        var safehouseIds = residents.Values.Select(r => r.SafehouseId).Distinct().ToList();
        var safehouses = await db.Safehouses
            .Where(s => safehouseIds.Contains(s.SafehouseId))
            .ToDictionaryAsync(s => s.SafehouseId);

        var result = predictions.Select(p =>
        {
            residents.TryGetValue(p.ResidentId, out var r);
            safehouses.TryGetValue(r?.SafehouseId ?? 0, out var sh);

            return new
            {
                p.Id,
                p.ResidentId,
                residentCode = r?.InternalCode ?? r?.CaseControlNo ?? $"R-{p.ResidentId}",
                safehouseName = sh?.Name,
                caseStatus = r?.CaseStatus,
                p.RiskProbability,
                p.RiskPrediction,
                p.RiskLevel,
                p.PredictionTimestamp,
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// GET /api/predictions/campaign
    /// Returns campaign donation predictions joined with social media post features.
    /// </summary>
    [HttpGet("campaign")]
    public async Task<IActionResult> GetCampaignPredictions()
    {
        var predictions = await db.CampaignPredictions
            .OrderByDescending(cp => cp.PredictedDonationValuePhp)
            .ToListAsync();

        var postIds = predictions.Select(cp => cp.PostId).Distinct().ToList();
        var posts = await db.SocialMediaPosts
            .Where(sp => postIds.Contains(sp.PostId))
            .ToDictionaryAsync(sp => sp.PostId);

        var result = predictions.Select(cp =>
        {
            posts.TryGetValue(cp.PostId, out var sp);

            return new
            {
                cp.Id,
                cp.PostId,
                cp.Platform,
                cp.CampaignName,
                cp.PostType,
                cp.EstimatedDonationValuePhp,
                cp.PredictedDonationValuePhp,
                cp.PredictionErrorPhp,
                hasCallToAction = sp?.HasCallToAction ?? false,
                featuresResidentStory = sp?.FeaturesResidentStory ?? false,
                isBoosted = sp?.IsBoosted ?? false,
                boostBudgetPhp = sp?.BoostBudgetPhp ?? 0m,
                mediaType = sp?.MediaType,
                contentTopic = sp?.ContentTopic,
                cp.PredictionTimestamp,
            };
        });

        return Ok(result);
    }

    // --- Legacy endpoints (still used by SupportersPage batch lookup) ---

    [HttpGet("social-media")]
    public async Task<ActionResult<List<SocialMediaPrediction>>> GetSocialMediaPredictions()
    {
        var predictions = await db.SocialMediaPredictions
            .OrderByDescending(p => p.PredictedEngagementRate)
            .ToListAsync();
        return Ok(predictions);
    }

    [HttpGet("reintegration")]
    public async Task<ActionResult<List<ReintegrationPrediction>>> GetReintegrationPredictions()
    {
        var predictions = await db.ReintegrationPredictions
            .OrderByDescending(p => p.ReadinessProbability)
            .ToListAsync();
        return Ok(predictions);
    }

    [HttpGet("counseling")]
    public async Task<ActionResult<List<CounselingPrediction>>> GetCounselingPredictions()
    {
        var predictions = await db.CounselingPredictions
            .OrderByDescending(p => p.PredictedImprovement)
            .ToListAsync();
        return Ok(predictions);
    }

    [HttpGet("education")]
    public async Task<ActionResult<List<EducationPrediction>>> GetEducationPredictions()
    {
        var predictions = await db.EducationPredictions
            .OrderByDescending(p => p.CompletionProbability)
            .ToListAsync();
        return Ok(predictions);
    }

    [HttpGet("donation-forecast")]
    public async Task<ActionResult<List<DonationForecastPrediction>>> GetDonationForecastPredictions()
    {
        var predictions = await db.DonationForecastPredictions
            .OrderBy(p => p.YearMonth)
            .ToListAsync();
        return Ok(predictions);
    }

    [HttpGet("safehouse")]
    public async Task<ActionResult<List<SafehousePrediction>>> GetSafehousePredictions()
    {
        var predictions = await db.SafehousePredictions
            .OrderByDescending(p => p.PredictedHealthScore)
            .ToListAsync();
        return Ok(predictions);
    }
}
