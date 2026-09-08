using dizajn_Projekti.Models;
using dizajn_Projekti.Database;
namespace dizajn_Projekti.Models
{
    public class ReservationModel
    {

        public int ReservationId { get; set; }
        public DateTime? ReservationDate { get; set; }
        public string? ReservationTime { get; set; }
        public int Patient { get; set; }
        public int Doctor { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Scheduled;

        public DoktoriModel? DoctorNavigation { get; set; }
        public PacientiModel? PatientNavigation { get; set; }

    }
}


