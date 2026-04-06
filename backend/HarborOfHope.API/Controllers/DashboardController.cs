using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var totalResidents = await db.Residents.CountAsync();
        var activeCases = await db.Residents.CountAsync(r => r.CaseStatus == "Active");

        // Total donations -- handle empty table
        decimal totalDonations;
        try
        {
            totalDonations = await db.Donations.SumAsync(d => d.Amount ?? 0);
        }
        catch
        {
            totalDonations = 0;
        }

        // Reintegration rate
        var totalWithType = await db.Residents.CountAsync(r => r.ReintegrationType != null);
        var completed = await db.Residents.CountAsync(r => r.ReintegrationStatus == "Completed");
        var reintegrationRate = totalWithType > 0
            ? Math.Round((double)completed / totalWithType * 100, 1)
            : 0;

        // Recent donations (top 5)
        var recentDonations = await db.Donations
            .Include(d => d.Supporter)
            .OrderByDescending(d => d.DonationDate)
            .Take(5)
            .Select(d => new RecentDonationDto
            {
                DonationId = d.DonationId,
                SupporterName = d.Supporter != null ? d.Supporter.DisplayName : null,
                Amount = d.Amount ?? 0,
                DonationType = d.DonationType,
                DonationDate = d.DonationDate
            })
            .ToListAsync();

        // Residents needing attention (Critical first, then High, top 5)
        var residentsNeedingAttention = await db.Residents
            .Include(r => r.Safehouse)
            .Where(r => r.CurrentRiskLevel == "Critical" || r.CurrentRiskLevel == "High")
            .OrderBy(r => r.CurrentRiskLevel == "Critical" ? 0 : 1)
            .ThenBy(r => r.ResidentId)
            .Take(5)
            .Select(r => new AttentionResidentDto
            {
                ResidentId = r.ResidentId,
                CaseControlNo = r.CaseControlNo,
                SafehouseName = r.Safehouse != null ? r.Safehouse.Name : null,
                CurrentRiskLevel = r.CurrentRiskLevel,
                CaseStatus = r.CaseStatus
            })
            .ToListAsync();

        return Ok(new DashboardStatsDto
        {
            TotalResidents = totalResidents,
            ActiveCases = activeCases,
            TotalDonations = totalDonations,
            ReintegrationRate = reintegrationRate,
            RecentDonations = recentDonations,
            ResidentsNeedingAttention = residentsNeedingAttention
        });
    }
}
