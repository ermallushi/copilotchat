using CopilotChatApp.Models;
using System.Text;
using System.Text.Json;

namespace CopilotChatApp.Services
{
    /// <summary>
    /// Service for communicating with the Copilot API.
    /// </summary>
    public class CopilotService : ICopilotService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<CopilotService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="CopilotService"/> class.
        /// </summary>
        /// <param name="httpClient">The HTTP client.</param>
        /// <param name="configuration">The configuration.</param>
        /// <param name="logger">The logger.</param>
        public CopilotService(HttpClient httpClient, IConfiguration configuration, ILogger<CopilotService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            var timeout = _configuration.GetValue<int>("CopilotApi:TimeoutSeconds", 30);
            _httpClient.Timeout = TimeSpan.FromSeconds(timeout);
        }

        /// <summary>
        /// Sends a message to the Copilot API and returns the response.
        /// </summary>
        /// <param name="message">The message to send.</param>
        /// <param name="conversationId">Optional conversation ID for maintaining context.</param>
        /// <returns>A tuple containing the response and the conversation ID.</returns>
        /// <exception cref="ArgumentException">Thrown when the message is null or empty.</exception>
        /// <exception cref="HttpRequestException">Thrown when the API request fails.</exception>
        public async Task<(string Response, string? ConversationId)> SendMessageAsync(string message, string? conversationId = null)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("Message cannot be empty.", nameof(message));
            }

            try
            {
                var apiUrl = _configuration["CopilotApi:BaseUrl"];
                if (string.IsNullOrWhiteSpace(apiUrl))
                {
                    throw new InvalidOperationException("Copilot API URL is not configured.");
                }

                var request = new ChatRequest 
                { 
                    Text = message,
                    ConversationId = conversationId
                };
                var jsonContent = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending message to Copilot API: {Message}, ConversationId: {ConversationId}", message, conversationId ?? "new");

                var response = await _httpClient.PostAsync(apiUrl, content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Received response from Copilot API");

                var chatResponse = JsonSerializer.Deserialize<ChatResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    PropertyNameCaseInsensitive = true
                });

                var result = chatResponse?.Result ?? "No response received.";
                var returnedConversationId = chatResponse?.ConversationId?.Trim();
                
                return (result, returnedConversationId);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request to Copilot API failed");
                throw new HttpRequestException("Failed to communicate with Copilot API. Please try again later.", ex);
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Request to Copilot API timed out");
                throw new TimeoutException("The request to Copilot API timed out. Please try again.", ex);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse response from Copilot API");
                throw new InvalidOperationException("Failed to parse response from Copilot API.", ex);
            }
        }
    }
}
