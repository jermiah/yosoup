import { Room, RoomEvent, RemoteParticipant, Track } from 'livekit-client';

export class LiveKitService {
  constructor() {
    this.room = null;
    this.isConnected = false;
  }

  // Generate token on the server (you'll need a backend endpoint for this)
  async generateToken(roomName, participantName) {
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  // Connect to LiveKit room
  async connect(wsUrl, token, callbacks = {}) {
    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 640, height: 480 },
        },
      });

      // Set up event listeners
      this.setupEventListeners(callbacks);

      // Connect to the room
      await this.room.connect(wsUrl, token);
      this.isConnected = true;

      console.log('Connected to LiveKit room:', this.room.name);
      return this.room;
    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
      throw error;
    }
  }

  // Set up event listeners
  setupEventListeners(callbacks) {
    if (!this.room) return;

    // Participant joined
    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('Participant connected:', participant.identity);
      if (callbacks.onParticipantConnected) {
        callbacks.onParticipantConnected(participant);
      }
    });

    // Participant disconnected
    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('Participant disconnected:', participant.identity);
      if (callbacks.onParticipantDisconnected) {
        callbacks.onParticipantDisconnected(participant);
      }
    });

    // Track subscribed
    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('Track subscribed:', track.kind);
      if (callbacks.onTrackSubscribed) {
        callbacks.onTrackSubscribed(track, publication, participant);
      }

      // Auto-play audio tracks
      if (track.kind === Track.Kind.Audio) {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
      }
    });

    // Track unsubscribed
    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log('Track unsubscribed:', track.kind);
      if (callbacks.onTrackUnsubscribed) {
        callbacks.onTrackUnsubscribed(track, publication, participant);
      }

      track.detach();
    });

    // Data received
    this.room.on(RoomEvent.DataReceived, (payload, participant, kind) => {
      const decoder = new TextDecoder();
      const message = decoder.decode(payload);
      console.log('Data received:', message);

      if (callbacks.onDataReceived) {
        callbacks.onDataReceived(message, participant);
      }
    });

    // Connection state changed
    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log('Connection state changed:', state);
      if (callbacks.onConnectionStateChanged) {
        callbacks.onConnectionStateChanged(state);
      }
    });

    // Disconnected
    this.room.on(RoomEvent.Disconnected, (reason) => {
      console.log('Disconnected from room:', reason);
      this.isConnected = false;
      if (callbacks.onDisconnected) {
        callbacks.onDisconnected(reason);
      }
    });
  }

  // Enable microphone
  async enableMicrophone() {
    if (!this.room) throw new Error('Not connected to room');

    try {
      await this.room.localParticipant.setMicrophoneEnabled(true);
      console.log('Microphone enabled');
    } catch (error) {
      console.error('Failed to enable microphone:', error);
      throw error;
    }
  }

  // Disable microphone
  async disableMicrophone() {
    if (!this.room) throw new Error('Not connected to room');

    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      console.log('Microphone disabled');
    } catch (error) {
      console.error('Failed to disable microphone:', error);
      throw error;
    }
  }

  // Send data message
  sendMessage(message, reliable = true) {
    if (!this.room) throw new Error('Not connected to room');

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    this.room.localParticipant.publishData(data, { reliable });
  }

  // Disconnect from room
  async disconnect() {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      this.isConnected = false;
      console.log('Disconnected from LiveKit room');
    }
  }

  // Get current room
  getRoom() {
    return this.room;
  }

  // Check if connected
  checkIsConnected() {
    return this.isConnected;
  }
}

// Export singleton instance
export const livekitService = new LiveKitService();
