using System.ComponentModel.DataAnnotations;

namespace dizajn_Projekti.Models
{
    public class ContactModel
    {
        [Key]
        public int ContactId { get; set; }

        [Required]
        public string? Name { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        public string? Message { get; set; }
    }
}