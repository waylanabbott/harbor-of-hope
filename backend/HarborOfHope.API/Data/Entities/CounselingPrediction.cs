using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("counseling_predictions")]
public class CounselingPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("recording_id")]
    public int RecordingId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("predicted_improvement")]
    public double PredictedImprovement { get; set; }

    [Column("actual_improvement")]
    public double ActualImprovement { get; set; }

    [Column("session_type")]
    public string? SessionType { get; set; }

    [Column("effectiveness_label")]
    public string? EffectivenessLabel { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
