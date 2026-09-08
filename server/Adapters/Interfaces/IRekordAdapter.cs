using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Adapters.Interfaces
{
    public interface IRekordAdapter
    {
        Task<IEnumerable<RekordModel>> GetAllRekordsAsync();
        Task<RekordModel> GetRekordByIdAsync(int id);
        Task AddRekordAsync(RekordModel rekord);
        Task UpdateRekordAsync(int id, RekordModel rekord);
        Task DeleteRekordAsync(int id);
        Task<(List<RekordModel> Items, int TotalCount)> SearchAsync(string? search, int? doctorId, int page, int pageSize);
    }
}
