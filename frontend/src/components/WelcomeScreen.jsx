import React, { useState } from 'react';
import { 
  Activity, Shield, Sparkles, ArrowRight, UserCheck, Stethoscope, 
  Building2, Pill, ShieldAlert, CheckCircle, ChevronRight, Lock, Key, HeartPulse 
} from 'lucide-react';
import MedicalCross3D from './3d/MedicalCross3D';

export default function WelcomeScreen({ onSelectRole, onSignInClick, t }) {
  const [showRoleModal, setShowRoleModal] = useState(false);

  const ROLES = [
    {
      id: 'Patient',
      title: 'Patient',
      icon: <UserCheck size={28} color="#00f2fe" />,
      badge: 'Public Access',
      badgeColor: 'badge-cyan',
      description: 'Manage your health, prescriptions, appointments, emergency response, and government welfare schemes.',
      features: ['Find Hospitals & Doctors', 'Book OPD Appointments', 'AI Prescription Scanner', 'Emergency Accident Detection', 'Government Schemes Engine']
    },
    {
      id: 'Doctor',
      title: 'Doctor',
      icon: <Stethoscope size={28} color="#00c9a7" />,
      badge: 'ABDM Verified',
      badgeColor: 'badge-verified',
      description: 'Manage clinical consultations, access authorized patient health records, and issue signed digital QR prescriptions.',
      features: ['Today OPD Appointments', 'Patient History Search', 'Digital Prescription Creator', 'Cryptographic QR Signing', 'HPR Duty Management']
    },
    {
      id: 'HospitalAdmin',
      title: 'Hospital Admin',
      icon: <Building2 size={28} color="#3b82f6" />,
      badge: 'HFR Operations',
      badgeColor: 'badge-central',
      description: 'Manage hospital facility profile, doctor schedules, bed availability, emergency units, and ABDM HFR sync.',
      features: ['ICU & Bed Capacity Tracker', 'Empaneled Doctor Roster', 'Facilities & Emergency Status', 'Hospital Audit Records', 'ABDM HFR Registry Sync']
    },
    {
      id: 'Pharmacist',
      title: 'Pharmacist',
      icon: <Pill size={28} color="#10b981" />,
      badge: 'License Verified',
      badgeColor: 'badge-state',
      description: 'Verify prescription QR codes, inspect CDSCO drug schedules, dispense medications, and log pharmacy audit trails.',
      features: ['Prescription QR Scanner', 'CDSCO Formulary Search', 'Dispense Checklist', 'Schedule H Verification', 'Dispensing Audit History']
    },
    {
      id: 'DataAdmin',
      title: 'Super Admin',
      icon: <Lock size={28} color="#f59e0b" />,
      badge: 'Full Platform Admin',
      badgeColor: 'badge-warning',
      description: 'Platform governance, user verification queues, hospital empanelments, system audit logs, and global analytics.',
      features: ['User & Role Management', 'HFR/HPR Verifications', 'Platform Metrics & Logs', 'Scheme & Formulary Controls', 'System Governance']
    }
  ];

  return (
    <div className="animate-fade-in" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {/* Hero Container */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.85) 0%, rgba(6, 11, 20, 0.95) 100%)',
        border: '1px solid var(--hf-border-glass)',
        padding: '48px 36px',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 242, 254, 0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Glowing Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
          
          {/* Left Column: Hero Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 5 }}>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 242, 254, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0, 242, 254, 0.3)', width: 'fit-content' }}>
              <Activity size={16} color="var(--hf-cyan)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--hf-cyan)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Unified Healthcare Ecosystem
              </span>
            </div>

            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
              Healthcare Without <span style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #00c9a7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Barriers.</span>
            </h1>

            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px' }}>
              Welcome to <strong>HealthFlow AI</strong> — Next-generation AI-powered spatial healthcare platform connecting Patients, Doctors, Hospitals, and Pharmacists with zero-hallucination guardrails and ABDM integration.
            </p>

            {/* Core Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
              <button
                onClick={() => setShowRoleModal(true)}
                className="btn btn-primary"
                style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '14px' }}
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => setShowRoleModal(true)}
                className="btn btn-secondary"
                style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '14px' }}
              >
                <Key size={18} />
                <span>Sign In to Account</span>
              </button>
            </div>

            {/* Compliance Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', pt: '14px', borderTop: '1px solid var(--hf-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>
                <Shield size={14} color="#34d399" />
                <span>ABDM Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>
                <CheckCircle size={14} color="#00f2fe" />
                <span>CDSCO Verified Formulary</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>
                <HeartPulse size={14} color="#ff4b63" />
                <span>Multi-Signal SOS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Visual Card */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5 }}>
            <div className="hf-3d-card" style={{ padding: '36px', textAlign: 'center', width: '100%', maxWidth: '380px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <MedicalCross3D size={150} color={0x00f2fe} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 800, marginBottom: '8px' }}>
                Spatial Healthcare Hub
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', marginBottom: '20px' }}>
                Select your role to access customized clinical tools, emergency services, and medical records.
              </p>
              <button
                onClick={() => setShowRoleModal(true)}
                className="btn btn-cyan"
                style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
              >
                <span>Select Your Role</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Role Selection Modal (Step 2) */}
      {showRoleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="hf-3d-card animate-slide-up" style={{
            maxWidth: '920px',
            width: '100%',
            padding: '36px',
            maxHeight: '92vh',
            overflowY: 'auto',
            border: '1px solid rgba(0, 242, 254, 0.35)'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>STEP 2 • SELECT YOUR ROLE</span>
                <h2 style={{ fontSize: '1.85rem', color: '#ffffff', fontWeight: 800 }}>
                  Choose Your HealthFlow AI Persona
                </h2>
                <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
                  Features and interface will automatically customize based on your selected healthcare role.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--hf-border-subtle)', color: 'var(--hf-text-muted)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
              >
                Close
              </button>
            </div>

            {/* Role Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setShowRoleModal(false);
                    onSelectRole(r.id);
                  }}
                  className="hf-card"
                  style={{
                    padding: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderLeft: `4px solid ${r.id === 'Patient' ? '#00f2fe' : (r.id === 'Doctor' ? '#00c9a7' : (r.id === 'HospitalAdmin' ? '#3b82f6' : (r.id === 'Pharmacist' ? '#10b981' : '#f59e0b')))}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--hf-border-subtle)'
                    }}>
                      {r.icon}
                    </div>
                    <span className={`badge ${r.badgeColor}`}>{r.badge}</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800, marginBottom: '4px' }}>{r.title}</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)', lineHeight: 1.5 }}>
                      "{r.description}"
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--hf-border-subtle)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Included Features:</span>
                    <ul style={{ paddingLeft: '14px', fontSize: '0.78rem', color: 'var(--hf-text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {r.features.slice(0, 3).map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '9px', fontSize: '0.84rem', marginTop: '6px' }}
                  >
                    <span>Enter as {r.title}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
