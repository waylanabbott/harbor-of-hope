using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("incident_risk_predictions")]
public class IncidentRiskPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("risk_probability")]
    public double RiskProbability { get; set; }

    [Column("risk_prediction")]
    public int RiskPrediction { get; set; }

    [Column("risk_level")]
    public string? RiskLevel { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
