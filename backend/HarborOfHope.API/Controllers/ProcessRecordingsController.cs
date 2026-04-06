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
public class ProcessRecordingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProcessRecordingDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "sessionDate",
        [FromQuery] string sortDir = "desc",
        [FromQuery] int? residentId = null)
    {
        var query = db.ProcessRecordings.Include(p => p.Resident).AsQueryable();

        if (residentId.HasValue)
            query = query.Where(p => p.ResidentId == residentId.Value);

        var isDesc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLower() switch
        {
            "socialworker" => isDesc ? query.OrderByDescending(p => p.SocialWorker) : query.OrderBy(p => p.SocialWorker),
            "sessiontype" => isDesc ? query.OrderByDescending(p => p.SessionType) : query.OrderBy(p => p.SessionType),
            "residentid" => isDesc ? query.OrderByDescending(p => p.ResidentId) : query.OrderBy(p => p.ResidentId),
            _ => isDesc ? query.OrderByDescending(p => p.SessionDate) : query.OrderBy(p => p.SessionDate),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProcessRecordingDto
            {
                RecordingId = p.RecordingId,
                ResidentId = p.ResidentId,
                ResidentCode = p.Resident != null ? p.Resident.CaseControlNo : null,
                SessionDate = p.SessionDate,
                SocialWorker = p.SocialWorker,
                SessionType = p.SessionType,
                SessionDurationMinutes = p.SessionDurationMinutes,
                EmotionalStateObserved = p.EmotionalStateObserved,
                EmotionalStateEnd = p.EmotionalStateEnd,
                SessionNarrative = p.SessionNarrative,
                InterventionsApplied = p.InterventionsApplied,
                FollowUpActions = p.FollowUpActions,
                ProgressNoted = p.ProgressNoted,
                ConcernsFlagged = p.ConcernsFlagged,
                ReferralMade = p.ReferralMade
            })
            .ToListAsync();

        return Ok(new PagedResult<ProcessRecordingDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProcessRecordingDto>> GetById(int id)
    {
        var p = await db.ProcessRecordings
            .Include(p => p.Resident)
            .FirstOrDefaultAsync(p => p.RecordingId == id);

        if (p == null) return NotFound();

        return Ok(new ProcessRecordingDto
        {
            RecordingId = p.RecordingId,
            ResidentId = p.ResidentId,
            ResidentCode = p.Resident?.CaseControlNo,
            SessionDate = p.SessionDate,
            SocialWorker = p.SocialWorker,
            SessionType = p.SessionType,
            SessionDurationMinutes = p.SessionDurationMinutes,
            EmotionalStateObserved = p.EmotionalStateObserved,
            EmotionalStateEnd = p.EmotionalStateEnd,
            SessionNarrative = p.SessionNarrative,
            InterventionsApplied = p.InterventionsApplied,
            FollowUpActions = p.FollowUpActions,
            ProgressNoted = p.ProgressNoted,
            ConcernsFlagged = p.ConcernsFlagged,
            ReferralMade = p.ReferralMade
        });
    }

    [HttpPost]
    public async Task<ActionResult<ProcessRecordingDto>> Create([FromBody] ProcessRecordingCreateDto dto)
    {
        var residentExists = await db.Residents.AnyAsync(r => r.ResidentId == dto.ResidentId);
        if (!residentExists)
            return BadRequest(new { message = "Resident not found." });

        var recording = new ProcessRecording
        {
            ResidentId = dto.ResidentId,
            SessionDate = dto.SessionDate,
            SocialWorker = InputSanitizer.Sanitize(dto.SocialWorker),
            SessionType = InputSanitizer.Sanitize(dto.SessionType),
            SessionDurationMinutes = dto.SessionDurationMinutes,
            EmotionalStateObserved = InputSanitizer.Sanitize(dto.EmotionalStateObserved),
            EmotionalStateEnd = InputSanitizer.Sanitize(dto.EmotionalStateEnd),
            SessionNarrative = InputSanitizer.Sanitize(dto.SessionNarrative),
            InterventionsApplied = InputSanitizer.Sanitize(dto.InterventionsApplied),
            FollowUpActions = InputSanitizer.Sanitize(dto.FollowUpActions),
            ProgressNoted = dto.ProgressNoted,
            ConcernsFlagged = dto.ConcernsFlagged,
            ReferralMade = dto.ReferralMade
        };

        db.ProcessRecordings.Add(recording);
        await db.SaveChangesAsync();

        await db.Entry(recording).Reference(p => p.Resident).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = recording.RecordingId }, new ProcessRecordingDto
        {
            RecordingId = recording.RecordingId,
            ResidentId = recording.ResidentId,
            ResidentCode = recording.Resident?.CaseControlNo,
            SessionDate = recording.SessionDate,
            SocialWorker = recording.SocialWorker,
            SessionType = recording.SessionType,
            SessionDurationMinutes = recording.SessionDurationMinutes,
            EmotionalStateObserved = recording.EmotionalStateObserved,
            EmotionalStateEnd = recording.EmotionalStateEnd,
            SessionNarrative = recording.SessionNarrative,
            InterventionsApplied = recording.InterventionsApplied,
            FollowUpActions = recording.FollowUpActions,
            ProgressNoted = recording.ProgressNoted,
            ConcernsFlagged = recording.ConcernsFlagged,
            ReferralMade = recording.ReferralMade
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProcessRecordingCreateDto dto)
    {
        var recording = await db.ProcessRecordings.FindAsync(id);
        if (recording == null) return NotFound();

        recording.ResidentId = dto.ResidentId;
        recording.SessionDate = dto.SessionDate;
        recording.SocialWorker = InputSanitizer.Sanitize(dto.SocialWorker);
        recording.SessionType = InputSanitizer.Sanitize(dto.SessionType);
        recording.SessionDurationMinutes = dto.SessionDurationMinutes;
        recording.EmotionalStateObserved = InputSanitizer.Sanitize(dto.EmotionalStateObserved);
        recording.EmotionalStateEnd = InputSanitizer.Sanitize(dto.EmotionalStateEnd);
        recording.SessionNarrative = InputSanitizer.Sanitize(dto.SessionNarrative);
        recording.InterventionsApplied = InputSanitizer.Sanitize(dto.InterventionsApplied);
        recording.FollowUpActions = InputSanitizer.Sanitize(dto.FollowUpActions);
        recording.ProgressNoted = dto.ProgressNoted;
        recording.ConcernsFlagged = dto.ConcernsFlagged;
        recording.ReferralMade = dto.ReferralMade;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recording = await db.ProcessRecordings.FindAsync(id);
        if (recording == null) return NotFound();

        db.ProcessRecordings.Remove(recording);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
