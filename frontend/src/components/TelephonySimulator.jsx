import React, { useState } from 'react';
import { healthflowApi } from '../services/api';
import { PhoneCall, PhoneOff, Key, ShieldCheck, ShieldAlert, Volume2, Hash, Play, UserCheck, Activity, Sparkles, Radio } from 'lucide-react';

export default function TelephonySimulator({ t }) {
  const [callerPhone, setCallerPhone] = useState('+919876543210');
  const [callActive, setCallActive] = useState(false);
  const [callSid, setCallSid] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [speechInput, setSpeechInput] = useState('');
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleStartCall() {
    setLoading(true);
    try {
      const sid = `CA_sim_${Date.now().toString(36)}`;
      setCallSid(sid);
      const res = await healthflowApi.telephonyIncomingCall({
        CallSid: sid,
        From: callerPhone,
        To: "+918001234567"
      });

      setCallActive(true);
      setCurrentPrompt(res.ResponseText);
      setCurrentState(res.NextState);
      setCallLogs([`[CONNECTED] Inbound call from ${callerPhone}`, `[IVR] ${res.ResponseText}`]);
      speakText(res.ResponseText);
    } catch (err) {
      console.error('Call failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePressDigit(digit) {
    if (!callActive) return;
    setLoading(true);
    try {
      const res = await healthflowApi.telephonyIncomingCall({
        CallSid: callSid,
        From: callerPhone,
        To: "+918001234567",
        Digits: digit.toString()
      });

      setCurrentPrompt(res.ResponseText);
      setCurrentState(res.NextState);
      setCallLogs(prev => [...prev, `[USER PRESSED KEY ${digit}]`, `[IVR] ${res.ResponseText}`]);
      speakText(res.ResponseText);
    } catch (err) {
      console.error('Digit handling error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPin() {
    if (!pinInput || !callActive) return;
    setLoading(true);
    try {
      const res = await healthflowApi.telephonyVerifyPin({
        call_sid: callSid,
        phone_number: callerPhone,
        pin: pinInput
      });

      setCurrentPrompt(res.response_text);
      setCallLogs(prev => [...prev, `[ENTERED PIN ****]`, `[IVR] ${res.response_text}`]);
      speakText(res.response_text);
      setPinInput('');
    } catch (err) {
      console.error('PIN verification error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendSpeech() {
    if (!speechInput || !callActive) return;
    setLoading(true);
    try {
      const res = await healthflowApi.telephonyIncomingCall({
        CallSid: callSid,
        From: callerPhone,
        To: "+918001234567",
        SpeechResult: speechInput
      });

      setCurrentPrompt(res.ResponseText);
      setCurrentState(res.NextState);
      setCallLogs(prev => [...prev, `[CALLER SAID] "${speechInput}"`, `[IVR] ${res.ResponseText}`]);
      speakText(res.ResponseText);
      setSpeechInput('');
    } catch (err) {
      console.error('Speech error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleEndCall() {
    setCallActive(false);
    setCallLogs(prev => [...prev, `[CALL COMPLETED / HUNG UP]`]);
    setCurrentPrompt('Call ended. The telephony session has been safely closed.');
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-blue)'
          }}>
            <PhoneCall size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.telephony_header || "Feature Phone & Low-Literacy Telephony IVR"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.telephony_sub || "Zero-smartphone accessible IVR voice simulator with PIN verification and automated rural triage."}
            </p>
          </div>
        </div>

        <span className="badge badge-central">
          <Radio size={12} />
          <span>Rural IVR Telephony Gateway</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Virtual Feature Phone Console */}
        <div className="hf-3d-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: callActive ? '4px solid var(--hf-primary)' : '4px solid var(--hf-danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Virtual Feature Phone Console
            </span>
            <span className={`badge ${callActive ? 'badge-verified' : 'badge-danger'}`}>
              {callActive ? '● CALL IN PROGRESS' : 'DISCONNECTED'}
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Caller Phone Number (Simulated Ingress)</label>
            <input
              type="text"
              className="input-field"
              value={callerPhone}
              onChange={(e) => setCallerPhone(e.target.value)}
              disabled={callActive}
              style={{ marginTop: '6px', fontFamily: 'var(--hf-font-mono)' }}
            />
          </div>

          {!callActive ? (
            <button
              onClick={handleStartCall}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '14px', fontSize: '1rem', width: '100%' }}
            >
              <PhoneCall size={20} />
              <span>{loading ? 'Connecting Cellular Ingress...' : (t.dial_call_btn || "Place Test Incoming Call")}</span>
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="btn btn-emergency"
              style={{ padding: '14px', fontSize: '1rem', width: '100%' }}
            >
              <PhoneOff size={20} />
              <span>Hang Up Call</span>
            </button>
          )}

          {/* Interactive DTMF Keypad */}
          <div>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--hf-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              IVR Keypad Digits:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((d) => (
                <button
                  key={d}
                  onClick={() => handlePressDigit(d)}
                  disabled={!callActive || loading}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--hf-border-subtle)',
                    color: '#ffffff',
                    padding: '14px',
                    borderRadius: 'var(--hf-radius-md)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    cursor: callActive ? 'pointer' : 'not-allowed',
                    opacity: callActive ? 1 : 0.35,
                    transition: 'all 0.15s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Voice PIN Verification Station */}
          {callActive && currentState === 'AWAITING_PIN' && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '16px', borderRadius: 'var(--hf-radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fef3c7' }}>
                  Voice Security Challenge (PIN: 1234 for Ravi Kumar)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  maxLength="4"
                  className="input-field"
                  placeholder="4-digit PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  style={{ padding: '8px', textAlign: 'center', fontSize: '1rem', letterSpacing: '4px' }}
                />
                <button
                  onClick={handleVerifyPin}
                  disabled={loading || !pinInput}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  {t.submit_pin || "Submit PIN"}
                </button>
              </div>
            </div>
          )}

          {/* Caller Speech Input */}
          {callActive && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Say Something to Voice Agent:</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Find O positive blood, I need a cardiologist..."
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSpeech()}
                  style={{ padding: '9px', fontSize: '0.88rem' }}
                />
                <button
                  onClick={handleSendSpeech}
                  disabled={loading || !speechInput}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', flexShrink: 0 }}
                >
                  Speak
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Call Audio Output & Transcription Log */}
        <div className="hf-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
            Live Telephony Speaker & IVR Stream
          </h3>

          {/* Current Spoken Prompt */}
          <div style={{ background: 'rgba(0, 201, 167, 0.1)', border: '1px solid rgba(0, 201, 167, 0.3)', padding: '18px', borderRadius: 'var(--hf-radius-md)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Volume2 size={24} color="var(--hf-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--hf-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Audio Spoken to Caller:
              </span>
              <div style={{ fontSize: '0.98rem', color: '#f8fafc', fontWeight: 500, lineHeight: 1.5 }}>
                {currentPrompt || "No active call connected. Click 'Place Test Incoming Call' to start."}
              </div>
            </div>
          </div>

          {/* Call Logs Stream */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--hf-text-muted)', textTransform: 'uppercase' }}>
                Telephony Event & Webhook Activity:
              </span>
              <button
                onClick={async () => {
                  try {
                    const logs = await healthflowApi.getTelephonyCallLogs();
                    const formatted = logs.map(l => `[LOG] ${JSON.stringify(l)}`);
                    setCallLogs(prev => [...prev, ...formatted]);
                  } catch (err) {
                    console.error('Failed to fetch call logs:', err);
                  }
                }}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                Refresh Webhooks
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.45)', padding: '16px', borderRadius: 'var(--hf-radius-md)', height: '280px', overflowY: 'auto', fontFamily: 'var(--hf-font-mono)', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--hf-border-subtle)' }}>
              {callLogs.map((log, i) => (
                <div key={i} style={{ color: log.startsWith('[USER') ? '#60a5fa' : (log.startsWith('[IVR') ? '#34d399' : (log.startsWith('[LOG') ? '#fbbf24' : '#94a3b8') ) }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
