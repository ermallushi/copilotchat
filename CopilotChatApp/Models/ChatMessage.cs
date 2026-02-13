namespace CopilotChatApp.Models
{
    /// <summary>
    /// Represents a chat message in the UI.
    /// </summary>
    public class ChatMessage
    {
        /// <summary>
        /// Gets or sets the content of the message.
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether this message is from the user.
        /// </summary>
        public bool IsUser { get; set; }

        /// <summary>
        /// Gets or sets the timestamp when the message was created.
        /// </summary>
        public DateTime Timestamp { get; set; }
    }
}
