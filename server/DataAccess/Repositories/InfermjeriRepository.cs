using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class InfermjeriRepository : IInfermjeriRepository
    {
        private readonly HospitalDbContext _context;

        public InfermjeriRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InfermjeriModel>> GetAllAsync()
        {
            return await _context.Infermjeri.ToListAsync();
        }

        public async Task<InfermjeriModel> GetByIdAsync(int id)
        {
            return await _context.Infermjeri.FindAsync(id);
        }

        public async Task AddAsync(InfermjeriModel infermjeri)
        {
            await _context.Infermjeri.AddAsync(infermjeri);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(InfermjeriModel infermjeri)
        {
            _context.Entry(infermjeri).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var infermjeri = await GetByIdAsync(id);
            if (infermjeri != null)
            {
                _context.Infermjeri.Remove(infermjeri);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Infermjeri.AnyAsync(e => e.Id_i == id);
        }

        public async Task<(List<InfermjeriModel> Items, int TotalCount)> SearchAsync(string? search, string? department, int page, int pageSize)
        {
            var query = _context.Infermjeri.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(n =>
                    (n.Emri != null && n.Emri.Contains(term)) ||
                    (n.Mbiemri != null && n.Mbiemri.Contains(term)) ||
                    (n.Email != null && n.Email.Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                query = query.Where(n => n.Departamenti == department);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(n => n.Emri)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
        public async Task<Dictionary<string, List<object>>> GetNursesForWeek()
        {
            var nurses = await _context.Infermjeri
                .Select(n => new
                {
                    n.Id_i,
                    n.Emri,
                    n.Mbiemri,
                    n.Departamenti,
                    n.Email,
                    n.NumriTel,
                    Day = (n.Id_i % 7)  // Assuming nurses are assigned to days in a cyclic manner
                })
                .ToListAsync();

            var nursesByDay = new Dictionary<string, List<object>>
        {
            { "Monday", nurses.Where(n => n.Day == 1).Select(n => (object)n).ToList() },
            { "Tuesday", nurses.Where(n => n.Day == 2).Select(n => (object)n).ToList() },
            { "Wednesday", nurses.Where(n => n.Day == 3).Select(n => (object)n).ToList() },
            { "Thursday", nurses.Where(n => n.Day == 4).Select(n => (object)n).ToList() },
            { "Friday", nurses.Where(n => n.Day == 5).Select(n => (object)n).ToList() },
            { "Saturday", nurses.Where(n => n.Day == 6).Select(n => (object)n).ToList() },
            { "Sunday", nurses.Where(n => n.Day == 0).Select(n => (object)n).ToList() }
        };

            return nursesByDay;
        }
    }
}
