using System.Text.Json.Serialization;

namespace InternalKnowledgeAssistant.Server.Models
{
    public class AssistantResponse
    {
        [JsonPropertyName("answer")]
        public string Answer { get; set; } = string.Empty;
        
        [JsonPropertyName("citations")]
        public string[] Citations { get; set; } = Array.Empty<string>();
        
        [JsonPropertyName("next_cursor")]
        public string? NextCursor { get; set; }
        
        [JsonPropertyName("follow_up")]
        public string FollowUp { get; set; } = string.Empty;
    }
}
