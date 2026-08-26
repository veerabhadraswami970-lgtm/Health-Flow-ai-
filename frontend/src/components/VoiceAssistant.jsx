import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import { Mic, MicOff, Volume2, Sparkles, Activity, ShieldCheck, Terminal, MessageSquare, Send } from 'lucide-react';

const SAMPLE_VOICE_PROMPTS = [
  { text: "Find government health schemes for heart surgery in Telugu", lang: "te", label: "తెలుగు: గుండె శస్త్రచికిత్స పథకాలు" },
  { text: "Find O positive blood banks in Hyderabad", lang: "en", label: "EN: O+ Blood in Hyderabad" },
  { text: "Find an ABDM cardiologist at NIMS Hospital", lang: "en", label: "EN: Cardiologist at NIMS" },
  { text: "Explain dosage, warnings and uses of Dolo 650", lang: "en", label: "EN: Explain Dolo 650" },
  { text: "आपातकालीन चिकित्सा सहायता चाहिए (Emergency)", lang: "hi", label: "हिन्दी: आपातकालीन सहायता (108)" }
];

export default function VoiceAssistant({ t, lang }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = lang === 'te' ? 'te-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');

      recog.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleSendVoice(text);
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [lang]);

  function toggleListening() {
    if (!recognition) {
      alert("Web Speech API is not supported in this browser. Please use the preset voice prompts or text input.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }

  async function handleSendVoice(textToSend) {
    const text = textToSend || transcript;
    if (!text) return;
    setLoading(true);
    try {
      const res = await healthflowApi.interactVoice({
        transcript: text,
        language: lang,
        user_id: "patient_ravi_kumar"
      });

      // Play audio speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(res.spoken_response);
        utterance.lang = res.detected_language === 'te' ? 'te-IN' : (res.detected_language === 'hi' ? 'hi-IN' : 'en-US');
        window.speechSynthesis.speak(utterance);
      }

      setConversation(prev => [res, ...prev]);
    } catch (err) {
      console.error('Voice interaction error:', err);
    } finally {
      setLoading(false);
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
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-indigo)'
          }}>
            <Mic size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.voice_header || "Multilingual Voice Healthcare AI"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.voice_sub || "Hands-free diagnostic navigation in Telugu, Hindi, and English with audio synthesis."}
            </p>
          </div>
        </div>

        <span className="badge badge-cyan">
          <Sparkles size={12} />
          <span>Speech Recognition & TTS Active</span>
        </span>
      </div>

      {/* Voice Control Core Card */}
      <div className="hf-card" style={{ padding: '36px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--hf-indigo)' }}>
        
        {/* Animated Listening Waveform & Mic Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div
            onClick={toggleListening}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: isListening 
                ? 'radial-gradient(circle at 35% 35%, #ff4b63, #b31028)' 
                : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              border: isListening ? '3px solid #ff7b8d' : '3px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 35px rgba(255, 75, 99, 0.8)' : '0 10px 30px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isListening ? 'scale(1.08)' : 'scale(1)'
            }}
          >
            {isListening ? <MicOff size={38} color="#ffffff" /> : <Mic size={38} color="#ffffff" />}
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 800, marginBottom: '4px' }}>
              {isListening ? "Listening... Speak naturally" : "Click to Speak with HealthFlow Voice AI"}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>
              Supports Telugu (తెలుగు), Hindi (हिन्दी), and Indian English.
            </p>
          </div>

          {/* Biometric Audio Waveform */}
          {isListening && (
            <div className="voice-wave" style={{ marginTop: '6px' }}>
              <div className="wave-bar" style={{ background: 'var(--hf-cyan)' }} />
              <div className="wave-bar" style={{ background: 'var(--hf-primary)' }} />
              <div className="wave-bar" style={{ background: 'var(--hf-indigo)' }} />
              <div className="wave-bar" style={{ background: 'var(--hf-cyan)' }} />
              <div className="wave-bar" style={{ background: 'var(--hf-primary)' }} />
            </div>
          )}
        </div>

        {/* Text Input Fallback Bar */}
        <div style={{ maxWidth: '640px', margin: '28px auto 0 auto', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Or type a healthcare query in Telugu, Hindi, or English..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendVoice()}
            style={{ padding: '12px 18px', fontSize: '0.95rem' }}
          />
          <button
            onClick={() => handleSendVoice()}
            disabled={loading || !transcript}
            className="btn btn-primary"
            style={{ padding: '12px 24px', flexShrink: 0 }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>

        {/* Sample Voice Prompts Chips */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
            Try Instant One-Click Voice Prompts:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {SAMPLE_VOICE_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(p.text);
                  handleSendVoice(p.text);
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: 'var(--hf-radius-full)' }}
              >
                <Sparkles size={12} color="var(--hf-cyan)" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Conversation Transcript Stream */}
      {conversation.length > 0 && (
        <div className="hf-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--hf-cyan)" />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Voice AI Responses ({conversation.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  background: 'rgba(10, 18, 35, 0.75)',
                  padding: '20px',
                  borderRadius: 'var(--hf-radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderLeft: '4px solid var(--hf-cyan)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-central">{msg.detected_intent || 'Query'}</span>
                    <span className="badge badge-verified">Lang: {msg.detected_language?.toUpperCase() || 'EN'}</span>
                  </div>
                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(msg.spoken_response);
                        utterance.lang = msg.detected_language === 'te' ? 'te-IN' : (msg.detected_language === 'hi' ? 'hi-IN' : 'en-US');
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <Volume2 size={13} color="var(--hf-cyan)" />
                    <span>Replay Audio</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.92rem', color: 'var(--hf-text-secondary)' }}>
                  <strong>Your Query:</strong> "{msg.original_transcript}"
                </div>

                <div style={{ background: 'rgba(0, 242, 254, 0.08)', padding: '14px', borderRadius: 'var(--hf-radius-md)', fontSize: '0.95rem', color: '#f8fafc', lineHeight: 1.6, border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                  {msg.spoken_response}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
