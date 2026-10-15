using System.Data;
using Microsoft.Data.SqlClient;

namespace NsiManager.Api.Data;

public class Connections(IConfiguration config)
{
    public IDbConnection Nsi => new SqlConnection(
        config.GetConnectionString("Nsi")
        ?? throw new InvalidOperationException(
            "ConnectionStrings:Nsi მითითებული არ არის. დაამატეთ: dotnet user-secrets set \"ConnectionStrings:Nsi\" \"...\""));
}
