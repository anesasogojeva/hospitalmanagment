using dizajn_Projekti.Models;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface INurseScheduleRepository
    {
        Task<List<NurseScheduleModel>> GetAllAsync();
        Task<List<NurseScheduleModel>> GetByDayAsync(DayOfWeek day);
        Task<NurseScheduleModel?> GetByIdAsync(int id);
        Task<List<NurseScheduleModel>> GetByNurseAndDayAsync(int nurseId, DayOfWeek day, int? excludeId = null);
        Task AddAsync(NurseScheduleModel schedule);
        Task UpdateAsync(NurseScheduleModel schedule);
        Task DeleteAsync(int id);
    }
}
