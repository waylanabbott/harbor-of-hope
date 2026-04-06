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
public class ResidentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ResidentListDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "residentId",
        [FromQuery] string sortDir = "asc",
        [FromQuery] string? search = null,
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? riskLevel = null,
        [FromQuery] string? category = null)
    {
        var query = db.Residents.Include(r => r.Safehouse).AsQueryable();

        // Search on CaseControlNo and InternalCode
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(r =>
                (r.CaseControlNo != null && r.CaseControlNo.ToLower().Contains(term)) ||
                (r.InternalCode != null && r.InternalCode.ToLower().Contains(term)));
        }

        // Filters
        if (safehouseId.HasValue)
            query = query.Where(r => r.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.CaseStatus == status);

        if (!string.IsNullOrWhiteSpace(riskLevel))
            query = query.Where(r => r.CurrentRiskLevel == riskLevel);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(r => r.CaseCategory == category);

        // Sorting
        var isDesc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLower() switch
        {
            "casestatus" => isDesc ? query.OrderByDescending(r => r.CaseStatus) : query.OrderBy(r => r.CaseStatus),
            "safehouseid" => isDesc ? query.OrderByDescending(r => r.SafehouseId) : query.OrderBy(r => r.SafehouseId),
            "currentrisklevel" => isDesc ? query.OrderByDescending(r => r.CurrentRiskLevel) : query.OrderBy(r => r.CurrentRiskLevel),
            "dateofadmission" => isDesc ? query.OrderByDescending(r => r.DateOfAdmission) : query.OrderBy(r => r.DateOfAdmission),
            _ => isDesc ? query.OrderByDescending(r => r.ResidentId) : query.OrderBy(r => r.ResidentId),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ResidentListDto
            {
                ResidentId = r.ResidentId,
                CaseControlNo = r.CaseControlNo,
                InternalCode = r.InternalCode,
                SafehouseId = r.SafehouseId,
                SafehouseName = r.Safehouse != null ? r.Safehouse.Name : null,
                CaseStatus = r.CaseStatus,
                CaseCategory = r.CaseCategory,
                CurrentRiskLevel = r.CurrentRiskLevel,
                DateOfAdmission = r.DateOfAdmission,
                PresentAge = r.PresentAge
            })
            .ToListAsync();

        return Ok(new PagedResult<ResidentListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResidentDetailDto>> GetById(int id)
    {
        var r = await db.Residents
            .Include(r => r.Safehouse)
            .FirstOrDefaultAsync(r => r.ResidentId == id);

        if (r == null) return NotFound();

        return Ok(MapToDetailDto(r));
    }

    [HttpPost]
    public async Task<ActionResult<ResidentDetailDto>> Create([FromBody] ResidentCreateDto dto)
    {
        var resident = new Resident
        {
            CaseControlNo = InputSanitizer.Sanitize(dto.CaseControlNo),
            InternalCode = InputSanitizer.Sanitize(dto.InternalCode),
            SafehouseId = dto.SafehouseId,
            CaseStatus = InputSanitizer.Sanitize(dto.CaseStatus),
            Sex = InputSanitizer.Sanitize(dto.Sex),
            DateOfBirth = dto.DateOfBirth,
            BirthStatus = InputSanitizer.Sanitize(dto.BirthStatus),
            PlaceOfBirth = InputSanitizer.Sanitize(dto.PlaceOfBirth),
            Religion = InputSanitizer.Sanitize(dto.Religion),
            CaseCategory = InputSanitizer.Sanitize(dto.CaseCategory),
            SubCatOrphaned = dto.SubCatOrphaned,
            SubCatTrafficked = dto.SubCatTrafficked,
            SubCatChildLabor = dto.SubCatChildLabor,
            SubCatPhysicalAbuse = dto.SubCatPhysicalAbuse,
            SubCatSexualAbuse = dto.SubCatSexualAbuse,
            SubCatOsaec = dto.SubCatOsaec,
            SubCatCicl = dto.SubCatCicl,
            SubCatAtRisk = dto.SubCatAtRisk,
            SubCatStreetChild = dto.SubCatStreetChild,
            SubCatChildWithHiv = dto.SubCatChildWithHiv,
            IsPwd = dto.IsPwd,
            PwdType = InputSanitizer.Sanitize(dto.PwdType),
            HasSpecialNeeds = dto.HasSpecialNeeds,
            SpecialNeedsDiagnosis = InputSanitizer.Sanitize(dto.SpecialNeedsDiagnosis),
            FamilyIs4ps = dto.FamilyIs4ps,
            FamilySoloParent = dto.FamilySoloParent,
            FamilyIndigenous = dto.FamilyIndigenous,
            FamilyParentPwd = dto.FamilyParentPwd,
            FamilyInformalSettler = dto.FamilyInformalSettler,
            DateOfAdmission = dto.DateOfAdmission,
            AgeUponAdmission = InputSanitizer.Sanitize(dto.AgeUponAdmission),
            PresentAge = InputSanitizer.Sanitize(dto.PresentAge),
            LengthOfStay = InputSanitizer.Sanitize(dto.LengthOfStay),
            ReferralSource = InputSanitizer.Sanitize(dto.ReferralSource),
            ReferringAgencyPerson = InputSanitizer.Sanitize(dto.ReferringAgencyPerson),
            DateColbRegistered = dto.DateColbRegistered,
            DateColbObtained = dto.DateColbObtained,
            AssignedSocialWorker = InputSanitizer.Sanitize(dto.AssignedSocialWorker),
            InitialCaseAssessment = InputSanitizer.Sanitize(dto.InitialCaseAssessment),
            DateCaseStudyPrepared = dto.DateCaseStudyPrepared,
            ReintegrationType = InputSanitizer.Sanitize(dto.ReintegrationType),
            ReintegrationStatus = InputSanitizer.Sanitize(dto.ReintegrationStatus),
            InitialRiskLevel = InputSanitizer.Sanitize(dto.InitialRiskLevel),
            CurrentRiskLevel = InputSanitizer.Sanitize(dto.CurrentRiskLevel),
            DateEnrolled = dto.DateEnrolled,
            DateClosed = dto.DateClosed,
            CreatedAt = DateTime.UtcNow
        };

        db.Residents.Add(resident);
        await db.SaveChangesAsync();

        // Reload with Safehouse for response
        await db.Entry(resident).Reference(r => r.Safehouse).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = resident.ResidentId }, MapToDetailDto(resident));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ResidentCreateDto dto)
    {
        var resident = await db.Residents.FindAsync(id);
        if (resident == null) return NotFound();

        resident.CaseControlNo = InputSanitizer.Sanitize(dto.CaseControlNo);
        resident.InternalCode = InputSanitizer.Sanitize(dto.InternalCode);
        resident.SafehouseId = dto.SafehouseId;
        resident.CaseStatus = InputSanitizer.Sanitize(dto.CaseStatus);
        resident.Sex = InputSanitizer.Sanitize(dto.Sex);
        resident.DateOfBirth = dto.DateOfBirth;
        resident.BirthStatus = InputSanitizer.Sanitize(dto.BirthStatus);
        resident.PlaceOfBirth = InputSanitizer.Sanitize(dto.PlaceOfBirth);
        resident.Religion = InputSanitizer.Sanitize(dto.Religion);
        resident.CaseCategory = InputSanitizer.Sanitize(dto.CaseCategory);
        resident.SubCatOrphaned = dto.SubCatOrphaned;
        resident.SubCatTrafficked = dto.SubCatTrafficked;
        resident.SubCatChildLabor = dto.SubCatChildLabor;
        resident.SubCatPhysicalAbuse = dto.SubCatPhysicalAbuse;
        resident.SubCatSexualAbuse = dto.SubCatSexualAbuse;
        resident.SubCatOsaec = dto.SubCatOsaec;
        resident.SubCatCicl = dto.SubCatCicl;
        resident.SubCatAtRisk = dto.SubCatAtRisk;
        resident.SubCatStreetChild = dto.SubCatStreetChild;
        resident.SubCatChildWithHiv = dto.SubCatChildWithHiv;
        resident.IsPwd = dto.IsPwd;
        resident.PwdType = InputSanitizer.Sanitize(dto.PwdType);
        resident.HasSpecialNeeds = dto.HasSpecialNeeds;
        resident.SpecialNeedsDiagnosis = InputSanitizer.Sanitize(dto.SpecialNeedsDiagnosis);
        resident.FamilyIs4ps = dto.FamilyIs4ps;
        resident.FamilySoloParent = dto.FamilySoloParent;
        resident.FamilyIndigenous = dto.FamilyIndigenous;
        resident.FamilyParentPwd = dto.FamilyParentPwd;
        resident.FamilyInformalSettler = dto.FamilyInformalSettler;
        resident.DateOfAdmission = dto.DateOfAdmission;
        resident.AgeUponAdmission = InputSanitizer.Sanitize(dto.AgeUponAdmission);
        resident.PresentAge = InputSanitizer.Sanitize(dto.PresentAge);
        resident.LengthOfStay = InputSanitizer.Sanitize(dto.LengthOfStay);
        resident.ReferralSource = InputSanitizer.Sanitize(dto.ReferralSource);
        resident.ReferringAgencyPerson = InputSanitizer.Sanitize(dto.ReferringAgencyPerson);
        resident.DateColbRegistered = dto.DateColbRegistered;
        resident.DateColbObtained = dto.DateColbObtained;
        resident.AssignedSocialWorker = InputSanitizer.Sanitize(dto.AssignedSocialWorker);
        resident.InitialCaseAssessment = InputSanitizer.Sanitize(dto.InitialCaseAssessment);
        resident.DateCaseStudyPrepared = dto.DateCaseStudyPrepared;
        resident.ReintegrationType = InputSanitizer.Sanitize(dto.ReintegrationType);
        resident.ReintegrationStatus = InputSanitizer.Sanitize(dto.ReintegrationStatus);
        resident.InitialRiskLevel = InputSanitizer.Sanitize(dto.InitialRiskLevel);
        resident.CurrentRiskLevel = InputSanitizer.Sanitize(dto.CurrentRiskLevel);
        resident.DateEnrolled = dto.DateEnrolled;
        resident.DateClosed = dto.DateClosed;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var resident = await db.Residents.FindAsync(id);
        if (resident == null) return NotFound();

        db.Residents.Remove(resident);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ResidentDetailDto MapToDetailDto(Resident r) => new()
    {
        ResidentId = r.ResidentId,
        CaseControlNo = r.CaseControlNo,
        InternalCode = r.InternalCode,
        SafehouseId = r.SafehouseId,
        SafehouseName = r.Safehouse?.Name,
        CaseStatus = r.CaseStatus,
        Sex = r.Sex,
        DateOfBirth = r.DateOfBirth,
        BirthStatus = r.BirthStatus,
        PlaceOfBirth = r.PlaceOfBirth,
        Religion = r.Religion,
        CaseCategory = r.CaseCategory,
        SubCatOrphaned = r.SubCatOrphaned,
        SubCatTrafficked = r.SubCatTrafficked,
        SubCatChildLabor = r.SubCatChildLabor,
        SubCatPhysicalAbuse = r.SubCatPhysicalAbuse,
        SubCatSexualAbuse = r.SubCatSexualAbuse,
        SubCatOsaec = r.SubCatOsaec,
        SubCatCicl = r.SubCatCicl,
        SubCatAtRisk = r.SubCatAtRisk,
        SubCatStreetChild = r.SubCatStreetChild,
        SubCatChildWithHiv = r.SubCatChildWithHiv,
        IsPwd = r.IsPwd,
        PwdType = r.PwdType,
        HasSpecialNeeds = r.HasSpecialNeeds,
        SpecialNeedsDiagnosis = r.SpecialNeedsDiagnosis,
        FamilyIs4ps = r.FamilyIs4ps,
        FamilySoloParent = r.FamilySoloParent,
        FamilyIndigenous = r.FamilyIndigenous,
        FamilyParentPwd = r.FamilyParentPwd,
        FamilyInformalSettler = r.FamilyInformalSettler,
        DateOfAdmission = r.DateOfAdmission,
        AgeUponAdmission = r.AgeUponAdmission,
        PresentAge = r.PresentAge,
        LengthOfStay = r.LengthOfStay,
        ReferralSource = r.ReferralSource,
        ReferringAgencyPerson = r.ReferringAgencyPerson,
        DateColbRegistered = r.DateColbRegistered,
        DateColbObtained = r.DateColbObtained,
        AssignedSocialWorker = r.AssignedSocialWorker,
        InitialCaseAssessment = r.InitialCaseAssessment,
        DateCaseStudyPrepared = r.DateCaseStudyPrepared,
        ReintegrationType = r.ReintegrationType,
        ReintegrationStatus = r.ReintegrationStatus,
        InitialRiskLevel = r.InitialRiskLevel,
        CurrentRiskLevel = r.CurrentRiskLevel,
        DateEnrolled = r.DateEnrolled,
        DateClosed = r.DateClosed,
        CreatedAt = r.CreatedAt
    };
}
