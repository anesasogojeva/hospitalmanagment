using dizajn_Projekti.Models;

namespace dizajn_Projekti.Factories.Interfaces
{
    public interface IReservationFactory
    {
        ReservationModel CreateReservation(DateTime? reservationDate, string? reservationTime, int patientId, int doctorId);
    }
}