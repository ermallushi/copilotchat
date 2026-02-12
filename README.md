# Copilot Chat Application

A .NET Core 8 web application for chatting with a Power Automate Copilot agent API.

## Features
- Real-time chat interface with modern, responsive design
- Markdown rendering for rich responses (bold, italic, links, lists, etc.)
- User messages on the right, bot responses on the left
- Auto-scroll to latest message
- Loading indicator during API calls
- Error handling and user-friendly error messages
- Clear chat functionality
- Responsive design that works on mobile and desktop

## Prerequisites
- .NET 8 SDK or later
- Any modern web browser

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/ermallushi/copilotchat.git
   cd copilotchat/CopilotChatApp
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Update `appsettings.json` with your API endpoint if needed:
   ```json
   {
     "CopilotApi": {
       "BaseUrl": "your-api-endpoint-here",
       "TimeoutSeconds": 30
     }
   }
   ```

   **Security Note**: The API endpoint URL in this repository contains authentication tokens for demonstration purposes. In production:
   - Store sensitive API URLs and tokens in environment variables
   - Use Azure Key Vault or similar secure configuration stores
   - Use .NET User Secrets for local development
   - Never commit actual API credentials to source control

4. Run the application:
   ```bash
   dotnet run
   ```

5. Open your browser to:
   - HTTPS: `https://localhost:5001`
   - HTTP: `http://localhost:5000`

## Configuration

Edit `appsettings.json` to configure:
- `CopilotApi:BaseUrl` - Your Power Automate API endpoint
- `CopilotApi:TimeoutSeconds` - API timeout duration (default: 30 seconds)

## Usage

1. Type your message in the input field at the bottom of the chat interface
2. Click the "Send" button or press Enter to send your message
3. Wait for the Copilot response (a loading indicator will appear)
4. Responses support markdown formatting including:
   - **Bold text**
   - *Italic text*
   - [Links](https://example.com)
   - Lists (ordered and unordered)
   - Headers
   - Code blocks

5. Use the "Clear Chat" button to reset the conversation

## Technologies Used

- **.NET Core 8** - Backend framework
- **ASP.NET Core MVC** - Web application framework
- **Bootstrap 5** - UI styling and components
- **jQuery** - Client-side interactions
- **Markdig** - Server-side markdown parsing (ready for future enhancements)
- **IHttpClientFactory** - HTTP client management

## Project Structure

```
CopilotChatApp/
├── Controllers/
│   └── ChatController.cs          # MVC controller for chat operations
├── Models/
│   ├── ChatRequest.cs             # API request model
│   ├── ChatResponse.cs            # API response model
│   └── ChatMessage.cs             # UI message model
├── Services/
│   ├── ICopilotService.cs         # Service interface
│   └── CopilotService.cs          # API integration service
├── Views/
│   ├── Chat/
│   │   └── Index.cshtml           # Chat interface view
│   └── Shared/
│       └── _Layout.cshtml         # Shared layout
├── wwwroot/
│   ├── css/
│   │   └── chat.css               # Custom chat styling
│   └── js/
│       └── chat.js                # Client-side chat functionality
├── appsettings.json               # Configuration
├── Program.cs                     # Application entry point
└── CopilotChatApp.csproj          # Project file
```

## Architecture

### Clean Architecture
The application follows clean architecture principles:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external API communication
- **Models**: Data transfer objects
- **Views**: User interface presentation

### Key Components

#### CopilotService
- Manages HTTP communication with the Power Automate API
- Handles request serialization and response deserialization
- Implements proper error handling and timeout management
- Uses IHttpClientFactory for efficient HTTP client management

#### ChatController
- Provides the chat interface (Index action)
- Handles message sending (SendMessage action)
- Returns JSON responses for AJAX requests
- Implements anti-forgery token validation for security

#### Chat Interface
- Modern, gradient-styled chat bubbles
- Real-time message display
- Markdown rendering for bot responses
- Smooth animations and transitions
- Mobile-responsive design

## Security Features

- **Anti-CSRF Protection**: Anti-forgery tokens on POST requests
- **XSS Protection**: Automatic HTML encoding by ASP.NET Core
- **Input Validation**: Server-side and client-side validation
- **Error Handling**: Graceful error handling without exposing sensitive information
- **Timeout Management**: Prevents indefinite waiting on API calls

## Error Handling

The application handles various error scenarios:
- **Network Errors**: User-friendly message displayed via toast notification
- **Timeout Errors**: Specific message asking user to retry
- **API Errors**: Error messages from API displayed when available
- **Validation Errors**: Prevents empty message submission
- **Logging**: All errors are logged server-side for debugging

## Development

### Build the Project
```bash
dotnet build
```

### Run in Development Mode
```bash
dotnet run --environment Development
```

### Run Tests (if implemented)
```bash
dotnet test
```

## Future Enhancements

Potential improvements for future iterations:
- Chat history persistence (database storage)
- User authentication and authorization
- Multi-user support with isolated conversations
- Rate limiting to prevent API abuse
- Enhanced markdown support with code syntax highlighting
- Export chat history feature
- Voice input support
- File attachment support

## Troubleshooting

### Application won't start
- Ensure .NET 8 SDK is installed: `dotnet --version`
- Check that ports 5000 and 5001 are not in use
- Verify appsettings.json is properly formatted

### API connection fails
- Verify the API endpoint URL in appsettings.json
- Check network connectivity
- Ensure the API is accessible and responding
- Check timeout settings if requests are slow

### Chat interface not loading
- Clear browser cache
- Check browser console for JavaScript errors
- Ensure all static files are being served correctly

## License

This project is provided as-is for demonstration purposes.

## Contact

For questions or issues, please open an issue on the GitHub repository.