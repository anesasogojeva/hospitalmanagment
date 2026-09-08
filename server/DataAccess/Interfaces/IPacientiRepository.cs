using dizajn_Projekti.Models;

public interface IPacientiRepository
{
    Task<List<PacientiModel>> GetAllAsync();
    Task<PacientiModel?> GetByIdAsync(int id);
    Task AddAsync(PacientiModel pacientiModel);
    Task UpdateAsync(PacientiModel pacientiModel);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<PacientiModel?> GetByUserIdAsync(string userId);

    // New Methods
    Task<List<ReservationModel>> GetReservationsByPatientIdAsync(int patientId);
    Task<List<EmergencyModel>> GetEmergenciesByPatientIdAsync(int patientId);
    Task<List<RekordModel>> GetRecordsByPatientIdAsync(int patientId);
    Task<List<ReviewModel>> GetReviewsByPatientIdAsync(int patientId);
}