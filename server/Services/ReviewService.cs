using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IPacientiRepository _pacientiRepository;
        private readonly HospitalDbContext _context;

        public ReviewService(IReviewRepository reviewRepository, IPacientiRepository pacientiRepository, HospitalDbContext context)
        {
            _reviewRepository = reviewRepository;
            _pacientiRepository = pacientiRepository;
            _context = context;
        }

        public async Task<IEnumerable<ReviewModel>> GetAllReviewsAsync()
        {
            return await _reviewRepository.GetAllAsync();
        }

        public async Task<List<ReviewModel>> GetPatientReviewsAsync(string userId)
        {
            // Fetch the reviews for the specified patient (user)
            var patient = await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) throw new Exception("Patient not found");

            return await _context.Review.Where(r => r.Id_P == patient.Id_P).ToListAsync();
        }

        public async Task<ReviewModel> GetReviewByIdAsync(int id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
            {
                throw new KeyNotFoundException("Review not found");
            }
            return review;
        }

        public async Task<ReviewModel> AddReviewAsync(ReviewModel review)
        {
            // Ensure patient exists
            var patient = await _pacientiRepository.GetByIdAsync(review.Id_P);
            if (patient == null)
            {
                throw new KeyNotFoundException("Patient not found");
            }

            // Set the associated patient for the review
            review.Pacienti = patient;

            // Add the review
            await _reviewRepository.AddAsync(review);

            // Return the added review
            return review;
        }

        public async Task UpdateReviewAsync(int id, ReviewModel review)
        {
            if (id != review.Id_R)
            {
                throw new ArgumentException("ID mismatch");
            }

            if (!await _reviewRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Review not found");
            }

            await _reviewRepository.UpdateAsync(review);
        }

        public async Task DeleteReviewAsync(int id)
        {
            if (!await _reviewRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Review not found");
            }

            await _reviewRepository.DeleteAsync(id);
        }

        public async Task<(List<ReviewModel> Items, int TotalCount)> SearchAsync(string? search, int? rating, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.Review
                .Include(r => r.Pacienti)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(r =>
                    (r.ReviewText != null && r.ReviewText.Contains(term)) ||
                    (r.Pacienti != null && r.Pacienti.Emri != null && r.Pacienti.Emri.Contains(term)) ||
                    (r.Pacienti != null && r.Pacienti.Mbiemri != null && r.Pacienti.Mbiemri.Contains(term)));
            }

            if (rating.HasValue)
            {
                query = query.Where(r => r.Rating == rating.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(r => r.Id_R)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
