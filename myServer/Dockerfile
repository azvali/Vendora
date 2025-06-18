# Use the official .NET SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the application code
COPY . ./

# Publish the application
RUN dotnet publish -c Release -o out

# Use the official ASP.NET Core runtime image for the final, smaller image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Expose the port the app runs on
EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080

# Start the application
ENTRYPOINT ["dotnet", "myServer.dll"] 