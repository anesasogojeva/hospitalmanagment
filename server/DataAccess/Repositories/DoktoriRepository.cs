using dizajn_Projekti.Models;
using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;
using Microsoft.EntityFrameworkCore;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class DoktoriRepository : IDoktoriRepository
    {
        private readonly HospitalDbContext _context;

        public DoktoriRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DoktoriModel>> GetAllAsync()
        {
            return await _context.Doktori.ToListAsync();
        }

        public async Task<DoktoriModel?> GetByIdAsync(int id)
        {
            return await _context.Doktori.FindAsync(id);
        }

        public async Task AddAsync(DoktoriModel doktoriModel)
        {
            _context.Doktori.Add(doktoriModel);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(DoktoriModel doktoriModel)
        {
            var existingDoktori = await _context.Doktori.FindAsync(doktoriModel.Id);
            if (existingDoktori == null)
                throw new Exception("Doctor not found.");

            // Update fields manually to prevent overwriting UserId
            existingDoktori.Emri = doktoriModel.Emri;
            existingDoktori.DataELindjes = doktoriModel.DataELindjes;
            existingDoktori.Email = doktoriModel.Email;
            existingDoktori.Specializimi = doktoriModel.Specializimi;
            existingDoktori.Pervoja = doktoriModel.Pervoja;
            existingDoktori.PhotoFileName = doktoriModel.PhotoFileName;
            existingDoktori.NumriTel = doktoriModel.NumriTel;

            _context.Entry(existingDoktori).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(DoktoriModel doktoriModel)
        {
            _context.Doktori.Remove(doktoriModel);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Doktori.AnyAsync(e => e.Id == id);
        }
    }
}
