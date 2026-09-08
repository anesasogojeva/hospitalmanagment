using dizajn_Projekti.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services.Interfaces
{
    public interface IContactService
    {
        Task AddContactAsync(ContactModel contact);
        Task<IEnumerable<ContactModel>> GetContactsAsync();
        Task DeleteContactAsync(int id);
        Task<(List<ContactModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize);
    }
}