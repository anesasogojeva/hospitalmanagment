using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dizajn_Projekti.Controllers
{
    // Doctor's own record-keeping (pre-existing) plus read-only analytics for the
    // admin dashboard. Every analytics metric here is computed from data that
    // genuinely exists in the schema - no fabricated numbers.
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly HospitalDbContext _context;
        private readonly IRekordService _rekordService;
        private readonly UserManager<User> _userManager;

        public DashboardController(HospitalDbContext context, IRekordService rekordService, UserManager<User> userManager)
        {
            _context = context;
            _rekordService = rekordService;
            _userManager = userManager;
        }

        // GET: api/Dashboard/doctor/records
        [HttpGet("doctor/records")]
        [Authorize(Roles = "doktor")]
        public async Task<IActionResult> GetDoctorRecords()
        {
            var userId = _userManager.GetUserId(User);
            var records = await _rekordService.GetDoctorRecords(userId);
            return Ok(records);
        }

        // POST: api/Dashboard/doctor/records
        [HttpPost("doctor/records")]
        [Authorize(Roles = "doktor")]
        public async Task<IActionResult> AddRecord([FromBody] RekordModel newRecord)
        {
            var userId = _userManager.GetUserId(User);
            await _rekordService.AddRecord(newRecord, userId);
            return CreatedAtAction(nameof(GetDoctorRecords), new { id = newRecord.Id_Rek }, newRecord);
        }

        // GET: api/Dashboard/summary
        [HttpGet("summary")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetSummary()
        {
            var today = DateTime.Today;

            var totalPatients = await _context.Pacienti.CountAsync();
            var totalDoctors = await _context.Doktori.CountAsync();

            var todaysAppointments = await _context.ReservationModel
                .Where(r => r.ReservationDate.HasValue && r.ReservationDate.Value.Date == today)
                .ToListAsync();

            var nowTime = DateTime.Now.ToString("HH:mm");
            var todaysUpcoming = todaysAppointments.Count(r =>
                string.Compare(r.ReservationTime, nowTime, StringComparison.Ordinal) >= 0);
            var todaysPast = todaysAppointments.Count - todaysUpcoming;

            var totalAppointments = await _context.ReservationModel.CountAsync();
            var scheduledCount = await _context.ReservationModel.CountAsync(r => r.Status == ReservationStatus.Scheduled);
            var completedCount = await _context.ReservationModel.CountAsync(r => r.Status == ReservationStatus.Completed);
            var cancelledCount = await _context.ReservationModel.CountAsync(r => r.Status == ReservationStatus.Cancelled);
            var cancellationRate = totalAppointments > 0
                ? Math.Round(cancelledCount * 100.0 / totalAppointments, 1)
                : 0;

            return Ok(new
            {
                totalPatients,
                totalDoctors,
                todaysAppointments = todaysAppointments.Count,
                todaysUpcoming,
                todaysPast,
                totalAppointments,
                scheduledCount,
                completedCount,
                cancelledCount,
                cancellationRate
            });
        }

        // GET: api/Dashboard/upcoming-appointments?limit=10
        [HttpGet("upcoming-appointments")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUpcomingAppointments([FromQuery] int limit = 10)
        {
            limit = limit is < 1 or > 100 ? 10 : limit;
            var today = DateTime.Today;

            // Bound the query by date in SQL (translatable), then refine by time-of-day in memory
            // since ReservationTime is a free-text "HH:mm" string, not a proper time column.
            var candidates = await _context.ReservationModel
                .Include(r => r.DoctorNavigation)
                .Include(r => r.PatientNavigation)
                .Where(r => r.ReservationDate.HasValue && r.ReservationDate.Value.Date >= today)
                .ToListAsync();

            var nowTime = DateTime.Now.ToString("HH:mm");

            var upcoming = candidates
                .Where(r => r.ReservationDate!.Value.Date > today ||
                            string.Compare(r.ReservationTime, nowTime, StringComparison.Ordinal) >= 0)
                .OrderBy(r => r.ReservationDate)
                .ThenBy(r => r.ReservationTime)
                .Take(limit)
                .Select(r => new
                {
                    r.ReservationId,
                    r.ReservationDate,
                    r.ReservationTime,
                    r.Status,
                    PatientName = r.PatientNavigation != null
                        ? $"{r.PatientNavigation.Emri} {r.PatientNavigation.Mbiemri}".Trim()
                        : null,
                    DoctorName = r.DoctorNavigation != null ? r.DoctorNavigation.Emri : null,
                    Specialization = r.DoctorNavigation != null ? r.DoctorNavigation.Specializimi : null
                });

            return Ok(upcoming);
        }

        // GET: api/Dashboard/appointments-by-doctor
        [HttpGet("appointments-by-doctor")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAppointmentsByDoctor()
        {
            var data = await _context.ReservationModel
                .Include(r => r.DoctorNavigation)
                .Where(r => r.DoctorNavigation != null)
                .GroupBy(r => new { r.Doctor, r.DoctorNavigation!.Emri, r.DoctorNavigation.Specializimi })
                .Select(g => new
                {
                    DoctorId = g.Key.Doctor,
                    DoctorName = g.Key.Emri,
                    Specialization = g.Key.Specializimi,
                    AppointmentCount = g.Count()
                })
                .OrderByDescending(x => x.AppointmentCount)
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/Dashboard/appointments-by-specialty
        [HttpGet("appointments-by-specialty")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAppointmentsBySpecialty()
        {
            var data = await _context.ReservationModel
                .Include(r => r.DoctorNavigation)
                .Where(r => r.DoctorNavigation != null && r.DoctorNavigation.Specializimi != null)
                .GroupBy(r => r.DoctorNavigation!.Specializimi)
                .Select(g => new { Specialization = g.Key, AppointmentCount = g.Count() })
                .OrderByDescending(x => x.AppointmentCount)
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/Dashboard/appointment-trends?days=30
        [HttpGet("appointment-trends")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAppointmentTrends([FromQuery] int days = 30)
        {
            days = days is < 7 or > 365 ? 30 : days;
            var startDate = DateTime.Today.AddDays(-(days - 1));

            var raw = await _context.ReservationModel
                .Where(r => r.ReservationDate.HasValue && r.ReservationDate.Value.Date >= startDate)
                .GroupBy(r => r.ReservationDate!.Value.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            // Fill in zero-count days so the chart shows a continuous series, not just active days.
            var series = new List<object>();
            for (var day = startDate; day <= DateTime.Today; day = day.AddDays(1))
            {
                var match = raw.FirstOrDefault(r => r.Date == day);
                series.Add(new { date = day.ToString("yyyy-MM-dd"), count = match?.Count ?? 0 });
            }

            return Ok(series);
        }

        // GET: api/Dashboard/patient-demographics
        [HttpGet("patient-demographics")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetPatientDemographics()
        {
            var patients = await _context.Pacienti
                .Select(p => new { p.Gjinia, p.DataELindjes })
                .ToListAsync();

            var genderBreakdown = patients
                .GroupBy(p => string.IsNullOrWhiteSpace(p.Gjinia) ? "Unspecified" : p.Gjinia)
                .Select(g => new { gender = g.Key, count = g.Count() })
                .ToList();

            int? GetAge(DateTime? dob)
            {
                if (!dob.HasValue) return null;
                var today = DateTime.Today;
                var age = today.Year - dob.Value.Year;
                if (dob.Value.Date > today.AddYears(-age)) age--;
                return age;
            }

            string BucketFor(int? age) => age switch
            {
                null => "Unknown",
                < 18 => "0-17",
                < 35 => "18-34",
                < 55 => "35-54",
                < 75 => "55-74",
                _ => "75+"
            };

            var ageBuckets = new[] { "0-17", "18-34", "35-54", "55-74", "75+", "Unknown" };
            var ageCounts = patients
                .GroupBy(p => BucketFor(GetAge(p.DataELindjes)))
                .ToDictionary(g => g.Key, g => g.Count());

            var ageBreakdown = ageBuckets.Select(bucket => new
            {
                bucket,
                count = ageCounts.TryGetValue(bucket, out var count) ? count : 0
            });

            return Ok(new { genderBreakdown, ageBreakdown });
        }
    }
}
