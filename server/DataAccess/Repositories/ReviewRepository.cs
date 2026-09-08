using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly HospitalDbContext _context;

        public ReviewRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReviewModel>> GetAllAsync()
        {
            return await _context.Review
                .Include(r => r.Pacienti)
                .ToListAsync();
        }

        public async Task<ReviewModel?> GetByIdAsync(int id)
        {
            return await _context.Review
                .Include(r => r.Pacienti)
                .FirstOrDefaultAsync(r => r.Id_R == id);
        }

        public async Task AddAsync(ReviewModel review)
        {
            await _context.Review.AddAsync(review);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ReviewModel review)
        {
            _context.Entry(review).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var review = await GetByIdAsync(id);
            if (review != null)
            {
                _context.Review.Remove(review);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Review.AnyAsync(r => r.Id_R == id);
        }
        public async Task<List<ReviewModel>> GetPatientReviewsAsync(int patientId)
        {
            return await _context.Review
                .Where(r => r.Id_P == patientId)
                .ToListAsync();
        }
        
    }
}
