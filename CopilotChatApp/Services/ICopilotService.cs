namespace CopilotChatApp.Services
{
    /// <summary>
    /// Interface for Copilot API service.
    /// </summary>
    public interface ICopilotService
    {
        /// <summary>
        /// Sends a message to the Copilot API and returns the response.
        /// </summary>
        /// <param name="message">The message to send.</param>
        /// <param name="conversationId">Optional conversation ID for maintaining context.</param>
        /// <returns>A tuple containing the response and the conversation ID.</returns>
        Task<(string Response, string? ConversationId)> SendMessageAsync(string message, string? conversationId = null);
    }
}
