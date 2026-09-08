using System.ComponentModel.DataAnnotations;

namespace dizajn_Projekti.Models
{
    public class RegistrationRequest
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; }

        public string Role { get; set; } // Add this property to specify the role
    }
}
