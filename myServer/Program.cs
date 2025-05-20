using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using myServer;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

var app = builder.Build();
app.UseCors(builder => builder
    .WithOrigins("http://localhost:5173")
    .AllowAnyMethod()
    .AllowAnyHeader());


var customClaimTypes = new HashSet<string> {
            "email", "username", "fullName", "id", "address", "city", "state", "postalCode", "Country"
};

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

app.Run();

public class TokenRequest{
    public required string Token {get; set;}
}
public class LoginRequest{
    public required string Email {get; set;}
    public required string Password {get; set;}
}