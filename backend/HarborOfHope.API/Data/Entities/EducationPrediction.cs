using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("education_predictions")]
public class EducationPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("education_record_id")]
    public int EducationRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("completion_probability")]
    public double CompletionProbability { get; set; }

    [Column("completion_prediction")]
    public int CompletionPrediction { get; set; }

    [Column("outcome_level")]
    public string? OutcomeLevel { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
