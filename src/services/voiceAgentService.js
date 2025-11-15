import axios from 'axios';

class VoiceAgentService {
  constructor() {
    this.mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    this.mistralModel = import.meta.env.VITE_MISTRAL_MODEL || 'mistral-large-latest';
    this.elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    this.conversationHistory = [];
  }

  // Call Mistral LLM for text generation
  async generateResponse(userMessage, systemPrompt = null) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      const messages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...this.conversationHistory]
        : this.conversationHistory;

      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: this.mistralModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.mistralApiKey}`,
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw error;
    }
  }

  // Convert text to speech using ElevenLabs
  async textToSpeech(text) {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsVoiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.elevenLabsApiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      // Convert array buffer to blob
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      return audioBlob;
    } catch (error) {
      console.error('Error calling ElevenLabs API:', error);
      throw error;
    }
  }

  // Play audio from blob
  async playAudio(audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Complete voice interaction: user speaks, AI responds with voice
  async handleVoiceInteraction(userTranscript, systemPrompt = null) {
    try {
      // Generate text response from Mistral
      const textResponse = await this.generateResponse(userTranscript, systemPrompt);

      // Convert to speech using ElevenLabs
      const audioBlob = await this.textToSpeech(textResponse);

      // Play the audio
      await this.playAudio(audioBlob);

      return {
        textResponse,
        audioBlob,
      };
    } catch (error) {
      console.error('Error in voice interaction:', error);
      throw error;
    }
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory() {
    return [...this.conversationHistory];
  }

  // Set conversation history (useful for resuming conversations)
  setHistory(history) {
    this.conversationHistory = history;
  }
}

export const voiceAgentService = new VoiceAgentService();
