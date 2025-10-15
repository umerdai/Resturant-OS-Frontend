<template>
    <div class="smart-order-assistant">
        <!-- Header -->
        <div class="chat-header">
            <div class="flex align-items-center gap-3">
                <div class="assistant-avatar">
                    <i class="pi pi-android"></i>
                </div>
                <div>
                    <h2 class="chat-title">Daily Wastage Prediction</h2>
                    <p class="chat-subtitle">Ask me anything about Wastage prediction</p>
                </div>
            </div>
            <div class="status-indicator">
                <span class="status-dot"></span>
                <span class="status-text">Online</span>
            </div>
        </div>

        <!-- Chat Container -->
        <div class="chat-container">
            <!-- Chat Display -->
            <ScrollPanel class="chat-messages">
                <!-- Welcome Message -->
                <div v-if="messages.length === 0" class="welcome-message">
                    <div class="welcome-icon">
                        <i class="pi pi-comments"></i>
                    </div>
                    <h3>Welcome! 👋</h3>
                    <p>I'm your Daily Wastage Prediction Assistant. Ask me about:</p>
                    <div class="suggestion-chips">
                        <Button label="📈 Wastage Trends" size="small" outlined @click="userMessage = 'What are the wastage trends for today?'" />
                        <Button label="💰 Most Wasted Items" size="small" outlined @click="userMessage = 'Show me the most wasted items'" />
                        <Button label="📊 Wastage by Category" size="small" outlined @click="userMessage = 'What are the wastage by category?'" />
                    </div>
                </div>

                <!-- Messages -->
                <div v-for="(msg, index) in messages" :key="index" class="message-wrapper" :class="msg.sender">
                    <div class="message-bubble" :class="msg.sender">
                        <div v-if="msg.sender === 'bot'" class="bot-avatar">
                            <i class="pi pi-android"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-text">{{ msg.text }}</div>
                            <div class="message-time">{{ formatTime(new Date()) }}</div>
                        </div>
                        <div v-if="msg.sender === 'user'" class="user-avatar">
                            <i class="pi pi-user"></i>
                        </div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isTyping" class="message-wrapper bot">
                    <div class="message-bubble bot typing-indicator">
                        <div class="bot-avatar">
                            <i class="pi pi-android"></i>
                        </div>
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </ScrollPanel>

            <!-- Input Area -->
            <div class="chat-input-area">
                <div class="input-container">
                    <InputText v-model="userMessage" placeholder="Type your message here..." class="chat-input" @keyup.enter="sendMessage" />

                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <!-- Voice Button -->
                        <Button
                            :icon="isListening ? 'pi pi-microphone' : 'pi pi-microphone'"
                            :class="['voice-button', { listening: isListening }]"
                            @click="toggleVoice"
                            rounded
                            text
                            :aria-label="isListening ? 'Stop listening' : 'Start voice input'"
                        />

                        <!-- Send Button -->
                        <Button icon="pi pi-send" class="send-button" @click="sendMessage" :disabled="!userMessage.trim()" rounded :aria-label="'Send message'" />
                    </div>
                </div>
            </div>
        </div>

        <Message v-if="error" severity="error" class="error-message">{{ error }}</Message>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// Chat state
const messages = ref([]);
const userMessage = ref('');
const isListening = ref(false);
const isTyping = ref(false);
const recognition = ref(null);
const error = ref(null);

// Format time helper
const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// 🎙️ Initialize speech recognition (Web Speech API)
if ('webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.value = new SpeechRecognition();
    recognition.value.lang = 'en-US';
    recognition.value.interimResults = false;
    recognition.value.maxAlternatives = 1;

    recognition.value.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userMessage.value = transcript;
        isListening.value = false;
    };

    recognition.value.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening.value = false;
    };

    recognition.value.onend = () => {
        isListening.value = false;
    };
} else {
    console.warn('Speech recognition not supported in this browser.');
}

// 🎤 Start / Stop Listening
const toggleVoice = () => {
    if (!recognition.value) {
        alert('Speech recognition not supported in this browser.');
        return;
    }

    if (isListening.value) {
        recognition.value.stop();
        isListening.value = false;
    } else {
        recognition.value.start();
        isListening.value = true;
    }
};

// 📨 Send Message
const sendMessage = async () => {
    if (!userMessage.value.trim()) return;

    // Add user's message
    messages.value.push({ sender: 'user', text: userMessage.value });

    const question = userMessage.value;
    userMessage.value = '';

    // Show typing indicator
    isTyping.value = true;

    try {
        const response = await axios.post('http://your-backend-url/api/chat', {
            question
        });

        // Simulate typing delay for better UX
        setTimeout(() => {
            isTyping.value = false;
            messages.value.push({
                sender: 'bot',
                text: response.data.answer || 'No response received.'
            });
        }, 800);
    } catch (err) {
        setTimeout(() => {
            isTyping.value = false;
            messages.value.push({
                sender: 'bot',
                text: 'Error contacting the backend.'
            });
        }, 800);
    }
};
</script>

<style scoped>
.smart-order-assistant {
    max-width: 1000px;
    margin: 0 auto;
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    background: var(--surface-card);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Header Styles */
.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.assistant-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(136, 101, 101, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--p-text-color)
    
}

.chat-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.chat-subtitle {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.9;
    color: var(--p-text-color)
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
       background: rgba(136, 101, 101, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    color: var(--p-text-color)
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse 2s infinite;
}

.status-text {
    font-size: 0.875rem;
    font-weight: 500;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

/* Chat Container */
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Chat Messages */
.chat-messages {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background: var(--surface-ground);
}

.chat-messages :deep(.p-scrollpanel-wrapper) {
    border-right: none;
}

.chat-messages :deep(.p-scrollpanel-bar) {
    background-color: var(--primary-200);
    opacity: 0.4;
    transition: opacity 0.3s;
}

.chat-messages :deep(.p-scrollpanel-bar:hover) {
    opacity: 0.8;
}

/* Welcome Message */
.welcome-message {
    text-align: center;
    padding: 3rem 2rem;
    max-width: 500px;
    margin: 0 auto;
}

.welcome-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: var(--primary-color);
}

.welcome-message h3 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
    color: var(--text-color);
}

.welcome-message p {
    color: var(--text-color-secondary);
    margin-bottom: 1.5rem;
}

.suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
}

/* Message Styles */
.message-wrapper {
    display: flex;
    margin-bottom: 1.5rem;
    animation: slideIn 0.3s ease-out;
}

.message-wrapper.user {
    justify-content: flex-end;
}

.message-wrapper.bot {
    justify-content: flex-start;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-bubble {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    max-width: 70%;
}

.bot-avatar,
.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
}

.bot-avatar {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
    color: var(--p-text-color)
}

.user-avatar {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
}

.message-content {
    flex: 1;
}

.message-text {
    padding: 0.875rem 1.125rem;
    border-radius: 16px;
    line-height: 1.5;
    word-wrap: break-word;
}

.message-wrapper.user .message-text {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-bottom-right-radius: 4px;
}

.message-wrapper.bot .message-text {
    background: var(--surface-card);
    color: var(--text-color);
    border: 1px solid var(--surface-border);
    border-bottom-left-radius: 4px;
}

.message-time {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
    padding: 0 0.5rem;
}

/* Typing Indicator */
.typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.typing-dots {
    display: flex;
    gap: 0.25rem;
    padding: 1rem 1.25rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-color);
    animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%,
    60%,
    100% {
        transform: translateY(0);
        opacity: 0.7;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

/* Input Area */
.chat-input-area {
    padding: 1.5rem 2rem;
    background: var(--surface-card);
    border-top: 1px solid var(--surface-border);
}

.input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--surface-ground);
    border-radius: 24px;
    padding: 0.5rem 0.75rem;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.input-container:focus-within {
    border-color: var(--primary-color);
    background: var(--surface-card);
    box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.1);
}

.chat-input {
    flex: 1;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0.75rem 1rem !important;
}

.chat-input:focus {
    outline: none !important;
    box-shadow: none !important;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.voice-button {
    color: var(--text-color-secondary) !important;
    transition: all 0.3s ease;
}

.voice-button:hover {
    color: var(--primary-color) !important;
    background: var(--primary-50) !important;
}

.voice-button.listening {
    color: #ef4444 !important;
    background: #fee2e2 !important;
    animation: pulse-red 1.5s infinite;
}

@keyframes pulse-red {
    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }
    50% {
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    }
}

.send-button {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%) !important;
    border: none !important;
    transition: all 0.3s ease;
    color: rgb(32, 155, 32);
}

.send-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.4);
    color: rgb(132, 199, 132);
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error-message {
    margin: 1rem 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .smart-order-assistant {
        height: calc(100vh - 80px);
        border-radius: 0;
    }

    .chat-header {
        padding: 1rem 1.5rem;
    }

    .assistant-avatar {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
        color: var(--p-text-color)
    }

    .chat-title {
        font-size: 1.125rem;
    }

    .chat-subtitle {
        font-size: 0.75rem;
    }

    .chat-messages {
        padding: 1rem;
    }

    .message-bubble {
        max-width: 85%;
    }

    .chat-input-area {
        padding: 1rem 1.5rem;
    }

    .suggestion-chips {
        flex-direction: column;
    }
}
</style>
