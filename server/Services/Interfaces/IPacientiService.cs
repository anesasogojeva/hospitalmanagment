using dizajn_Projekti.Models;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IPacientiService
    {
        Task<List<PacientiModel>> GetAllAsync();
        Task<PacientiModel?> GetByIdAsync(int id);
        Task<(bool Succeeded, List<string> Errors, PacientiModel? Patient)> AddAsync(CreatePatientRequest request);
        Task UpdateAsync(int id, PacientiModel pacientiModel);
        Task DeleteAsync(int id);
        Task<List<ReservationModel>> GetPatientReservations(string userId);
        Task<List<EmergencyModel>> GetPatientEmergency(string userId);
        Task AddEmergency(EmergencyModel request, string userId);
        Task AddReservation(ReservationModel request, string userId);
        Task<List<RekordModel>> GetPatientRecords(string userId);
        Task<List<ReviewModel>> GetPatientReviewsAsync(string userId);
        Task AddReviewAsync(ReviewModel review);

    }

}