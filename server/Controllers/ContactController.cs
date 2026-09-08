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
    public class ContactController : ControllerBase
    {
        private readonly IContactService _service;

        public ContactController(IContactService service)
        {
            _service = service;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> PostContact([FromBody] ContactModel contact)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _service.AddContactAsync(contact);
            return Ok(new { message = "Contact saved successfully" });
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetContacts()
        {
            var contacts = await _service.GetContactsAsync();
            return Ok(contacts);
        }

        // GET: api/Contact/search?search=&page=1&pageSize=10
        [HttpGet("search")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> SearchContacts(
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            try
            {
                await _service.DeleteContactAsync(id);
                return Ok(new { message = "Contact deleted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}