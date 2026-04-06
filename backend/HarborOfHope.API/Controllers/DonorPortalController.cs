using HarborOfHope.API.Data;
using HarborOfHope.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/donor")]
[Authorize(Policy = AuthPolicies.DonorOnly)]
public class DonorPortalController(AppDbContext db, UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("donations")]
    public async Task<ActionResult<List<DonorDonationDto>>> GetMyDonations()
    {
        var user = await userManager.GetUserAsync(User);
        if (user?.SupporterId is null)
            return Ok(new List<DonorDonationDto>());

        var donations = await db.Donations
            .Where(d => d.SupporterId == user.SupporterId)
            .OrderByDescending(d => d.DonationDate)
            .Select(d => new DonorDonationDto
            {
                DonationId = d.DonationId,
                Amount = d.Amount ?? 0,
                DonationType = d.DonationType,
                DonationDate = d.DonationDate,
                CampaignName = d.CampaignName,
                IsRecurring = d.IsRecurring
            })
            .ToListAsync();

        return Ok(donations);
    }

    [HttpGet("impact")]
    public async Task<ActionResult<DonorImpactDto>> GetMyImpact()
    {
        var user = await userManager.GetUserAsync(User);
        if (user?.SupporterId is null)
            return Ok(new DonorImpactDto());

        var userDonations = db.Donations.Where(d => d.SupporterId == user.SupporterId);

        var totalDonated = await userDonations.SumAsync(d => (decimal?)d.Amount) ?? 0;
        var donationCount = await userDonations.CountAsync();
        var firstDate = await userDonations.MinAsync(d => (DateTime?)d.DonationDate);
        var latestDate = await userDonations.MaxAsync(d => (DateTime?)d.DonationDate);

        var donationIds = await userDonations.Select(d => d.DonationId).ToListAsync();

        var allocations = await db.DonationAllocations
            .Where(a => donationIds.Contains(a.DonationId))
            .Include(a => a.Safehouse)
            .GroupBy(a => new { SafehouseName = a.Safehouse != null ? a.Safehouse.Name : null, a.ProgramArea })
            .Select(g => new AllocationSummaryDto
            {
                SafehouseName = g.Key.SafehouseName,
                ProgramArea = g.Key.ProgramArea,
                TotalAllocated = g.Sum(a => a.AmountAllocated)
            })
            .ToListAsync();

        return Ok(new DonorImpactDto
        {
            TotalDonated = totalDonated,
            DonationCount = donationCount,
            FirstDonationDate = firstDate,
            LatestDonationDate = latestDate,
            Allocations = allocations
        });
    }
}
