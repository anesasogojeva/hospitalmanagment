using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Interfaces
{
    public interface IContactRepository
    {
        Task AddContactAsync(ContactModel contact);
        Task<IEnumerable<ContactModel>> GetContactsAsync();
        Task<ContactModel> GetContactByIdAsync(int id);
        Task DeleteContactAsync(ContactModel contact);
        Task<(List<ContactModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize);
    }
}