namespace HarborOfHope.API.DTOs;

public record ExplanatoryFeatureDto(
    string Name,
    double Coefficient,
    double PValue,
    string Direction,
    string Interpretation,
    bool IsSignificant
);

public record ExplanatoryPipelineDto(
    int PipelineId,
    string PipelineName,
    string TargetVariable,
    string ModelType,
    double RSquared,
    double AdjRSquared,
    int SampleSize,
    string KeyInsight,
    List<string> Recommendations,
    List<ExplanatoryFeatureDto> TopFeatures
);
