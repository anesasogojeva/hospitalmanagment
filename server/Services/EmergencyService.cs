using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Services.Interfaces;
using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using dizajn_Projekti.Database;
using NuGet.Protocol.Core.Types;

namespace dizajn_Projekti.Services
{
    public class EmergencyService : IEmergencyService
    {
        private readonly IEmergencyRepository _emergencyRepository;
        private readonly IDoktoriRepository _doctorRepository;
        private readonly IPacientiRepository _pacientiRepository;
        private readonly HospitalDbContext _context;
        private readonly UserManager<User> _userManager;

        public EmergencyService(HospitalDbContext context, UserManager<User> userManager, IEmergencyRepository emergencyRepository, IDoktoriRepository doctorRepository, IPacientiRepository pacientiRepository)
        {
            _emergencyRepository = emergencyRepository;
            _doctorRepository = doctorRepository;
            _pacientiRepository = pacientiRepository;
            _context = context;
            _userManager = userManager;
        }

        public async Task<IEnumerable<EmergencyModel>> GetDoctorEmergency(string userId)
        {
            return await _context.EmergencyModel
                                 .Include(e => e.PatientNavigation)
                                 .Where(e => e.DoctorNavigation.UserId == userId)
                                 .ToListAsync();
        }

        public async Task<(List<EmergencyModel> Items, int TotalCount)> GetPatientEmergency(string userId, int page, int pageSize)
        {
            var patient = await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) throw new Exception("Patient not found");

            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.EmergencyModel
                .Include(e => e.DoctorNavigation)
                .Where(e => e.Patient == patient.Id_P);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(e => e.Id_E)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task AddEmergency(EmergencyModel emergencyModel, string userId)
        {
            var patient = await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) throw new Exception("Patient not found");

            var emergency = new EmergencyModel
            {
                Subject = emergencyModel.Subject,
                Pershkrimi = emergencyModel.Pershkrimi,
                NumriKontaktit = emergencyModel.NumriKontaktit,
                Patient = patient.Id_P,
                Doctor = emergencyModel.Doctor
            };

            await _emergencyRepository.AddAsync(emergency);
        }

        public async Task<IEnumerable<EmergencyModel>> GetAllEmergenciesAsync()
        {
            return await _emergencyRepository.GetAllAsync();
        }

        public async Task<EmergencyModel> GetEmergencyByIdAsync(int id)
        {
            var emergency = await _emergencyRepository.GetByIdAsync(id);
            if (emergency == null)
            {
                throw new KeyNotFoundException("Emergency not found");
            }
            return emergency;
        }

        public async Task AddEmergencyAsync(EmergencyModel emergency)
        {
            var doctor = await _doctorRepository.GetByIdAsync(emergency.Doctor);
            if (doctor == null)
            {
                throw new KeyNotFoundException("Doctor not found");
            }

            var patient = await _pacientiRepository.GetByIdAsync(emergency.Patient);
            if (patient == null)
            {
                throw new KeyNotFoundException("Patient not found");
            }

            emergency.DoctorNavigation = doctor;
            emergency.PatientNavigation = patient;

            await _emergencyRepository.AddAsync(emergency);
        }

        public async Task UpdateEmergencyAsync(int id, EmergencyModel emergency)
        {
            if (id != emergency.Id_E)
            {
                throw new ArgumentException("ID mismatch");
            }

            if (!await _emergencyRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Emergency not found");
            }

            await _emergencyRepository.UpdateAsync(emergency);
        }

        public async Task DeleteEmergencyAsync(int id)
        {
            if (!await _emergencyRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Emergency not found");
            }

            await _emergencyRepository.DeleteAsync(id);
        }

        public async Task<(List<EmergencyModel> Items, int TotalCount)> SearchAsync(string? search, int? doctorId, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.EmergencyModel
                .Include(e => e.DoctorNavigation)
                .Include(e => e.PatientNavigation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(e =>
                    (e.Subject != null && e.Subject.Contains(term)) ||
                    (e.Pershkrimi != null && e.Pershkrimi.Contains(term)) ||
                    (e.NumriKontaktit != null && e.NumriKontaktit.Contains(term)) ||
                    (e.PatientNavigation != null && e.PatientNavigation.Emri != null && e.PatientNavigation.Emri.Contains(term)) ||
                    (e.PatientNavigation != null && e.PatientNavigation.Mbiemri != null && e.PatientNavigation.Mbiemri.Contains(term)) ||
                    (e.DoctorNavigation != null && e.DoctorNavigation.Emri != null && e.DoctorNavigation.Emri.Contains(term)));
            }

            if (doctorId.HasValue)
            {
                query = query.Where(e => e.Doctor == doctorId.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(e => e.Id_E)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
