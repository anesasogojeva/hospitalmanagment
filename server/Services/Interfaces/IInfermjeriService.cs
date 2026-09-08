using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IInfermjeriService
    {
        Task<IEnumerable<InfermjeriModel>> GetAllInfermjeriAsync();
        Task<InfermjeriModel> GetInfermjeriByIdAsync(int id);
        Task AddInfermjeriAsync(InfermjeriModel infermjeri);
        Task UpdateInfermjeriAsync(int id, InfermjeriModel infermjeri);
        Task DeleteInfermjeriAsync(int id);
        Task<Dictionary<string, List<object>>> GetNursesForWeek();
        Task<(List<InfermjeriModel> Items, int TotalCount)> SearchAsync(string? search, string? department, int page, int pageSize);
    }
}