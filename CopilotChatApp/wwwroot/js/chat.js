// Chat functionality
$(document).ready(function () {
    const chatForm = $('#chatForm');
    const messageInput = $('#messageInput');
    const chatMessages = $('#chatMessages');
    const sendButton = $('#sendButton');
    const loadingIndicator = $('#loadingIndicator');
    const newChatButton = $('#newChat');
    const clearChatButton = $('#clearChat');
    const errorToast = new bootstrap.Toast($('#errorToast')[0]);
    const errorMessage = $('#errorMessage');
    
    // Conversation state
    let conversationId = null;

    // Simple markdown parser
    function parseMarkdown(text) {
        if (!text) return '';

        // Limit text length to prevent ReDoS attacks
        const maxLength = 50000;
        if (text.length > maxLength) {
            text = text.substring(0, maxLength);
        }

        // Escape HTML to prevent XSS
        text = $('<div>').text(text).html();

        // Parse markdown - process in order to avoid conflicts
        // Inline code first to protect it from other transformations
        text = text.replace(/`([^`]+?)`/g, '___CODE___$1___/CODE___');

        // Bold: **text** or __text__
        text = text.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+?)__/g, '<strong>$1</strong>');

        // Italic: *text* or _text_ (single characters only, not part of bold)
        text = text.replace(/([^*]|^)\*([^*]+?)\*([^*]|$)/g, '$1<em>$2</em>$3');
        text = text.replace(/([^_]|^)_([^_]+?)_([^_]|$)/g, '$1<em>$2</em>$3');

        // Links: [text](url)
        text = text.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Restore inline code
        text = text.replace(/___CODE___([^_]+?)___\/CODE___/g, '<code>$1</code>');

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

        // Prepare data
        const formData = {
            message: message,
            __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
        };
        
        // Add conversationId if it exists
        if (conversationId) {
            formData.conversationId = conversationId;
        }

        // Send to server
        $.ajax({
            url: chatForm.attr('action'),
            method: 'POST',
            data: formData,
            success: function (data) {
                setLoading(false);

                if (data.success) {
                    addMessage(data.response, false);
                    
                    // Store conversation ID from response
                    if (data.conversationId) {
                        conversationId = data.conversationId;
                        console.log('Conversation ID:', conversationId);
                    }
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

    // Start new chat
    newChatButton.on('click', function () {
        if (chatMessages.children().length > 1 || (chatMessages.children().length === 1 && !chatMessages.find('.welcome-message').length)) {
            if (confirm('Are you sure you want to start a new chat? This will clear the current conversation.')) {
                conversationId = null;
                chatMessages.html('<div class="welcome-message"><p>Welcome! Ask me anything about your business processes.</p></div>');
                console.log('New chat started - conversation ID cleared');
            }
        } else {
            conversationId = null;
            chatMessages.html('<div class="welcome-message"><p>Welcome! Ask me anything about your business processes.</p></div>');
            console.log('New chat started - conversation ID cleared');
        }
    });

    // Clear chat
    clearChatButton.on('click', function () {
        if (confirm('Are you sure you want to clear the chat history?')) {
            conversationId = null;
            chatMessages.html('<div class="welcome-message"><p>Welcome! Ask me anything about your business processes.</p></div>');
            console.log('Chat cleared - conversation ID cleared');
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
