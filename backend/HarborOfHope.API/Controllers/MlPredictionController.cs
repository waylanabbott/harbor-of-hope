using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using HarborOfHope.API.Services;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class MlPredictionController(MlPredictionService mlService) : ControllerBase
{
    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        var health = await mlService.GetHealthAsync();
        if (health == null)
            return StatusCode(503, new { error = "ML API unavailable" });
        return Ok(health);
    }

    [HttpPost("predict/{modelName}")]
    public async Task<IActionResult> Predict(string modelName, [FromBody] MlPredictionRequest request)
    {
        var result = await mlService.PredictAsync(modelName, request.Features);
        if (result == null)
            return StatusCode(503, new { error = $"ML prediction failed for {modelName}" });
        return Ok(result);
    }
}
