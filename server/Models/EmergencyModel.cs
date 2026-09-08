using dizajn_Projekti.Models;
using dizajn_Projekti.Database;
namespace dizajn_Projekti.Models
{
    public class EmergencyModel
    {

        public int Id_E { get; set; }
        public string? Subject { get; set; }
        public string? Pershkrimi { get; set; }
        public string? NumriKontaktit { get; set; }
        public int Patient { get; set; }
        public int Doctor { get; set; }

        public DoktoriModel? DoctorNavigation { get; set; }
        public PacientiModel? PatientNavigation { get; set; }

    }
}
