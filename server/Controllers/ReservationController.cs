using dizajn_Projekti.Services.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Factories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Controllers
{
    // No class-level [Authorize] - most actions here are admin-only (see each action), but
    // the status endpoint is also usable by doctors for their own appointments, which a
    // blanket class-level "admin" role would rule out entirely (stacked [Authorize]
    // attributes AND their role lists together rather than OR them).
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _service;
        private readonly IReservationFactory _reservationFactory;
        private readonly UserManager<User> _userManager;

        public ReservationController(IReservationService service, IReservationFactory reservationFactory, UserManager<User> userManager)
        {
            _service = service;
            _reservationFactory = reservationFactory;
            _userManager = userManager;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _service.GetAllReservationsAsync();
            return Ok(reservations);
        }

        // GET: api/Reservation/search?search=&doctorId=&dateFrom=&dateTo=&page=1&pageSize=10
        [HttpGet("search")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> SearchReservations(
            [FromQuery] string? search,
            [FromQuery] int? doctorId,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.SearchAsync(search, doctorId, dateFrom, dateTo, page, pageSize);

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
        public async Task<IActionResult> GetReservationById(int id)
        {
            try
            {
                var reservation = await _service.GetReservationByIdAsync(id);
                return Ok(reservation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
       

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddReservation([FromBody] ReservationModel reservation)
        {
            try
            {
                // Use the factory to create the reservation before passing it to the service
                var createdReservation = _reservationFactory.CreateReservation(
                    reservation.ReservationDate,
                    reservation.ReservationTime,
                    reservation.Patient,
                    reservation.Doctor);

                // Now, pass the created reservation to the service for adding
                await _service.AddReservationAsync(createdReservation);
                return CreatedAtAction(nameof(GetReservationById), new { id = createdReservation.ReservationId }, createdReservation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationModel reservation)
        {
            try
            {
                await _service.UpdateReservationAsync(id, reservation);
                return NoContent();
            }
            catch (Exception ex) when (ex is ArgumentException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/Reservation/5/status
        // Admins can change any appointment's status. Doctors can only change the status of
        // their OWN appointments - enforced below (server-side, from the JWT), not just by
        // hiding the control in the UI. Patients cannot reach this at all (role not listed).
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin,doktor")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] UpdateReservationStatusRequest request)
        {
            if (!User.IsInRole("admin"))
            {
                var userId = _userManager.GetUserId(User);
                var ownsAppointment = await _service.IsReservationOwnedByDoctorUserAsync(id, userId);
                if (!ownsAppointment)
                {
                    return Forbid();
                }
            }

            try
            {
                await _service.UpdateReservationStatusAsync(id, request.Status);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            try
            {
                await _service.DeleteReservationAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
