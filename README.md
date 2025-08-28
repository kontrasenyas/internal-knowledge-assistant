# Internal Knowledge Assistant

A full-stack application that provides an AI-powered knowledge management system using Llama3 to intelligently search and answer questions from your team's documented knowledge base.

URL: https://internal-knowledge-assistant.fly.dev/

## Frontend-Backend Integration

### AI Chat Service

The Angular frontend communicates with the backend through the `/api/assistant` endpoint to provide AI-powered chat functionality.

#### API Endpoint
- **URL**: `https://localhost:7232/api/assistant`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Payload
```typescript
interface AssistantRequest {
  query: string;                    // User's question
  conversationHistory: string[];     // Array of previous user messages
  cursor: string | null;            // Pagination cursor for "Show More" functionality
}
```

#### Example Request
```json
{
  "query": "What is the team methodology?",
  "conversationHistory": ["Hello", "Hi there"],
  "cursor": null
}
```

#### Response Format
```typescript
interface AssistantResponse {
  answer: string;                   // AI-generated response
  citations: string[];              // Array of document citations (e.g., ["doc:1,cursor:abc123"])
  next_cursor: string | null;       // Cursor for next page of results
  follow_up: string;                // Suggested follow-up question
}
```

#### Example Response
```json
{
  "answer": "The team follows Agile methodology with 2-week sprints. Daily standups are held at 9:00 AM.",
  "citations": ["doc:1,cursor:cursor_page_1"],
  "next_cursor": "cursor_page_2",
  "follow_up": "Would you like to know more about Agile practices?"
}
```

#### Frontend Implementation

The `AIChatService` handles all communication with the backend:

```typescript
// Send a message to the AI assistant
sendMessage(query: string, conversationHistory: string[], cursor: string | null): Observable<AssistantResponse>

// Error handling returns fallback response
{
  answer: "I don't know",
  citations: [],
  next_cursor: null,
  follow_up: ""
}
```

#### Features

1. **Real-time Chat**: Users can ask questions and receive AI-generated responses
2. **Document Citations**: Each response includes source citations with document IDs and cursors
3. **Pagination**: "Show More" button appears when `next_cursor` is available
4. **Conversation History**: Maintains context across multiple interactions
5. **Error Handling**: Graceful fallback when backend is unavailable

#### Usage Flow

1. User types a question in the chat input
2. Frontend sends POST request to `/api/assistant` with query and conversation history
3. Backend processes request using RetrieverService and Llama3
4. Response includes answer, citations, next cursor, and follow-up suggestion
5. Frontend displays response and enables "Show More" if cursor is available
6. User can click "Show More" to get additional information using the stored cursor

## Backend Architecture

The backend implements an AI-powered knowledge assistant system with:

- **RetrieverService**: Retrieves all notes from the database and converts them to searchable chunks
- **PromptBuilder**: Creates structured prompts that instruct the AI model to use only the provided documents
- **LlamaClient**: Integrates with local Llama3 API using OpenAI-compatible chat completions
- **AssistantController**: RESTful endpoint for chat interactions
- **NotesController**: Manages CRUD operations for your knowledge base notes

## Getting Started

1. **Backend**: Start the .NET server (`dotnet run`) - runs on HTTPS port 7232
2. **Frontend**: Start the Angular app (`npm start`) - runs on port 4200
3. **AI Model**: Ensure Llama3 is running on `http://localhost:8000` with the chat completions API (`/v1/chat/completions`)
4. **Database**: SQLite database is automatically created and initialized
5. **Usage**: Use the AI chat interface to ask questions about your knowledge base

## How It Works

1. **Knowledge Storage**: Store your team's knowledge as notes using the notes interface
2. **AI Retrieval**: When you ask a question, the system retrieves ALL your notes from the database
3. **AI Analysis**: Llama3 analyzes all available notes to find relevant information and answer your question
4. **Smart Answers**: AI provides answers based ONLY on your documented knowledge (no hallucinations)
5. **Citations**: Each answer includes references to the source notes used

### Current Implementation Approach

The system uses a **"retrieve all, let AI decide"** approach:
- **Simple & Effective**: No complex search algorithms needed
- **AI Intelligence**: Llama3 model determines which notes are relevant
- **Comprehensive Coverage**: AI has access to your entire knowledge base
- **Easy to Maintain**: Simple backend logic, AI handles the complexity

*Note: This approach works well for smaller to medium knowledge bases. For larger datasets, consider implementing semantic search or vector embeddings.*

## Current Status

✅ **Fully Functional**: The AI knowledge assistant is working and ready to use  
✅ **Real Database Integration**: Uses your actual notes, not hardcoded data  
✅ **Clean Architecture**: Simple, maintainable code structure  
✅ **Production Ready**: Proper error handling and fallback responses  
✅ **Tested**: Unit tests cover the core functionality  

## Next Steps (Optional Enhancements)

- **Semantic Search**: Implement vector embeddings for better document retrieval
- **Advanced Filtering**: Add tags, categories, or search filters
- **User Authentication**: Add login and user management
- **API Rate Limiting**: Implement request throttling
- **Monitoring**: Add logging and performance metrics

## Llama3 Integration

The backend integrates with Llama3 using the OpenAI-compatible chat completions API:

- **Endpoint**: `http://localhost:8000/v1/chat/completions`
- **Model**: `llama-3-8b`
- **Format**: Chat completions with system and user messages
- **Response**: Structured JSON with answer, citations, next_cursor, and follow_up

## Key Features

- **AI-Powered Knowledge Search**: Ask questions in natural language
- **Document-Based Answers**: AI only uses information from your documented notes
- **Automatic Citations**: Every answer includes source references
- **Conversation History**: Maintains context across multiple questions
- **Show More Functionality**: Pagination for additional information
- **Real-Time Chat Interface**: Modern Angular-based chat UI
- **SQLite Database**: Lightweight, file-based storage for your knowledge base

## Project Structure

```
internal-knowledge-assistant/
├── InternalKnowledgeAssistant.Server/          # .NET 9.0 Backend
│   ├── Controllers/                            # API endpoints
│   │   ├── AssistantController.cs             # AI chat endpoint
│   │   └── NotesController.cs                 # Notes CRUD operations
│   ├── Application/Services/                   # Business logic
│   │   ├── RetrieverService.cs                # Document retrieval
│   │   └── PromptBuilder.cs                   # AI prompt construction
│   ├── Infrastructure/Services/                # External integrations
│   │   └── LlamaClient.cs                     # Llama3 API client
│   ├── Models/                                 # Data models
│   │   ├── Note.cs                            # Note entity
│   │   ├── Chunk.cs                           # Document chunk for AI
│   │   ├── AssistantRequest.cs                # Chat request model
│   │   └── AssistantResponse.cs               # Chat response model
│   └── Data/                                  # Database layer
│       ├── KnowledgeAssistantDbContext.cs     # Entity Framework context
│       └── DatabaseInitializer.cs             # Database setup
├── internalknowledgeassistant.client/          # Angular Frontend
│   ├── src/app/services/                      # Frontend services
│   │   └── ai-chat.service.ts                 # AI chat service
│   └── src/app/notes/ai-chat/                 # Chat UI components
└── InternalKnowledgeAssistant.Tests/           # Unit tests
```
