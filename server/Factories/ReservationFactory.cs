using dizajn_Projekti.Factories.Interfaces;
using dizajn_Projekti.Models;

namespace dizajn_Projekti.Factories
{
    public class ReservationFactory : IReservationFactory
    {
        public ReservationModel CreateReservation(DateTime? reservationDate, string? reservationTime, int patientId, int doctorId)
        {
            return new ReservationModel
            {
                ReservationDate = reservationDate,
                ReservationTime = reservationTime,
                Patient = patientId,
                Doctor = doctorId
            };
        }
    }
}