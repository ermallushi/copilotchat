namespace CopilotChatApp.Models
{
    /// <summary>
    /// Represents a request to the Copilot API.
    /// </summary>
    public class ChatRequest
    {
        /// <summary>
        /// Gets or sets the text message to send to the Copilot.
        /// </summary>
        public string Text { get; set; } = string.Empty;
    }
}
