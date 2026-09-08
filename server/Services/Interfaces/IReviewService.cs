using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewModel>> GetAllReviewsAsync();
        Task<ReviewModel> GetReviewByIdAsync(int id);
        Task<ReviewModel> AddReviewAsync(ReviewModel review);
        Task UpdateReviewAsync(int id, ReviewModel review);
        Task DeleteReviewAsync(int id);
        
        Task<List<ReviewModel>> GetPatientReviewsAsync(string userId);
        Task<(List<ReviewModel> Items, int TotalCount)> SearchAsync(string? search, int? rating, int page, int pageSize);

    }
}
