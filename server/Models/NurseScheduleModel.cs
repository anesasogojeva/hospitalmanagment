namespace dizajn_Projekti.Models
{
    // Admin-controlled weekly nurse schedule - replaces the old modulo-7 fake grouping
    // (Id_i % 7) that used to stand in for a real schedule. Reuses the existing
    // InfermjeriModel roster rather than a separate nurse table.
    public class NurseScheduleModel
    {
        public int Id { get; set; }

        public int NurseId { get; set; }
        public InfermjeriModel? Nurse { get; set; }

        public DayOfWeek DayOfWeek { get; set; }
        public Shift Shift { get; set; }

        // Null for an "Off" entry - a working shift always has both.
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
