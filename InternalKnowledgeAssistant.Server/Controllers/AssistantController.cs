using InternalKnowledgeAssistant.Server.Application.Services;
using InternalKnowledgeAssistant.Server.Infrastructure.Services;
using InternalKnowledgeAssistant.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace InternalKnowledgeAssistant.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly IRetrieverService _retrieverService;
        private readonly IPromptBuilder _promptBuilder;
        private readonly ILlamaClient _llamaClient;
        private readonly ILogger<AssistantController> _logger;

        public AssistantController(
            IRetrieverService retrieverService,
            IPromptBuilder promptBuilder,
            ILlamaClient llamaClient,
            ILogger<AssistantController> logger)
        {
            _retrieverService = retrieverService;
            _promptBuilder = promptBuilder;
            _llamaClient = llamaClient;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<AssistantResponse>> GetAssistantResponse([FromBody] AssistantRequest request)
        {
            try
            {
                // Get chunks from retriever service
                var (chunks, nextCursor) = await _retrieverService.GetTopKChunks(request.Query, request.Cursor);

                // Build prompt
                var prompt = _promptBuilder.BuildPrompt(
                    request.ConversationHistory,
                    chunks,
                    request.Query,
                    nextCursor);

                // Generate response from Llama
                var llamaResponse = await _llamaClient.GenerateAsync(prompt);

                // Try to parse the response as JSON
                try
                {
                    var parsedResponse = JsonSerializer.Deserialize<AssistantResponse>(llamaResponse);
                    if (parsedResponse != null)
                    {
                        // Ensure next_cursor is set correctly
                        parsedResponse.NextCursor = nextCursor;
                        return Ok(parsedResponse);
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse Llama response as JSON: {Response}", llamaResponse);
                }

                // Fallback response if JSON parsing fails
                var fallbackResponse = new AssistantResponse
                {
                    Answer = "I don't know",
                    Citations = Array.Empty<string>(),
                    NextCursor = nextCursor,
                    FollowUp = "Try show more"
                };

                return Ok(fallbackResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing assistant request");
                return StatusCode(500, new AssistantResponse
                {
                    Answer = "I encountered an error while processing your request.",
                    Citations = Array.Empty<string>(),
                    NextCursor = null,
                    FollowUp = "Please try again later."
                });
            }
        }
    }
}
