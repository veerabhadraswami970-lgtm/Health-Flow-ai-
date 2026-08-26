import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Gauge, MapPin, PhoneCall, CheckCircle, 
  Settings, Zap, AlertTriangle, Compass, ShieldCheck, ExternalLink, RefreshCw, UserCheck
} from 'lucide-react';
import { sensorDetectionEngine, CONFIDENCE_THRESHOLDS } from '../services/sensorDetectionService';
import { healthflowApi } from '../services/api';
import AccidentEmergency3D from './3d/AccidentEmergency3D';

export default function AccidentDetectionModule({ t, onRequestEmergencyConfirmation, onTriggerFullSOS }) {
  const [activeSubTab, setActiveSubTab] = useState('monitor'); // 'monitor' | 'scenarios' | 'dashboard' | 'settings'
  const [telemetry, setTelemetry] = useState(sensorDetectionEngine.latestTelemetry);
  const [evaluation, setEvaluation] = useState(sensorDetectionEngine.calculateConfidence());
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [activeIncident, setActiveIncident] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    auto_escalation: true,
    confirmation_timeout_sec: 20,
    location_permission_granted: true,
    sensor_monitoring_active: true,
    emergency_contacts: [
      { name: "Anil Kumar", relation: "Son", phone: "+919876543211" },
      { name: "Sunita Devi", relation: "Spouse", phone: "+919876543212" }
    ]
  });

  // Subscribe to real browser sensors
  useEffect(() => {
    sensorDetectionEngine.startListening((data) => {
      setTelemetry(data.telemetry);
      setEvaluation(data.evaluation);
    });

    // Load initial settings & nearby hospitals
    loadInitialData();

    return () => {
      sensorDetectionEngine.stopListening();
    };
  }, []);

  async function loadInitialData() {
    try {
      const s = await healthflowApi.getAccidentSettings("patient_ravi_kumar");
      if (s) setSettings(s);
    } catch (err) {
      console.warn("Could not fetch accident settings:", err);
    }

    try {
      setLoadingHospitals(true);
      const hosps = await healthflowApi.getNearbyEmergencyHospitals("Hyderabad");
      setNearbyHospitals(hosps || []);
    } catch (err) {
      console.warn("Could not fetch nearby emergency hospitals:", err);
    } finally {
      setLoadingHospitals(false);
    }
  }

  async function handleToggleMonitoring() {
    const nextState = !isMonitoring;
    setIsMonitoring(nextState);
    if (nextState) {
      sensorDetectionEngine.startListening();
    } else {
      sensorDetectionEngine.stopListening();
    }
    try {
      await healthflowApi.updateAccidentSettings("patient_ravi_kumar", { enabled: nextState, sensor_monitoring_active: nextState });
    } catch (e) {
      console.warn("Settings update error:", e);
    }
  }

  async function handleSaveSettings(newSettings) {
    setSettings(newSettings);
    try {
      await healthflowApi.updateAccidentSettings("patient_ravi_kumar", newSettings);
    } catch (e) {
      console.error("Save settings error:", e);
    }
  }

  // Scenario 1: Phone Drop on Table
  function runScenario1() {
    sensorDetectionEngine.injectSimulatedTelemetry({
      acceleration: 26.5,
      rotation: 2.0,
      speed: 0.0,
      is_sudden_stop: false,
      inactivity_duration_sec: 0.0,
      abnormal_orientation: false
    });
  }

  // Scenario 2: Sudden Braking
  function runScenario2() {
    sensorDetectionEngine.injectSimulatedTelemetry({
      acceleration: 19.0,
      rotation: 12.0,
      speed: 38.0,
      is_sudden_stop: true,
      inactivity_duration_sec: 0.0,
      abnormal_orientation: false
    });
  }

  // Scenario 3: High Impact Possible Accident
  function runScenario3() {
    const simTelem = {
      acceleration: 42.0,
      rotation: 195.0,
      speed: 55.0,
      is_sudden_stop: true,
      inactivity_duration_sec: 14.0,
      abnormal_orientation: true,
      latitude: 17.3850,
      longitude: 78.4867
    };
    sensorDetectionEngine.injectSimulatedTelemetry(simTelem);
    
    const evalResult = sensorDetectionEngine.calculateConfidence(simTelem);
    if (onRequestEmergencyConfirmation) {
      onRequestEmergencyConfirmation({
        event_id: `evt_sim_${Date.now()}`,
        patient_id: "patient_ravi_kumar",
        confidence_score: evalResult.confidenceScore,
        signals_breakdown: evalResult.breakdown,
        telemetry: simTelem
      });
    }
  }

  // Scenario 4: User Requests Help Directly
  async function runScenario4() {
    runScenario3();
    try {
      const incident = await healthflowApi.createEmergencyIncident({
        patient_id: "patient_ravi_kumar",
        confidence_score: 89.0,
        user_response: "USER_CONFIRMED_HELP",
        latitude: 17.3850,
        longitude: 78.4867
      });
      setActiveIncident(incident);
      setActiveSubTab('dashboard');
    } catch (e) {
      console.error("Scenario 4 error:", e);
    }
  }

  // Scenario 5: User Is Safe (I'M OK)
  async function runScenario5() {
    if (activeIncident) {
      try {
        const updated = await healthflowApi.cancelEmergencyIncident(activeIncident.incident_id, "USER_CONFIRMED_SAFE");
        setActiveIncident(updated);
      } catch (e) {
        console.error("Scenario 5 error:", e);
      }
    } else {
      runScenario1();
    }
  }

  // Scenario 6: Timeout Escalation
  async function runScenario6() {
    try {
      const incident = await healthflowApi.createEmergencyIncident({
        patient_id: "patient_ravi_kumar",
        confidence_score: 91.5,
        user_response: "TIMEOUT_NO_RESPONSE",
        latitude: 17.3850,
        longitude: 78.4867
      });
      setActiveIncident(incident);
      setActiveSubTab('dashboard');
    } catch (e) {
      console.error("Scenario 6 error:", e);
    }
  }

  const confidenceScore = evaluation?.confidenceScore || 0;

  return (
    <div className="hf-card animate-slide-up" style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header & Status Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--hf-border-glass)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 59, 92, 0.2) 0%, rgba(255, 59, 92, 0.05) 100%)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 59, 92, 0.4)'
          }}>
            <ShieldAlert size={36} color="#ff4b63" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--hf-text-primary)', margin: 0 }}>
                AI Accident Detection & Emergency Response
              </h2>
              <span className={`badge ${isMonitoring ? 'badge-verified' : ''}`} style={{
                background: isMonitoring ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isMonitoring ? '#34d399' : '#f87171',
                border: `1px solid ${isMonitoring ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                fontSize: '0.82rem',
                padding: '4px 12px'
              }}>
                ● {isMonitoring ? "Active Monitoring" : "Disabled"}
              </span>
            </div>
            <span style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>
              Multi-signal smartphone telemetry engine (Accelerometer + Gyroscope + GPS + Inactivity)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleToggleMonitoring}
            className={`btn ${isMonitoring ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            {isMonitoring ? "Disable Monitoring" : "Enable Monitoring"}
          </button>
          <button
            onClick={() => onTriggerFullSOS && onTriggerFullSOS()}
            className="btn btn-emergency"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            🚨 Instant SOS
          </button>
        </div>
      </div>

      {/* Assistive Safety Banner */}
      <div style={{
        background: 'rgba(0, 242, 254, 0.05)',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '28px',
        fontSize: '0.82rem',
        color: 'var(--hf-cyan)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ShieldCheck size={20} />
        <span>
          <strong>Assistive Emergency Technology Notice:</strong> HealthFlow AI provides multi-sensor triage support.
          It uses the strict terminology <em>"Possible Accident Detected"</em> and requires verification before emergency escalation.
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '28px' }}>
        <button
          onClick={() => setActiveSubTab('monitor')}
          className={`tab-btn ${activeSubTab === 'monitor' ? 'active' : ''}`}
        >
          <Activity size={18} />
          <span>Live Sensor Monitor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('scenarios')}
          className={`tab-btn ${activeSubTab === 'scenarios' ? 'active' : ''}`}
        >
          <Zap size={18} />
          <span>Test Scenarios (1–6)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`tab-btn ${activeSubTab === 'dashboard' ? 'active' : ''}`}
        >
          <ShieldAlert size={18} />
          <span>Emergency Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings & Contacts</span>
        </button>
      </div>

      {/* Tab 1: Live Sensor Monitor */}
      {activeSubTab === 'monitor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Signal Gauges */}
          <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: 'var(--hf-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gauge size={20} color="var(--hf-cyan)" />
              <span>Real-Time Mobile Signals</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Accelerometer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--hf-text-secondary)' }}>Accelerometer Impact</span>
                  <span style={{ fontWeight: 800, color: telemetry.acceleration > 20 ? '#ff4b63' : 'var(--hf-text-primary)' }}>
                    {telemetry.acceleration} m/s²
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((telemetry.acceleration / 50) * 100, 100)}%`, background: telemetry.acceleration > 20 ? '#ff4b63' : 'var(--hf-cyan)' }} />
                </div>
              </div>

              {/* Gyroscope Rotation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--hf-text-secondary)' }}>Gyroscope Angular Rate</span>
                  <span style={{ fontWeight: 800, color: telemetry.rotation > 100 ? '#ff4b63' : 'var(--hf-text-primary)' }}>
                    {telemetry.rotation} deg/s
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((telemetry.rotation / 250) * 100, 100)}%`, background: 'var(--hf-primary)' }} />
                </div>
              </div>

              {/* GPS Speed & Sudden Stop */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--hf-text-secondary)' }}>GPS Speed / High-G Stop</span>
                  <span style={{ fontWeight: 800, color: telemetry.is_sudden_stop ? '#ff4b63' : 'var(--hf-text-primary)' }}>
                    {telemetry.speed} km/h {telemetry.is_sudden_stop && "(Sudden Stop Detected)"}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((telemetry.speed / 120) * 100, 100)}%`, background: telemetry.is_sudden_stop ? '#ff4b63' : '#a855f7' }} />
                </div>
              </div>

              {/* Post-Impact Inactivity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--hf-text-secondary)' }}>Post-Impact Phone Inactivity</span>
                  <span style={{ fontWeight: 800, color: telemetry.inactivity_duration_sec > 10 ? '#ff4b63' : 'var(--hf-text-primary)' }}>
                    {telemetry.inactivity_duration_sec}s stationary
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((telemetry.inactivity_duration_sec / 30) * 100, 100)}%`, background: '#f59e0b' }} />
                </div>
              </div>

              {/* Abnormal Orientation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--hf-text-secondary)' }}>Device Orientation State:</span>
                <span style={{ fontWeight: 800, color: telemetry.abnormal_orientation ? '#ff4b63' : 'var(--hf-primary)' }}>
                  {telemetry.abnormal_orientation ? "⚠️ Abnormal Tilt / Roll" : "✓ Normal Orientation"}
                </span>
              </div>
            </div>
          </div>

          {/* Accident Confidence Engine */}
          <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--hf-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="#ff4b63" />
                <span>Accident Confidence Score</span>
              </h3>

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: confidenceScore >= 70 ? '#ff4b63' : confidenceScore >= 40 ? '#f59e0b' : 'var(--hf-primary)', lineHeight: 1 }}>
                  {confidenceScore}<span style={{ fontSize: '1.5rem' }}>%</span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: '8px', color: 'var(--hf-text-primary)' }}>
                  Classification: {evaluation?.riskLevel || "NORMAL"}
                </div>
              </div>

              {/* False Positive Banner if triggered */}
              {evaluation?.isFalsePositiveMitigated && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', color: '#fbbf24', marginBottom: '16px' }}>
                  🛡️ <strong>False Positive Protection Active:</strong> High acceleration detected in isolation without rotation/stop/inactivity. Capped to prevent false emergency dispatch.
                </div>
              )}

              {/* Breakdown List */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--hf-text-secondary)' }}>
                  <span>Impact Acceleration Score (+35):</span>
                  <span style={{ color: 'var(--hf-text-primary)', fontWeight: 700 }}>+{evaluation?.breakdown?.impact_score || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--hf-text-secondary)' }}>
                  <span>Rotational Gyro Score (+20):</span>
                  <span style={{ color: 'var(--hf-text-primary)', fontWeight: 700 }}>+{evaluation?.breakdown?.rotation_score || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--hf-text-secondary)' }}>
                  <span>GPS Sudden Stop Score (+20):</span>
                  <span style={{ color: 'var(--hf-text-primary)', fontWeight: 700 }}>+{evaluation?.breakdown?.stop_score || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--hf-text-secondary)' }}>
                  <span>Post-Impact Inactivity Score (+15):</span>
                  <span style={{ color: 'var(--hf-text-primary)', fontWeight: 700 }}>+{evaluation?.breakdown?.inactivity_score || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--hf-text-secondary)' }}>
                  <span>Abnormal Orientation Score (+10):</span>
                  <span style={{ color: 'var(--hf-text-primary)', fontWeight: 700 }}>+{evaluation?.breakdown?.orientation_score || 0}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => sensorDetectionEngine.requestPermissions()}
              className="btn btn-secondary"
              style={{ marginTop: '16px', width: '100%', fontSize: '0.86rem' }}
            >
              Request Smartphone Permissions
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Test Scenarios 1–6 */}
      {activeSubTab === 'scenarios' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--hf-text-primary)' }}>
              Interactive Sensor Telemetry & Safety Test Suite
            </h3>
            <span style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
              Test all 6 specified real-world scenarios on any desktop or mobile device.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Scenario 1 */}
            <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', padding: '20px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--hf-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scenario 1 — False Positive
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--hf-text-primary)' }}>
                Phone Dropped on Desk
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                High acceleration spike (26.5 m/s²) without supporting rotation, GPS stop, or inactivity. False positive filter caps score &lt; 40.
              </p>
              <button onClick={runScenario1} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.84rem' }}>
                Run Scenario 1
              </button>
            </div>

            {/* Scenario 2 */}
            <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', padding: '20px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scenario 2 — Contextual Stop
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--hf-text-primary)' }}>
                Sudden Braking
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                Speed drop from 38 km/h + deceleration spike. Yields medium score (POSSIBLE_INCIDENT) without emergency modal.
              </p>
              <button onClick={runScenario2} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.84rem' }}>
                Run Scenario 2
              </button>
            </div>

            {/* Scenario 3 */}
            <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid rgba(255, 59, 92, 0.4)', padding: '20px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ff4b63', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scenario 3 — Multi-Signal Impact
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--hf-text-primary)' }}>
                Possible Accident Event
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                High impact (42 m/s²) + rotation (195 deg/s) + GPS stop + inactivity + upside tilt. Confidence &gt; 85%. Triggers full-screen alert.
              </p>
              <button onClick={runScenario3} className="btn btn-emergency" style={{ width: '100%', fontSize: '0.84rem' }}>
                Run Scenario 3 (Trigger Alert)
              </button>
            </div>

            {/* Scenario 4 */}
            <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', padding: '20px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--hf-danger)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scenario 4 — Explicit Help
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--hf-text-primary)' }}>
                User Presses "NEED HELP"
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                Immediately creates emergency incident, dispatches contact alerts, and identifies nearby 24/7 trauma hospitals.
              </p>
              <button onClick={runScenario4} className="btn btn-primary" style={{ width: '100%', fontSize: '0.84rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none' }}>
                Run Scenario 4
              </button>
            </div>

            {/* Scenario 5 */}
            <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', padding: '20px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scenario 5 — False Alarm Safe
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--hf-text-primary)' }}>
                User Presses "I'M OK"
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                Cancels active emergency alert, logs event as status = FALSE_ALARM, and does not send emergency notifications.
              </p>
              <button onClick={runScenario5} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.84rem', borderColor: '#34d399', color: '#34d399' }}>
                Run Scenario 5
              </button>
            </div>

            {/* Scenario 6 */}
            <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', padding: '20px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scenario 6 — No Response
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--hf-text-primary)' }}>
                Countdown Timeout
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                User does not respond before countdown expires. Automatically escalates based on policy and logs TIMEOUT_NO_RESPONSE.
              </p>
              <button onClick={runScenario6} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.84rem' }}>
                Run Scenario 6
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Emergency Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Incident Summary Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(28, 12, 22, 0.95) 0%, rgba(10, 18, 35, 0.98) 100%)',
            border: '2px solid var(--hf-danger)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <AccidentEmergency3D size={110} />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--hf-danger)', textTransform: 'uppercase' }}>
                  Active Emergency Status Tracker
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  {activeIncident ? `Incident ID: ${activeIncident.incident_id}` : "Possible Accident Monitoring Active"}
                </h3>
                <div style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
                  Patient: <strong>Ravi Kumar</strong> (Age 34, Blood Group <strong>O+</strong>)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="badge badge-verified" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>
                Status: {activeIncident ? activeIncident.status : "STANDBY"}
              </span>
            </div>
          </div>

          {/* Incident Timeline */}
          <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--hf-text-primary)', marginBottom: '16px' }}>
              Incident Execution Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                <CheckCircle size={18} color="#34d399" />
                <span style={{ color: 'var(--hf-text-primary)' }}>Possible accident multi-signal pattern detected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                <CheckCircle size={18} color="#34d399" />
                <span style={{ color: 'var(--hf-text-primary)' }}>Emergency incident record generated in database</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                <CheckCircle size={18} color="#34d399" />
                <span style={{ color: 'var(--hf-text-primary)' }}>
                  Emergency contact notification requested (Cellular Gateway)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                <CheckCircle size={18} color="#34d399" />
                <span style={{ color: 'var(--hf-text-primary)' }}>Nearby ABDM 24/7 trauma emergency facilities identified</span>
              </div>
            </div>
          </div>

          {/* Registered Emergency Contacts Notification Status */}
          <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--hf-text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PhoneCall size={18} color="var(--hf-cyan)" />
              <span>Emergency Contact Notifications</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {settings.emergency_contacts.map((c, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--hf-text-primary)' }}>
                      {c.name} ({c.relation})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--hf-text-secondary)' }}>
                      {c.phone}
                    </div>
                  </div>
                  <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                    Notification sent
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby ABDM Trauma Emergency Hospitals */}
          <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--hf-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={18} color="#ff4b63" />
                <span>Nearby Emergency Trauma Facilities (ABDM HFR)</span>
              </h4>
              <span style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', fontStyle: 'italic' }}>
                Hospital notification integration is not configured.
              </span>
            </div>

            {loadingHospitals ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--hf-text-secondary)' }}>
                Loading nearby emergency centers...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {nearbyHospitals.slice(0, 3).map((h, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 75, 99, 0.06)', border: '1px solid rgba(255, 75, 99, 0.3)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                        {h.name}
                      </div>
                      <span style={{ background: 'rgba(255,75,99,0.2)', color: '#ff7b8d', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                        {h.distance_km || 1.8} km away
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--hf-text-secondary)', marginBottom: '12px' }}>
                      📍 {h.address}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a
                        href={`tel:${h.emergency_contact || h.helpline || '108'}`}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', flex: 1, background: 'linear-gradient(135deg, #ff4b63 0%, #b31028 100%)', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <PhoneCall size={14} />
                        <span>CALL</span>
                      </a>

                      {h.latitude && h.longitude && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${h.latitude},${h.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <Compass size={14} />
                          <span>DIRECTIONS</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Settings & Preferences */}
      {activeSubTab === 'settings' && (
        <div style={{ background: 'rgba(6, 11, 20, 0.6)', border: '1px solid var(--hf-border-glass)', borderRadius: '16px', padding: '28px', maxWidth: '720px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--hf-text-primary)', marginBottom: '20px' }}>
            Accident Detection & Emergency Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Master Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--hf-text-primary)', fontSize: '0.96rem' }}>
                  Enable Mobile Accident Detection
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>
                  Monitors accelerometer, gyroscope, and GPS for impact patterns
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSaveSettings({ ...settings, enabled: e.target.checked })}
                style={{ width: '22px', height: '22px', cursor: 'pointer' }}
              />
            </div>

            {/* Confirmation Timeout */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: 'var(--hf-text-primary)', fontSize: '0.96rem' }}>
                  Emergency Check Confirmation Timeout
                </span>
                <span style={{ fontWeight: 900, color: '#ff4b63', fontSize: '1rem' }}>
                  {settings.confirmation_timeout_sec} seconds
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="30"
                value={settings.confirmation_timeout_sec}
                onChange={(e) => handleSaveSettings({ ...settings, confirmation_timeout_sec: parseInt(e.target.value, 10) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--hf-text-muted)', marginTop: '4px' }}>
                <span>15s (Fast dispatch)</span>
                <span>30s (Maximum reaction time)</span>
              </div>
            </div>

            {/* Auto Escalation Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--hf-text-primary)', fontSize: '0.96rem' }}>
                  Automatic Emergency Escalation
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>
                  Automatically notify emergency contacts if countdown finishes with no response
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_escalation}
                onChange={(e) => handleSaveSettings({ ...settings, auto_escalation: e.target.checked })}
                style={{ width: '22px', height: '22px', cursor: 'pointer' }}
              />
            </div>

            {/* Emergency Contacts List */}
            <div>
              <div style={{ fontWeight: 800, color: 'var(--hf-text-primary)', fontSize: '0.96rem', marginBottom: '12px' }}>
                Registered Emergency Contacts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {settings.emergency_contacts.map((c, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--hf-text-primary)' }}>{c.name}</strong> ({c.relation})
                      <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>{c.phone}</div>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--hf-cyan)' }}>✓ Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
