using dizajn_Projekti.Database;
using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;

public class PacientiRepository : IPacientiRepository
{
    private readonly HospitalDbContext _context;

    public PacientiRepository(HospitalDbContext context)
    {
        _context = context;
    }

    public async Task<List<PacientiModel>> GetAllAsync()
    {
        return await _context.Pacienti.ToListAsync();
    }

    public async Task<PacientiModel?> GetByIdAsync(int id)
    {
        return await _context.Pacienti.FindAsync(id);
    }

    public async Task AddAsync(PacientiModel pacientiModel)
    {
        await _context.Pacienti.AddAsync(pacientiModel);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PacientiModel pacientiModel)
    {
        var existingPacienti = await _context.Pacienti.FindAsync(pacientiModel.Id_P);
        if (existingPacienti == null)
            throw new Exception("Patient not found.");

        existingPacienti.Emri = pacientiModel.Emri;
        existingPacienti.Mbiemri = pacientiModel.Mbiemri;
        existingPacienti.DataELindjes = pacientiModel.DataELindjes;
        existingPacienti.NumriTel = pacientiModel.NumriTel;
        existingPacienti.Gjinia = pacientiModel.Gjinia;

        _context.Entry(existingPacienti).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var pacienti = await GetByIdAsync(id);
        if (pacienti != null)
        {
            _context.Pacienti.Remove(pacienti);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Pacienti.AnyAsync(e => e.Id_P == id);
    }

    public async Task<PacientiModel?> GetByUserIdAsync(string userId)
    {
        return await _context.Pacienti.FirstOrDefaultAsync(p => p.UserId == userId);
    }

    // New Methods

    public async Task<List<ReservationModel>> GetReservationsByPatientIdAsync(int patientId)
    {
        return await _context.ReservationModel.Where(r => r.Patient == patientId).ToListAsync();
    }

    public async Task<List<EmergencyModel>> GetEmergenciesByPatientIdAsync(int patientId)
    {
        return await _context.EmergencyModel.Where(e => e.Patient == patientId).ToListAsync();
    }

    public async Task<List<RekordModel>> GetRecordsByPatientIdAsync(int patientId)
    {
        return await _context.Rekord.Where(r => r.Id_P == patientId).ToListAsync();
    }

    public async Task<List<ReviewModel>> GetReviewsByPatientIdAsync(int patientId)
    {
        return await _context.Review.Where(r => r.Id_P == patientId).ToListAsync();
    }
}
