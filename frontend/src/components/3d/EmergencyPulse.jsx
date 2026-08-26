import React from 'react';

export default function EmergencyPulse({ size = 160 }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Outer Pulse 1 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '2px solid rgba(255, 75, 99, 0.4)',
        animation: 'hfEmergencyPulseRing 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1)'
      }} />

      {/* Outer Pulse 2 */}
      <div style={{
        position: 'absolute',
        width: '80%',
        height: '80%',
        borderRadius: '50%',
        border: '2px solid rgba(255, 75, 99, 0.6)',
        animation: 'hfEmergencyPulseRing 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s'
      }} />

      {/* Core Glowing Orb */}
      <div style={{
        width: '45%',
        height: '45%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #ff7b8d 0%, #ff4b63 60%, #b31028 100%)',
        boxShadow: '0 0 30px rgba(255, 75, 99, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>

      <style>{`
        @keyframes hfEmergencyPulseRing {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
