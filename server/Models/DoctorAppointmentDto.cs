namespace dizajn_Projekti.Models
{
    // Shaped for the Doctor Dashboard's "My Appointments" list - includes the patient's
    // contact details (email lives on the linked User, not PacientiModel, hence the DTO
    // rather than returning ReservationModel directly).
    public class DoctorAppointmentDto
    {
        public int ReservationId { get; set; }
        public DateTime? ReservationDate { get; set; }
        public string? ReservationTime { get; set; }
        public ReservationStatus Status { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientSurname { get; set; }
        public string? PatientEmail { get; set; }
        public string? PatientPhone { get; set; }
    }
}
