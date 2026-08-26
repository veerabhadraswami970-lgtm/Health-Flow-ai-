import React from 'react';

export default function LocationPulse({ size = 36 }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Sonar Ring 1 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'rgba(0, 242, 254, 0.25)',
        animation: 'hfSonarPulse 2s infinite ease-out'
      }} />

      {/* Sonar Ring 2 */}
      <div style={{
        position: 'absolute',
        width: '70%',
        height: '70%',
        borderRadius: '50%',
        background: 'rgba(0, 201, 167, 0.35)',
        animation: 'hfSonarPulse 2s infinite ease-out 0.5s'
      }} />

      {/* Center Biometric Pin */}
      <div style={{
        width: '38%',
        height: '38%',
        borderRadius: '50%',
        background: '#00f2fe',
        boxShadow: '0 0 12px #00f2fe, 0 0 20px #00c9a7',
        border: '2px solid #ffffff',
        zIndex: 2
      }} />

      <style>{`
        @keyframes hfSonarPulse {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
