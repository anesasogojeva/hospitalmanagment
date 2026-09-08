using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SherbimiController : ControllerBase
    {
        private readonly ISherbimiService _service;

        public SherbimiController(ISherbimiService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSherbimi()
        {
            var sherbimi = await _service.GetAllSherbimiAsync();
            return Ok(sherbimi);
        }

        // GET: api/Sherbimi/search?search=&page=1&pageSize=10
        [HttpGet("search")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> SearchSherbimi(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.SearchAsync(search, page, pageSize);

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
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetSherbimiById(int id)
        {
            try
            {
                var sherbimi = await _service.GetSherbimiByIdAsync(id);
                return Ok(sherbimi);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddSherbimi([FromBody] SherbimiModel sherbimi)
        {
            await _service.AddSherbimiAsync(sherbimi);
            return CreatedAtAction(nameof(GetSherbimiById), new { id = sherbimi.Id_S }, sherbimi);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateSherbimi(int id, [FromBody] SherbimiModel sherbimi)
        {
            try
            {
                await _service.UpdateSherbimiAsync(id, sherbimi);
                return NoContent();
            }
            catch (Exception ex) when (ex is ArgumentException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSherbimi(int id)
        {
            try
            {
                await _service.DeleteSherbimiAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}