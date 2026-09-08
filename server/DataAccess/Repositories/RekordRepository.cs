
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using dizajn_Projekti.DataAccess.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Collections;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class RekordRepository : IRekordRepository
    {
        private readonly HospitalDbContext _context;

        public RekordRepository(HospitalDbContext context)
        {
            _context = context;
        }
        

        public async Task<IEnumerable<RekordModel>> GetAllAsync()
        {
            return await _context.Rekord
                .Include(r => r.Doktori)
                .Include(r => r.Pacienti)
                .ToListAsync();
        }

        public async Task<RekordModel?> GetByIdAsync(int id)
        {
            return await _context.Rekord
                .Include(r => r.Doktori)
                .Include(r => r.Pacienti)
                .FirstOrDefaultAsync(r => r.Id_Rek == id);
        }

        public async Task AddAsync(RekordModel rekord)
        {
            await _context.Rekord.AddAsync(rekord);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(RekordModel rekord)
        {
            _context.Entry(rekord).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var rekord = await GetByIdAsync(id);
            if (rekord != null)
            {
                _context.Rekord.Remove(rekord);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Rekord.AnyAsync(r => r.Id_Rek == id);
        }
        public async Task<List<RekordModel>> GetPatientRecordsAsync(int patientId)
        {
            return await _context.Rekord
                .Where(r => r.Id_P == patientId)
                .ToListAsync();
        }
       /* public async Task<IEnumerable<RekordModel>> GetDoctorRecords(string userId)
        {
            return await _context.Rekord
                .Where(r => r.Doktori.UserId == userId)
                .ToListAsync();
        }*/

        
    }
}