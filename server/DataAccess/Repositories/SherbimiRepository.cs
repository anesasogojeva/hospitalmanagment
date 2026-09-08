using dizajn_Projekti.Database;
using dizajn_Projekti.DataAccess.Interfaces;

using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class SherbimiRepository : ISherbimiRepository
    {
        private readonly HospitalDbContext _context;

        public SherbimiRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SherbimiModel>> GetAllAsync()
        {
            return await _context.Sherbimi.ToListAsync();
        }

        public async Task<SherbimiModel?> GetByIdAsync(int id)
        {
            return await _context.Sherbimi.FindAsync(id);
        }

        public async Task AddAsync(SherbimiModel sherbimi)
        {
            await _context.Sherbimi.AddAsync(sherbimi);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SherbimiModel sherbimi)
        {
            _context.Entry(sherbimi).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var sherbimi = await GetByIdAsync(id);
            if (sherbimi != null)
            {
                _context.Sherbimi.Remove(sherbimi);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Sherbimi.AnyAsync(s => s.Id_S == id);
        }

        public async Task<(List<SherbimiModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.Sherbimi.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(s =>
                    (s.Emri != null && s.Emri.Contains(term)) ||
                    (s.Pershkrimi != null && s.Pershkrimi.Contains(term)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(s => s.Emri)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}