using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IRekordRepository
    {
        Task<IEnumerable<RekordModel>> GetAllAsync();
        Task<RekordModel?> GetByIdAsync(int id);
        Task AddAsync(RekordModel rekord);
        Task UpdateAsync(RekordModel rekord);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<RekordModel>> GetPatientRecordsAsync(int patientId);
        
    }
}