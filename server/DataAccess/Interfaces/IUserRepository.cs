using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
// using hsm_lab1.Models;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    


        public interface IUserRepository
        {
            Task<User?> GetUserByUsernameAsync(string username);
            Task<bool> UpdateUserAsync(User user);
            Task AddDoktoriAsync(DoktoriModel doktori);
            Task AddPacientiAsync(PacientiModel pacienti);
        Task<User?> GetUserByEmailAsync(string email);
        }
    }
    

