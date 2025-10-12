<template>
  <div class="card p-4">
    <!-- Chat Box Section -->
    <div class="p-4 border-round surface-card shadow-2">
      <h3 class="text-lg font-semibold mb-3">💬 Ask a Question</h3>

      <!-- Chat Display -->
      <ScrollPanel style="height: 250px" class="p-3 border-round mb-3 bg-gray-50">
        <div v-for="(msg, index) in messages" :key="index" class="mb-2">
          <div
            v-if="msg.sender === 'user'"
            class="p-2 border-round bg-blue-100 text-right"
          >
            <strong>You:</strong> {{ msg.text }}
          </div>
          <div v-else class="p-2 border-round bg-green-100 text-left">
            <strong>Bot:</strong> {{ msg.text }}
          </div>
        </div>
      </ScrollPanel>

      <!-- Input Field + Voice Button -->
      <div class="flex align-items-center gap-2">
        <InputText
          v-model="userMessage"
          placeholder="Type or speak your question..."
          class="flex-grow-1 w-full"
          @keyup.enter="sendMessage"
        />

        <!-- 🎤 Voice Button -->
        <Button
          :icon="isListening ? 'pi pi-microphone' : 'pi pi-microphone'"
          :class="isListening ? 'p-button-danger' : 'p-button-secondary'"
          @click="toggleVoice"
          :label="isListening ? 'Listening...' : 'Speak'"
        />

        <!-- Send Button -->
        <Button
          icon="pi pi-send"
          label="Send"
          class="p-button-success"
          @click="sendMessage"
          :disabled="!userMessage"
        />
      </div>
    </div>

    <Message v-if="error" severity="error" class="mt-3">{{ error }}</Message>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Chat state
const messages = ref([])
const userMessage = ref('')
const isListening = ref(false)
const recognition = ref(null)
const error = ref(null)

// 🎙️ Initialize speech recognition (Web Speech API)
if ('webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition.value = new SpeechRecognition()
  recognition.value.lang = 'en-US'
  recognition.value.interimResults = false
  recognition.value.maxAlternatives = 1

  recognition.value.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    userMessage.value = transcript
    isListening.value = false
  }

  recognition.value.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false
  }

  recognition.value.onend = () => {
    isListening.value = false
  }
} else {
  console.warn('Speech recognition not supported in this browser.')
}

// 🎤 Start / Stop Listening
const toggleVoice = () => {
  if (!recognition.value) {
    alert('Speech recognition not supported in this browser.')
    return
  }

  if (isListening.value) {
    recognition.value.stop()
    isListening.value = false
  } else {
    recognition.value.start()
    isListening.value = true
  }
}

// 📨 Send Message
const sendMessage = async () => {
  if (!userMessage.value.trim()) return

  // Add user's message
  messages.value.push({ sender: 'user', text: userMessage.value })

  const question = userMessage.value
  userMessage.value = ''

  try {
    const response = await axios.post('http://your-backend-url/api/chat', {
      question,
    })

    messages.value.push({
      sender: 'bot',
      text: response.data.answer || 'No response received.',
    })
  } catch (err) {
    messages.value.push({
      sender: 'bot',
      text: 'Error contacting the backend.',
    })
  }
}
</script>

<style scoped>
.bg-gray-50 {
  background-color: #f9fafb;
}
</style>
