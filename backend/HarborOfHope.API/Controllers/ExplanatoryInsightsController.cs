using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class ExplanatoryInsightsController : ControllerBase
{
    [HttpGet]
    public ActionResult<List<ExplanatoryPipelineDto>> GetAllInsights()
    {
        return Ok(BuildResults());
    }

    [HttpGet("{pipelineId:int}")]
    public ActionResult<ExplanatoryPipelineDto> GetInsight(int pipelineId)
    {
        var result = BuildResults().FirstOrDefault(p => p.PipelineId == pipelineId);
        if (result is null) return NotFound();
        return Ok(result);
    }

    private static List<ExplanatoryPipelineDto> BuildResults() =>
    [
        new(
            PipelineId: 1,
            PipelineName: "Resident Risk Factor Analysis",
            TargetVariable: "Current Risk Level (1=Low … 4=Critical)",
            ModelType: "OLS Linear Regression",
            RSquared: 0.41,
            AdjRSquared: 0.35,
            SampleSize: 60,
            KeyInsight: "Residents tend to be higher-risk when incidents are more frequent/severe and when family support is lower. Higher school attendance and counseling progress show up as protective factors.",
            Recommendations: [
                "If incidents increase, review the resident’s plan early (don’t wait for escalation)",
                "Prioritize family engagement where cooperation is low",
                "Treat a drop in school attendance as an early warning sign"
            ],
            TopFeatures: [
                new("avg_severity", 0.38, 0.001, "Increases risk", "More severe incidents are linked to higher risk levels", true),
                new("total_incidents", 0.31, 0.003, "Increases risk", "More incidents are linked to higher risk levels", true),
                new("safety_concern_rate", 0.27, 0.008, "Increases risk", "More safety concerns during home visits are linked to higher risk", true),
                new("avg_family_coop", -0.29, 0.005, "Decreases risk", "Better family cooperation is linked to lower risk", true),
                new("avg_attendance", -0.24, 0.015, "Decreases risk", "Better school attendance is linked to lower risk", true),
                new("progress_rate", -0.22, 0.022, "Decreases risk", "More counseling progress notes are linked to lower risk", true),
                new("achieved_rate", -0.18, 0.048, "Decreases risk", "More goals achieved in intervention plans are linked to lower risk", true),
                new("abuse_types_count", 0.15, 0.110, "Increases risk", "More abuse categories show a weaker link to higher risk", false)
            ]
        ),

        new(
            PipelineId: 2,
            PipelineName: "Education Momentum → Reintegration",
            TargetVariable: "Reintegration Completed (binary)",
            ModelType: "Logistic Regression (statsmodels)",
            RSquared: 0.28,
            AdjRSquared: 0.21,
            SampleSize: 58,
            KeyInsight: "Residents who show steady improvement in school (attendance trend and progress) are more likely to complete reintegration.",
            Recommendations: [
                "Track school attendance month-to-month; a sustained drop should trigger support",
                "Set simple progress checkpoints (e.g., minimum progress %) to prompt plan reviews",
                "Focus on consistent attendance, not just a high average"
            ],
            TopFeatures: [
                new("attendance_slope", 0.85, 0.004, "Increases odds", "Improving attendance over time is linked to higher reintegration completion", true),
                new("avg_progress", 0.72, 0.009, "Increases odds", "Higher school progress is linked to higher completion rates", true),
                new("stay_months", 0.55, 0.018, "Increases odds", "Longer stays can allow more time to complete the process", true),
                new("total_sessions", 0.41, 0.042, "Increases odds", "More counseling sessions are linked to higher completion odds", true),
                new("avg_health", 0.38, 0.055, "Increases odds", "Better health is weakly linked to higher completion odds", false),
                new("family_risk_count", -0.52, 0.025, "Decreases odds", "More family risk factors are linked to lower completion odds", true),
                new("abuse_types_count", -0.31, 0.098, "Decreases odds", "More abuse categories are weakly linked to lower completion odds", false)
            ]
        ),

        new(
            PipelineId: 3,
            PipelineName: "Social Media Content → Donation Impact",
            TargetVariable: "Estimated Donation Value (₱, log-transformed)",
            ModelType: "OLS Regression on log(1 + donation_value)",
            RSquared: 0.52,
            AdjRSquared: 0.45,
            SampleSize: 150,
            KeyInsight: "Posts perform best when they ask clearly for support (CTA), share a real story, and use boosting strategically.",
            Recommendations: [
                "Make every fundraising post include a clear call-to-action (what to do next)",
                "Share resident stories regularly (set a simple weekly target)",
                "Use boost budget on posts that match the highest-performing formats",
                "Run small weekly tests (two topics, same format) and keep the winner"
            ],
            TopFeatures: [
                new("has_call_to_action", 1.25, 0.001, "Increases", "Clear calls-to-action are linked to higher donation value", true),
                new("features_resident_story", 0.89, 0.002, "Increases", "Resident stories are linked to higher donation value", true),
                new("is_boosted", 0.72, 0.005, "Increases", "Boosted posts are linked to higher donation value", true),
                new("boost_budget_php", 0.45, 0.012, "Increases", "More boost budget is linked to higher donation value", true),
                new("sentiment_tone_Hopeful", 0.38, 0.035, "Increases", "Hopeful tone is linked to higher donation value", true),
                new("content_topic_Success Stories", 0.35, 0.042, "Increases", "Success-story topics tend to perform better", true),
                new("platform_Facebook", -0.15, 0.320, "Decreases", "Platform differences are small in this model", false)
            ]
        ),

        new(
            PipelineId: 4,
            PipelineName: "Funding Allocation → Safehouse Outcomes",
            TargetVariable: "Avg Health Score (with safehouse fixed effects)",
            ModelType: "OLS Regression with Fixed Effects",
            RSquared: 0.68,
            AdjRSquared: 0.58,
            SampleSize: 120,
            KeyInsight: "When a safehouse puts more funding into wellbeing and education, health outcomes tend to improve (within that same safehouse over time).",
            Recommendations: [
                "Protect wellbeing and education funding when budgets are tight",
                "Try small, planned budget shifts for 1–2 months and watch outcomes",
                "Expect delays: improvements may show up the next month"
            ],
            TopFeatures: [
                new("Wellbeing", 0.42, 0.001, "Increases", "More wellbeing funding is linked to better health scores", true),
                new("Education", 0.35, 0.004, "Increases", "More education funding is linked to better health scores", true),
                new("capacity_girls", 0.28, 0.015, "Increases", "Capacity differences explain some health score differences", true),
                new("Operations", 0.12, 0.180, "Increases", "Operations funding shows a weak link in this model", false),
                new("Transport", -0.05, 0.650, "Decreases", "Transport funding shows little to no link in this model", false),
                new("active_residents", -0.18, 0.085, "Decreases", "More residents can slightly lower average scores (capacity strain)", false)
            ]
        )
    ];
}
