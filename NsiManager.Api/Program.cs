using Dapper;
using Microsoft.AspNetCore.Mvc;
using NsiManager.Api.Data;
using NsiManager.Api.Dtos;
using NsiManager.Api.Middleware;
using NsiManager.Api.Repositories;
using NsiManager.Api.Repositories.Interfaces;

DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // ვალიდაციის შეცდომებიც იმავე ფორმატით: { "message": "..." }
        options.InvalidModelStateResponseFactory = context =>
        {
            var messages = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .Where(m => !string.IsNullOrWhiteSpace(m))
                .Distinct();

            return new BadRequestObjectResult(new ApiError(string.Join("; ", messages)));
        };
    });

builder.Services.AddOpenApi();

// ბაზა
builder.Services.AddSingleton<Connections>();
builder.Services.AddSingleton<DapperActions>();

// ცნობარები — ყოველი ახალი ცნობარის repository აქ რეგისტრირდება
builder.Services.AddScoped<ISp122Repository, Sp122Repository>();

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
