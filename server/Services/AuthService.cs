using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol.Plugins;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
namespace dizajn_Projekti.Services
{
    

    
        public class AuthService : IAuthService
        {
            private readonly IUserRepository _repository;
            private readonly UserManager<User> _userManager;
            private readonly IConfiguration _configuration;

            public AuthService(IUserRepository repository, UserManager<User> userManager, IConfiguration configuration)
            {
                _repository = repository;
                _userManager = userManager;
                _configuration = configuration;
            }

            public async Task<(string Token, string RefreshToken, string Role)?> LoginAsync(LoginRequest request)
            {
                // The login field is labeled "Username" but accepts either - fall back to an
                // email lookup so users who type their email address can still sign in.
                var user = await _repository.GetUserByUsernameAsync(request.Username)
                    ?? await _repository.GetUserByEmailAsync(request.Username);

                if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
                {
                    return null;
                }

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);

                await _repository.UpdateUserAsync(user);

                return (token, refreshToken, user.UserRole);
            }

        public async Task<(bool Succeeded, List<string> Errors)> RegisterAsync(RegistrationRequest request)
        {
            // Check if a user with the same username already exists
            var existingUser = await _repository.GetUserByUsernameAsync(request.Username);
            if (existingUser != null)
            {
                return (false, new List<string> { "This username is already taken." });
            }

            // Check if a user with the same email already exists
            var existingEmailUser = await _repository.GetUserByEmailAsync(request.Email);
            if (existingEmailUser != null)
            {
                return (false, new List<string> { "An account with this email already exists." });
            }

            // Proceed with user creation if the username and email are unique
            var user = new User
            {
                UserName = request.Username,
                Email = request.Email,
                UserRole = request.Role
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return (false, result.Errors.Select(IdentityErrorHelper.Format).ToList());
            }

            // Add related models based on role
            if (request.Role.ToLower() == "doktor")
            {
                await _repository.AddDoktoriAsync(new DoktoriModel
                {
                    UserId = user.Id,
                    Emri = request.Username
                });
            }
            else if (request.Role.ToLower() == "patient")
            {
                await _repository.AddPacientiAsync(new PacientiModel
                {
                    UserId = user.Id,
                    Emri = request.Username
                });
            }

            return (true, new List<string>());
        }



        public async Task<(string Token, string RefreshToken)?> RefreshTokenAsync(TokenRequest request)
            {
                var user = await _repository.GetUserByUsernameAsync(request.UserName);

                if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
                {
                    return null;
                }

                var token = GenerateJwtToken(user);
                var newRefreshToken = GenerateRefreshToken();

                user.RefreshToken = newRefreshToken;
                await _repository.UpdateUserAsync(user);

                return (token, newRefreshToken);
            }

            private string GenerateJwtToken(User user)
            {
                var claims = new[]
                {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.UserRole)
            };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    _configuration["Jwt:Issuer"],
                    _configuration["Jwt:Audience"],
                    claims,
                    expires: DateTime.Now.AddHours(1),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }

            private string GenerateRefreshToken()
            {
                var randomNumber = new byte[32];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(randomNumber);
                    return Convert.ToBase64String(randomNumber);
                }
            }
        }
    }

