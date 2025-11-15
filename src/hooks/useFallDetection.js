import { useState, useEffect, useCallback, useRef } from 'react';

// Threshold values based on research
const LOWER_THRESHOLD = 0.6; // g-force (free fall detection)
const UPPER_THRESHOLD = 3.2; // g-force (impact detection)
const INACTIVITY_TIME = 2000; // milliseconds
const GRAVITY = 9.81; // m/s²

export const useFallDetection = (onFallDetected) => {
  const [isActive, setIsActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState([]);
  const fallDetectedRef = useRef(false);
  const inactivityTimerRef = useRef(null);

  // Calculate total acceleration magnitude in g-force
  const calculateMagnitude = useCallback((x, y, z) => {
    const xG = x / GRAVITY;
    const yG = y / GRAVITY;
    const zG = z / GRAVITY;
    return Math.sqrt(xG * xG + yG * yG + zG * zG);
  }, []);

  // Check for inactivity after potential fall
  const checkInactivity = useCallback(() => {
    const recentData = accelerometerData.slice(-10);
    if (recentData.length === 0) return;

    const mean = recentData.reduce((sum, d) => sum + d.magnitude, 0) / recentData.length;
    const variance = recentData.reduce((sum, d) => sum + Math.pow(d.magnitude - mean, 2), 0) / recentData.length;
    const stdDev = Math.sqrt(variance);

    // If person is relatively still after fall
    if (stdDev < 0.5) {
      if (onFallDetected) {
        onFallDetected();
      }
    } else {
      fallDetectedRef.current = false; // Reset if person is moving
    }
  }, [accelerometerData, onFallDetected]);

  // Detect fall pattern
  const detectFall = useCallback((currentAccel) => {
    // Check for free-fall (low acceleration)
    const hasFreeFall = accelerometerData.some(d => d.magnitude < LOWER_THRESHOLD);

    // Check for impact (high acceleration)
    const hasImpact = currentAccel > UPPER_THRESHOLD;

    if (hasFreeFall && hasImpact && !fallDetectedRef.current) {
      fallDetectedRef.current = true;

      // Clear any existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Wait to check for inactivity
      inactivityTimerRef.current = setTimeout(() => {
        checkInactivity();
      }, INACTIVITY_TIME);
    }
  }, [accelerometerData, checkInactivity]);

  // Handle motion data
  const handleMotion = useCallback((event) => {
    const x = event.accelerationIncludingGravity.x || 0;
    const y = event.accelerationIncludingGravity.y || 0;
    const z = event.accelerationIncludingGravity.z || 0;

    const totalAcceleration = calculateMagnitude(x, y, z);

    setAccelerometerData(prevData => {
      const twoSecondsAgo = Date.now() - 2000;
      const filteredData = prevData.filter(d => d.timestamp > twoSecondsAgo);

      const newData = [
        ...filteredData,
        {
          magnitude: totalAcceleration,
          timestamp: Date.now(),
          x: x / GRAVITY,
          y: y / GRAVITY,
          z: z / GRAVITY
        }
      ];

      return newData;
    });

    detectFall(totalAcceleration);
  }, [calculateMagnitude, detectFall]);

  // Request permission and start detection
  const startDetection = useCallback(async () => {
    try {
      // Check if permission API exists (iOS 13+)
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('devicemotion', handleMotion);
          setIsActive(true);
          console.log('Fall detection activated');
        } else {
          console.error('Motion permission denied');
          alert('Motion permission denied. Cannot detect falls.');
        }
      } else {
        // Not iOS 13+, no permission needed
        setPermissionGranted(true);
        window.addEventListener('devicemotion', handleMotion);
        setIsActive(true);
        console.log('Fall detection activated (no permission required)');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Error requesting motion permission: ' + error.message);
    }
  }, [handleMotion]);

  // Stop detection
  const stopDetection = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsActive(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    console.log('Fall detection deactivated');
  }, [handleMotion]);

  // Reset fall detection state
  const resetFallDetection = useCallback(() => {
    fallDetectedRef.current = false;
    setAccelerometerData([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isActive,
    permissionGranted,
    startDetection,
    stopDetection,
    resetFallDetection,
    currentAcceleration: accelerometerData.length > 0 ? accelerometerData[accelerometerData.length - 1].magnitude : 0
  };
};
