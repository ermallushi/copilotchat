using CopilotChatApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace CopilotChatApp.Controllers
{
    /// <summary>
    /// Controller for chat functionality.
    /// </summary>
    public class ChatController : Controller
    {
        private readonly ICopilotService _copilotService;
        private readonly ILogger<ChatController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChatController"/> class.
        /// </summary>
        /// <param name="copilotService">The copilot service.</param>
        /// <param name="logger">The logger.</param>
        public ChatController(ICopilotService copilotService, ILogger<ChatController> logger)
        {
            _copilotService = copilotService;
            _logger = logger;
        }

        /// <summary>
        /// Displays the chat page.
        /// </summary>
        /// <returns>The chat view.</returns>
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Sends a message to the Copilot and returns the response.
        /// </summary>
        /// <param name="message">The message to send.</param>
        /// <returns>A JSON result containing the response or error.</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SendMessage([FromForm] string message)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(message))
                {
                    return Json(new { success = false, error = "Message cannot be empty." });
                }

                var response = await _copilotService.SendMessageAsync(message);
                return Json(new { success = true, response });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid message");
                return Json(new { success = false, error = ex.Message });
            }
            catch (TimeoutException ex)
            {
                _logger.LogError(ex, "Timeout error");
                return Json(new { success = false, error = "The request timed out. Please try again." });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request error");
                return Json(new { success = false, error = "Failed to communicate with the API. Please try again later." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while sending message");
                return Json(new { success = false, error = "An unexpected error occurred. Please try again." });
            }
        }
    }
}
