using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IDoktoriService
    {
        Task<IEnumerable<DoktoriModel>> GetAllAsync();
        Task<DoktoriModel?> GetByIdAsync(int id);
        Task<(bool Succeeded, List<string> Errors, DoktoriModel? Doctor)> CreateAsync(CreateDoctorRequest request);
        Task UpdateAsync(int id, DoktoriModel doktoriModel);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
