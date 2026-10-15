using System.Data;
using Dapper;

namespace NsiManager.Api.Data;

public class DapperActions
{
    public async Task<IEnumerable<T>> QueryAsync<T>(
        IDbConnection connection, string sql, object? param = null,
        CommandType commandType = CommandType.StoredProcedure)
    {
        using (connection)
        {
            return await connection.QueryAsync<T>(sql, param, commandType: commandType);
        }
    }

    public async Task<T?> QueryFirstOrDefaultAsync<T>(
        IDbConnection connection, string sql, object? param = null,
        CommandType commandType = CommandType.StoredProcedure)
    {
        using (connection)
        {
            return await connection.QueryFirstOrDefaultAsync<T>(sql, param, commandType: commandType);
        }
    }

    public async Task<int> ExecuteAsync(
        IDbConnection connection, string sql, object? param = null,
        CommandType commandType = CommandType.StoredProcedure)
    {
        using (connection)
        {
            return await connection.ExecuteAsync(sql, param, commandType: commandType);
        }
    }
}
