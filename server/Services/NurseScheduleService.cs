using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;

namespace dizajn_Projekti.Services
{
    public class NurseScheduleService : INurseScheduleService
    {
        private readonly INurseScheduleRepository _repository;
        private readonly IInfermjeriRepository _infermjeriRepository;

        public NurseScheduleService(INurseScheduleRepository repository, IInfermjeriRepository infermjeriRepository)
        {
            _repository = repository;
            _infermjeriRepository = infermjeriRepository;
        }

        public async Task<List<NurseScheduleDto>> GetAllAsync()
        {
            var schedules = await _repository.GetAllAsync();
            return schedules.Select(ToDto).ToList();
        }

        public async Task<List<NurseScheduleDto>> GetByDayAsync(DayOfWeek day)
        {
            var schedules = await _repository.GetByDayAsync(day);
            return schedules.Select(ToDto).ToList();
        }

        public async Task<(bool Succeeded, List<string> Errors, NurseScheduleDto? Schedule)> CreateAsync(NurseScheduleRequest request)
        {
            var (errors, nurse) = await ValidateAsync(request, excludeId: null);
            if (errors.Count > 0)
            {
                return (false, errors, null);
            }

            var schedule = new NurseScheduleModel
            {
                NurseId = request.NurseId,
                DayOfWeek = request.DayOfWeek,
                Shift = request.Shift,
                StartTime = request.Shift == Shift.Off ? null : request.StartTime,
                EndTime = request.Shift == Shift.Off ? null : request.EndTime
            };

            await _repository.AddAsync(schedule);
            schedule.Nurse = nurse;

            return (true, new List<string>(), ToDto(schedule));
        }

        public async Task<(bool Succeeded, List<string> Errors)> UpdateAsync(int id, NurseScheduleRequest request)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return (false, new List<string> { "Schedule entry not found." });
            }

            var (errors, _) = await ValidateAsync(request, excludeId: id);
            if (errors.Count > 0)
            {
                return (false, errors);
            }

            existing.NurseId = request.NurseId;
            existing.DayOfWeek = request.DayOfWeek;
            existing.Shift = request.Shift;
            existing.StartTime = request.Shift == Shift.Off ? null : request.StartTime;
            existing.EndTime = request.Shift == Shift.Off ? null : request.EndTime;

            await _repository.UpdateAsync(existing);
            return (true, new List<string>());
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return false;
            }

            await _repository.DeleteAsync(id);
            return true;
        }

        // Shared validation for create/update: nurse exists, times make sense for a working
        // shift, no duplicate nurse+day+shift, and no overlapping time ranges for that nurse
        // on that day (checked against every other shift they already have that day, not
        // just same-labeled ones).
        private async Task<(List<string> Errors, InfermjeriModel? Nurse)> ValidateAsync(NurseScheduleRequest request, int? excludeId)
        {
            var errors = new List<string>();

            var nurse = await _infermjeriRepository.GetByIdAsync(request.NurseId);
            if (nurse == null)
            {
                errors.Add("Selected nurse does not exist.");
                return (errors, null);
            }

            var isWorkingShift = request.Shift != Shift.Off;

            if (isWorkingShift)
            {
                if (!request.StartTime.HasValue || !request.EndTime.HasValue)
                {
                    errors.Add("Start and end time are required for a working shift.");
                }
                else if (request.EndTime <= request.StartTime)
                {
                    errors.Add("End time must be after start time.");
                }
            }

            if (errors.Count > 0)
            {
                return (errors, nurse);
            }

            var sameNurseDay = await _repository.GetByNurseAndDayAsync(request.NurseId, request.DayOfWeek, excludeId);

            if (sameNurseDay.Any(s => s.Shift == request.Shift))
            {
                errors.Add($"{nurse.Emri} already has a {request.Shift} shift on {request.DayOfWeek}.");
            }

            if (isWorkingShift)
            {
                var overlaps = sameNurseDay.Any(s =>
                    s.Shift != Shift.Off && s.StartTime.HasValue && s.EndTime.HasValue &&
                    request.StartTime < s.EndTime && s.StartTime < request.EndTime);

                if (overlaps)
                {
                    errors.Add($"{nurse.Emri} already has an overlapping shift on {request.DayOfWeek}.");
                }
            }

            return (errors, nurse);
        }

        private static NurseScheduleDto ToDto(NurseScheduleModel schedule)
        {
            return new NurseScheduleDto
            {
                Id = schedule.Id,
                NurseId = schedule.NurseId,
                NurseName = schedule.Nurse != null
                    ? $"{schedule.Nurse.Emri} {schedule.Nurse.Mbiemri}".Trim()
                    : null,
                Department = schedule.Nurse?.Departamenti,
                DayOfWeek = schedule.DayOfWeek,
                Shift = schedule.Shift,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime
            };
        }
    }
}
