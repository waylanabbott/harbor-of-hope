namespace HarborOfHope.API.DTOs;

/// <summary>
/// Generic prediction request -- features as dictionary.
/// </summary>
public record MlPredictionRequest(Dictionary<string, object> Features);

/// <summary>
/// Generic prediction response from Flask.
/// </summary>
public record MlPredictionResponse(
    string Model,
    List<double> Prediction,
    List<List<double>>? Probabilities = null,
    string? RiskLevel = null
);

/// <summary>
/// Flask health response.
/// </summary>
public record MlHealthResponse(
    string Status,
    List<string> ModelsLoaded,
    List<string> ModelsMissing
);
