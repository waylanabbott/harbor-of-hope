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
        var predictions = await (
            from p in db.DonorChurnPredictions
            join s in db.Supporters on p.SupporterId equals s.SupporterId into sj
            from s in sj.DefaultIfEmpty()
            orderby p.ChurnProbability descending
            select new
            {
                p.Id,
                p.SupporterId,
                supporterName = s != null
                    ? (s.DisplayName ?? ((s.FirstName ?? "") + " " + (s.LastName ?? "")).Trim())
                    : "Unknown",
                supporterType = s != null ? s.SupporterType : null,
                email = s != null ? s.Email : null,
                p.ChurnProbability,
                p.ChurnPrediction,
                p.ChurnRiskLevel,
                p.PredictionTimestamp,
            }
        ).ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/incident-risk
    /// Returns incident risk predictions enriched with resident info.
    /// </summary>
    [HttpGet("incident-risk")]
    public async Task<IActionResult> GetIncidentRiskPredictions()
    {
        var predictions = await (
            from p in db.IncidentRiskPredictions
            join r in db.Residents on p.ResidentId equals r.ResidentId into rj
            from r in rj.DefaultIfEmpty()
            join sh in db.Safehouses on (r != null ? r.SafehouseId : 0) equals sh.SafehouseId into shj
            from sh in shj.DefaultIfEmpty()
            orderby p.RiskProbability descending
            select new
            {
                p.Id,
                p.ResidentId,
                residentCode = r != null ? (r.InternalCode ?? r.CaseControlNo ?? ("R-" + r.ResidentId)) : "Unknown",
                safehouseName = sh != null ? sh.Name : null,
                caseStatus = r != null ? r.CaseStatus : null,
                p.RiskProbability,
                p.RiskPrediction,
                p.RiskLevel,
                p.PredictionTimestamp,
            }
        ).ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/campaign
    /// Returns campaign donation predictions joined with social media post features.
    /// </summary>
    [HttpGet("campaign")]
    public async Task<IActionResult> GetCampaignPredictions()
    {
        var predictions = await (
            from cp in db.CampaignPredictions
            join sp in db.SocialMediaPosts on cp.PostId equals sp.PostId into spj
            from sp in spj.DefaultIfEmpty()
            orderby cp.PredictedDonationValuePhp descending
            select new
            {
                cp.Id,
                cp.PostId,
                cp.Platform,
                cp.CampaignName,
                cp.PostType,
                cp.EstimatedDonationValuePhp,
                cp.PredictedDonationValuePhp,
                cp.PredictionErrorPhp,
                // Post features for interactive filtering
                hasCallToAction = sp != null && sp.HasCallToAction,
                featuresResidentStory = sp != null && sp.FeaturesResidentStory,
                isBoosted = sp != null && sp.IsBoosted,
                boostBudgetPhp = sp != null ? sp.BoostBudgetPhp : 0m,
                mediaType = sp != null ? sp.MediaType : null,
                contentTopic = sp != null ? sp.ContentTopic : null,
                cp.PredictionTimestamp,
            }
        ).ToListAsync();
        return Ok(predictions);
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
