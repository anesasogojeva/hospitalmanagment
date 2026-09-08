using dizajn_Projekti.Database;
using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dizajn_Projekti.DataAccess.Repositories
{
    public class ContactRepository : IContactRepository
    {
        private readonly HospitalDbContext _context;

        public ContactRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task AddContactAsync(ContactModel contact)
        {
            await _context.Contacts.AddAsync(contact);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ContactModel>> GetContactsAsync()
        {
            return await _context.Contacts.ToListAsync();
        }

        public async Task<ContactModel> GetContactByIdAsync(int id)
        {
            return await _context.Contacts.FindAsync(id);
        }

        public async Task DeleteContactAsync(ContactModel contact)
        {
            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
        }

        public async Task<(List<ContactModel> Items, int TotalCount)> SearchAsync(string? search, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = _context.Contacts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c =>
                    (c.Name != null && c.Name.Contains(term)) ||
                    (c.Email != null && c.Email.Contains(term)) ||
                    (c.Message != null && c.Message.Contains(term)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(c => c.ContactId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
