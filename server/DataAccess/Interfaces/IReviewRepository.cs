using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IReviewRepository
    {
        Task<IEnumerable<ReviewModel>> GetAllAsync();
        Task<ReviewModel?> GetByIdAsync(int id);
        Task AddAsync(ReviewModel review);
        Task UpdateAsync(ReviewModel review);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<ReviewModel>> GetPatientReviewsAsync(int patientId);
    }
}
