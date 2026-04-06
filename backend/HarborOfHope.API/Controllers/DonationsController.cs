using HarborOfHope.API.Data;
using HarborOfHope.API.Data.Entities;
using HarborOfHope.API.DTOs;
using HarborOfHope.API.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthPolicies.AdminOnly)]
public class DonationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<DonationDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "donationDate",
        [FromQuery] string sortDir = "desc",
        [FromQuery] int? supporterId = null)
    {
        var query = db.Donations.Include(d => d.Supporter).AsQueryable();

        if (supporterId.HasValue)
            query = query.Where(d => d.SupporterId == supporterId.Value);

        var isDesc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLower() switch
        {
            "amount" => isDesc ? query.OrderByDescending(d => d.Amount) : query.OrderBy(d => d.Amount),
            "donationtype" => isDesc ? query.OrderByDescending(d => d.DonationType) : query.OrderBy(d => d.DonationType),
            "supporterid" => isDesc ? query.OrderByDescending(d => d.SupporterId) : query.OrderBy(d => d.SupporterId),
            _ => isDesc ? query.OrderByDescending(d => d.DonationDate) : query.OrderBy(d => d.DonationDate),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DonationDto
            {
                DonationId = d.DonationId,
                SupporterId = d.SupporterId,
                SupporterDisplayName = d.Supporter != null ? d.Supporter.DisplayName : null,
                DonationType = d.DonationType,
                DonationDate = d.DonationDate,
                IsRecurring = d.IsRecurring,
                CampaignName = d.CampaignName,
                ChannelSource = d.ChannelSource,
                CurrencyCode = d.CurrencyCode,
                Amount = d.Amount ?? 0,
                EstimatedValue = d.EstimatedValue,
                ImpactUnit = d.ImpactUnit,
                Notes = d.Notes,
                ReferralPostId = d.ReferralPostId
            })
            .ToListAsync();

        return Ok(new PagedResult<DonationDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DonationDto>> GetById(int id)
    {
        var d = await db.Donations
            .Include(d => d.Supporter)
            .FirstOrDefaultAsync(d => d.DonationId == id);

        if (d == null) return NotFound();

        return Ok(new DonationDto
        {
            DonationId = d.DonationId,
            SupporterId = d.SupporterId,
            SupporterDisplayName = d.Supporter?.DisplayName,
            DonationType = d.DonationType,
            DonationDate = d.DonationDate,
            IsRecurring = d.IsRecurring,
            CampaignName = d.CampaignName,
            ChannelSource = d.ChannelSource,
            CurrencyCode = d.CurrencyCode,
            Amount = d.Amount ?? 0,
            EstimatedValue = d.EstimatedValue,
            ImpactUnit = d.ImpactUnit,
            Notes = d.Notes,
            ReferralPostId = d.ReferralPostId
        });
    }

    [HttpPost]
    public async Task<ActionResult<DonationDto>> Create([FromBody] DonationCreateDto dto)
    {
        // Validate SupporterId exists
        var supporterExists = await db.Supporters.AnyAsync(s => s.SupporterId == dto.SupporterId);
        if (!supporterExists)
            return BadRequest(new { message = "Supporter not found." });

        var donation = new Donation
        {
            SupporterId = dto.SupporterId,
            DonationType = InputSanitizer.Sanitize(dto.DonationType),
            DonationDate = dto.DonationDate,
            IsRecurring = dto.IsRecurring,
            CampaignName = InputSanitizer.Sanitize(dto.CampaignName),
            ChannelSource = InputSanitizer.Sanitize(dto.ChannelSource),
            CurrencyCode = InputSanitizer.Sanitize(dto.CurrencyCode),
            Amount = dto.Amount,
            EstimatedValue = dto.EstimatedValue,
            ImpactUnit = InputSanitizer.Sanitize(dto.ImpactUnit),
            Notes = InputSanitizer.Sanitize(dto.Notes),
            ReferralPostId = dto.ReferralPostId
        };

        db.Donations.Add(donation);
        await db.SaveChangesAsync();

        await db.Entry(donation).Reference(d => d.Supporter).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = donation.DonationId }, new DonationDto
        {
            DonationId = donation.DonationId,
            SupporterId = donation.SupporterId,
            SupporterDisplayName = donation.Supporter?.DisplayName,
            DonationType = donation.DonationType,
            DonationDate = donation.DonationDate,
            IsRecurring = donation.IsRecurring,
            CampaignName = donation.CampaignName,
            ChannelSource = donation.ChannelSource,
            CurrencyCode = donation.CurrencyCode,
            Amount = donation.Amount ?? 0,
            EstimatedValue = donation.EstimatedValue,
            ImpactUnit = donation.ImpactUnit,
            Notes = donation.Notes,
            ReferralPostId = donation.ReferralPostId
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] DonationCreateDto dto)
    {
        var donation = await db.Donations.FindAsync(id);
        if (donation == null) return NotFound();

        donation.SupporterId = dto.SupporterId;
        donation.DonationType = InputSanitizer.Sanitize(dto.DonationType);
        donation.DonationDate = dto.DonationDate;
        donation.IsRecurring = dto.IsRecurring;
        donation.CampaignName = InputSanitizer.Sanitize(dto.CampaignName);
        donation.ChannelSource = InputSanitizer.Sanitize(dto.ChannelSource);
        donation.CurrencyCode = InputSanitizer.Sanitize(dto.CurrencyCode);
        donation.Amount = dto.Amount;
        donation.EstimatedValue = dto.EstimatedValue;
        donation.ImpactUnit = InputSanitizer.Sanitize(dto.ImpactUnit);
        donation.Notes = InputSanitizer.Sanitize(dto.Notes);
        donation.ReferralPostId = dto.ReferralPostId;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var donation = await db.Donations.FindAsync(id);
        if (donation == null) return NotFound();

        db.Donations.Remove(donation);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
