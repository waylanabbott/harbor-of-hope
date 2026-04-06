namespace HarborOfHope.API.DTOs;

public class DonorDonationDto
{
    public int DonationId { get; set; }
    public decimal Amount { get; set; }
    public string? DonationType { get; set; }
    public DateTime? DonationDate { get; set; }
    public string? CampaignName { get; set; }
    public bool IsRecurring { get; set; }
}
