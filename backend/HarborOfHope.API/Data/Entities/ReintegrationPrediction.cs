using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("reintegration_predictions")]
public class ReintegrationPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("readiness_probability")]
    public double ReadinessProbability { get; set; }

    [Column("readiness_prediction")]
    public int ReadinessPrediction { get; set; }

    [Column("readiness_level")]
    public string? ReadinessLevel { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
