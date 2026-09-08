using System.ComponentModel.DataAnnotations;

namespace dizajn_Projekti.Models
{
    // Admin's "Add Doctor" payload - carries the login credentials for the account that
    // gets created alongside the doctor profile, which plain DoktoriModel intentionally
    // doesn't expose (it's the persisted entity, not a request body).
    public class CreateDoctorRequest
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Emri { get; set; } = string.Empty;

        public DateTime? DataELindjes { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;

        public string? Specializimi { get; set; }
        public int? Pervoja { get; set; }
        public string? PhotoFileName { get; set; }
        public string? NumriTel { get; set; }
    }
}
