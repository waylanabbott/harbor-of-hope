using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("safehouse_predictions")]
public class SafehousePrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("predicted_health_score")]
    public double PredictedHealthScore { get; set; }

    [Column("actual_health_score")]
    public double ActualHealthScore { get; set; }

    [Column("residual")]
    public double Residual { get; set; }

    [Column("performance_label")]
    public string? PerformanceLabel { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
