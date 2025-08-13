using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using InternalKnowledgeAssistant.Server.Models;

namespace InternalKnowledgeAssistant.Server.Data
{
    public class KnowledgeAssistantDbContext : DbContext
    {
        public KnowledgeAssistantDbContext(DbContextOptions<KnowledgeAssistantDbContext> options)
            : base(options)
        {
        }

        public DbSet<Models.Note> Notes { get; set; }
    }
}
