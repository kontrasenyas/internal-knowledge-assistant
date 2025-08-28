using InternalKnowledgeAssistant.Server.Models;

namespace InternalKnowledgeAssistant.Server.Application.Services
{
    public interface IPromptBuilder
    {
        string BuildPrompt(string[] conversationHistory, List<Chunk> retrievedDocuments, string userQuery, string? retrieverNextCursor);
    }

    public class PromptBuilder : IPromptBuilder
    {
        public string BuildPrompt(string[] conversationHistory, List<Chunk> retrievedDocuments, string userQuery, string? retrieverNextCursor)
        {
            var conversationHistoryText = conversationHistory.Length > 0 
                ? string.Join("\n", conversationHistory.Select((msg, i) => $"User {i + 1}: {msg}"))
                : "No previous conversation";

            var retrievedDocumentsText = retrievedDocuments.Count > 0
                ? string.Join("\n\n", retrievedDocuments.Select(doc => $"Document {doc.Id} (Source: {doc.Source}, Cursor: {doc.Cursor}):\n{doc.Text}"))
                : "No documents retrieved";

                               var prompt = $@"RETRIEVED_DOCUMENTS:
       {retrievedDocumentsText}

       CONVERSATION_HISTORY:
       {conversationHistoryText}

       USER_QUERY:
       {userQuery}

       RETRIEVER_NEXT_CURSOR:
       {retrieverNextCursor ?? "null"}

       You have access to all the team's documented knowledge. Analyze the retrieved documents to answer the user's question. Remember to:
       - Use ONLY the information from the retrieved documents above
       - Cite any factual claims with chunk id and cursor, e.g. [doc:42,cursor:abc123]
       - If the answer can be found in the documents, provide a comprehensive response
       - If no relevant information is found, answer ""I don't know"" and suggest what information might be helpful to add
       - If user asks for ""more"", set next_cursor to retriever_next_cursor
       - Respond ONLY as valid JSON:

       {{
         ""answer"": ""<assistant answer>"",
         ""citations"": [""doc:42,cursor:abc123""],
         ""next_cursor"": ""<cursor-or-null>"",
         ""follow_up"": ""<suggested follow-up>""
       }}";

            return prompt;
        }
    }
}
