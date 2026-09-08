using dizajn_Projekti.Models;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface INurseScheduleService
    {
        Task<List<NurseScheduleDto>> GetAllAsync();
        Task<List<NurseScheduleDto>> GetByDayAsync(DayOfWeek day);
        Task<(bool Succeeded, List<string> Errors, NurseScheduleDto? Schedule)> CreateAsync(NurseScheduleRequest request);
        Task<(bool Succeeded, List<string> Errors)> UpdateAsync(int id, NurseScheduleRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
