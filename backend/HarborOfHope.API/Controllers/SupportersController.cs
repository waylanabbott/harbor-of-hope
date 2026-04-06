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
public class SupportersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<SupporterDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "supporterId",
        [FromQuery] string sortDir = "asc",
        [FromQuery] string? search = null)
    {
        var query = db.Supporters.Include(s => s.Donations).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                (s.DisplayName != null && s.DisplayName.ToLower().Contains(term)) ||
                (s.Email != null && s.Email.ToLower().Contains(term)));
        }

        var isDesc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLower() switch
        {
            "displayname" => isDesc ? query.OrderByDescending(s => s.DisplayName) : query.OrderBy(s => s.DisplayName),
            "email" => isDesc ? query.OrderByDescending(s => s.Email) : query.OrderBy(s => s.Email),
            "status" => isDesc ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            "createdat" => isDesc ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt),
            _ => isDesc ? query.OrderByDescending(s => s.SupporterId) : query.OrderBy(s => s.SupporterId),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SupporterDto
            {
                SupporterId = s.SupporterId,
                SupporterType = s.SupporterType,
                DisplayName = s.DisplayName,
                OrganizationName = s.OrganizationName,
                FirstName = s.FirstName,
                LastName = s.LastName,
                RelationshipType = s.RelationshipType,
                Region = s.Region,
                Country = s.Country,
                Email = s.Email,
                Phone = s.Phone,
                Status = s.Status,
                CreatedAt = s.CreatedAt,
                FirstDonationDate = s.FirstDonationDate,
                AcquisitionChannel = s.AcquisitionChannel,
                DonationCount = s.Donations.Count
            })
            .ToListAsync();

        return Ok(new PagedResult<SupporterDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupporterDto>> GetById(int id)
    {
        var s = await db.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.SupporterId == id);

        if (s == null) return NotFound();

        return Ok(new SupporterDto
        {
            SupporterId = s.SupporterId,
            SupporterType = s.SupporterType,
            DisplayName = s.DisplayName,
            OrganizationName = s.OrganizationName,
            FirstName = s.FirstName,
            LastName = s.LastName,
            RelationshipType = s.RelationshipType,
            Region = s.Region,
            Country = s.Country,
            Email = s.Email,
            Phone = s.Phone,
            Status = s.Status,
            CreatedAt = s.CreatedAt,
            FirstDonationDate = s.FirstDonationDate,
            AcquisitionChannel = s.AcquisitionChannel,
            DonationCount = s.Donations.Count
        });
    }

    [HttpPost]
    public async Task<ActionResult<SupporterDto>> Create([FromBody] SupporterCreateDto dto)
    {
        var supporter = new Supporter
        {
            SupporterType = InputSanitizer.Sanitize(dto.SupporterType),
            DisplayName = InputSanitizer.Sanitize(dto.DisplayName),
            OrganizationName = InputSanitizer.Sanitize(dto.OrganizationName),
            FirstName = InputSanitizer.Sanitize(dto.FirstName),
            LastName = InputSanitizer.Sanitize(dto.LastName),
            RelationshipType = InputSanitizer.Sanitize(dto.RelationshipType),
            Region = InputSanitizer.Sanitize(dto.Region),
            Country = InputSanitizer.Sanitize(dto.Country),
            Email = InputSanitizer.Sanitize(dto.Email),
            Phone = InputSanitizer.Sanitize(dto.Phone),
            Status = InputSanitizer.Sanitize(dto.Status),
            FirstDonationDate = dto.FirstDonationDate,
            AcquisitionChannel = InputSanitizer.Sanitize(dto.AcquisitionChannel),
            CreatedAt = DateTime.UtcNow
        };

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = supporter.SupporterId }, new SupporterDto
        {
            SupporterId = supporter.SupporterId,
            SupporterType = supporter.SupporterType,
            DisplayName = supporter.DisplayName,
            OrganizationName = supporter.OrganizationName,
            FirstName = supporter.FirstName,
            LastName = supporter.LastName,
            RelationshipType = supporter.RelationshipType,
            Region = supporter.Region,
            Country = supporter.Country,
            Email = supporter.Email,
            Phone = supporter.Phone,
            Status = supporter.Status,
            CreatedAt = supporter.CreatedAt,
            FirstDonationDate = supporter.FirstDonationDate,
            AcquisitionChannel = supporter.AcquisitionChannel,
            DonationCount = 0
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SupporterCreateDto dto)
    {
        var supporter = await db.Supporters.FindAsync(id);
        if (supporter == null) return NotFound();

        supporter.SupporterType = InputSanitizer.Sanitize(dto.SupporterType);
        supporter.DisplayName = InputSanitizer.Sanitize(dto.DisplayName);
        supporter.OrganizationName = InputSanitizer.Sanitize(dto.OrganizationName);
        supporter.FirstName = InputSanitizer.Sanitize(dto.FirstName);
        supporter.LastName = InputSanitizer.Sanitize(dto.LastName);
        supporter.RelationshipType = InputSanitizer.Sanitize(dto.RelationshipType);
        supporter.Region = InputSanitizer.Sanitize(dto.Region);
        supporter.Country = InputSanitizer.Sanitize(dto.Country);
        supporter.Email = InputSanitizer.Sanitize(dto.Email);
        supporter.Phone = InputSanitizer.Sanitize(dto.Phone);
        supporter.Status = InputSanitizer.Sanitize(dto.Status);
        supporter.FirstDonationDate = dto.FirstDonationDate;
        supporter.AcquisitionChannel = InputSanitizer.Sanitize(dto.AcquisitionChannel);

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var supporter = await db.Supporters.FindAsync(id);
        if (supporter == null) return NotFound();

        db.Supporters.Remove(supporter);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
