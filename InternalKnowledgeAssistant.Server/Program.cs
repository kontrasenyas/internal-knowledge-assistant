using InternalKnowledgeAssistant.Server.Data;
using InternalKnowledgeAssistant.Server.Application.Services;
using InternalKnowledgeAssistant.Server.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policy using configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow all origins for easier testing
            policy.SetIsOriginAllowed(origin => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // In production, use configured origins
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
                policy.WithOrigins(
                    "https://localhost:59874", 
                    "http://localhost:59874",
                    "https://localhost:4200",
                    "http://localhost:4200"
                );
            }
            
            policy.AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
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
    // For production, use the SQLite database file in the mounted volume
    connectionString = "Data Source=/app/data/app.db";
}

builder.Services.AddDbContext<KnowledgeAssistantDbContext>(options =>
    options.UseSqlite(connectionString));

// Register application services
builder.Services.AddScoped<IRetrieverService, RetrieverService>();
builder.Services.AddScoped<IPromptBuilder, PromptBuilder>();

// Register infrastructure services
builder.Services.AddHttpClient<ILlamaClient, LlamaClient>();

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

// Initialize database
await DatabaseInitializer.InitializeDatabaseAsync(app);

app.Run();
