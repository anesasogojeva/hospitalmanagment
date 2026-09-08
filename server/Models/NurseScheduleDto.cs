namespace dizajn_Projekti.Models
{
    // Flat, read-friendly shape for the schedule grid (Admin management UI and the
    // doctor dashboard's read-only weekly view both consume this).
    public class NurseScheduleDto
    {
        public int Id { get; set; }
        public int NurseId { get; set; }
        public string? NurseName { get; set; }
        public string? Department { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public Shift Shift { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
