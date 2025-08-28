using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace InternalKnowledgeAssistant.Server.Data
{
    public static class DatabaseInitializer
    {
        public static async Task InitializeDatabaseAsync(IHost host)
        {
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<KnowledgeAssistantDbContext>>();
            
            try
            {
                var context = services.GetRequiredService<KnowledgeAssistantDbContext>();
                
                // Ensure database is created
                await context.Database.EnsureCreatedAsync();
                
                // Check if we need to seed data
                if (!context.Notes.Any())
                {
                    logger.LogInformation("Seeding database with initial data...");
                    
                    logger.LogInformation("Database is empty. Please add notes through the application interface.");
                }
                else
                {
                    logger.LogInformation("Database already contains data, skipping seed");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while initializing the database");
                throw;
            }
        }
    }
}
