using dizajn_Projekti.Adapters.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Adapters
{
    public class RekordAdapter : IRekordAdapter
    {
        private readonly IRekordService _rekordService;

        public RekordAdapter(IRekordService rekordService)
        {
            _rekordService = rekordService;
        }

        public async Task<IEnumerable<RekordModel>> GetAllRekordsAsync()
        {
            return await _rekordService.GetAllRekordsAsync();
        }

        public async Task<RekordModel> GetRekordByIdAsync(int id)
        {
            return await _rekordService.GetRekordByIdAsync(id);
        }

        public async Task AddRekordAsync(RekordModel rekord)
        {
            await _rekordService.AddRekordAsync(rekord);
        }

        public async Task UpdateRekordAsync(int id, RekordModel rekord)
        {
            await _rekordService.UpdateRekordAsync(id, rekord);
        }

        public async Task DeleteRekordAsync(int id)
        {
            await _rekordService.DeleteRekordAsync(id);
        }

        public async Task<(List<RekordModel> Items, int TotalCount)> SearchAsync(string? search, int? doctorId, int page, int pageSize)
        {
            return await _rekordService.SearchAsync(search, doctorId, page, pageSize);
        }
    }
}
