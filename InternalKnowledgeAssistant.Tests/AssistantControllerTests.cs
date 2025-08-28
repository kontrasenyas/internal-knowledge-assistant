using InternalKnowledgeAssistant.Server.Application.Services;
using InternalKnowledgeAssistant.Server.Controllers;
using InternalKnowledgeAssistant.Server.Infrastructure.Services;
using InternalKnowledgeAssistant.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace InternalKnowledgeAssistant.Tests
{
    public class AssistantControllerTests
    {
        private readonly Mock<IRetrieverService> _mockRetrieverService;
        private readonly Mock<IPromptBuilder> _mockPromptBuilder;
        private readonly Mock<ILlamaClient> _mockLlamaClient;
        private readonly Mock<ILogger<AssistantController>> _mockLogger;
        private readonly AssistantController _controller;

        public AssistantControllerTests()
        {
            _mockRetrieverService = new Mock<IRetrieverService>();
            _mockPromptBuilder = new Mock<IPromptBuilder>();
            _mockLlamaClient = new Mock<ILlamaClient>();
            _mockLogger = new Mock<ILogger<AssistantController>>();
            
            _controller = new AssistantController(
                _mockRetrieverService.Object,
                _mockPromptBuilder.Object,
                _mockLlamaClient.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAssistantResponse_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new AssistantRequest
            {
                Query = "What is the team methodology?",
                ConversationHistory = new[] { "Hello", "Hi there" },
                Cursor = null
            };

            var chunks = new List<Chunk>
            {
                new Chunk { Id = "1", Cursor = "cursor_page_1", Source = "Team Handbook", Text = "Agile methodology" }
            };

            var nextCursor = "cursor_page_2";
            var prompt = "SYSTEM: You are TeamKB Assistant...";
            var llamaResponse = @"{""answer"": ""The team follows Agile methodology"", ""citations"": [""doc:1,cursor:cursor_page_1""], ""next_cursor"": null, ""follow_up"": ""Would you like to know more about Agile practices?""}";

            _mockRetrieverService
                .Setup(x => x.GetTopKChunks(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync((chunks, nextCursor));

            _mockPromptBuilder
                .Setup(x => x.BuildPrompt(It.IsAny<string[]>(), It.IsAny<List<Chunk>>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(prompt);

            _mockLlamaClient
                .Setup(x => x.GenerateAsync(It.IsAny<string>()))
                .ReturnsAsync(llamaResponse);

            // Act
            var result = await _controller.GetAssistantResponse(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AssistantResponse>(okResult.Value);
            
            Assert.Equal("The team follows Agile methodology", response.Answer);
            Assert.Contains("doc:1,cursor:cursor_page_1", response.Citations);
            Assert.Equal("cursor_page_2", response.NextCursor);
            Assert.Equal("Would you like to know more about Agile practices?", response.FollowUp);
        }

        [Fact]
        public async Task GetAssistantResponse_InvalidJsonResponse_ReturnsFallbackResponse()
        {
            // Arrange
            var request = new AssistantRequest
            {
                Query = "What is the team methodology?",
                ConversationHistory = Array.Empty<string>(),
                Cursor = null
            };

            var chunks = new List<Chunk>
            {
                new Chunk { Id = "1", Cursor = "cursor_page_1", Source = "Team Handbook", Text = "Agile methodology" }
            };

            var nextCursor = "cursor_page_2";
            var prompt = "SYSTEM: You are TeamKB Assistant...";
            var invalidLlamaResponse = "This is not valid JSON";

            _mockRetrieverService
                .Setup(x => x.GetTopKChunks(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync((chunks, nextCursor));

            _mockPromptBuilder
                .Setup(x => x.BuildPrompt(It.IsAny<string[]>(), It.IsAny<List<Chunk>>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(prompt);

            _mockLlamaClient
                .Setup(x => x.GenerateAsync(It.IsAny<string>()))
                .ReturnsAsync(invalidLlamaResponse);

            // Act
            var result = await _controller.GetAssistantResponse(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AssistantResponse>(okResult.Value);
            
            Assert.Equal("I don't know", response.Answer);
            Assert.Empty(response.Citations);
            Assert.Equal("cursor_page_2", response.NextCursor);
            Assert.Equal("Try show more", response.FollowUp);
        }

        [Fact]
        public async Task GetAssistantResponse_RetrieverServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var request = new AssistantRequest
            {
                Query = "What is the team methodology?",
                ConversationHistory = Array.Empty<string>(),
                Cursor = null
            };

            _mockRetrieverService
                .Setup(x => x.GetTopKChunks(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await _controller.GetAssistantResponse(request);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            
            var response = Assert.IsType<AssistantResponse>(statusCodeResult.Value);
            Assert.Equal("I encountered an error while processing your request.", response.Answer);
            Assert.Equal("Please try again later.", response.FollowUp);
        }
    }
}
