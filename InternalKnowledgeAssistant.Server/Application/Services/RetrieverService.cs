using InternalKnowledgeAssistant.Server.Models;
using InternalKnowledgeAssistant.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace InternalKnowledgeAssistant.Server.Application.Services
{
    public interface IRetrieverService
    {
        Task<(List<Chunk> chunks, string? nextCursor)> GetTopKChunks(string query, string? cursor, int k = 4);
    }

    public class RetrieverService : IRetrieverService
    {
        private readonly KnowledgeAssistantDbContext _context;

        public RetrieverService(KnowledgeAssistantDbContext context)
        {
            _context = context;
        }

        public async Task<(List<Chunk> chunks, string? nextCursor)> GetTopKChunks(string query, string? cursor, int k = 4)
        {
            try
            {
                // Get all notes from the database
                var allNotes = await _context.Notes
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                // Convert all notes to chunks - let the AI model decide relevance
                var chunks = allNotes.Select((note, index) => new Chunk
                {
                    Id = note.Id.ToString(),
                    Cursor = $"cursor_page_{cursor ?? "1"}",
                    Source = note.Title ?? "Untitled Note",
                    Text = note.Content ?? "No content available"
                }).ToList();

                // Simple pagination - if we have more notes than k, provide next cursor
                string? nextCursor = null;
                if (allNotes.Count > k)
                {
                    var currentPage = cursor == null ? 1 : int.Parse(cursor.Replace("cursor_page_", ""));
                    nextCursor = $"cursor_page_{currentPage + 1}";
                }

                return (chunks, nextCursor);
            }
            catch (Exception ex)
            {
                // Log error and return empty result
                return (new List<Chunk>(), null);
            }
        }
    }
}
