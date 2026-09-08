using System.ComponentModel.DataAnnotations;

namespace dizajn_Projekti.Models
{
    // Admin's "Add Patient" payload - carries the login credentials for the account created
    // alongside the patient profile. PacientiModel itself has no Email field (the linked
    // User is the single source of truth for it, same as everywhere else in this app).
    public class CreatePatientRequest
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Emri { get; set; } = string.Empty;

        public string? Mbiemri { get; set; }

        public DateTime? DataELindjes { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;

        public int? NumriTel { get; set; }

        public string? Gjinia { get; set; }
    }
}
