using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("donor_churn_predictions")]
public class DonorChurnPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("churn_probability")]
    public double ChurnProbability { get; set; }

    [Column("churn_prediction")]
    public int ChurnPrediction { get; set; }

    [Column("churn_risk_level")]
    public string? ChurnRiskLevel { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
