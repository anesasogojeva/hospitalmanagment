using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class EmergencyRepository : IEmergencyRepository
    {
        private readonly HospitalDbContext _context;

        public EmergencyRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmergencyModel>> GetAllAsync()
        {
            return await _context.EmergencyModel
                .Include(e => e.DoctorNavigation)
                .Include(e => e.PatientNavigation)
                .ToListAsync();
        }

        public async Task<EmergencyModel?> GetByIdAsync(int id)
        {
            return await _context.EmergencyModel
                .Include(e => e.DoctorNavigation)
                .Include(e => e.PatientNavigation)
                .FirstOrDefaultAsync(e => e.Id_E == id);
        }

        public async Task AddAsync(EmergencyModel emergency)
        {
            await _context.EmergencyModel.AddAsync(emergency);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(EmergencyModel emergency)
        {
            _context.Entry(emergency).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var emergency = await GetByIdAsync(id);
            if (emergency != null)
            {
                _context.EmergencyModel.Remove(emergency);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.EmergencyModel.AnyAsync(e => e.Id_E == id);
        }
        public async Task<List<EmergencyModel>> GetPatientEmergenciesAsync(int patientId)
        {
            return await _context.EmergencyModel
                .Where(e => e.Patient == patientId)
                .ToListAsync();
        }

        public async Task<IEnumerable<EmergencyModel>> GetDoctorEmergency(string userId)
        {
            var doctor = await _context.Doktori.FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor == null)
            {
                throw new KeyNotFoundException("Doctor not found for the provided userId.");
            }

            return await _context.EmergencyModel
                .Where(e => e.Doctor == doctor.Id)
                .ToListAsync();
        }


    }
}