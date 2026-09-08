using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace dizajn_Projekti.Models
{
    public class ReviewModel
    {
        public int Id_R { get; set; } 

        [ForeignKey("Pacienti")]
        public int Id_P { get; set; } 
        public string? ReviewText { get; set; }
        public int Rating { get; set; } 
        public PacientiModel? Pacienti { get; set; }
    }
}
