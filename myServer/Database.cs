using Npgsql;
using BCrypt.Net;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace myServer;

public static class Database{

    private static string? connectionString;
    
    static Database(){
        connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        if(string.IsNullOrEmpty(connectionString)){
            throw new InvalidOperationException("Database connection string 'DATABASE_URL' is not set in environment variables.");
        }
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    private static bool VerifyPassword(string password, string hashedPassword)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            Console.WriteLine("Error verifying password: Invalid salt format in stored hash.");
            return false;
        }
    }

    public static async Task<(int Id, string Email)?> ValidateUser(string email, string password){

        if(string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password)){
            return null;
        }


        try{
            using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand("SELECT Id, Email, password FROM users WHERE email = @email", conn);

            cmd.Parameters.AddWithValue("@email", email);

            using var reader = await cmd.ExecuteReaderAsync();
            if(await reader.ReadAsync()){
                int userId = reader.GetInt32(0);
                string userEmail = reader.GetString(1);
                string hashedPasswordFromDb = reader.GetString(2);

                if (VerifyPassword(password, hashedPasswordFromDb))
                {
                    return (Id : userId, Email : userEmail);
                }
            }
            return null;
        }
        catch(Exception ex){
            Console.WriteLine($"Error in ValidateUser: {ex.ToString()}");
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
                Console.WriteLine($"CreateUser: Email {email} already exists.");
                return false;
            }

            string hashedPassword = HashPassword(password);

            using var cmd = new NpgsqlCommand("INSERT INTO users (email, password) VALUES (@email, @password)", conn);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@password", hashedPassword);

            await cmd.ExecuteNonQueryAsync();
            Console.WriteLine($"CreateUser: User {email} created successfully.");
            return true;
        }
        catch(Exception ex){
            Console.WriteLine($"Error in CreateUser: {ex.ToString()}");
            return false;
        }
    }

    public static async Task<bool> UpdateUserPassword(string userEmail, string newPassword){


        if (string.IsNullOrEmpty(userEmail) || string.IsNullOrEmpty(newPassword))
        {
            Console.WriteLine("UpdateUserPassword Error: Email or NewPassword is null or empty.");
            return false;
        }

        string hashedPassword = HashPassword(newPassword);
        
        try
        {
            using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand("UPDATE users SET password = @HashedPassword WHERE email = @UserEmail", conn);
            cmd.Parameters.AddWithValue("@HashedPassword", hashedPassword);
            cmd.Parameters.AddWithValue("@UserEmail", userEmail);

            int rowsAffected = await cmd.ExecuteNonQueryAsync();
            
            if (rowsAffected > 0)
            {
                Console.WriteLine($"Password updated successfully for user: {userEmail}");
                return true;
            }
            else
            {
                Console.WriteLine($"Password update attempt for user: {userEmail} affected 0 rows. User might not exist.");
                return false;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database error in UpdateUserPassword for {userEmail}: {ex.ToString()}");
            return false;
        }
    }


    public static async Task<bool> UploadItem(int userId, string name, IFormFile imageFile, decimal price, string condition, string location){

            
            if(imageFile == null || imageFile.Length == 0){
                Console.WriteLine("UploadItem Error: Image file is null or empty.");
                return false;
            }

            byte[] imageData;

            using (var memoryStream = new MemoryStream()){
                await imageFile.CopyToAsync(memoryStream);
                if (memoryStream.Length == 0){
                    Console.WriteLine("UploadItem Error: Image file is empty after copying to memory stream.");
                    return false;
                }
                imageData = memoryStream.ToArray();
            }


            try{
                await using var conn = new NpgsqlConnection(connectionString);
                await conn.OpenAsync();

                var cmd = new NpgsqlCommand("INSERT INTO items (user_id, name, image, price, condition, location, is_active) VALUES (@userId, @name, @imageData, @price, @condition, @location, true)", conn);
                
                cmd.Parameters.AddWithValue("@userId", userId);
                cmd.Parameters.AddWithValue("@name", name);
                cmd.Parameters.AddWithValue("@imageData", imageData); 
                cmd.Parameters.AddWithValue("@price", price);         
                cmd.Parameters.AddWithValue("@condition", condition);
                cmd.Parameters.AddWithValue("@location", location);

            
                int rowsAffected = await cmd.ExecuteNonQueryAsync();

                
                if (rowsAffected > 0)
                {
                    Console.WriteLine($"Item uploaded for user id: {userId}");
                    return true;
                }
                else
                {
                    Console.WriteLine($"failed to upload item for id: {userId}");
                    return false;
                }
            }
            catch(Exception err){
                Console.WriteLine($"error in UploadItem for user {userId}: {err.ToString()}");
                return false;
            }
    }


    public static async Task<List<Item>> get30(int count){

        List<Item> items = new List<Item>();
        int currStart = count * 30;

        try{
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();

            var query = @"SELECT id, name, image, price, condition, location, created_at
                            FROM items 
                            WHERE is_active = true 
                            ORDER BY created_at DESC
                            LIMIT 30
                            OFFSET @offset";

            await using (var cmd = new NpgsqlCommand(query, conn)){

                cmd.Parameters.AddWithValue("@offset", currStart);

                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while(await reader.ReadAsync()){
                        byte[] imageData = (byte[])reader["image"];
                        string imageBase64 = Convert.ToBase64String(imageData);
                        string imageUrl = $"data:image/jpeg;base64,{imageBase64}";


                        items.Add(new Item {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Title = reader.GetString(reader.GetOrdinal("name")),
                            Price = reader.GetDecimal(reader.GetOrdinal("price")),
                            Condition = reader.GetString(reader.GetOrdinal("condition")),
                            Image = imageUrl,
                            Location = reader.GetString(reader.GetOrdinal("location")),
                            Created_at = reader.GetDateTime(reader.GetOrdinal("created_at"))
                        });
                    }
                }
            }
        }catch(Exception err){
            Console.WriteLine($"Error in get30: {err.ToString()}");
        }
        return items;
    }
}


public class Item{
    public int Id {get; set;}
    public string Title {get; set;}
    public string Image {get; set;}
    public decimal Price {get; set;}
    public string Condition {get; set;}
    public string Location {get; set;}
    public DateTime Created_at {get; set;}
}