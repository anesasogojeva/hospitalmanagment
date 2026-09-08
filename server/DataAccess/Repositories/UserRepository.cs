using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using global::dizajn_Projekti.Database;


using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
namespace dizajn_Projekti.DataAccess.Repositories
{
    

   
        public class UserRepository : IUserRepository
        {
            private readonly HospitalDbContext _context;

            public UserRepository(HospitalDbContext context)
            {
                _context = context;
            }

            public async Task<User?> GetUserByUsernameAsync(string username)
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            }

            public async Task<bool> UpdateUserAsync(User user)
            {
                _context.Users.Update(user);
                return await _context.SaveChangesAsync() > 0;
            }

            public async Task AddDoktoriAsync(DoktoriModel doktori)
            {
                await _context.Doktori.AddAsync(doktori);
                await _context.SaveChangesAsync();
            }

            public async Task AddPacientiAsync(PacientiModel pacienti)
            {
                await _context.Pacienti.AddAsync(pacienti);
                await _context.SaveChangesAsync();
            }
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

    }
}

