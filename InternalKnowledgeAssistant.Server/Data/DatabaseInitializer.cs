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
                    
                    var sampleNotes = new[]
                    {
                        new Models.Note
                        {
                            Title = "Welcome to Internal Knowledge Assistant",
                            Content = "This is your first note. You can edit, delete, or create new notes to organize your internal knowledge.",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Models.Note
                        {
                            Title = "Getting Started",
                            Content = "Use this application to store and organize important information, procedures, and knowledge that your team needs to access regularly.",
                            CreatedAt = DateTime.UtcNow
                        }
                    };
                    
                    context.Notes.AddRange(sampleNotes);
                    await context.SaveChangesAsync();
                    
                    logger.LogInformation("Database seeded successfully with {Count} notes", sampleNotes.Length);
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
