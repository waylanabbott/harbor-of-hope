using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HarborOfHope.API.Data.Entities;

[Table("campaign_predictions")]
public class CampaignPrediction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("post_id")]
    public int PostId { get; set; }

    [Column("platform")]
    public string? Platform { get; set; }

    [Column("campaign_name")]
    public string? CampaignName { get; set; }

    [Column("post_type")]
    public string? PostType { get; set; }

    [Column("estimated_donation_value_php")]
    public double EstimatedDonationValuePhp { get; set; }

    [Column("predicted_donation_value_php")]
    public double PredictedDonationValuePhp { get; set; }

    [Column("prediction_error_php")]
    public double PredictionErrorPhp { get; set; }

    [Column("prediction_timestamp")]
    public string? PredictionTimestamp { get; set; }
}
