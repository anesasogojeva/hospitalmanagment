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
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _service;

        public ReviewController(IReviewService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _service.GetAllReviewsAsync();
            return Ok(reviews);
        }

        // GET: api/Review/search?search=&rating=&page=1&pageSize=10
        [HttpGet("search")]
        public async Task<IActionResult> SearchReviews(
            [FromQuery] string? search,
            [FromQuery] int? rating,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.SearchAsync(search, rating, page, pageSize);

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
        public async Task<IActionResult> GetReviewById(int id)
        {
            try
            {
                var review = await _service.GetReviewByIdAsync(id);
                return Ok(review);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

       
       
            [HttpPost]
            public async Task<IActionResult> AddReview([FromBody] ReviewModel review)
            {
                try
                {
                    await _service.AddReviewAsync(review);
                    return CreatedAtAction(nameof(GetReviewById), new { id = review.Id_R }, review);
                }
                catch (KeyNotFoundException ex)
                {
                    return NotFound(new { message = ex.Message });
                }
            }
        

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] ReviewModel review)
        {
            try
            {
                await _service.UpdateReviewAsync(id, review);
                return NoContent();
            }
            catch (Exception ex) when (ex is ArgumentException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                await _service.DeleteReviewAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
