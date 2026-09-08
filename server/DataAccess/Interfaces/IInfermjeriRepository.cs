using dizajn_Projekti.Models;
using dizajn_Projekti.DataAccess.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IInfermjeriRepository
    {
        Task<IEnumerable<InfermjeriModel>> GetAllAsync();
        Task<InfermjeriModel> GetByIdAsync(int id);
        Task AddAsync(InfermjeriModel infermjeri);
        Task UpdateAsync(InfermjeriModel infermjeri);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<Dictionary<string, List<object>>> GetNursesForWeek();
        Task<(List<InfermjeriModel> Items, int TotalCount)> SearchAsync(string? search, string? department, int page, int pageSize);
    }
}