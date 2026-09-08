using dizajn_Projekti.Models;
using Microsoft.CodeAnalysis;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationModel>> GetAllReservationsAsync();
        Task<ReservationModel> GetReservationByIdAsync(int id);
        Task AddReservationAsync(ReservationModel reservation);
        Task UpdateReservationAsync(int id, ReservationModel reservation);
        Task UpdateReservationStatusAsync(int id, ReservationStatus status);
        Task<bool> IsReservationOwnedByDoctorUserAsync(int reservationId, string userId);
        Task DeleteReservationAsync(int id);
        Task<(List<DoctorAppointmentDto> Items, int TotalCount)> GetDoctorReservations(
            string userId, string? search, ReservationStatus? status, DateTime? date, int page, int pageSize);
        Task<(List<ReservationModel> Items, int TotalCount)> GetPatientReservations(string userId, int page, int pageSize);
        Task AddReservation(ReservationModel reservationModel, string userId);
        Task<IEnumerable<object>> GetDoctorAvailability(int doctorId, DateTime date);
        Task<(List<ReservationModel> Items, int TotalCount)> SearchAsync(
            string? search, int? doctorId, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize);

    }
}