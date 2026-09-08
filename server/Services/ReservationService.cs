using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Services.Interfaces;

using dizajn_Projekti.Models;

using Microsoft.CodeAnalysis;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using dizajn_Projekti.Database;
using dizajn_Projekti.Factories.Interfaces;
using NuGet.Protocol.Core.Types;

namespace dizajn_Projekti.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationFactory _reservationFactory;
        private readonly IReservationRepository _reservationRepository;
        private readonly IDoktoriRepository _doctorRepository;
        private readonly IPacientiRepository _pacientiRepository;
        private readonly HospitalDbContext _context;
        private readonly UserManager<User> _userManager;

        public ReservationService(HospitalDbContext context, UserManager<User> userManager, IReservationRepository reservationRepository, IDoktoriRepository doctorRepository, IPacientiRepository pacientiRepository, IReservationFactory reservationFactory)
        {
            _reservationRepository = reservationRepository;
            _doctorRepository = doctorRepository;
            _pacientiRepository = pacientiRepository;
            _context = context;
            _userManager = userManager;
            _reservationFactory = reservationFactory;
        }
       /* public async Task<IEnumerable<ReservationModel>> GetDoctorReservations(string userId)
        {
            return await _reservationRepository.GetReservationsByDoctor(userId);
        }*/

        public async Task<(List<ReservationModel> Items, int TotalCount)> GetPatientReservations(string userId, int page, int pageSize)
        {
            var patient = await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) throw new Exception("Patient not found");

            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var today = DateTime.Today;
            var query = _context.ReservationModel
                .Include(r => r.DoctorNavigation)
                .Where(r => r.Patient == patient.Id_P);

            var totalCount = await query.CountAsync();

            // Upcoming appointments first (soonest first), then past ones.
            var items = await query
                .OrderBy(r => r.ReservationDate.HasValue && r.ReservationDate.Value.Date >= today ? 0 : 1)
                .ThenBy(r => r.ReservationDate)
                .ThenBy(r => r.ReservationTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
        public async Task<(List<DoctorAppointmentDto> Items, int TotalCount)> GetDoctorReservations(
            string userId, string? search, ReservationStatus? status, DateTime? date, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            // No doctor profile linked to this account -> no appointments, not an error.
            var doctor = await _context.Doktori.FirstOrDefaultAsync(d => d.UserId == userId);
            if (doctor == null)
            {
                return (new List<DoctorAppointmentDto>(), 0);
            }

            // Patient email lives on the linked User, not PacientiModel, hence the join
            // (same pattern GetDoctorPatients/admin's SearchPacienti already use).
            var query =
                from r in _context.ReservationModel
                join p in _context.Pacienti on r.Patient equals p.Id_P
                join u in _context.Users on p.UserId equals u.Id into userJoin
                from u in userJoin.DefaultIfEmpty()
                where r.Doctor == doctor.Id
                select new { Reservation = r, Patient = p, Email = u != null ? u.Email : null };

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(x =>
                    (x.Patient.Emri != null && x.Patient.Emri.Contains(term)) ||
                    (x.Patient.Mbiemri != null && x.Patient.Mbiemri.Contains(term)));
            }

            if (status.HasValue)
            {
                query = query.Where(x => x.Reservation.Status == status.Value);
            }

            if (date.HasValue)
            {
                var day = date.Value.Date;
                query = query.Where(x => x.Reservation.ReservationDate.HasValue && x.Reservation.ReservationDate.Value.Date == day);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.Reservation.ReservationDate)
                .ThenBy(x => x.Reservation.ReservationTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new DoctorAppointmentDto
                {
                    ReservationId = x.Reservation.ReservationId,
                    ReservationDate = x.Reservation.ReservationDate,
                    ReservationTime = x.Reservation.ReservationTime,
                    Status = x.Reservation.Status,
                    PatientId = x.Patient.Id_P,
                    PatientName = x.Patient.Emri,
                    PatientSurname = x.Patient.Mbiemri,
                    PatientEmail = x.Email,
                    PatientPhone = x.Patient.NumriTel != null ? x.Patient.NumriTel.ToString() : null
                })
                .ToListAsync();

            return (items, totalCount);
        }

        private static readonly string[] WorkingHourSlots = new[]
        {
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
        };

        public async Task AddReservation(ReservationModel reservationModel, string userId)
        {
            var patient = await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) throw new Exception("Patient not found");

            if (reservationModel.ReservationDate.HasValue)
            {
                var requestedDate = reservationModel.ReservationDate.Value.Date;
                bool slotTaken = await _context.ReservationModel.AnyAsync(r =>
                    r.Doctor == reservationModel.Doctor &&
                    r.ReservationDate.HasValue &&
                    r.ReservationDate.Value.Date == requestedDate &&
                    r.ReservationTime == reservationModel.ReservationTime);

                if (slotTaken)
                {
                    throw new InvalidOperationException("This time slot is no longer available. Please select another time.");
                }
            }

            var reservation = _reservationFactory.CreateReservation(
                reservationModel.ReservationDate,
                reservationModel.ReservationTime,
                patient.Id_P,
                reservationModel.Doctor);

            await _reservationRepository.AddAsync(reservation);
        }

        public async Task<(List<ReservationModel> Items, int TotalCount)> SearchAsync(
            string? search, int? doctorId, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.ReservationModel
                .Include(r => r.DoctorNavigation)
                .Include(r => r.PatientNavigation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(r =>
                    (r.DoctorNavigation != null && r.DoctorNavigation.Emri != null && r.DoctorNavigation.Emri.Contains(term)) ||
                    (r.PatientNavigation != null && r.PatientNavigation.Emri != null && r.PatientNavigation.Emri.Contains(term)) ||
                    (r.PatientNavigation != null && r.PatientNavigation.Mbiemri != null && r.PatientNavigation.Mbiemri.Contains(term)));
            }

            if (doctorId.HasValue)
            {
                query = query.Where(r => r.Doctor == doctorId.Value);
            }

            if (dateFrom.HasValue)
            {
                var from = dateFrom.Value.Date;
                query = query.Where(r => r.ReservationDate.HasValue && r.ReservationDate.Value.Date >= from);
            }

            if (dateTo.HasValue)
            {
                var to = dateTo.Value.Date;
                query = query.Where(r => r.ReservationDate.HasValue && r.ReservationDate.Value.Date <= to);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(r => r.ReservationDate)
                .ThenBy(r => r.ReservationTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<IEnumerable<object>> GetDoctorAvailability(int doctorId, DateTime date)
        {
            var requestedDate = date.Date;
            var bookedTimes = await _context.ReservationModel
                .Where(r => r.Doctor == doctorId && r.ReservationDate.HasValue && r.ReservationDate.Value.Date == requestedDate)
                .Select(r => r.ReservationTime)
                .ToListAsync();

            return WorkingHourSlots.Select(slot => new
            {
                Time = slot,
                Available = !bookedTimes.Contains(slot)
            });
        }

        public async Task<IEnumerable<ReservationModel>> GetAllReservationsAsync()
        {
            return await _reservationRepository.GetAllAsync();
        }

        public async Task<ReservationModel> GetReservationByIdAsync(int id)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
            {
                throw new KeyNotFoundException("Reservation not found");
            }
            return reservation;
        }

        public async Task AddReservationAsync(ReservationModel reservation)
        {
            var doctor = await _doctorRepository.GetByIdAsync(reservation.Doctor);
            if (doctor == null)
            {
                throw new KeyNotFoundException("Doctor not found");
            }

            var patient = await _pacientiRepository.GetByIdAsync(reservation.Patient);
            if (patient == null)
            {
                throw new KeyNotFoundException("Patient not found");
            }

            reservation.DoctorNavigation = doctor;
            reservation.PatientNavigation = patient;

            await _reservationRepository.AddAsync(reservation);
        }

        public async Task UpdateReservationAsync(int id, ReservationModel reservation)
        {
            if (id != reservation.ReservationId)
            {
                throw new ArgumentException("ID mismatch");
            }

            if (!await _reservationRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Reservation not found");
            }

            await _reservationRepository.UpdateAsync(reservation);
        }

        public async Task DeleteReservationAsync(int id)
        {
            if (!await _reservationRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Reservation not found");
            }

            await _reservationRepository.DeleteAsync(id);
        }

        public async Task UpdateReservationStatusAsync(int id, ReservationStatus status)
        {
            if (!await _reservationRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Reservation not found");
            }

            await _reservationRepository.UpdateStatusAsync(id, status);
        }

        public async Task<bool> IsReservationOwnedByDoctorUserAsync(int reservationId, string userId)
        {
            var doctor = await _context.Doktori.FirstOrDefaultAsync(d => d.UserId == userId);
            if (doctor == null)
            {
                return false;
            }

            return await _context.ReservationModel.AnyAsync(r => r.ReservationId == reservationId && r.Doctor == doctor.Id);
        }
    }
}