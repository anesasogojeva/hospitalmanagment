using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IRekordService
    {
        Task<IEnumerable<RekordModel>> GetAllRekordsAsync();
        Task<RekordModel> GetRekordByIdAsync(int id);
        Task AddRekordAsync(RekordModel rekord);
        Task UpdateRekordAsync(int id, RekordModel rekord);
        Task DeleteRekordAsync(int id);
        Task<List<RekordModel>> GetDoctorRecords(string userId);
        Task<(List<RekordModel> Items, int TotalCount)> GetPatientRecords(string userId, int page, int pageSize);
        Task AddRecord(RekordModel rekordModel, string userId);
        Task<(List<RekordModel> Items, int TotalCount)> SearchAsync(string? search, int? doctorId, int page, int pageSize);
    }
}