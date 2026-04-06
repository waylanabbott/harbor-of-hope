namespace HarborOfHope.API.DTOs;

public class DonationDto
{
    public int DonationId { get; set; }
    public int SupporterId { get; set; }
    public string? SupporterDisplayName { get; set; }
    public string? DonationType { get; set; }
    public DateTime? DonationDate { get; set; }
    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }
    public string? ChannelSource { get; set; }
    public string? CurrencyCode { get; set; }
    public decimal Amount { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? ImpactUnit { get; set; }
    public string? Notes { get; set; }
    public int? ReferralPostId { get; set; }
}
