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
public class HomeVisitationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<HomeVisitationDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "visitDate",
        [FromQuery] string sortDir = "desc",
        [FromQuery] int? residentId = null)
    {
        var query = db.HomeVisitations.Include(h => h.Resident).AsQueryable();

        if (residentId.HasValue)
            query = query.Where(h => h.ResidentId == residentId.Value);

        var isDesc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLower() switch
        {
            "socialworker" => isDesc ? query.OrderByDescending(h => h.SocialWorker) : query.OrderBy(h => h.SocialWorker),
            "visittype" => isDesc ? query.OrderByDescending(h => h.VisitType) : query.OrderBy(h => h.VisitType),
            "residentid" => isDesc ? query.OrderByDescending(h => h.ResidentId) : query.OrderBy(h => h.ResidentId),
            _ => isDesc ? query.OrderByDescending(h => h.VisitDate) : query.OrderBy(h => h.VisitDate),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new HomeVisitationDto
            {
                VisitationId = h.VisitationId,
                ResidentId = h.ResidentId,
                ResidentCode = h.Resident != null ? h.Resident.CaseControlNo : null,
                VisitDate = h.VisitDate,
                SocialWorker = h.SocialWorker,
                VisitType = h.VisitType,
                LocationVisited = h.LocationVisited,
                FamilyMembersPresent = h.FamilyMembersPresent,
                Purpose = h.Purpose,
                Observations = h.Observations,
                FamilyCooperationLevel = h.FamilyCooperationLevel,
                SafetyConcernsNoted = h.SafetyConcernsNoted,
                FollowUpNeeded = h.FollowUpNeeded,
                FollowUpNotes = h.FollowUpNotes,
                VisitOutcome = h.VisitOutcome
            })
            .ToListAsync();

        return Ok(new PagedResult<HomeVisitationDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HomeVisitationDto>> GetById(int id)
    {
        var h = await db.HomeVisitations
            .Include(h => h.Resident)
            .FirstOrDefaultAsync(h => h.VisitationId == id);

        if (h == null) return NotFound();

        return Ok(new HomeVisitationDto
        {
            VisitationId = h.VisitationId,
            ResidentId = h.ResidentId,
            ResidentCode = h.Resident?.CaseControlNo,
            VisitDate = h.VisitDate,
            SocialWorker = h.SocialWorker,
            VisitType = h.VisitType,
            LocationVisited = h.LocationVisited,
            FamilyMembersPresent = h.FamilyMembersPresent,
            Purpose = h.Purpose,
            Observations = h.Observations,
            FamilyCooperationLevel = h.FamilyCooperationLevel,
            SafetyConcernsNoted = h.SafetyConcernsNoted,
            FollowUpNeeded = h.FollowUpNeeded,
            FollowUpNotes = h.FollowUpNotes,
            VisitOutcome = h.VisitOutcome
        });
    }

    [HttpPost]
    public async Task<ActionResult<HomeVisitationDto>> Create([FromBody] HomeVisitationCreateDto dto)
    {
        var residentExists = await db.Residents.AnyAsync(r => r.ResidentId == dto.ResidentId);
        if (!residentExists)
            return BadRequest(new { message = "Resident not found." });

        var visitation = new HomeVisitation
        {
            ResidentId = dto.ResidentId,
            VisitDate = dto.VisitDate,
            SocialWorker = InputSanitizer.Sanitize(dto.SocialWorker),
            VisitType = InputSanitizer.Sanitize(dto.VisitType),
            LocationVisited = InputSanitizer.Sanitize(dto.LocationVisited),
            FamilyMembersPresent = InputSanitizer.Sanitize(dto.FamilyMembersPresent),
            Purpose = InputSanitizer.Sanitize(dto.Purpose),
            Observations = InputSanitizer.Sanitize(dto.Observations),
            FamilyCooperationLevel = InputSanitizer.Sanitize(dto.FamilyCooperationLevel),
            SafetyConcernsNoted = dto.SafetyConcernsNoted,
            FollowUpNeeded = dto.FollowUpNeeded,
            FollowUpNotes = InputSanitizer.Sanitize(dto.FollowUpNotes),
            VisitOutcome = InputSanitizer.Sanitize(dto.VisitOutcome)
        };

        db.HomeVisitations.Add(visitation);
        await db.SaveChangesAsync();

        await db.Entry(visitation).Reference(h => h.Resident).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = visitation.VisitationId }, new HomeVisitationDto
        {
            VisitationId = visitation.VisitationId,
            ResidentId = visitation.ResidentId,
            ResidentCode = visitation.Resident?.CaseControlNo,
            VisitDate = visitation.VisitDate,
            SocialWorker = visitation.SocialWorker,
            VisitType = visitation.VisitType,
            LocationVisited = visitation.LocationVisited,
            FamilyMembersPresent = visitation.FamilyMembersPresent,
            Purpose = visitation.Purpose,
            Observations = visitation.Observations,
            FamilyCooperationLevel = visitation.FamilyCooperationLevel,
            SafetyConcernsNoted = visitation.SafetyConcernsNoted,
            FollowUpNeeded = visitation.FollowUpNeeded,
            FollowUpNotes = visitation.FollowUpNotes,
            VisitOutcome = visitation.VisitOutcome
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] HomeVisitationCreateDto dto)
    {
        var visitation = await db.HomeVisitations.FindAsync(id);
        if (visitation == null) return NotFound();

        visitation.ResidentId = dto.ResidentId;
        visitation.VisitDate = dto.VisitDate;
        visitation.SocialWorker = InputSanitizer.Sanitize(dto.SocialWorker);
        visitation.VisitType = InputSanitizer.Sanitize(dto.VisitType);
        visitation.LocationVisited = InputSanitizer.Sanitize(dto.LocationVisited);
        visitation.FamilyMembersPresent = InputSanitizer.Sanitize(dto.FamilyMembersPresent);
        visitation.Purpose = InputSanitizer.Sanitize(dto.Purpose);
        visitation.Observations = InputSanitizer.Sanitize(dto.Observations);
        visitation.FamilyCooperationLevel = InputSanitizer.Sanitize(dto.FamilyCooperationLevel);
        visitation.SafetyConcernsNoted = dto.SafetyConcernsNoted;
        visitation.FollowUpNeeded = dto.FollowUpNeeded;
        visitation.FollowUpNotes = InputSanitizer.Sanitize(dto.FollowUpNotes);
        visitation.VisitOutcome = InputSanitizer.Sanitize(dto.VisitOutcome);

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var visitation = await db.HomeVisitations.FindAsync(id);
        if (visitation == null) return NotFound();

        db.HomeVisitations.Remove(visitation);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
