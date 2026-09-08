using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
// using hsm_lab1.Models;
using Microsoft.AspNetCore.Identity;

namespace dizajn_Projekti.Services
{
    public class PacientiService : IPacientiService
    {
        private readonly IPacientiRepository _pacientiRepository;
        private readonly UserManager<User> _userManager;
        private readonly IReservationService _reservationService;
        private readonly IReviewService _reviewService;
        private readonly IEmergencyService _emergencyService;
        private readonly IRekordService _rekordService;
        private readonly IEmergencyRepository _emergencyRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly IReservationRepository _reservationRepository;


        public PacientiService(IPacientiRepository pacientiRepository, UserManager<User> userManager, IReservationService reservationService, IReviewService reviewService, IEmergencyService emergencyService, IRekordService rekordService, IReviewRepository reviewRepository, IReservationRepository reservationRepository)
        {
            _pacientiRepository = pacientiRepository;
            _userManager = userManager;
            _reservationService = reservationService;
            _reviewService = reviewService;
            _emergencyService = emergencyService;
            _rekordService = rekordService;
            _reviewRepository = reviewRepository;
            _reservationRepository = reservationRepository;
        }

        public async Task<List<PacientiModel>> GetAllAsync()
        {
            return await _pacientiRepository.GetAllAsync();
        }

        public async Task<PacientiModel?> GetByIdAsync(int id)
        {
            return await _pacientiRepository.GetByIdAsync(id);
        }

        public async Task<(bool Succeeded, List<string> Errors, PacientiModel? Patient)> AddAsync(CreatePatientRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return (false, new List<string> { "This email is already registered." }, null);
            }

            // The patient's login: email doubles as username, same convention the doctor
            // and self-registration flows use.
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                UserRole = "patient"
            };

            var userCreationResult = await _userManager.CreateAsync(user, request.Password);
            if (!userCreationResult.Succeeded)
            {
                return (false, userCreationResult.Errors.Select(IdentityErrorHelper.Format).ToList(), null);
            }

            // Assign the 'patient' role to the new user
            await _userManager.AddToRoleAsync(user, "patient");

            var pacientiModel = new PacientiModel
            {
                Emri = request.Emri,
                Mbiemri = request.Mbiemri,
                DataELindjes = request.DataELindjes,
                NumriTel = request.NumriTel,
                Gjinia = request.Gjinia,
                UserId = user.Id
            };

            await _pacientiRepository.AddAsync(pacientiModel);

            return (true, new List<string>(), pacientiModel);
        }

        public async Task UpdateAsync(int id, PacientiModel pacientiModel)
        {
            if (id != pacientiModel.Id_P)
                throw new ArgumentException("ID mismatch.");

            var existingPacienti = await _pacientiRepository.GetByIdAsync(id);

            // Add logging or debugging here to see the value of existingPacienti
            if (existingPacienti == null)
            {
                throw new Exception($"Patient with ID {id} not found.");
            }

            // Preserve UserId
            pacientiModel.UserId = existingPacienti.UserId;

            await _pacientiRepository.UpdateAsync(pacientiModel);
        }


        public async Task DeleteAsync(int id)
        {
            await _pacientiRepository.DeleteAsync(id);
        }
        public async Task<List<ReservationModel>> GetPatientReservations(string userId)
        {
            var (items, _) = await _reservationService.GetPatientReservations(userId, 1, int.MaxValue);
            return items;
        }

        public async Task<List<EmergencyModel>> GetPatientEmergency(string userId)
        {
            var (items, _) = await _emergencyService.GetPatientEmergency(userId, 1, int.MaxValue);
            return items;
        }

        public async Task AddEmergency(EmergencyModel request, string userId)
        {
            request.Patient = (await _pacientiRepository.GetByUserIdAsync(userId)).Id_P;
            await _emergencyRepository.AddAsync(request);
        }

        public async Task AddReservation(ReservationModel request, string userId)
        {
            request.Patient = (await _pacientiRepository.GetByUserIdAsync(userId)).Id_P;
            await _reservationRepository.AddAsync(request);
        }

        public async Task<List<RekordModel>> GetPatientRecords(string userId)
        {
            var (items, _) = await _rekordService.GetPatientRecords(userId, 1, int.MaxValue);
            return items;
        }

        public async Task<List<ReviewModel>> GetPatientReviewsAsync(string userId)
        {
            return await _reviewService.GetPatientReviewsAsync(userId);
        }

        public async Task AddReviewAsync(ReviewModel review)
        {
            await _reviewRepository.AddAsync(review);
        }

    }

}