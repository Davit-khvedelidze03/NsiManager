using Microsoft.Data.SqlClient;
using NsiManager.Api.Dtos;

namespace NsiManager.Api.Middleware;

//ყველა შეცდომას პასუხობს აგზავნის ერთნაირი ფორმატით: { "message": "..." }
public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (SqlException ex) when (IsKnownSqlError(ex.Number))
        {
            var (status, message) = ex.Number switch
            {
                50001 => (StatusCodes.Status400BadRequest, ex.Message),
                50002 => (StatusCodes.Status409Conflict, ex.Message),
                50004 => (StatusCodes.Status404NotFound, ex.Message),
                2601 or 2627 => (StatusCodes.Status409Conflict, "ასეთი ჩანაწერი უკვე არსებობს"),
                _ => (StatusCodes.Status400BadRequest, "მონაცემი ეწინააღმდეგება ბაზის შეზღუდვას")
            };

            logger.LogWarning("SQL {Number}: {Message}", ex.Number, ex.Message);
            await WriteErrorAsync(context, status, message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "დაუმუშავებელი შეცდომა: {Path}", context.Request.Path);
            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError,
                "სერვერის შეცდომა, სცადეთ მოგვიანებით");
        }
    }

    private static bool IsKnownSqlError(int number) =>
        number is 50001 or 50002 or 50004 or 2601 or 2627 or 547;

    private static async Task WriteErrorAsync(HttpContext context, int status, string message)
    {
        if (context.Response.HasStarted)
            return;

        context.Response.Clear();
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new ApiError(message));
    }
}
