// Chat functionality
$(document).ready(function () {
    const chatForm = $('#chatForm');
    const messageInput = $('#messageInput');
    const chatMessages = $('#chatMessages');
    const sendButton = $('#sendButton');
    const loadingIndicator = $('#loadingIndicator');
    const clearChatButton = $('#clearChat');
    const errorToast = new bootstrap.Toast($('#errorToast')[0]);
    const errorMessage = $('#errorMessage');

    // Simple markdown parser
    function parseMarkdown(text) {
        if (!text) return '';

        // Escape HTML to prevent XSS
        text = $('<div>').text(text).html();

        // Parse markdown
        // Bold: **text** or __text__
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic: *text* or _text_
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = text.replace(/_(.+?)_/g, '<em>$1</em>');

        // Links: [text](url)
        text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Inline code: `code`
        text = text.replace(/`(.+?)`/g, '<code>$1</code>');

        // Headers: # Header
        text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Unordered lists: - item or * item
        const lines = text.split('\n');
        let inList = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^[\-\*] (.+)$/)) {
                if (!inList) {
                    result.push('<ul>');
                    inList = true;
                }
                result.push('<li>' + line.replace(/^[\-\*] /, '') + '</li>');
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                result.push(line);
            }
        }
        if (inList) {
            result.push('</ul>');
        }
        text = result.join('\n');

        // Ordered lists: 1. item
        inList = false;
        result = [];
        const lines2 = text.split('\n');
        
        for (let i = 0; i < lines2.length; i++) {
            const line = lines2[i];
            if (line.match(/^\d+\. (.+)$/)) {
                if (!inList) {
                    result.push('<ol>');
                    inList = true;
                }
                result.push('<li>' + line.replace(/^\d+\. /, '') + '</li>');
            } else {
                if (inList) {
                    result.push('</ol>');
                    inList = false;
                }
                result.push(line);
            }
        }
        if (inList) {
            result.push('</ol>');
        }
        text = result.join('\n');

        // Line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // Add message to chat
    function addMessage(content, isUser) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageClass = isUser ? 'user' : 'bot';
        const parsedContent = isUser ? $('<div>').text(content).html() : parseMarkdown(content);

        const messageHtml = `
            <div class="message ${messageClass}">
                <div class="message-content">
                    ${parsedContent}
                    <div class="message-timestamp">${timestamp}</div>
                </div>
            </div>
        `;

        chatMessages.append(messageHtml);
        scrollToBottom();
    }

    // Scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.animate({
            scrollTop: chatMessages[0].scrollHeight
        }, 300);
    }

    // Show error
    function showError(message) {
        errorMessage.text(message);
        errorToast.show();
    }

    // Show/hide loading
    function setLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.show();
            sendButton.prop('disabled', true);
            messageInput.prop('disabled', true);
        } else {
            loadingIndicator.hide();
            sendButton.prop('disabled', false);
            messageInput.prop('disabled', false);
        }
    }

    // Handle form submission
    chatForm.on('submit', function (e) {
        e.preventDefault();

        const message = messageInput.val().trim();
        if (!message) {
            showError('Please enter a message');
            return;
        }

        // Add user message
        addMessage(message, true);
        messageInput.val('');

        // Show loading
        setLoading(true);

        // Send to server
        $.ajax({
            url: chatForm.attr('action'),
            method: 'POST',
            data: {
                message: message,
                __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
            },
            success: function (data) {
                setLoading(false);

                if (data.success) {
                    addMessage(data.response, false);
                } else {
                    showError(data.error || 'An error occurred');
                }
            },
            error: function (xhr, status, error) {
                setLoading(false);
                showError('Failed to send message. Please check your connection and try again.');
            }
        });
    });

    // Clear chat
    clearChatButton.on('click', function () {
        if (confirm('Are you sure you want to clear the chat history?')) {
            chatMessages.html('<div class="welcome-message"><p>Welcome! Ask me anything about your business processes.</p></div>');
        }
    });

    // Focus on input when page loads
    messageInput.focus();

    // Allow Enter to send, Shift+Enter for new line
    messageInput.on('keypress', function (e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            chatForm.submit();
        }
    });
});
