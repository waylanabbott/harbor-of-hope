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
    /// Returns all donor churn predictions.
    /// </summary>
    [HttpGet("churn")]
    public async Task<ActionResult<List<DonorChurnPrediction>>> GetChurnPredictions()
    {
        var predictions = await db.DonorChurnPredictions
            .OrderByDescending(p => p.ChurnProbability)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/social-media
    /// Returns social media engagement predictions.
    /// </summary>
    [HttpGet("social-media")]
    public async Task<ActionResult<List<SocialMediaPrediction>>> GetSocialMediaPredictions()
    {
        var predictions = await db.SocialMediaPredictions
            .OrderByDescending(p => p.PredictedEngagementRate)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/reintegration
    /// Returns reintegration readiness predictions.
    /// </summary>
    [HttpGet("reintegration")]
    public async Task<ActionResult<List<ReintegrationPrediction>>> GetReintegrationPredictions()
    {
        var predictions = await db.ReintegrationPredictions
            .OrderByDescending(p => p.ReadinessProbability)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/counseling
    /// Returns counseling effectiveness predictions.
    /// </summary>
    [HttpGet("counseling")]
    public async Task<ActionResult<List<CounselingPrediction>>> GetCounselingPredictions()
    {
        var predictions = await db.CounselingPredictions
            .OrderByDescending(p => p.PredictedImprovement)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/incident-risk
    /// Returns incident risk predictions for residents.
    /// </summary>
    [HttpGet("incident-risk")]
    public async Task<ActionResult<List<IncidentRiskPrediction>>> GetIncidentRiskPredictions()
    {
        var predictions = await db.IncidentRiskPredictions
            .OrderByDescending(p => p.RiskProbability)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/education
    /// Returns education outcome predictions.
    /// </summary>
    [HttpGet("education")]
    public async Task<ActionResult<List<EducationPrediction>>> GetEducationPredictions()
    {
        var predictions = await db.EducationPredictions
            .OrderByDescending(p => p.CompletionProbability)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/donation-forecast
    /// Returns donation forecast predictions.
    /// </summary>
    [HttpGet("donation-forecast")]
    public async Task<ActionResult<List<DonationForecastPrediction>>> GetDonationForecastPredictions()
    {
        var predictions = await db.DonationForecastPredictions
            .OrderBy(p => p.YearMonth)
            .ToListAsync();
        return Ok(predictions);
    }

    /// <summary>
    /// GET /api/predictions/safehouse
    /// Returns safehouse outcome predictions.
    /// </summary>
    [HttpGet("safehouse")]
    public async Task<ActionResult<List<SafehousePrediction>>> GetSafehousePredictions()
    {
        var predictions = await db.SafehousePredictions
            .OrderByDescending(p => p.PredictedHealthScore)
            .ToListAsync();
        return Ok(predictions);
    }
}
