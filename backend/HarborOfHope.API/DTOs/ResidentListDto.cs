namespace HarborOfHope.API.DTOs;

public class ResidentListDto
{
    public int ResidentId { get; set; }
    public string? CaseControlNo { get; set; }
    public string? InternalCode { get; set; }
    public int SafehouseId { get; set; }
    public string? SafehouseName { get; set; }
    public string? CaseStatus { get; set; }
    public string? CaseCategory { get; set; }
    public string? CurrentRiskLevel { get; set; }
    public DateTime? DateOfAdmission { get; set; }
    public string? PresentAge { get; set; }
}
