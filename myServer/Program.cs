var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

var app = builder.Build();
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
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