using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace dizajn_Projekti.Models
{
    public class DoktoriModel
    {
        public int Id { get; set; }
        public string? Emri { get; set; }
        public DateTime? DataELindjes { get; set; }
        public string? Email { get; set; }
        public string? Specializimi { get; set; }
        public int? Pervoja { get; set; }
        public string? PhotoFileName { get; set; }
        public string? NumriTel { get; set; }

        [JsonIgnore] // This prevents Swagger from including it in the request body
        public string? UserId { get; set; }
    }

}