import { useState, useEffect } from 'react';
import { useFallDetection } from './hooks/useFallDetection';
import EmergencyAlert from './components/EmergencyAlert';
import VoiceInterface from './components/VoiceInterface';
import './App.css';

function App() {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // Fall detection hook
  const {
    isActive,
    permissionGranted,
    startDetection,
    stopDetection,
    resetFallDetection,
    currentAcceleration
  } = useFallDetection(() => {
    // Callback when fall is detected
    setShowEmergencyAlert(true);
  });

  // Request location permission
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermission(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      // Watch position for continuous updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  const handleCancelAlert = () => {
    setShowEmergencyAlert(false);
    resetFallDetection();
  };

  const toggleFallDetection = () => {
    if (isActive) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  return (
    <div className="app">
      {showEmergencyAlert && (
        <EmergencyAlert
          onCancel={handleCancelAlert}
          userLocation={userLocation}
        />
      )}

      <header className="app-header">
        <h1>🛡️ Fall Detection Assistant</h1>
        <p className="app-subtitle">AI-powered safety monitoring</p>
      </header>

      <main className="app-main">
        {/* Fall Detection Section */}
        <section className="card fall-detection-card">
          <h2>Fall Detection</h2>

          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Permission:</span>
              <span className={`status-badge ${permissionGranted ? 'granted' : 'denied'}`}>
                {permissionGranted ? '✓ Granted' : '✗ Not Granted'}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Location:</span>
              <span className={`status-badge ${locationPermission ? 'granted' : 'denied'}`}>
                {locationPermission ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
          </div>

          {isActive && (
            <div className="acceleration-display">
              <div className="acceleration-meter">
                <div className="meter-label">Acceleration</div>
                <div className="meter-value">
                  {currentAcceleration.toFixed(2)} g
                </div>
                <div className="meter-bar">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${Math.min((currentAcceleration / 4) * 100, 100)}%`,
                      backgroundColor:
                        currentAcceleration > 3.2
                          ? '#ef4444'
                          : currentAcceleration < 0.6
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <button
            className={`action-button ${isActive ? 'stop' : 'start'}`}
            onClick={toggleFallDetection}
          >
            {isActive ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
          </button>

          {userLocation && (
            <div className="location-info">
              <p className="location-text">
                📍 Lat: {userLocation.latitude.toFixed(6)}, Lon: {userLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </section>

        {/* Voice Interface Section */}
        <section className="card voice-card">
          <VoiceInterface />
        </section>

        {/* Instructions Section */}
        <section className="card instructions-card">
          <h2>ℹ️ How It Works</h2>
          <ol className="instructions-list">
            <li>
              <strong>Enable Fall Detection:</strong> Tap "Start Monitoring" to activate accelerometer-based fall detection.
            </li>
            <li>
              <strong>Voice Assistant:</strong> Connect to the voice agent to ask questions, get help, or perform tasks using voice commands.
            </li>
            <li>
              <strong>Emergency Response:</strong> If a fall is detected, you'll have 10 seconds to cancel the alert before emergency contacts are notified.
            </li>
            <li>
              <strong>Stay Safe:</strong> Keep your phone with you and ensure location services are enabled for accurate emergency response.
            </li>
          </ol>
        </section>

        {/* MCP Tools Info */}
        <section className="card tools-card">
          <h2>🛠️ Available Voice Commands</h2>
          <div className="tools-grid">
            <div className="tool-item">📱 WhatsApp Messaging</div>
            <div className="tool-item">🔍 Web Search (Brave, Perplexity)</div>
            <div className="tool-item">📧 Gmail Management</div>
            <div className="tool-item">🗺️ Google Maps & Directions</div>
            <div className="tool-item">🏠 Airbnb Search</div>
            <div className="tool-item">📹 YouTube Transcripts</div>
            <div className="tool-item">🌐 Web Scraping (Firecrawl)</div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Emergency Contact: {import.meta.env.VITE_EMERGENCY_PHONE || 'Not configured'}</p>
        <p className="footer-note">For demo purposes only. Always call emergency services directly in case of real emergency.</p>
      </footer>
    </div>
  );
}

export default App;
