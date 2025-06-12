using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using myServer;
using sib_api_v3_sdk.Api;
using sib_api_v3_sdk.Model;
using sib_api_v3_sdk.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


var builder = WebApplication.CreateBuilder(args);

// Explicitly add user secrets if in Development
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>(optional: true);
}

builder.Services.AddCors();

var app = builder.Build();

app.UseCors(builder => builder
    .WithOrigins("http://localhost:5173", "http://localhost:5174")
    .AllowAnyMethod()
    .AllowAnyHeader());



//generates user data token
string GenerateToken(string email, string id){

        var keyString = Environment.GetEnvironmentVariable("SECRET_KEY");
        if(keyString == null){
            throw new Exception("failed to fetch secret key");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]{
            new Claim("userEmail", email),
            new Claim("id", id)
        };

        var token = new JwtSecurityToken(

            issuer: "Vendora",
            audience: "VendoraApp",
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
}

//decodes user data token
ClaimsPrincipal? decodeToken(string token){
    var keyString = Environment.GetEnvironmentVariable("SECRET_KEY");

    if(keyString == null){
        throw new Exception("failed to fetch secret key");
    }

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
    var handler = new JwtSecurityTokenHandler();
    var validation = new TokenValidationParameters{
        ValidateIssuer = true,
        ValidIssuer = "Vendora",
        ValidateAudience = true,
        ValidAudience = "VendoraApp",
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = key,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    try{
        var principal = handler.ValidateToken(token, validation, out var validatedToken);
        return principal;
    }
    catch(Exception e){
        Console.WriteLine(e.Message);
        return null;
    }
}

//endpoints
app.MapPost("/api/login", async (LoginRequest request) => {

    Console.WriteLine("attempting login");

    var userData = await Database.ValidateUser(request.Email, request.Password);

    if(userData != null){
        var token = GenerateToken(userData.Value.Email, userData.Value.Id.ToString());
        return Results.Ok(new { message = "Login successful", token = token});
    }
    return Results.Json(new { message = "Login Failed. Please try again."}, statusCode: 401);
});

app.MapPost("/api/getUserData", (TokenRequest request) => {
    var decodedToken = decodeToken(request.Token);
    if(decodedToken == null){
        return Results.Json(new { message = "Invalid token"}, statusCode: 401);
    }

    var claims = decodedToken.Claims.ToDictionary(c => c.Type, c => c.Value);
    return Results.Ok(new { message = "User data retrieved", claims = claims});
});

app.MapPost("/api/register", async (RegisterUser register) => {
    if(string.IsNullOrEmpty(register.Email) || string.IsNullOrEmpty(register.Password)){
        return Results.Json(new { message = "Invalid Email or Password"}, statusCode: 400);
    }

    var res = await Database.CreateUser(register.Email, register.Password);

    if(res){
        return Results.Json(new { message = "User created successfully"}, statusCode: 200);
    }
    return Results.Json(new { message = "User creation failed"}, statusCode: 500);
});

app.MapPost("/api/sendEmail", async (EmailRequest request) => {
    if (string.IsNullOrEmpty(request.Email))
    {
        return Results.BadRequest(new { message = "Email is required." });
    }
    Console.WriteLine($"Received request with Email: {request.Email ?? "NULL"}");
    var key = builder.Configuration["BREVO_KEY"];
    Console.WriteLine($"Retrieved BREVO_KEY value via builder.Configuration: [{key ?? "NULL"}]");

    if(key == null){
        Console.WriteLine("BREVO_KEY is null (checked via builder.Configuration), returning 500 error.");
        return Results.Json(new {message = "Failed to fetch Brevo key"}, statusCode: 500);
    }
    
    var token = GenerateToken(request.Email!, Guid.NewGuid().ToString());

    var resetLink = $"http://localhost:5173/screens/PasswordReset?token={token}";
    Console.WriteLine($"Generated Reset Link: {resetLink}");
    var config = new Configuration();
    config.ApiKey.Add("api-key", key);
    var apiInstance = new TransactionalEmailsApi(config);


    var emailSender = new  SendSmtpEmailSender(email: "yousefm2315@gmail.com", name: "Vendora");
    var emailTo = new List<SendSmtpEmailTo> {
        new SendSmtpEmailTo(email: request.Email, name: "User")
    };

    var subject = "Password Reset";
    var htmlContent = $@"
        <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
        </html>";
    
        var sendSmtpEmail = new SendSmtpEmail {
            Sender = emailSender,
            To = emailTo,
            Subject = subject,
            HtmlContent = htmlContent
        };

    try
    {
        var result = await apiInstance.SendTransacEmailAsync(sendSmtpEmail);
        return Results.Ok(new { message = "Password reset instructions sent to your email" });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error sending password reset email: {ex.Message}");
        return Results.Json(new { message = "Failed to send password reset email" }, statusCode: 500);
    }
});

app.MapPut("/api/PasswordReset", async (ResetRequest request) => {

    if(string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword)){
        return Results.BadRequest(new { message = "Token and new password are required." });
    };

    ClaimsPrincipal? principal = decodeToken(request.Token);
    if (principal == null)
    {
        return Results.Json(new { message = "Invalid or expired token." }, statusCode: StatusCodes.Status401Unauthorized);
    }

    string? userEmail = principal.Claims.FirstOrDefault(c => c.Type == "userEmail")?.Value;
    if (string.IsNullOrEmpty(userEmail))
    {
        Console.WriteLine("Error: userEmail claim not found in token.");
        return Results.Json(new { message = "Invalid token: user email not found." }, statusCode: StatusCodes.Status401Unauthorized);
    }

    if (request.NewPassword.Length < 8) {
        return Results.BadRequest(new { message = "Password must be at least 8 characters."});
    }


    try{
        var res = await Database.UpdateUserPassword(userEmail, request.NewPassword);

        if (res)
        {
            return Results.Ok(new { message = "Password updated successfully." });
        }
        else
        {
            return Results.Problem(detail: "Failed to update password.", statusCode: 500);
        }

    }catch(Exception ex){
        Console.WriteLine($"Error in PasswordReset endpoint: {ex.Message}");
        return Results.Json(new {message = "Error occurred while resetting password."}, statusCode: 500);
    }
});

app.MapPost("/api/UploadItem", async ([FromForm] ItemUpload item) => {

    try{
        string name = item.Name;
        int id = item.Id;
        IFormFile image = item.Image;
        decimal price = item.Price;
        string condition = item.Condition;
        string location = item.Location;

    
        if (image == null || image.Length == 0){
            return Results.BadRequest(new { message = "Image file is required and cannot be empty." });
        }

        var res = await Database.UploadItem(id, name, image, price, condition, location);

        if(res){
            return Results.Json(new { message = "upload successful", statusCode = 200});
        }
        else{
            return Results.Json(new { message = "upload failed", statusCode = 500});
        }

    }catch(Exception err){
        Console.WriteLine(err);
        return Results.Problem(
                    detail: "An unexpected error occurred while processing the item upload.",
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Upload Error"
                );
    }
}).DisableAntiforgery();


app.MapPost("/api/getItems", async (LoadCount x) => {

    try{
        var items = await Database.GetItems(x.Count, x.PriceMin, x.PriceMax, x.Condition);

        return Results.Ok(items);
    }catch(Exception e){
        Console.WriteLine($"Error in /api/getItems: {e.Message}");
        return Results.Problem("An error occurred while fetching items.", statusCode: 500);
    }

});

app.MapPost("/api/getMyItems", async (MyItemsRequest request) => {
    if (!int.TryParse(request.UserId, out int userId) || userId <= 0)
    {
        return Results.BadRequest(new { message = "User ID is invalid." });
    }

    try
    {
        var items = await Database.GetMyItems(userId);
        return Results.Ok(items);
    }
    catch (Exception e)
    {
        Console.WriteLine($"Error fetching items for user {userId}: {e.Message}");
        return Results.Problem("An error occurred while fetching your items.", statusCode: 500);
    }
});


app.MapPost("/api/deleteItem", async (DeleteRequest item) =>{

    try{
        var res = await Database.deleteItem(item.ItemID);

        if(res){
            return Results.Ok(new {message = "Item deleted."});
        }
        else{
            return Results.NotFound(new {message = "Failed to delete item."});
        }
    }
    catch(Exception e){
        Console.WriteLine($"Failed to delete item.: {e}");
        return Results.Problem("Server error", statusCode: 500);
    }
});



app.Run();

public class DeleteRequest{
    public required int ItemID {get; set;}
}

public class MyItemsRequest
{
    public required string UserId { get; set; }
}

public class LoadCount{
    public int Count {get; set;}
    public decimal? PriceMin { get; set; }
    public decimal? PriceMax { get; set; }
    public string? Condition { get; set; }
}

public class ResetRequest{
    public required string Token {set; get;}
    public required string NewPassword {set; get;}
}

public class EmailRequest{
    public required string Email {get; set;}
}

public class RegisterUser{
    public required string Email {get; set;}
    public required string Password {get; set;}
}

public class TokenRequest{
    public required string Token {get; set;}
}
public class LoginRequest{
    public required string Email {get; set;}
    public required string Password {get; set;}
}
public class ItemUpload{
    public required string Name {get; set;}
    public required int Id {get; set;}
    public required IFormFile Image {get; set;}
    public required decimal Price {get; set;}
    public required string Condition {get; set;}
    public required string Location {get; set;}
}