using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;

using dizajn_Projekti.Models;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly HospitalDbContext _context;

        public ReservationRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReservationModel>> GetAllAsync()
        {
            return await _context.ReservationModel
                .Include(r => r.DoctorNavigation)
            .Include(r => r.PatientNavigation)
                .ToListAsync();
        }

        public async Task<ReservationModel?> GetByIdAsync(int id)
        {
            return await _context.ReservationModel
                .Include(r => r.DoctorNavigation)
                .Include(r => r.PatientNavigation)
                .FirstOrDefaultAsync(r => r.ReservationId == id);
        }

        public async Task AddAsync(ReservationModel reservation)
        {
            await _context.ReservationModel.AddAsync(reservation);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ReservationModel reservation)
        {
            // Load-and-copy (rather than attaching the whole posted graph as Modified) so that
            // fields the edit form doesn't send - like Status - aren't silently reset to their
            // default value.
            var existing = await _context.ReservationModel.FindAsync(reservation.ReservationId);
            if (existing == null) return;

            existing.ReservationDate = reservation.ReservationDate;
            existing.ReservationTime = reservation.ReservationTime;
            existing.Patient = reservation.Patient;
            existing.Doctor = reservation.Doctor;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(int id, ReservationStatus status)
        {
            var reservation = await _context.ReservationModel.FindAsync(id);
            if (reservation == null) return;

            reservation.Status = status;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var reservation = await GetByIdAsync(id);
            if (reservation != null)
            {
                _context.ReservationModel.Remove(reservation);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ReservationModel.AnyAsync(r => r.ReservationId == id);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task<List<ReservationModel>> GetPatientReservationsAsync(int patientId)
        {
            return await _context.ReservationModel
                .Where(r => r.Patient == patientId)
                .ToListAsync();
        }
        



    }
}