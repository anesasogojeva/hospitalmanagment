using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IEmergencyRepository
    {
        Task<IEnumerable<EmergencyModel>> GetAllAsync();
        Task<EmergencyModel?> GetByIdAsync(int id);
        Task AddAsync(EmergencyModel emergency);
        Task UpdateAsync(EmergencyModel emergency);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<EmergencyModel>> GetPatientEmergenciesAsync(int patientId);
        Task<IEnumerable<EmergencyModel>> GetDoctorEmergency(string userId);
    }
}
