import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import Medicine3D from './3d/Medicine3D';
import { Clock, Bell, Phone, Send, CheckCircle, Pill, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';

export default function MedicineReminders({ t }) {
  const [reminders, setReminders] = useState([]);
  const [triggeredAlert, setTriggeredAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    try {
      const data = await healthflowApi.getPatientReminders('patient_ravi_kumar');
      setReminders(data || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
  }

  async function handleTriggerTest(remId) {
    setLoading(true);
    try {
      const res = await healthflowApi.triggerTestReminder(remId);
      setTriggeredAlert(res);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(res.message);
        window.speechSynthesis.speak(u);
      }
    } catch (err) {
      console.error('Failed to trigger reminder:', err);
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
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-warning)'
          }}>
            <Bell size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.reminders_header || "Smart Medication Schedule & Audio Adherence"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.reminders_sub || "Automated SMS, outbound voice call & app notifications synchronized from prescription scans."}
            </p>
          </div>
        </div>

        <span className="badge badge-warning">
          <Sparkles size={12} />
          <span>Automated Telephony & Audio Adherence</span>
        </span>
      </div>

      {triggeredAlert && (
        <div className="hf-card animate-slide-up" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(10, 18, 35, 0.85) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          padding: '20px',
          borderRadius: 'var(--hf-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={22} color="var(--hf-warning)" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
              Simulated Voice Call / SMS Dispatched:
            </span>
            <div style={{ fontSize: '1rem', color: '#ffffff', marginTop: '2px', fontWeight: 600 }}>
              {triggeredAlert.message}
            </div>
          </div>
        </div>
      )}

      {/* Daily Medication Timeline */}
      <div className="grid-2">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className="hf-3d-card"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--hf-warning)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--hf-warning)" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{rem.time_of_day}</span>
                  <span className="badge badge-warning">{rem.meal_relation}</span>
                </div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--hf-cyan)', marginTop: '4px', fontWeight: 800 }}>
                  {rem.medicine_name}
                </h4>
                <span style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
                  Prescribed Dosage: <strong>{rem.dosage}</strong>
                </span>
              </div>

              <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                {rem.channel}
              </span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)' }}>
                Derived from Prescription
              </span>
              <button
                onClick={() => handleTriggerTest(rem.id)}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Send size={13} />
                <span>{t.test_reminder_btn || "Test Voice Dispatch"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
