using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("donation_forecast_predictions")]
public class DonationForecastPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("year_month")]
    public string? YearMonth { get; set; }

    [Column("actual_amount")]
    public double? ActualAmount { get; set; }

    [Column("predicted_amount")]
    public double PredictedAmount { get; set; }

    [Column("residual")]
    public double? Residual { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
