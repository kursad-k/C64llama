class ChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.fontDecrease = document.getElementById('fontDecrease');
        this.fontIncrease = document.getElementById('fontIncrease');
        this.uppercaseToggle = document.getElementById('uppercaseToggle');
        this.chatMessages = document.getElementById('chatMessages');
        
        this.initializeFontScale();
        this.initializeUppercase();
        this.bindEvents();
        this.loadCurrentChat();
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || window.defaultTheme;
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.newChatBtn.addEventListener('click', () => this.newChat());
        this.fontDecrease.addEventListener('click', () => this.decreaseFontSize());
        this.fontIncrease.addEventListener('click', () => this.increaseFontSize());
        this.uppercaseToggle.addEventListener('click', () => this.toggleUppercase());
        
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.autoResize();
        });
    }
    
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResize();
        this.setLoading(true);
        
        try {
            const response = await fetch('/chat/api/send/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(data.response, 'assistant');
            } else {
                this.addMessage(`Error: ${data.error}`, 'assistant');
            }
        } catch (error) {
            this.addMessage(`Connection error: ${error.message}`, 'assistant');
        } finally {
            this.setLoading(false);
        }
    }
    
    async newChat() {
        if (confirm('Start a new chat? Current conversation will be saved.')) {
            try {
                const response = await fetch('/chat/api/new-chat/', {
                    method: 'POST'
                });
                
                if (response.headers.get('content-type')?.includes('text/markdown')) {
                    // File download
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'chat.md';
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
                
                this.clearMessages();
            } catch (error) {
                alert(`Error starting new chat: ${error.message}`);
            }
        }
    }
    
    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.dataset.originalText = content;
        
        // Apply uppercase if mode is enabled
        const isUppercase = document.documentElement.classList.contains('c64-uppercase');
        contentDiv.textContent = isUppercase ? content.toUpperCase() : content;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    clearMessages() {
        this.chatMessages.innerHTML = '<div class="welcome-message" id="c64-header"><p>**** COMMODORE 64 BASIC V2 ****</p><p>64K RAM SYSTEM  38911 BASIC BYTES FREE</p><p></p><p>READY.</p></div>';
    }
    
    setLoading(loading) {
        this.sendBtn.disabled = loading;
        this.messageInput.disabled = loading;
        this.sendBtn.textContent = loading ? 'Sending...' : 'Send';
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    initializeFontScale() {
        const savedScale = localStorage.getItem('fontScale') || '1';
        this.setFontScale(parseFloat(savedScale));
    }
    
    setFontScale(scale) {
        scale = Math.max(0.8, Math.min(1.5, scale)); // Limit between 0.8x and 1.5x
        document.documentElement.style.setProperty('--font-scale', scale);
        localStorage.setItem('fontScale', scale.toString());
    }
    
    decreaseFontSize() {
        const currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
        this.setFontScale(currentScale - 0.1);
    }
    
    increaseFontSize() {
        const currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
        this.setFontScale(currentScale + 0.1);
    }
    
    initializeUppercase() {
        const savedUppercase = localStorage.getItem('c64Uppercase') === 'true';
        this.setUppercase(savedUppercase);
    }
    
    setUppercase(enabled) {
        if (enabled) {
            document.documentElement.classList.add('c64-uppercase');
            this.convertAllTextToUppercase();
            console.log('Uppercase mode enabled');
        } else {
            document.documentElement.classList.remove('c64-uppercase');
            this.convertAllTextToLowercase();
            console.log('Uppercase mode disabled');
        }
        localStorage.setItem('c64Uppercase', enabled.toString());
    }
    
    toggleUppercase() {
        const isEnabled = document.documentElement.classList.contains('c64-uppercase');
        console.log('Toggle uppercase called, current state:', isEnabled);
        this.setUppercase(!isEnabled);
    }
    
    convertAllTextToUppercase() {
        // Store original text if not already stored
        const messages = this.chatMessages.querySelectorAll('.message-content');
        messages.forEach(msg => {
            if (!msg.dataset.originalText) {
                msg.dataset.originalText = msg.textContent;
            }
            msg.textContent = msg.dataset.originalText.toUpperCase();
        });
        
        const welcome = this.chatMessages.querySelector('.welcome-message');
        if (welcome && !welcome.dataset.originalHtml) {
            welcome.dataset.originalHtml = welcome.innerHTML;
        }
    }
    
    convertAllTextToLowercase() {
        // Restore original text
        const messages = this.chatMessages.querySelectorAll('.message-content');
        messages.forEach(msg => {
            if (msg.dataset.originalText) {
                msg.textContent = msg.dataset.originalText;
            }
        });
        
        const welcome = this.chatMessages.querySelector('.welcome-message');
        if (welcome && welcome.dataset.originalHtml) {
            welcome.innerHTML = welcome.dataset.originalHtml;
        }
    }
    
    async loadCurrentChat() {
        try {
            const response = await fetch('/chat/api/load-chat/');
            const data = await response.json();
            
            if (data.success && data.content) {
                this.parseAndDisplayChat(data.content);
            }
        } catch (error) {
            console.log('No existing chat to load');
        }
    }
    
    parseAndDisplayChat(content) {
        const lines = content.split('\n');
        let currentRole = null;
        let currentContent = [];
        
        for (const line of lines) {
            if (line.startsWith('## User -')) {
                if (currentRole && currentContent.length > 0) {
                    this.addMessage(currentContent.join('\n'), currentRole);
                }
                currentRole = 'user';
                currentContent = [];
            } else if (line.startsWith('## Assistant -')) {
                if (currentRole && currentContent.length > 0) {
                    this.addMessage(currentContent.join('\n'), currentRole);
                }
                currentRole = 'assistant';
                currentContent = [];
            } else if (line.trim() && currentRole) {
                currentContent.push(line);
            }
        }
        
        // Add the last message
        if (currentRole && currentContent.length > 0) {
            this.addMessage(currentContent.join('\n'), currentRole);
        }
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});