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
        /// <returns>The response from the Copilot.</returns>
        Task<string> SendMessageAsync(string message);
    }
}
