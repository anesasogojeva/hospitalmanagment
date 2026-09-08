using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IEmergencyService
    {
        Task<IEnumerable<EmergencyModel>> GetAllEmergenciesAsync();
        Task<EmergencyModel> GetEmergencyByIdAsync(int id);
        Task AddEmergencyAsync(EmergencyModel emergency);
        Task UpdateEmergencyAsync(int id, EmergencyModel emergency);
        Task DeleteEmergencyAsync(int id);
        Task<IEnumerable<EmergencyModel>> GetDoctorEmergency(string userId);
        Task<(List<EmergencyModel> Items, int TotalCount)> GetPatientEmergency(string userId, int page, int pageSize);
        Task AddEmergency(EmergencyModel emergencyModel, string userId);
        Task<(List<EmergencyModel> Items, int TotalCount)> SearchAsync(string? search, int? doctorId, int page, int pageSize);
    }
}