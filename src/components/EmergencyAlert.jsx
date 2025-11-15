import { useState, useEffect, useRef } from 'react';
import { mcpService } from '../services/mcpService';
import { voiceAgentService } from '../services/voiceAgentService';

const ALERT_COUNTDOWN = 10; // seconds before sending emergency alert

export default function EmergencyAlert({ onCancel, userLocation }) {
  const [countdown, setCountdown] = useState(ALERT_COUNTDOWN);
  const [alertSent, setAlertSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Speak alert
    speakAlert();

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const speakAlert = async () => {
    try {
      const message = `Fall detected! Emergency services will be notified in ${ALERT_COUNTDOWN} seconds. Say cancel to stop the alert.`;
      const audioBlob = await voiceAgentService.textToSpeech(message);
      await voiceAgentService.playAudio(audioBlob);
    } catch (error) {
      console.error('Error speaking alert:', error);
    }
  };

  const sendEmergencyAlert = async () => {
    if (isSending || alertSent) return;

    setIsSending(true);

    try {
      const emergencyPhone = import.meta.env.VITE_EMERGENCY_PHONE;
      const emergencyEmail = import.meta.env.VITE_EMERGENCY_EMAIL;

      // Get location information
      let locationText = 'Location unknown';
      if (userLocation) {
        try {
          const reverseGeocode = await mcpService.reverseGeocode(
            userLocation.latitude,
            userLocation.longitude
          );
          locationText = reverseGeocode.address || `${userLocation.latitude}, ${userLocation.longitude}`;
        } catch (error) {
          console.error('Error getting address:', error);
          locationText = `${userLocation.latitude}, ${userLocation.longitude}`;
        }
      }

      const timestamp = new Date().toLocaleString();
      const alertMessage = `🚨 EMERGENCY ALERT 🚨\n\nFall detected at ${timestamp}\n\nLocation: ${locationText}\n\nImmediate assistance may be required.\n\nGoogle Maps: https://www.google.com/maps?q=${userLocation?.latitude},${userLocation?.longitude}`;

      // Send email alert
      try {
        await mcpService.sendGmail(
          emergencyEmail,
          '🚨 EMERGENCY: Fall Detected',
          alertMessage
        );
        console.log('Email alert sent');
      } catch (error) {
        console.error('Error sending email alert:', error);
      }

      // Send SMS via Twilio or similar service (to be implemented)
      // You can integrate Twilio or other SMS service here

      setAlertSent(true);

      // Speak confirmation
      try {
        const confirmationBlob = await voiceAgentService.textToSpeech(
          'Emergency services have been notified. Help is on the way.'
        );
        await voiceAgentService.playAudio(confirmationBlob);
      } catch (error) {
        console.error('Error speaking confirmation:', error);
      }

    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Failed to send emergency alert. Please call for help manually.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    onCancel();
  };

  return (
    <div className="emergency-alert-overlay">
      <div className="emergency-alert-container">
        <div className="emergency-icon">⚠️</div>

        <h1 className="emergency-title">Fall Detected!</h1>

        {!alertSent ? (
          <>
            <p className="emergency-message">
              Emergency services will be notified in
            </p>
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
            </div>
            <p className="emergency-instruction">
              Press the button below to cancel if you're okay
            </p>
            <button
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSending}
            >
              I'm Okay - Cancel Alert
            </button>
          </>
        ) : (
          <>
            <div className="alert-sent-icon">✓</div>
            <p className="alert-sent-message">
              Emergency alert sent successfully!
            </p>
            <p className="alert-sent-details">
              Help is on the way. Stay calm and stay where you are if possible.
            </p>
            <button
              className="dismiss-button"
              onClick={handleCancel}
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
