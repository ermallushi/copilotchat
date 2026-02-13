namespace CopilotChatApp.Models
{
    /// <summary>
    /// Represents a response from the Copilot API.
    /// </summary>
    public class ChatResponse
    {
        /// <summary>
        /// Gets or sets the result message from the Copilot.
        /// </summary>
        public string Result { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the conversation ID from the response.
        /// </summary>
        public string? ConversationId { get; set; }
    }
}
