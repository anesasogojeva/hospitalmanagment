using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using dizajn_Projekti.DataAccess.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace dizajn_Projekti.Services
{
    public class DoktoriService : IDoktoriService
    {
        private readonly IDoktoriRepository _repository;
        private readonly UserManager<User> _userManager;

        public DoktoriService(IDoktoriRepository repository, UserManager<User> userManager)
        {
            _repository = repository;
            _userManager = userManager;
        }

        public async Task<IEnumerable<DoktoriModel>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<DoktoriModel?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<(bool Succeeded, List<string> Errors, DoktoriModel? Doctor)> CreateAsync(CreateDoctorRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return (false, new List<string> { "This email is already registered." }, null);
            }

            // The doctor's login: email doubles as username, same convention the
            // patient/doctor self-registration flow (AuthService.RegisterAsync) uses.
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                UserRole = "doktor"
            };

            var userResult = await _userManager.CreateAsync(user, request.Password);
            if (!userResult.Succeeded)
            {
                return (false, userResult.Errors.Select(IdentityErrorHelper.Format).ToList(), null);
            }

            var doktoriModel = new DoktoriModel
            {
                Emri = request.Emri,
                DataELindjes = request.DataELindjes,
                Email = request.Email,
                Specializimi = request.Specializimi,
                Pervoja = request.Pervoja,
                PhotoFileName = request.PhotoFileName,
                NumriTel = request.NumriTel,
                UserId = user.Id
            };

            await _repository.AddAsync(doktoriModel);

            return (true, new List<string>(), doktoriModel);
        }

        public async Task UpdateAsync(int id, DoktoriModel doktoriModel)
        {
            if (id != doktoriModel.Id)
                throw new ArgumentException("ID mismatch.");

            var existingDoktori = await _repository.GetByIdAsync(id);
            if (existingDoktori == null)
                throw new Exception("Doctor not found.");

            // Preserve UserId
            doktoriModel.UserId = existingDoktori.UserId;

            await _repository.UpdateAsync(doktoriModel);
        }

        public async Task DeleteAsync(int id)
        {
            var doktoriModel = await _repository.GetByIdAsync(id);
            if (doktoriModel == null)
                throw new Exception("Doctor not found.");

            await _repository.DeleteAsync(doktoriModel);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _repository.ExistsAsync(id);
        }
    }
}
