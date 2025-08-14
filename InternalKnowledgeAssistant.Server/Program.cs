using InternalKnowledgeAssistant.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policy using configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        // Get CORS origins from configuration based on environment
        var corsOrigins = builder.Configuration.GetSection("CorsOrigins")
            .GetSection(builder.Environment.EnvironmentName)
            .Get<string[]>();

        if (corsOrigins != null && corsOrigins.Length > 0)
        {
            policy.WithOrigins(corsOrigins);
        }
        else
        {
            // Fallback: Allow localhost for development if no config found
            policy.WithOrigins("https://localhost:59874", "http://localhost:59874");
        }
        
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services to the container.
string? connectionString;
if (builder.Environment.IsDevelopment())
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}
else
{
    var sqlBuilder = new SqlConnectionStringBuilder(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
    // Managed Identity: no password, use Azure AD auth
    sqlBuilder.Authentication = SqlAuthenticationMethod.ActiveDirectoryManagedIdentity;
    connectionString = sqlBuilder.ConnectionString;
}

builder.Services.AddDbContext<KnowledgeAssistantDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use CORS before other middleware
app.UseCors("AllowAngularApp");

// Add health check endpoint for Fly.io
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
