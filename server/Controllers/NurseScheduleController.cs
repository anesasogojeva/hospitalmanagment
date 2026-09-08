using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dizajn_Projekti.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NurseScheduleController : ControllerBase
    {
        private readonly INurseScheduleService _service;

        public NurseScheduleController(INurseScheduleService service)
        {
            _service = service;
        }

        // GET: api/NurseSchedule - the full weekly schedule
        [HttpGet]
        [Authorize(Roles = "admin,doktor")]
        public async Task<IActionResult> GetAll()
        {
            var schedule = await _service.GetAllAsync();
            return Ok(schedule);
        }

        // GET: api/NurseSchedule/day/Monday
        [HttpGet("day/{day}")]
        [Authorize(Roles = "admin,doktor")]
        public async Task<IActionResult> GetByDay(DayOfWeek day)
        {
            var schedule = await _service.GetByDayAsync(day);
            return Ok(schedule);
        }

        // POST: api/NurseSchedule
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] NurseScheduleRequest request)
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new { Errors = validationErrors });
            }

            var (succeeded, errors, schedule) = await _service.CreateAsync(request);

            if (!succeeded)
            {
                return BadRequest(new { Errors = errors });
            }

            return CreatedAtAction(nameof(GetByDay), new { day = schedule!.DayOfWeek }, schedule);
        }

        // PUT: api/NurseSchedule/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] NurseScheduleRequest request)
        {
            var (succeeded, errors) = await _service.UpdateAsync(id, request);

            if (!succeeded)
            {
                return BadRequest(new { Errors = errors });
            }

            return NoContent();
        }

        // DELETE: api/NurseSchedule/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Schedule entry not found." });
            }

            return NoContent();
        }
    }
}
