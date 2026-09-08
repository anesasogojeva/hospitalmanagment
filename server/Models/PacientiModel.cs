using global::dizajn_Projekti.Models;
using System.Text.Json.Serialization;

namespace dizajn_Projekti.Models

{
    public class PacientiModel
    {
        
        public int Id_P { get; set; }
        public string? Emri { get; set; }
        public string? Mbiemri { get; set; }
        public DateTime? DataELindjes { get; set; }
        public int? NumriTel { get; set; }
        public string? Gjinia { get; set; }

        [JsonIgnore]
        public string? UserId { get; set; }

        [JsonIgnore] // This will prevent the User object from being serialized or required on registration
        public User? User { get; set; }
    }
}