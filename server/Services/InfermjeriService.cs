using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.DataAccess.Repositories;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services
{
    public class InfermjeriService : IInfermjeriService
    {
        private readonly IInfermjeriRepository _repository;

        public InfermjeriService(IInfermjeriRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<InfermjeriModel>> GetAllInfermjeriAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<InfermjeriModel> GetInfermjeriByIdAsync(int id)
        {
            var infermjeri = await _repository.GetByIdAsync(id);
            if (infermjeri == null)
            {
                throw new KeyNotFoundException("Infermjeri not found");
            }
            return infermjeri;
        }

        public async Task AddInfermjeriAsync(InfermjeriModel infermjeri)
        {
            await _repository.AddAsync(infermjeri);
        }

        public async Task UpdateInfermjeriAsync(int id, InfermjeriModel infermjeri)
        {
            if (id != infermjeri.Id_i)
            {
                throw new ArgumentException("ID mismatch");
            }

            if (!await _repository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Infermjeri not found");
            }

            await _repository.UpdateAsync(infermjeri);
        }

        public async Task DeleteInfermjeriAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Infermjeri not found");
            }

            await _repository.DeleteAsync(id);
        }
        public async Task<Dictionary<string, List<object>>> GetNursesForWeek()
        {
            return await _repository.GetNursesForWeek();
        }

        public async Task<(List<InfermjeriModel> Items, int TotalCount)> SearchAsync(string? search, string? department, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;
            return await _repository.SearchAsync(search, department, page, pageSize);
        }
    }
}