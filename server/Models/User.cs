using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace dizajn_Projekti.Models
{
    public class User : IdentityUser
    {
        public string? UserRole { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiryTime { get; set; }

        /*InverseProperty("User")]*/
        public ICollection<DoktoriModel> Doktori { get; set; } = new List<DoktoriModel>();

      /*  [InverseProperty("User")]
        public ICollection<PacientiModel> Pacienti { get; set; } = new List<PacientiModel>();*/

    }
}
