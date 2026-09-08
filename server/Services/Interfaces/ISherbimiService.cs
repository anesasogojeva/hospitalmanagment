using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface ISherbimiService
    {
        Task<IEnumerable<SherbimiModel>> GetAllSherbimiAsync();
        Task<SherbimiModel> GetSherbimiByIdAsync(int id);
        Task AddSherbimiAsync(SherbimiModel sherbimi);
        Task UpdateSherbimiAsync(int id, SherbimiModel sherbimi);
        Task DeleteSherbimiAsync(int id);
        Task<(List<SherbimiModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize);
    }
}