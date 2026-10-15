using Dapper;
using NsiManager.Api.Data;
using NsiManager.Api.Dtos;
using NsiManager.Api.Models;
using NsiManager.Api.Repositories.Interfaces;

namespace NsiManager.Api.Repositories;


//ყველა ოპერაცია stored procedure-ს იძახებს (database/sp122/02_procedures.sql).
// ბაზის შეცდომები (THROW 50001/50002/50004) ErrorHandlingMiddleware-ში მუშავდება.

public class Sp122Repository(Connections connections, DapperActions dapper) : ISp122Repository
{
    public async Task<PagedResult<Sp122>> GetListAsync(string? search, int page, int pageSize)
    {
        var rows = (await dapper.QueryAsync<Sp122ListRow>(
            connections.Nsi, "dbo.SP122_GetList",
            new { Search = search, Page = page, PageSize = pageSize })).ToList();

        var totalCount = rows.Count > 0 ? rows[0].TotalCount : 0;
        return new PagedResult<Sp122>(rows, totalCount, page, pageSize);
    }

    public Task<Sp122?> GetByIdAsync(int prkey) =>
        dapper.QueryFirstOrDefaultAsync<Sp122>(connections.Nsi, "dbo.SP122_GetById", new { prkey });

    public async Task<Sp122> InsertAsync(Sp122Request request)
    {
        var row = await dapper.QueryFirstOrDefaultAsync<Sp122>(
            connections.Nsi, "dbo.SP122_Insert", ToParameters(request));

        return row ?? throw new InvalidOperationException("SP122_Insert-მა ჩანაწერი არ დააბრუნა");
    }

    public async Task<Sp122> UpdateAsync(int prkey, Sp122Request request)
    {
        var row = await dapper.QueryFirstOrDefaultAsync<Sp122>(
            connections.Nsi, "dbo.SP122_Update", ToParameters(request, prkey));

        return row ?? throw new InvalidOperationException("SP122_Update-მა ჩანაწერი არ დააბრუნა");
    }

    public Task DeleteAsync(int prkey) =>
        dapper.ExecuteAsync(connections.Nsi, "dbo.SP122_Delete", new { prkey });

    /// <summary>C#-ის ველები → procedure-ის პარამეტრები (სახელები ზუსტად ემთხვევა SQL-ს).</summary>
    private static DynamicParameters ToParameters(Sp122Request r, int? prkey = null)
    {
        var p = new DynamicParameters(new
        {
            ng = r.Ng,
            vg = r.Vg,
            kol = r.Kol,
            ves = r.Ves,
            udl = r.Udl,
            dm = r.Dm,
            prg = r.Prg,
            utv = r.Utv,
            rod = r.Rod,
            spec = r.Spec,
            negab = r.Negab,
            n_slujb = r.NSlujb,
            naz_gr = r.NazGr,
            naz_rus = r.NazRus
        });

        if (prkey is not null)
            p.Add("prkey", prkey);

        return p;
    }
}
