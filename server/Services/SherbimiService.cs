using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services
{
    public class SherbimiService : ISherbimiService
    {
        private readonly ISherbimiRepository _repository;

        public SherbimiService(ISherbimiRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SherbimiModel>> GetAllSherbimiAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<SherbimiModel> GetSherbimiByIdAsync(int id)
        {
            var sherbimi = await _repository.GetByIdAsync(id);
            if (sherbimi == null)
            {
                throw new KeyNotFoundException("Sherbimi not found");
            }
            return sherbimi;
        }

        public async Task AddSherbimiAsync(SherbimiModel sherbimi)
        {
            await _repository.AddAsync(sherbimi);
        }

        public async Task UpdateSherbimiAsync(int id, SherbimiModel sherbimi)
        {
            if (id != sherbimi.Id_S)
            {
                throw new ArgumentException("ID mismatch");
            }

            if (!await _repository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Sherbimi not found");
            }

            await _repository.UpdateAsync(sherbimi);
        }

        public async Task DeleteSherbimiAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Sherbimi not found");
            }

            await _repository.DeleteAsync(id);
        }

        public async Task<(List<SherbimiModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize)
        {
            return await _repository.SearchAsync(search, page, pageSize);
        }
    }
}