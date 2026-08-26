/**
 * HealthFlow AI - Mobile Sensor & Accident Detection Service
 * Client-side listener for DeviceMotionEvent, DeviceOrientationEvent, GPS, and Inactivity.
 * Calculates multi-signal accident confidence and triggers false-positive protection.
 */

// Initial Engineering Parameters per Specification (#9)
export const SENSOR_WEIGHTS = {
  ACCIDENT_IMPACT_WEIGHT: 35.0,
  ACCIDENT_ROTATION_WEIGHT: 20.0,
  ACCIDENT_STOP_WEIGHT: 20.0,
  ACCIDENT_INACTIVITY_WEIGHT: 15.0,
  ACCIDENT_ORIENTATION_WEIGHT: 10.0,
};

export const CONFIDENCE_THRESHOLDS = {
  NORMAL_MAX: 39.0,
  POSSIBLE_INCIDENT_MAX: 69.0,
  HIGH_RISK_ACCIDENT_MAX: 84.0,
  CRITICAL_INCIDENT_MIN: 85.0
};

class SensorDetectionEngine {
  constructor() {
    this.isListening = false;
    this.callbacks = new Set();
    this.latestTelemetry = {
      acceleration: 0.0,
      rotation: 0.0,
      speed: 0.0,
      is_sudden_stop: false,
      inactivity_duration_sec: 0.0,
      abnormal_orientation: false,
      elevation_change_m: 0.0,
      latitude: null,
      longitude: null,
      accuracy_m: null,
      timestamp: new Date().toISOString()
    };

    this.motionHistory = [];
    this.lastMovementTime = Date.now();
    this.watchPositionId = null;
    this.lastSpeedKmh = 0;
  }

  /**
   * Request sensor permissions (for iOS 13+ / modern browser security policies)
   */
  async requestPermissions() {
    let motionGranted = true;
    let orientationGranted = true;
    let locationGranted = false;

    // DeviceMotionEvent permission check
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        motionGranted = response === 'granted';
      } catch (err) {
        console.warn("DeviceMotionEvent permission request failed/skipped:", err);
      }
    }

    // DeviceOrientationEvent permission check
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        orientationGranted = response === 'granted';
      } catch (err) {
        console.warn("DeviceOrientationEvent permission request failed/skipped:", err);
      }
    }

    // Geolocation permission check
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      locationGranted = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.updateLocation(pos);
            resolve(true);
          },
          (err) => {
            console.warn("Geolocation permission denied/failed:", err);
            resolve(false);
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      });
    }

    return {
      motion: motionGranted,
      orientation: orientationGranted,
      location: locationGranted
    };
  }

  /**
   * Start active browser sensor listeners
   */
  startListening(onTelemetryUpdate) {
    if (onTelemetryUpdate) {
      this.callbacks.add(onTelemetryUpdate);
    }
    if (this.isListening) return;

    this.isListening = true;
    this.lastMovementTime = Date.now();

    // 1. Motion Listener (Accelerometer + Gyroscope)
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleDeviceMotion, true);
    }

    // 2. Orientation Listener
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
    }

    // 3. GPS Location Listener
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      this.watchPositionId = navigator.geolocation.watchPosition(
        (pos) => this.updateLocation(pos),
        (err) => console.warn("GPS watch position error:", err),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }

    // 4. Inactivity Monitor Loop
    this.inactivityInterval = setInterval(() => {
      const inactiveSec = (Date.now() - this.lastMovementTime) / 1000;
      this.latestTelemetry.inactivity_duration_sec = Math.round(inactiveSec * 10) / 10;
      this.evaluateAndEmit();
    }, 1000);
  }

  stopListening() {
    this.isListening = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion, true);
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation && this.watchPositionId !== null) {
      navigator.geolocation.clearWatch(this.watchPositionId);
      this.watchPositionId = null;
    }
    if (this.inactivityInterval) {
      clearInterval(this.inactivityInterval);
    }
  }

  handleDeviceMotion = (event) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    const rot = event.rotationRate;

    let accelMag = 0.0;
    if (acc) {
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      accelMag = Math.sqrt(x * x + y * y + z * z);
    }

    let rotRate = 0.0;
    if (rot) {
      const alpha = rot.alpha || 0;
      const beta = rot.beta || 0;
      const gamma = rot.gamma || 0;
      rotRate = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
    }

    // Motion threshold to reset inactivity
    if (accelMag > 12.0 || rotRate > 25.0) {
      this.lastMovementTime = Date.now();
    }

    this.latestTelemetry.acceleration = Math.round(accelMag * 10) / 10;
    this.latestTelemetry.rotation = Math.round(rotRate * 10) / 10;
    this.latestTelemetry.timestamp = new Date().toISOString();

    this.evaluateAndEmit();
  };

  handleDeviceOrientation = (event) => {
    const beta = Math.abs(event.beta || 0); // pitch (-180 to 180)
    const gamma = Math.abs(event.gamma || 0); // roll (-90 to 90)

    // Abnormal orientation: phone upside down or extreme side tilt (>75 deg pitch or roll)
    const isAbnormal = beta > 75 || gamma > 75;
    this.latestTelemetry.abnormal_orientation = isAbnormal;
    this.evaluateAndEmit();
  };

  updateLocation = (position) => {
    if (!position || !position.coords) return;
    const { latitude, longitude, speed, accuracy } = position.coords;

    const currentSpeedKmh = speed !== null && speed !== undefined ? speed * 3.6 : 0.0;
    // Sudden stop check: dropping from >20 km/h to <5 km/h
    const isStop = this.lastSpeedKmh > 20.0 && currentSpeedKmh < 5.0;
    this.lastSpeedKmh = currentSpeedKmh;

    this.latestTelemetry.latitude = latitude;
    this.latestTelemetry.longitude = longitude;
    this.latestTelemetry.accuracy_m = accuracy ? Math.round(accuracy) : null;
    this.latestTelemetry.speed = Math.round(currentSpeedKmh * 10) / 10;
    this.latestTelemetry.is_sudden_stop = isStop;

    this.evaluateAndEmit();
  };

  /**
   * Pure Multi-Signal Confidence Calculator
   * Matches Section 9 rules & Section 10 false positive protection.
   */
  calculateConfidence(telemetry = this.latestTelemetry) {
    let impact_score = 0.0;
    let rotation_score = 0.0;
    let stop_score = 0.0;
    let inactivity_score = 0.0;
    let orientation_score = 0.0;

    // 1. Acceleration Impact (Max 35.0)
    if (telemetry.acceleration > 15.0) {
      const scale = Math.min((telemetry.acceleration - 15.0) / 25.0, 1.0);
      impact_score = scale * SENSOR_WEIGHTS.ACCIDENT_IMPACT_WEIGHT;
    }

    // 2. Rotational Angular Velocity (Max 20.0)
    if (telemetry.rotation > 80.0) {
      const scale = Math.min((telemetry.rotation - 80.0) / 200.0, 1.0);
      rotation_score = scale * SENSOR_WEIGHTS.ACCIDENT_ROTATION_WEIGHT;
    }

    // 3. GPS Sudden Stop / Speed (Max 20.0)
    if (telemetry.is_sudden_stop || telemetry.speed > 25.0) {
      stop_score = SENSOR_WEIGHTS.ACCIDENT_STOP_WEIGHT;
    } else if (telemetry.speed > 10.0) {
      stop_score = SENSOR_WEIGHTS.ACCIDENT_STOP_WEIGHT * 0.5;
    }

    // 4. Post-Impact Inactivity (Max 15.0)
    if (telemetry.inactivity_duration_sec >= 10.0) {
      inactivity_score = SENSOR_WEIGHTS.ACCIDENT_INACTIVITY_WEIGHT;
    } else if (telemetry.inactivity_duration_sec >= 5.0) {
      inactivity_score = SENSOR_WEIGHTS.ACCIDENT_INACTIVITY_WEIGHT * 0.5;
    }

    // 5. Abnormal Orientation (Max 10.0)
    if (telemetry.abnormal_orientation) {
      orientation_score = SENSOR_WEIGHTS.ACCIDENT_ORIENTATION_WEIGHT;
    }

    let rawScore = impact_score + rotation_score + stop_score + inactivity_score + orientation_score;

    // False Positive Protection
    // Single isolated accelerometer drop without rotation, stop, inactivity or orientation change
    const supportingSignalsCount = [
      rotation_score > 5.0,
      stop_score > 5.0,
      inactivity_score > 5.0,
      orientation_score > 0.0
    ].filter(Boolean).length;

    let isFalsePositiveMitigated = false;
    if (supportingSignalsCount === 0 && telemetry.acceleration < 45.0) {
      rawScore = Math.min(rawScore, 25.0);
      isFalsePositiveMitigated = true;
    }

    const finalScore = Math.min(Math.max(Math.round(rawScore * 10) / 10, 0.0), 100.0);

    let riskLevel = "NORMAL";
    if (finalScore >= CONFIDENCE_THRESHOLDS.CRITICAL_INCIDENT_MIN) {
      riskLevel = "CRITICAL_SUSPECTED_INCIDENT";
    } else if (finalScore >= 70.0) {
      riskLevel = "HIGH_RISK_POSSIBLE_ACCIDENT";
    } else if (finalScore >= 40.0) {
      riskLevel = "POSSIBLE_INCIDENT";
    }

    return {
      confidenceScore: finalScore,
      riskLevel,
      isPossibleAccident: finalScore >= 40.0,
      requiresUserConfirmation: finalScore >= 70.0,
      isFalsePositiveMitigated,
      breakdown: {
        impact_score: Math.round(impact_score * 10) / 10,
        rotation_score: Math.round(rotation_score * 10) / 10,
        stop_score: Math.round(stop_score * 10) / 10,
        inactivity_score: Math.round(inactivity_score * 10) / 10,
        orientation_score: Math.round(orientation_score * 10) / 10,
        supportingSignalsCount
      }
    };
  }

  evaluateAndEmit() {
    const evaluation = this.calculateConfidence(this.latestTelemetry);
    const payload = {
      telemetry: { ...this.latestTelemetry },
      evaluation
    };

    this.callbacks.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error("Sensor telemetry callback error:", err);
      }
    });
  }

  /**
   * Set simulated telemetry for desktop testing (Scenarios 1 through 6)
   */
  injectSimulatedTelemetry(simulatedTelemetry) {
    this.latestTelemetry = {
      ...this.latestTelemetry,
      ...simulatedTelemetry,
      timestamp: new Date().toISOString()
    };
    if (simulatedTelemetry.acceleration > 15 || simulatedTelemetry.rotation > 30) {
      this.lastMovementTime = Date.now();
    }
    this.evaluateAndEmit();
  }
}

export const sensorDetectionEngine = new SensorDetectionEngine();
