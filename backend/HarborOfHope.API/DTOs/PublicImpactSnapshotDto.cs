namespace HarborOfHope.API.DTOs;

public class PublicImpactSnapshotDto
{
    public DateTime? SnapshotDate { get; set; }
    public string? Headline { get; set; }
    public string? SummaryText { get; set; }
    public string? Month { get; set; }
    public double? AvgHealthScore { get; set; }
    public double? EducationProgress { get; set; }
    public int? TotalResidents { get; set; }
    public decimal? DonationsTotal { get; set; }
}
