using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class NurseScheduleRepository : INurseScheduleRepository
    {
        private readonly HospitalDbContext _context;

        public NurseScheduleRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<NurseScheduleModel>> GetAllAsync()
        {
            return await _context.NurseSchedules
                .Include(s => s.Nurse)
                .OrderBy(s => s.DayOfWeek)
                .ThenBy(s => s.Shift)
                .ToListAsync();
        }

        public async Task<List<NurseScheduleModel>> GetByDayAsync(DayOfWeek day)
        {
            return await _context.NurseSchedules
                .Include(s => s.Nurse)
                .Where(s => s.DayOfWeek == day)
                .OrderBy(s => s.Shift)
                .ToListAsync();
        }

        public async Task<NurseScheduleModel?> GetByIdAsync(int id)
        {
            return await _context.NurseSchedules
                .Include(s => s.Nurse)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<List<NurseScheduleModel>> GetByNurseAndDayAsync(int nurseId, DayOfWeek day, int? excludeId = null)
        {
            var query = _context.NurseSchedules
                .Where(s => s.NurseId == nurseId && s.DayOfWeek == day);

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return await query.ToListAsync();
        }

        public async Task AddAsync(NurseScheduleModel schedule)
        {
            await _context.NurseSchedules.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(NurseScheduleModel schedule)
        {
            var existing = await _context.NurseSchedules.FindAsync(schedule.Id);
            if (existing == null)
            {
                throw new KeyNotFoundException("Schedule entry not found");
            }

            existing.NurseId = schedule.NurseId;
            existing.DayOfWeek = schedule.DayOfWeek;
            existing.Shift = schedule.Shift;
            existing.StartTime = schedule.StartTime;
            existing.EndTime = schedule.EndTime;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _context.NurseSchedules.FindAsync(id);
            if (existing != null)
            {
                _context.NurseSchedules.Remove(existing);
                await _context.SaveChangesAsync();
            }
        }
    }
}
