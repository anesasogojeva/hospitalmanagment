
using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface ISherbimiRepository
    {
        Task<IEnumerable<SherbimiModel>> GetAllAsync();
        Task<SherbimiModel?> GetByIdAsync(int id);
        Task AddAsync(SherbimiModel sherbimi);
        Task UpdateAsync(SherbimiModel sherbimi);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<(List<SherbimiModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize);
    }
}