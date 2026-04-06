namespace HarborOfHope.API.DTOs;

/// <summary>
/// Monthly donation trend data point (RPT-01).
/// </summary>
public record DonationTrendDto(string Month, decimal TotalAmount, int DonationCount);

/// <summary>
/// Resident reintegration status counts (RPT-02).
/// </summary>
public record ResidentOutcomeDto(string Status, int Count);

/// <summary>
/// Per-safehouse comparison metrics (RPT-03).
/// </summary>
public record SafehouseComparisonDto(
    int SafehouseId,
    string Name,
    int ResidentCount,
    decimal AvgHealthScore,
    decimal AvgEducationProgress,
    int TotalIncidents
);

/// <summary>
/// Batch churn prediction request (DONR-06).
/// </summary>
public record BatchChurnRequest(List<int> SupporterIds);

/// <summary>
/// Individual supporter churn prediction result (DONR-06).
/// </summary>
public record ChurnPredictionDto(int SupporterId, string RiskLevel, double ChurnProbability);
