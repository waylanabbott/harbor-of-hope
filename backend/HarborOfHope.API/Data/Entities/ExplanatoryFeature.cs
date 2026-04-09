using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("explanatory_features")]
public class ExplanatoryFeature
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("pipeline_id")]
    public int PipelineId { get; set; }

    [Column("feature_name")]
    public string FeatureName { get; set; } = "";

    [Column("coefficient")]
    public double Coefficient { get; set; }

    [Column("p_value")]
    public double PValue { get; set; }

    [Column("direction")]
    public string Direction { get; set; } = "";

    [Column("interpretation")]
    public string Interpretation { get; set; } = "";

    [Column("is_significant")]
    public bool IsSignificant { get; set; }

    [Column("feature_rank")]
    public int FeatureRank { get; set; }
}
