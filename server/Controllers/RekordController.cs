using dizajn_Projekti.Adapters.Interfaces;
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
    public class RekordController : ControllerBase
    {
        private readonly IRekordAdapter _adapter;

        public RekordController(IRekordAdapter adapter)
        {
            _adapter = adapter;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRekords()
        {
            var rekords = await _adapter.GetAllRekordsAsync();
            return Ok(rekords);
        }

        // GET: api/Rekord/search?search=&doctorId=&page=1&pageSize=10
        [HttpGet("search")]
        public async Task<IActionResult> SearchRekords(
            [FromQuery] string? search,
            [FromQuery] int? doctorId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _adapter.SearchAsync(search, doctorId, page, pageSize);

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
        public async Task<IActionResult> GetRekordById(int id)
        {
            try
            {
                var rekord = await _adapter.GetRekordByIdAsync(id);
                return Ok(rekord);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddRekord([FromBody] RekordModel rekord)
        {
            try
            {
                await _adapter.AddRekordAsync(rekord);
                return CreatedAtAction(nameof(GetRekordById), new { id = rekord.Id_Rek }, rekord);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRekord(int id, [FromBody] RekordModel rekord)
        {
            try
            {
                await _adapter.UpdateRekordAsync(id, rekord);
                return NoContent();
            }
            catch (Exception ex) when (ex is ArgumentException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRekord(int id)
        {
            try
            {
                await _adapter.DeleteRekordAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
