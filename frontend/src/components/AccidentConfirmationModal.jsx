import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, PhoneCall, Volume2 } from 'lucide-react';
import { healthflowApi } from '../services/api';
import EmergencyPulse from './3d/EmergencyPulse';

export default function AccidentConfirmationModal({
  isOpen,
  eventData,
  onClose,
  onConfirmedHelp,
  onConfirmedSafe,
  timeoutSeconds = 20,
  autoEscalate = true,
  t
}) {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);

  useEffect(() => {
    setSecondsLeft(timeoutSeconds);
  }, [isOpen, timeoutSeconds]);

  useEffect(() => {
    if (!isOpen) return;

    if (secondsLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  const handleTimeout = async () => {
    if (!isOpen) return;
    if (autoEscalate) {
      try {
        const incident = await healthflowApi.createEmergencyIncident({
          patient_id: eventData?.patient_id || "patient_ravi_kumar",
          event_id: eventData?.event_id || `evt_${Date.now()}`,
          confidence_score: eventData?.confidence_score || 85.0,
          detection_signals: eventData?.signals_breakdown || {},
          latitude: eventData?.telemetry?.latitude || 17.3850,
          longitude: eventData?.telemetry?.longitude || 78.4867,
          user_response: "TIMEOUT_NO_RESPONSE"
        });
        if (onConfirmedHelp) onConfirmedHelp(incident);
      } catch (err) {
        console.error("Auto escalation incident creation failed:", err);
      }
    }
    onClose();
  };

  const handleImOk = async () => {
    try {
      if (eventData?.incident_id) {
        await healthflowApi.cancelEmergencyIncident(eventData.incident_id, "USER_CONFIRMED_SAFE");
      }
      if (onConfirmedSafe) onConfirmedSafe();
    } catch (err) {
      console.warn("Incident cancellation request error:", err);
    } finally {
      onClose();
    }
  };

  const handleNeedHelp = async () => {
    try {
      let incident;
      if (eventData?.incident_id) {
        incident = await healthflowApi.confirmEmergencyIncident(eventData.incident_id);
      } else {
        incident = await healthflowApi.createEmergencyIncident({
          patient_id: eventData?.patient_id || "patient_ravi_kumar",
          event_id: eventData?.event_id || `evt_${Date.now()}`,
          confidence_score: eventData?.confidence_score || 88.0,
          detection_signals: eventData?.signals_breakdown || {},
          latitude: eventData?.telemetry?.latitude || 17.3850,
          longitude: eventData?.telemetry?.longitude || 78.4867,
          user_response: "USER_CONFIRMED_HELP"
        });
      }
      if (onConfirmedHelp) onConfirmedHelp(incident);
    } catch (err) {
      console.error("Help confirmation failed:", err);
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  const confidenceScore = eventData?.confidence_score || 85.0;
  const progressPercent = Math.max(0, (secondsLeft / timeoutSeconds) * 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 6, 15, 0.96)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      zIndex: 30000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'linear-gradient(135deg, rgba(35, 12, 22, 0.98) 0%, rgba(12, 18, 32, 0.98) 100%)',
        border: '3px solid #ff3b5c',
        borderRadius: '24px',
        padding: '36px 28px',
        boxShadow: '0 0 50px rgba(255, 59, 92, 0.5), inset 0 0 30px rgba(255, 59, 92, 0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Urgent Alert Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <EmergencyPulse size={72} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 59, 92, 0.18)',
          border: '1px solid rgba(255, 59, 92, 0.4)',
          padding: '6px 16px',
          borderRadius: '20px',
          color: '#ff6b84',
          fontSize: '0.85rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '14px'
        }}>
          <ShieldAlert size={18} color="#ff3b5c" />
          <span>Safety Assistive Alert</span>
        </div>

        <h1 style={{
          fontSize: '1.85rem',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          marginBottom: '10px',
          textShadow: '0 2px 10px rgba(255,59,92,0.4)'
        }}>
          🚨 POSSIBLE ACCIDENT DETECTED
        </h1>

        <p style={{
          fontSize: '1.02rem',
          color: 'rgba(255, 255, 255, 0.88)',
          lineHeight: 1.5,
          marginBottom: '24px',
          maxWidth: '440px',
          margin: '0 auto 24px auto'
        }}>
          We detected an unusual impact and movement pattern (Confidence: <strong style={{ color: '#ff3b5c' }}>{confidenceScore}%</strong>).
          <br /><strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>Are you okay?</strong>
        </p>

        {/* Countdown Ring Timer Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
          borderRadius: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
              Automatic Escalation Check
            </span>
            <span style={{ color: '#ff4b63', fontWeight: 900, fontSize: '1.1rem' }}>
              {secondsLeft}s
            </span>
          </div>

          <div style={{
            height: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #ff3b5c 0%, #ff803b 100%)',
              transition: 'width 1s linear',
              borderRadius: '5px'
            }} />
          </div>

          <span style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px', display: 'block' }}>
            {autoEscalate 
              ? "If you do not respond, emergency contacts will be notified automatically."
              : "Countdown active. Press 'I NEED HELP' for immediate dispatch."}
          </span>
        </div>

        {/* Core High-Contrast Response Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button
            onClick={handleImOk}
            style={{
              padding: '18px 12px',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: '2px solid #34d399',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <CheckCircle size={26} />
            <span>I'M OK</span>
          </button>

          <button
            onClick={handleNeedHelp}
            style={{
              padding: '18px 12px',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              border: '2px solid #f87171',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.45)',
              transition: 'transform 0.15s ease'
            }}
          >
            <PhoneCall size={26} />
            <span>I NEED HELP</span>
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)' }}>
          * Assistive technology alert. Calls 108 / 112 emergency services and notifies registered family members.
        </div>
      </div>
    </div>
  );
}
