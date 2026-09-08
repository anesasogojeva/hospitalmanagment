using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IDoktoriRepository
    {
        Task<IEnumerable<DoktoriModel>> GetAllAsync();
        Task<DoktoriModel?> GetByIdAsync(int id);
        Task AddAsync(DoktoriModel doktoriModel);
        Task UpdateAsync(DoktoriModel doktoriModel);
        Task DeleteAsync(DoktoriModel doktoriModel);
        Task<bool> ExistsAsync(int id);
    }
}
