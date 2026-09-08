using dizajn_Projekti.Services.Interfaces;
using dizajn_Projekti.Models;

using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol.Plugins;
using System.Linq;
using System.Threading.Tasks;

namespace dizajn_Projekti.Controllers
{
    

    [ApiController]
    [Route("api/authentication")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthenticationController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var result = await _authService.LoginAsync(model);

            if (result == null)
                return Unauthorized("Invalid login attempt");

            // Safely accessing the tuple members
            return Ok(new
            {
                Token = result.Value.Token,
                RefreshToken = result.Value.RefreshToken,
                Role = result.Value.Role
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest model)
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new { Errors = validationErrors });
            }

            // Call the AuthService to handle registration logic
            var (succeeded, errors) = await _authService.RegisterAsync(model);

            if (!succeeded)
                return BadRequest(new { Errors = errors });

            return Ok(new { Message = "User registered successfully!" });
        }



        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] TokenRequest model)
        {
            var result = await _authService.RefreshTokenAsync(model);
            if (result == null) return BadRequest("Invalid client request");

            return Ok(result);
        }
    }
}
