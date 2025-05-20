using Npgsql;

namespace myServer;

public static class Database{

    private static string? connectionString;
    
    static Database(){
        connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        if(string.IsNullOrEmpty(connectionString)){
            throw new Exception("Database connection string is not set");
        }
    }

    public static async Task<(int Id, string Email)?> ValidateUser(string email, string password){

        if(string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password)){
            return null;
        }


        try{
            using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand("SELECT Id, Email FROM users WHERE email = @email AND password = @password", conn);

            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@password", password);

            using var reader = await cmd.ExecuteReaderAsync();
            if(await reader.ReadAsync()){
                return (Id : reader.GetInt32(0), Email : reader.GetString(1));
            }
            return null;
        }
        catch(Exception ex){
            Console.WriteLine(ex.Message);
            return null;
        }
    }

    public static async Task<bool> CreateUser(string email, string password){
        if(string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password)){
            return false;
        }

        try{
            using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();

            using var checkcmd = new NpgsqlCommand("SELECT COUNT(*) FROM users WHERE email = @email", conn);
            checkcmd.Parameters.AddWithValue("@email", email);

            var result = await checkcmd.ExecuteScalarAsync();    
            if(Convert.ToInt32(result) > 0){
                return false;
            }

            using var cmd = new NpgsqlCommand("INSERT INTO users (email, password) values (@email, @password)", conn);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@password", password);

            await cmd.ExecuteNonQueryAsync();
            return true;
        }
        catch(Exception ex){
            Console.WriteLine(ex.Message);
            return false;
        }
    }
}