using dizajn_Projekti.Models;
using Microsoft.CodeAnalysis;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IReservationRepository
    {
        Task<IEnumerable<ReservationModel>> GetAllAsync();
        Task<ReservationModel?> GetByIdAsync(int id);
        Task AddAsync(ReservationModel reservation);
        Task UpdateAsync(ReservationModel reservation);
        Task UpdateStatusAsync(int id, ReservationStatus status);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<ReservationModel>> GetPatientReservationsAsync(int patientId);
        
    }
}
