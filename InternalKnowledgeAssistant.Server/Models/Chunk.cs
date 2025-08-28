namespace InternalKnowledgeAssistant.Server.Models
{
    public class Chunk
    {
        public string Id { get; set; } = string.Empty;
        public string Cursor { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }
}
