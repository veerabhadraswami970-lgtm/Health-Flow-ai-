import React from 'react';
import { Activity, ShieldAlert, Globe, UserCheck, HeartPulse, Sparkles } from 'lucide-react';

export default function Navbar({ lang, setLang, t, onEmergencyClick, role, setRole, activeTab, setActiveTab, onShowWelcomeScreen }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--hf-border-glass)',
      background: 'rgba(6, 11, 20, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Brand with 3D glowing pulse */}
        <div 
          onClick={() => setActiveTab && setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #00c9a7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Activity color="#030712" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'var(--hf-font-heading)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {t.app_title || "HealthFlow AI"}
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                PROD v2.0 3D
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--hf-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={11} color="var(--hf-cyan)" />
              <span>{t.tagline}</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Welcome Screen / Role Selector Button */}
          {onShowWelcomeScreen && (
            <button
              onClick={onShowWelcomeScreen}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <span>Onboarding / Switch Role</span>
            </button>
          )}

          {/* Language Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(18, 30, 56, 0.7)',
            padding: '6px 12px',
            borderRadius: 'var(--hf-radius-md)',
            border: '1px solid var(--hf-border-subtle)',
            backdropFilter: 'blur(10px)'
          }}>
            <Globe size={16} color="var(--hf-cyan)" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--hf-text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--hf-font-heading)'
              }}
            >
              <option value="en" style={{ background: '#0b1325' }}>English (EN)</option>
              <option value="te" style={{ background: '#0b1325' }}>తెలుగు (Telugu)</option>
              <option value="hi" style={{ background: '#0b1325' }}>हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Active Role Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(18, 30, 56, 0.7)',
            padding: '6px 12px',
            borderRadius: 'var(--hf-radius-md)',
            border: '1px solid var(--hf-border-subtle)',
            backdropFilter: 'blur(10px)'
          }}>
            <UserCheck size={16} color="var(--hf-primary)" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--hf-text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--hf-font-heading)'
              }}
            >
              <option value="Patient" style={{ background: '#0b1325' }}>Role: Patient</option>
              <option value="Doctor" style={{ background: '#0b1325' }}>Role: Doctor (ABDM)</option>
              <option value="Pharmacist" style={{ background: '#0b1325' }}>Role: Pharmacist</option>
              <option value="HospitalAdmin" style={{ background: '#0b1325' }}>Role: Hospital Admin</option>
              <option value="DataAdmin" style={{ background: '#0b1325' }}>Role: Data Admin</option>
            </select>
          </div>

          {/* Emergency SOS Trigger Button */}
          <button
            onClick={onEmergencyClick}
            className="btn btn-emergency"
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          >
            <ShieldAlert size={18} />
            <span>{t.emergency_btn || "EMERGENCY SOS"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
