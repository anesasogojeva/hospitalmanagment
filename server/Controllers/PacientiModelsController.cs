using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using dizajn_Projekti.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dizajn_Projekti.Services;
using Microsoft.AspNetCore.Identity;

namespace dizajn_Projekti.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
//[Authorize(Roles = "admin,doktor,patient")]
    public class PacientiModelsController : ControllerBase
    {
        private readonly IPacientiService _pacientiService;
        private readonly IRekordService _rekordService;
        private readonly IReservationService _reservationService;
        private readonly IEmergencyService _emergencyService;
        private readonly UserManager<User> _userManager;
        private readonly HospitalDbContext _context;
        private readonly IReviewService _reviewService;
        public PacientiModelsController(IPacientiService pacientiService, HospitalDbContext context, IRekordService rekordService, IReservationService reservationService, IEmergencyService emergencyService, UserManager<User> userManager, IReviewService reviewService)
        {
            _pacientiService = pacientiService;
            _rekordService = rekordService;
            _reservationService = reservationService;
            _emergencyService = emergencyService;
            _userManager = userManager;
            _context = context;
            _reviewService = reviewService;
        }

        // GET: api/PacientiModels
        [HttpGet]
        [Authorize(Roles = "admin,patient,doktor")]
        public async Task<IActionResult> GetPacienti()
        {
            try
            {
                var pacientiList = await _context.Pacienti
                    .Select(p => new
                    {
                        p.Id_P,
                        p.Emri,
                        p.Mbiemri,
                        p.DataELindjes,
                        p.NumriTel,
                        p.Gjinia,
                        p.UserId
                    })
                    .ToListAsync();

                if (pacientiList == null || !pacientiList.Any())
                {
                    return NotFound("No pacienti records found.");
                }
                return Ok(pacientiList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // GET: api/PacientiModels/search?search=&gender=&page=1&pageSize=10
        [HttpGet("search")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> SearchPacienti(
            [FromQuery] string? search,
            [FromQuery] string? gender,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query =
                from p in _context.Pacienti
                join u in _context.Users on p.UserId equals u.Id into userJoin
                from u in userJoin.DefaultIfEmpty()
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

            if (!string.IsNullOrWhiteSpace(gender))
            {
                query = query.Where(x => x.Patient.Gjinia == gender);
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

        // POST: api/PacientiModels
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PostPacientiModel([FromBody] CreatePatientRequest request)
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new { Errors = validationErrors });
            }

            var (succeeded, errors, patient) = await _pacientiService.AddAsync(request);

            if (!succeeded)
            {
                return BadRequest(new { Errors = errors });
            }

            return CreatedAtAction("GetPacientiModel", new { id = patient!.Id_P }, patient);
        }

        // GET: api/PacientiModels/5
        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetPacientiModel(int id)
        {
            var pacientiModel = await _pacientiService.GetByIdAsync(id);
            if (pacientiModel == null)
            {
                return NotFound();
            }

            var user = !string.IsNullOrWhiteSpace(pacientiModel.UserId)
                ? await _userManager.FindByIdAsync(pacientiModel.UserId)
                : null;

            return Ok(new
            {
                pacientiModel.Id_P,
                pacientiModel.Emri,
                pacientiModel.Mbiemri,
                pacientiModel.DataELindjes,
                pacientiModel.NumriTel,
                pacientiModel.Gjinia,
                pacientiModel.UserId,
                Email = user?.Email
            });
        }

        // PUT: api/PacientiModels/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutPacientiModel(int id, PacientiModel pacientiModel)
        {
            try
            {
                await _pacientiService.UpdateAsync(id, pacientiModel);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        // DELETE: api/PacientiModels/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeletePacientiModel(int id)
        {
            try
            {
                await _pacientiService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound($"Error: {ex.Message}");
            }
        }
        [HttpGet("patient/reservations")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetPatientReservations([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var userId = _userManager.GetUserId(User);
            var (items, totalCount) = await _reservationService.GetPatientReservations(userId, page, pageSize);
            return Ok(new
            {
                items,
                page,
                pageSize,
                totalCount,
                totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
            });
        }

        [HttpGet("patient/emergency")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetPatientEmergency([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var userId = _userManager.GetUserId(User);
            var (items, totalCount) = await _emergencyService.GetPatientEmergency(userId, page, pageSize);
            return Ok(new
            {
                items,
                page,
                pageSize,
                totalCount,
                totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
            });
        }

        [HttpPost("patient/emergency")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> CreateEmergency([FromBody] EmergencyModel request)
        {
            var userId = _userManager.GetUserId(User);
            await _emergencyService.AddEmergency(request, userId);
            return CreatedAtAction(nameof(GetPatientEmergency), new { id = request.Id_E }, request);
        }

        [HttpPost("patient/reservations")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationModel request)
        {
            var userId = _userManager.GetUserId(User);
            try
            {
                await _reservationService.AddReservation(request, userId);
                return CreatedAtAction(nameof(GetPatientReservations), new { id = request.ReservationId }, request);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("patient/reservations/availability")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetDoctorAvailability([FromQuery] int doctorId, [FromQuery] DateTime date)
        {
            var slots = await _reservationService.GetDoctorAvailability(doctorId, date);
            return Ok(slots);
        }

        [HttpGet("patient/records")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetPatientRecords([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var userId = _userManager.GetUserId(User);
            var (items, totalCount) = await _rekordService.GetPatientRecords(userId, page, pageSize);
            return Ok(new
            {
                items,
                page,
                pageSize,
                totalCount,
                totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
            });
        }

        [HttpPost("patient/reviews")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> AddReview([FromBody] ReviewModel newReview)
        {
            try
            {
                var userId = _userManager.GetUserId(User);

                // Validate patient existence
                var patient = await _context.Pacienti
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (patient == null)
                {
                    return NotFound(new { message = "Patient not found" });
                }

                // Assign the patient's ID to the review
                newReview.Id_P = patient.Id_P;
                await _reviewService.AddReviewAsync(newReview);

                return CreatedAtAction(nameof(GetPatientReviews), new { id = newReview.Id_R }, newReview);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("patient/reviews")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetPatientReviews()
        {
            var userId = _userManager.GetUserId(User);
            var reviews = await _reviewService.GetPatientReviewsAsync(userId);
            return Ok(reviews);
        }

    }

}