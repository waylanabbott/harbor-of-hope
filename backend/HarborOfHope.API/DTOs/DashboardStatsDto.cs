namespace HarborOfHope.API.DTOs;

public class DashboardStatsDto
{
    public int TotalResidents { get; set; }
    public int ActiveCases { get; set; }
    public decimal TotalDonations { get; set; }
    public double ReintegrationRate { get; set; }
    public List<RecentDonationDto> RecentDonations { get; set; } = [];
    public List<AttentionResidentDto> ResidentsNeedingAttention { get; set; } = [];
}

public class RecentDonationDto
{
    public int DonationId { get; set; }
    public string? SupporterName { get; set; }
    public decimal Amount { get; set; }
    public string? DonationType { get; set; }
    public DateTime? DonationDate { get; set; }
}

public class AttentionResidentDto
{
    public int ResidentId { get; set; }
    public string? CaseControlNo { get; set; }
    public string? SafehouseName { get; set; }
    public string? CurrentRiskLevel { get; set; }
    public string? CaseStatus { get; set; }
}
