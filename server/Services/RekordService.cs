
using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.DataAccess.Repositories;
using dizajn_Projekti.Database;
using dizajn_Projekti.Models;

using dizajn_Projekti.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol.Core.Types;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services
{
    public class RekordService : IRekordService
    {
        private readonly IRekordRepository _rekordRepository;
        private readonly IDoktoriRepository _doctorRepository;
        private readonly IPacientiRepository _pacientiRepository;
        private readonly HospitalDbContext _context;
        private readonly UserManager<User> _userManager;


        public RekordService(HospitalDbContext context, UserManager<User> userManager, IRekordRepository rekordRepository, IDoktoriRepository doctorRepository, IPacientiRepository pacientiRepository)
        {
            _rekordRepository = rekordRepository;
            _doctorRepository = doctorRepository;
            _pacientiRepository = pacientiRepository;
            _context = context;
            _userManager = userManager;
        }
        public async Task<List<RekordModel>> GetDoctorRecords(string userId)
        {
            // No doctor profile linked to this account -> no records, not an error (mirrors
            // GetDoctorReservations/GetDoctorEmergency, which filter directly rather than
            // throwing, so one missing profile link can't 500 and abort the whole dashboard).
            return await _context.Rekord
                .Include(r => r.Pacienti)
                .Where(r => r.Doktori != null && r.Doktori.UserId == userId)
                .ToListAsync();
        }

        

        public async Task<(List<RekordModel> Items, int TotalCount)> GetPatientRecords(string userId, int page, int pageSize)
        {
            var patient = await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) throw new Exception("Patient not found");

            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.Rekord
                .Include(r => r.Doktori)
                .Where(r => r.Id_P == patient.Id_P);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(r => r.Id_Rek)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task AddRecord(RekordModel rekordModel, string userId)
        {
            var doctor = await _context.Doktori.FirstOrDefaultAsync(p => p.UserId == userId);
            if (doctor == null) throw new Exception("Doctor not found");

            var rekord = new RekordModel
            {
                Id_P = rekordModel.Id_P,
                DoctorId = doctor.Id,
                Diagnoza = rekordModel.Diagnoza,
                Receta = rekordModel.Receta,
                Rezultatet = rekordModel.Rezultatet,
            };
            await _rekordRepository.AddAsync(rekord);
        }
        

        public async Task<IEnumerable<RekordModel>> GetAllRekordsAsync()
        {
            return await _rekordRepository.GetAllAsync();
        }

        public async Task<RekordModel> GetRekordByIdAsync(int id)
        {
            var rekord = await _rekordRepository.GetByIdAsync(id);
            if (rekord == null)
            {
                throw new KeyNotFoundException("Rekord not found");
            }
            return rekord;
        }

 public async Task AddRekordAsync(RekordModel rekord)
        {
            var doctor = await _doctorRepository.GetByIdAsync(rekord.DoctorId);
            if (doctor == null)
            {
                throw new KeyNotFoundException("Doctor not found");
            }

            var patient = await _pacientiRepository.GetByIdAsync(rekord.Id_P);
            if (patient == null)
            {
                throw new KeyNotFoundException("Patient not found");
            }

            rekord.Doktori = doctor;
            rekord.Pacienti = patient;

            await _rekordRepository.AddAsync(rekord);
        }

        public async Task UpdateRekordAsync(int id, RekordModel rekord)
        {
            if (id != rekord.Id_Rek)
            {
                throw new ArgumentException("ID mismatch");
            }

            if (!await _rekordRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Rekord not found");
            }

            await _rekordRepository.UpdateAsync(rekord);
        }

        public async Task DeleteRekordAsync(int id)
        {
            if (!await _rekordRepository.ExistsAsync(id))
            {
                throw new KeyNotFoundException("Rekord not found");
            }

            await _rekordRepository.DeleteAsync(id);
        }

        public async Task<(List<RekordModel> Items, int TotalCount)> SearchAsync(string? search, int? doctorId, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.Rekord
                .Include(r => r.Doktori)
                .Include(r => r.Pacienti)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(r =>
                    (r.Diagnoza != null && r.Diagnoza.Contains(term)) ||
                    (r.Receta != null && r.Receta.Contains(term)) ||
                    (r.Rezultatet != null && r.Rezultatet.Contains(term)) ||
                    (r.Doktori != null && r.Doktori.Emri != null && r.Doktori.Emri.Contains(term)) ||
                    (r.Pacienti != null && r.Pacienti.Emri != null && r.Pacienti.Emri.Contains(term)) ||
                    (r.Pacienti != null && r.Pacienti.Mbiemri != null && r.Pacienti.Mbiemri.Contains(term)));
            }

            if (doctorId.HasValue)
            {
                query = query.Where(r => r.DoctorId == doctorId.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(r => r.Id_Rek)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}