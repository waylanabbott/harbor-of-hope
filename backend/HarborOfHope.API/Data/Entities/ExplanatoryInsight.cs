using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("explanatory_insights")]
public class ExplanatoryInsight
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("pipeline_id")]
    public int PipelineId { get; set; }

    [Column("pipeline_name")]
    public string PipelineName { get; set; } = "";

    [Column("target_variable")]
    public string TargetVariable { get; set; } = "";

    [Column("model_type")]
    public string ModelType { get; set; } = "";

    [Column("r_squared")]
    public double RSquared { get; set; }

    [Column("adj_r_squared")]
    public double AdjRSquared { get; set; }

    [Column("sample_size")]
    public int SampleSize { get; set; }

    [Column("key_insight")]
    public string KeyInsight { get; set; } = "";

    [Column("recommendations_json")]
    public string RecommendationsJson { get; set; } = "[]";

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
