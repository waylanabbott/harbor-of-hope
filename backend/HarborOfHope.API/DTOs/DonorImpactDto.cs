namespace HarborOfHope.API.DTOs;

public class DonorImpactDto
{
    public decimal TotalDonated { get; set; }
    public int DonationCount { get; set; }
    public DateTime? FirstDonationDate { get; set; }
    public DateTime? LatestDonationDate { get; set; }
    public List<AllocationSummaryDto> Allocations { get; set; } = new();
}
