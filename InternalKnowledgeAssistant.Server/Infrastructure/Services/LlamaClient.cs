using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InternalKnowledgeAssistant.Server.Infrastructure.Services
{
    public interface ILlamaClient
    {
        Task<string> GenerateAsync(string prompt);
    }

    public class LlamaClient : ILlamaClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<LlamaClient> _logger;

        public LlamaClient(HttpClient httpClient, ILogger<LlamaClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<string> GenerateAsync(string prompt)
        {
            try
            {
                // Create the chat completions request with system and user messages
                var requestBody = new
                {
                    model = "llama-3-8b",
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = "You are 'TeamKB Assistant' — an internal knowledge assistant for a team. Follow these rules:\n" +
                                     "- Use ONLY the text inside 'RETRIEVED_DOCUMENTS'.\n" +
                                     "- Cite any factual claims with chunk id and cursor, e.g. [doc:42,cursor:abc123].\n" +
                                     "- If no answer is found, answer 'I don't know' and suggest next action.\n" +
                                     "- If user asks for 'more', set next_cursor to retriever_next_cursor.\n" +
                                     "- Respond ONLY as valid JSON:\n\n" +
                                     "{\n" +
                                     "  \"answer\": \"<assistant answer>\",\n" +
                                     "  \"citations\": [\"doc:42,cursor:abc123\"],\n" +
                                     "  \"next_cursor\": \"<cursor-or-null>\",\n" +
                                     "  \"follow_up\": \"<suggested follow-up>\"\n" +
                                     "}"
                        },
                        new
                        {
                            role = "user",
                            content = prompt
                        }
                    },
                    max_tokens = 512,
                    temperature = 0.0
                };

                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("http://localhost:8000/v1/chat/completions", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseData = JsonSerializer.Deserialize<ChatCompletionResponse>(responseContent);
                    
                    if (responseData?.Choices?.Length > 0 && responseData.Choices[0]?.Message?.Content != null)
                    {
                        return responseData.Choices[0].Message.Content;
                    }
                }

                _logger.LogWarning("Llama API call failed or returned invalid response. Status: {StatusCode}", response.StatusCode);
                return "I apologize, but I'm unable to generate a response at the moment.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Llama API");
                return "I apologize, but I encountered an error while processing your request.";
            }
        }
    }

    // New response models for chat completions format
    public class ChatCompletionResponse
    {
        [JsonPropertyName("choices")]
        public ChatChoice[]? Choices { get; set; }
        
        [JsonPropertyName("created")]
        public long Created { get; set; }
        
        [JsonPropertyName("model")]
        public string? Model { get; set; }
        
        [JsonPropertyName("usage")]
        public TokenUsage? Usage { get; set; }
    }

    public class ChatChoice
    {
        [JsonPropertyName("finish_reason")]
        public string? FinishReason { get; set; }
        
        [JsonPropertyName("index")]
        public int Index { get; set; }
        
        [JsonPropertyName("message")]
        public ChatMessage? Message { get; set; }
    }

    public class ChatMessage
    {
        [JsonPropertyName("role")]
        public string? Role { get; set; }
        
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    public class TokenUsage
    {
        [JsonPropertyName("completion_tokens")]
        public int CompletionTokens { get; set; }
        
        [JsonPropertyName("prompt_tokens")]
        public int PromptTokens { get; set; }
        
        [JsonPropertyName("total_tokens")]
        public int TotalTokens { get; set; }
    }

    // Keep the old response model for backward compatibility if needed
    public class LlamaResponse
    {
        public string? GeneratedText { get; set; }
    }
}
