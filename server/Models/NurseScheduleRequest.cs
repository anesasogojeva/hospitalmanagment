using System.ComponentModel.DataAnnotations;

namespace dizajn_Projekti.Models
{
    // Used for both create and update - Admin picks Nurse, Day, Shift, Start, End.
    public class NurseScheduleRequest
    {
        [Required(ErrorMessage = "Please select a nurse.")]
        public int NurseId { get; set; }

        public DayOfWeek DayOfWeek { get; set; }

        public Shift Shift { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }
    }
}
