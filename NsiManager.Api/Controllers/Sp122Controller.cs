using Microsoft.AspNetCore.Mvc;
using NsiManager.Api.Dtos;
using NsiManager.Api.Models;
using NsiManager.Api.Repositories.Interfaces;

namespace NsiManager.Api.Controllers;

[ApiController]
[Route("api/sp122")]
public class Sp122Controller(ISp122Repository repository) : ControllerBase
{
    //ძებნა ნებისმიერი პარამეტრით + გვერდები
    [HttpGet]
    public async Task<ActionResult<PagedResult<Sp122>>> GetList(
        [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return Ok(await repository.GetListAsync(search, page, pageSize));
    }

    [HttpGet("{prkey:int}")]
    public async Task<ActionResult<Sp122>> GetById(int prkey)
    {
        var row = await repository.GetByIdAsync(prkey);
        return row is null ? NotFound(new ApiError("ჩანაწერი ვერ მოიძებნა")) : Ok(row);
    }

    [HttpPost]
    public async Task<ActionResult<Sp122>> Insert([FromBody] Sp122Request request)
    {
        var row = await repository.InsertAsync(request);
        return CreatedAtAction(nameof(GetById), new { prkey = row.Prkey }, row);
    }

    [HttpPut("{prkey:int}")]
    public async Task<ActionResult<Sp122>> Update(int prkey, [FromBody] Sp122Request request) =>
        Ok(await repository.UpdateAsync(prkey, request));

    [HttpDelete("{prkey:int}")]
    public async Task<IActionResult> Delete(int prkey)
    {
        await repository.DeleteAsync(prkey);
        return NoContent();
    }
}
