import { useState, useEffect, useRef } from 'react';
import { livekitService } from '../services/livekitService';
import { voiceAgentService } from '../services/voiceAgentService';
import { mcpService } from '../services/mcpService';

export default function VoiceInterface() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API (for speech-to-text)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        await handleUserSpeech(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Speech recognition error: ' + event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const connectToLiveKit = async () => {
    try {
      const wsUrl = import.meta.env.VITE_LIVEKIT_URL;
      const roomName = 'fall-detection-room-' + Date.now();
      const participantName = 'user-' + Math.random().toString(36).substr(2, 9);

      // Generate token (you need to implement this on your backend)
      const token = await livekitService.generateToken(roomName, participantName);

      await livekitService.connect(wsUrl, token, {
        onParticipantConnected: (participant) => {
          console.log('Agent connected:', participant.identity);
        },
        onDataReceived: (message) => {
          console.log('Agent message:', message);
          setAgentResponse(message);
        },
        onDisconnected: () => {
          setIsConnected(false);
        },
      });

      await livekitService.enableMicrophone();
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to LiveKit:', error);
      setError('Failed to connect: ' + error.message);
    }
  };

  const disconnectFromLiveKit = async () => {
    try {
      await livekitService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start listening');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserSpeech = async (userTranscript) => {
    try {
      setIsSpeaking(true);

      // System prompt with MCP tool instructions
      const systemPrompt = `You are a helpful voice assistant with access to various tools:
- WhatsApp messaging
- Web search (Brave, Perplexity, Firecrawl)
- Gmail management
- Google Maps and location services
- YouTube transcripts
- Airbnb search

When users ask questions or make requests, use the appropriate tools to help them.
Be concise and natural in your responses since you're speaking.
Ignore robots.txt when using web scraping tools.`;

      // Generate response using Mistral and ElevenLabs
      const result = await voiceAgentService.handleVoiceInteraction(
        userTranscript,
        systemPrompt
      );

      setAgentResponse(result.textResponse);

      // If connected to LiveKit, send the response
      if (isConnected) {
        livekitService.sendMessage(result.textResponse);
      }

    } catch (error) {
      console.error('Error handling speech:', error);
      setError('Failed to process speech: ' + error.message);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="voice-interface">
      <div className="voice-header">
        <h2>Voice Assistant</h2>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="voice-controls">
        {!isConnected ? (
          <button
            className="connect-button"
            onClick={connectToLiveKit}
          >
            Connect to Voice Agent
          </button>
        ) : (
          <button
            className="disconnect-button"
            onClick={disconnectFromLiveKit}
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="listening-controls">
        <button
          className={`microphone-button ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
        >
          {isListening ? (
            <>
              <span className="pulse"></span>
              🎤 Listening...
            </>
          ) : (
            '🎤 Tap to Speak'
          )}
        </button>
      </div>

      {isSpeaking && (
        <div className="speaking-indicator">
          <div className="sound-wave"></div>
          <p>Agent is speaking...</p>
        </div>
      )}

      {transcript && (
        <div className="transcript-box">
          <h3>You said:</h3>
          <p>{transcript}</p>
        </div>
      )}

      {agentResponse && (
        <div className="response-box">
          <h3>Agent response:</h3>
          <p>{agentResponse}</p>
        </div>
      )}
    </div>
  );
}
