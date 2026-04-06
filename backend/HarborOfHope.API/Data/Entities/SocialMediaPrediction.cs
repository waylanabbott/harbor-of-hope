using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("social_media_predictions")]
public class SocialMediaPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("post_id")]
    public int PostId { get; set; }

    [Column("predicted_engagement_rate")]
    public double PredictedEngagementRate { get; set; }

    [Column("actual_engagement_rate")]
    public double ActualEngagementRate { get; set; }

    [Column("residual")]
    public double Residual { get; set; }

    [Column("recommendation")]
    public string? Recommendation { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
