namespace InternalKnowledgeAssistant.Server.Models
{
    public class AssistantRequest
    {
        public string Query { get; set; } = string.Empty;
        public string[] ConversationHistory { get; set; } = Array.Empty<string>();
        public string? Cursor { get; set; }
    }
}
