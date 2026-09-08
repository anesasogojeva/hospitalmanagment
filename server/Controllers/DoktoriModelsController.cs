using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services;
using dizajn_Projekti.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
//[Authorize(Roles = "admin,patient")]
public class DoktoriModelsController : ControllerBase
{
    private readonly IDoktoriService _service;
    private readonly IRekordService _rekordService;
    private readonly IReservationService _reservationService;
    private readonly IEmergencyService _emergencyService;
    private readonly INurseScheduleService _nurseScheduleService;
    private readonly UserManager<User> _userManager;
    private readonly HospitalDbContext _context;

    public DoktoriModelsController(IDoktoriService service, HospitalDbContext context, IRekordService rekordService, IReservationService reservationService, IEmergencyService emergencyService, INurseScheduleService nurseScheduleService, UserManager<User> userManager, IReviewService reviewService)
    {
        _service = service;
        _context = context;
        _rekordService = rekordService;
        _reservationService = reservationService;
        _emergencyService = emergencyService;
        _nurseScheduleService = nurseScheduleService;
        _userManager = userManager;
    }

    [HttpGet]
    //  [Authorize(Roles = "admin,patient")]
    public async Task<IActionResult> GetDoktori()
    {
        try
        {
            var doktoriList = await _context.Doktori
                .Select(d => new
                {
                    d.Id,
                    d.Emri,
                    d.DataELindjes,
                    d.Email,
                    d.Specializimi,
                    d.Pervoja,
                    d.PhotoFileName,
                    d.NumriTel,
                    d.UserId
                })
                .ToListAsync();

            if (doktoriList == null || !doktoriList.Any())
            {
                return NotFound("No doktor records found.");
            }
            return Ok(doktoriList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // GET: api/DoktoriModels/search?search=&specialization=&page=1&pageSize=10
    [HttpGet("search")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> SearchDoktori(
        [FromQuery] string? search,
        [FromQuery] string? specialization,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = _context.Doktori.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(d =>
                (d.Emri != null && d.Emri.Contains(term)) ||
                (d.Email != null && d.Email.Contains(term)) ||
                (d.Specializimi != null && d.Specializimi.Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(specialization))
        {
            query = query.Where(d => d.Specializimi == specialization);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(d => d.Emri)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.Id,
                d.Emri,
                d.DataELindjes,
                d.Email,
                d.Specializimi,
                d.Pervoja,
                d.PhotoFileName,
                d.NumriTel
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount,
            totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
        });
    }

    // GET: api/DoktoriModels/specializations - distinct list for the filter dropdown
    [HttpGet("specializations")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetSpecializations()
    {
        var specializations = await _context.Doktori
            .Where(d => d.Specializimi != null && d.Specializimi != "")
            .Select(d => d.Specializimi)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();

        return Ok(specializations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DoktoriModel>> GetDoktoriModel(int id)
    {
        var doktoriModel = await _service.GetByIdAsync(id);
        if (doktoriModel == null)
            return NotFound();

        return doktoriModel;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PostDoktoriModel([FromBody] CreateDoctorRequest request)
    {
        if (!ModelState.IsValid)
        {
            var validationErrors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { Errors = validationErrors });
        }

        var (succeeded, errors, doctor) = await _service.CreateAsync(request);

        if (!succeeded)
        {
            return BadRequest(new { Errors = errors });
        }

        return CreatedAtAction("GetDoktoriModel", new { id = doctor!.Id }, doctor);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutDoktoriModel(int id, DoktoriModel doktoriModel)
    {
        await _service.UpdateAsync(id, doktoriModel);
        return NoContent();
    }

    [HttpDelete("{id}")]
   [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteDoktoriModel(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    // GET: api/DoktoriModels/doctor/profile - the authenticated doctor's own profile, for the
    // Doctor Dashboard's "My Profile" section. Resolved from the JWT, never from a client id.
    [HttpGet("doctor/profile")]
    [Authorize(Roles = "doktor")]
    public async Task<IActionResult> GetDoctorProfile()
    {
        var userId = _userManager.GetUserId(User);
        var doctor = await _context.Doktori
            .Where(d => d.UserId == userId)
            .Select(d => new
            {
                d.Id,
                d.Emri,
                d.DataELindjes,
                d.Email,
                d.Specializimi,
                d.Pervoja,
                d.PhotoFileName,
                d.NumriTel
            })
            .FirstOrDefaultAsync();

        if (doctor == null)
        {
            return NotFound(new { message = "No doctor profile is linked to this account yet." });
        }

        return Ok(doctor);
    }

    // GET: api/DoktoriModels/doctor/reservations?search=&status=&date=&page=1&pageSize=10
    [HttpGet("doctor/reservations")]
    [Authorize(Roles = "doktor")]
    public async Task<IActionResult> GetDoctorReservations(
        [FromQuery] string? search,
        [FromQuery] ReservationStatus? status,
        [FromQuery] DateTime? date,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        // Scoped to the authenticated doctor server-side - a doctor cannot view another
        // doctor's appointments by passing a different id, because no id is ever accepted here.
        var userId = _userManager.GetUserId(User);
        var (items, totalCount) = await _reservationService.GetDoctorReservations(userId, search, status, date, page, pageSize);

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount,
            totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
        });
    }

    // GET: api/DoktoriModels/doctor/patients?search=&page=1&pageSize=10
    // "My Patients" = patients who have at least one appointment with the authenticated doctor -
    // the only doctor<->patient relationship the schema has (ReservationModel), so no new
    // relationship/table was added for this.
    [HttpGet("doctor/patients")]
    [Authorize(Roles = "doktor")]
    public async Task<IActionResult> GetDoctorPatients(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var userId = _userManager.GetUserId(User);
        var doctor = await _context.Doktori.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return Ok(new { items = new List<object>(), page, pageSize, totalCount = 0, totalPages = 0 });
        }

        var patientIds = _context.ReservationModel
            .Where(r => r.Doctor == doctor.Id)
            .Select(r => r.Patient)
            .Distinct();

        var query =
            from p in _context.Pacienti
            join u in _context.Users on p.UserId equals u.Id into userJoin
            from u in userJoin.DefaultIfEmpty()
            where patientIds.Contains(p.Id_P)
            select new { Patient = p, Email = u != null ? u.Email : null };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x =>
                (x.Patient.Emri != null && x.Patient.Emri.Contains(term)) ||
                (x.Patient.Mbiemri != null && x.Patient.Mbiemri.Contains(term)) ||
                (x.Email != null && x.Email.Contains(term)) ||
                (x.Patient.NumriTel != null && x.Patient.NumriTel.ToString().Contains(term)));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Patient.Emri)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Patient.Id_P,
                x.Patient.Emri,
                x.Patient.Mbiemri,
                x.Patient.DataELindjes,
                x.Patient.NumriTel,
                x.Patient.Gjinia,
                x.Email
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount,
            totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
        });
    }

    [HttpGet("doctor/emergency")]
    [Authorize(Roles = "doktor")]
    public async Task<IActionResult> GetDoctorEmergency()
    {
        var userId = _userManager.GetUserId(User);
        var emergency = await _emergencyService.GetDoctorEmergency(userId);
        return Ok(emergency);
    }

    [HttpGet("doctor/records")]
    [Authorize(Roles = "doktor")]
    public async Task<IActionResult> GetDoctorRecords()
    {
        var userId = _userManager.GetUserId(User);
        var records = await _rekordService.GetDoctorRecords(userId);
        return Ok(records);
    }

    // GET: api/DoktoriModels/doctor/nurses - the real, Admin-managed weekly nurse schedule
    // (used to be a fake Id_i % 7 grouping - see NurseScheduleController for how Admin
    // manages the underlying data).
    [HttpGet("doctor/nurses")]
    [Authorize(Roles = "doktor")]
    public async Task<IActionResult> GetNursesForWeek()
    {
        var schedule = await _nurseScheduleService.GetAllAsync();

        DayOfWeek[] weekOrder = {
            DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday,
            DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday
        };

        var nursesByDay = weekOrder.ToDictionary(
            day => day.ToString(),
            day => schedule.Where(s => s.DayOfWeek == day).ToList());

        return Ok(nursesByDay);
    }
}
