namespace HarborOfHope.API.DTOs;

public class PublicStatsDto
{
    public int TotalResidentsServed { get; set; }
    public decimal TotalDonationsReceived { get; set; }
    public int SuccessfulReintegrations { get; set; }
    public double ReintegrationRate { get; set; }
}
