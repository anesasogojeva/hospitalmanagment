using dizajn_Projekti.Models;
using NuGet.Protocol.Plugins;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace dizajn_Projekti.Services.Interfaces
{



        public interface IAuthService
        {
            Task<(string Token, string RefreshToken, string Role)?> LoginAsync(LoginRequest request);
            Task<(bool Succeeded, List<string> Errors)> RegisterAsync(RegistrationRequest request);
            Task<(string Token, string RefreshToken)?> RefreshTokenAsync(TokenRequest request);
        }

}
