var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

var app = builder.Build();
app.UseCors(builder => builder
    .AllowAnyOrigin('http://localhost:5173')
    .AllowAnyMethod('GET', 'POST', 'PUT', 'DELETE')
    .AllowAnyHeader());

app.MapPost("/api/login", (LoginRequest request) => {

    Console.WriteLine("attempting login");

    if(request.Email == "test@test.com" && request.Password == "password"){
        return Results.Ok(new { message = "Login successful" });
    }
    return Results.Unauthorized();
});

app.Run();


public class LoginRequest{
    public required string Email {get; set;}
    public required string Password {get; set;}
}