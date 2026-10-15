using NsiManager.Api.Dtos;
using NsiManager.Api.Models;

namespace NsiManager.Api.Repositories.Interfaces;

public interface ISp122Repository
{
    Task<PagedResult<Sp122>> GetListAsync(string? search, int page, int pageSize);
    Task<Sp122?> GetByIdAsync(int prkey);
    Task<Sp122> InsertAsync(Sp122Request request);
    Task<Sp122> UpdateAsync(int prkey, Sp122Request request);
    Task DeleteAsync(int prkey);
}
