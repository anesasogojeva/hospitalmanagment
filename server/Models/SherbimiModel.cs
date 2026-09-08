using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace dizajn_Projekti.Models
{
    public class SherbimiModel
    {
        public int Id_S { get; set; }
        public string? Emri { get; set; }
        public string? Pershkrimi { get; set; }
        public string? Stafi { get; set; }
    }
}
