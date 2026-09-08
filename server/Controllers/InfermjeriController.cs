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
    [Authorize(Roles = "admin")]
    public class InfermjeriController : ControllerBase
    {
        private readonly IInfermjeriService _service;

        public InfermjeriController(IInfermjeriService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetInfermjeri()
        {
            var infermjeri = await _service.GetAllInfermjeriAsync();
            return Ok(infermjeri);
        }

        // GET: api/Infermjeri/search?search=&department=&page=1&pageSize=10
        [HttpGet("search")]
        public async Task<IActionResult> SearchInfermjeri(
            [FromQuery] string? search,
            [FromQuery] string? department,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.SearchAsync(search, department, page, pageSize);

            return Ok(new
            {
                items,
                page,
                pageSize,
                totalCount,
                totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
            });
        }

        // GET: api/Infermjeri/departments - distinct list for the filter dropdown
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var all = await _service.GetAllInfermjeriAsync();
            var departments = all
                .Where(n => !string.IsNullOrEmpty(n.Departamenti))
                .Select(n => n.Departamenti)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            return Ok(departments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInfermjeriById(int id)
        {
            try
            {
                var infermjeri = await _service.GetInfermjeriByIdAsync(id);
                return Ok(infermjeri);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddInfermjeri([FromBody] InfermjeriModel infermjeri)
        {
            await _service.AddInfermjeriAsync(infermjeri);
            return CreatedAtAction(nameof(GetInfermjeriById), new { id = infermjeri.Id_i }, infermjeri);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInfermjeri(int id, [FromBody] InfermjeriModel infermjeri)
        {
            try
            {
                await _service.UpdateInfermjeriAsync(id, infermjeri);
                return NoContent();
            }
            catch (Exception ex) when (ex is KeyNotFoundException || ex is ArgumentException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfermjeri(int id)
        {
            try
            {
                await _service.DeleteInfermjeriAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
} 