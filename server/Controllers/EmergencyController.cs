using dizajn_Projekti.Services.Interfaces;
using dizajn_Projekti.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class EmergencyController : ControllerBase
    {
        private readonly IEmergencyService _service;

        public EmergencyController(IEmergencyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEmergencies()
        {
            var emergencies = await _service.GetAllEmergenciesAsync();
            return Ok(emergencies);
        }

        // GET: api/Emergency/search?search=&doctorId=&page=1&pageSize=10
        [HttpGet("search")]
        public async Task<IActionResult> SearchEmergencies(
            [FromQuery] string? search,
            [FromQuery] int? doctorId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.SearchAsync(search, doctorId, page, pageSize);

            return Ok(new
            {
                items,
                page,
                pageSize,
                totalCount,
                totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmergencyById(int id)
        {
            try
            {
                var emergency = await _service.GetEmergencyByIdAsync(id);
                return Ok(emergency);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddEmergency([FromBody] EmergencyModel emergency)
        {
            await _service.AddEmergencyAsync(emergency);
            return CreatedAtAction(nameof(GetEmergencyById), new { id = emergency.Id_E }, emergency);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmergency(int id, [FromBody] EmergencyModel emergency)
        {
            try
            {
                await _service.UpdateEmergencyAsync(id, emergency);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmergency(int id)
        {
            try
            {
                await _service.DeleteEmergencyAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
