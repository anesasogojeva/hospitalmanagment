using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.Services
{
    public class ContactService : IContactService
    {
        private readonly IContactRepository _repository;

        public ContactService(IContactRepository repository)
        {
            _repository = repository;
        }

        public async Task AddContactAsync(ContactModel contact)
        {
            await _repository.AddContactAsync(contact);
        }

        public async Task<IEnumerable<ContactModel>> GetContactsAsync()
        {
            return await _repository.GetContactsAsync();
        }

        public async Task DeleteContactAsync(int id)
        {
            var contact = await _repository.GetContactByIdAsync(id);
            if (contact == null)
            {
                throw new KeyNotFoundException("Contact not found");
            }
            await _repository.DeleteContactAsync(contact);
        }

        public async Task<(List<ContactModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize)
        {
            return await _repository.SearchAsync(search, page, pageSize);
        }
    }
}