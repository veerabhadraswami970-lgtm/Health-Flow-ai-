import React from 'react';
import HealthFlowAIOrb from './3d/HealthFlowAIOrb';
import Prescription3D from './3d/Prescription3D';
import Hospital3D from './3d/Hospital3D';
import BloodDrop3D from './3d/BloodDrop3D';
import HealthcareShield3D from './3d/HealthcareShield3D';
import Medicine3D from './3d/Medicine3D';
import EmergencyPulse from './3d/EmergencyPulse';
import { 
  Sparkles, ArrowRight, ShieldCheck, HeartPulse, Building2, 
  FileText, Activity, Droplet, Pill, AlertCircle, PhoneCall, Mic, QrCode
} from 'lucide-react';

export default function DashboardHome({ t, setActiveTab, onEmergencyClick, role }) {
  const quickActions = [
    {
      id: 'prescription',
      title: 'AI Prescription Scanner',
      desc: 'Multilingual OCR, CDSCO verification & AI dosage insights',
      badge: 'Flagship AI',
      badgeClass: 'badge-cyan',
      component3D: <Prescription3D size={110} />,
      accentColor: 'rgba(0, 242, 254, 0.4)'
    },
    {
      id: 'hospitals',
      title: 'Hospitals & Trauma Centers',
      desc: 'Live 3D spatial map, ICU bed availability & routing',
      badge: 'Live Map',
      badgeClass: 'badge-verified',
      component3D: <Hospital3D size={110} />,
      accentColor: 'rgba(0, 201, 167, 0.4)'
    },
    {
      id: 'blood_bank',
      title: 'Blood Bank Network',
      desc: 'Real-time e-RaktKosh inventory & donor matching',
      badge: 'e-RaktKosh',
      badgeClass: 'badge-danger',
      component3D: <BloodDrop3D size={110} />,
      accentColor: 'rgba(255, 75, 99, 0.4)'
    },
    {
      id: 'schemes',
      title: 'Government Health Schemes',
      desc: 'Ayushman Bharat (PM-JAY), Aarogyasri & instant eligibility',
      badge: 'AB-PMJAY',
      badgeClass: 'badge-central',
      component3D: <HealthcareShield3D size={110} />,
      accentColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 'medicines',
      title: 'Medicine Intelligence',
      desc: 'Generic alternatives, drug interactions & side-effect safety',
      badge: 'CDSCO Verified',
      badgeClass: 'badge-warning',
      component3D: <Medicine3D size={110} />,
      accentColor: 'rgba(245, 158, 11, 0.4)'
    },
    {
      id: 'emergency_action',
      title: 'Emergency SOS Response',
      desc: '1-Tap ambulance dispatch, trauma alerts & ICE contact ping',
      badge: 'Urgent 24/7',
      badgeClass: 'badge-danger',
      component3D: <EmergencyPulse size={100} />,
      accentColor: 'rgba(255, 75, 99, 0.6)',
      isEmergency: true
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Hero Spatial Section */}
      <section className="glass-card" style={{
        padding: '36px 40px',
        borderRadius: 'var(--hf-radius-xl)',
        background: 'linear-gradient(135deg, rgba(14, 25, 48, 0.85) 0%, rgba(6, 11, 20, 0.95) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 35px -10px rgba(0, 242, 254, 0.15)'
      }}>
        {/* Ambient Top Glow Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f2fe, #00c9a7, transparent)',
          opacity: 0.8
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)',
          alignItems: 'center',
          gap: '32px'
        }}>
          {/* Hero Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                <span>Active Role: {role} Persona</span>
              </span>
              <span className="badge badge-verified">
                <ShieldCheck size={13} />
                <span>ABDM & RBAC Secured</span>
              </span>
            </div>

            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Good Morning, <br />
              <span style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #00c9a7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {role === 'Patient' && 'Welcome to your Health Hub.'}
                {role === 'Doctor' && 'Dr. Ramesh Varma (Cardiology).'}
                {role === 'HospitalAdmin' && "NIMS Hospital Admin Center."}
                {role === 'Pharmacist' && 'Apollo Pharmacy Dispensing Desk.'}
                {role === 'DataAdmin' && 'System Super Admin Console.'}
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--hf-text-secondary)', maxWidth: '580px', lineHeight: 1.6 }}>
              {role === 'Patient' && 'Manage your personal health records, AI prescriptions, doctor appointments, emergency SOS, and government welfare schemes.'}
              {role === 'Doctor' && 'View today\'s OPD appointments, search patient medical histories, add clinical diagnosis, and issue signed digital QR prescriptions.'}
              {role === 'HospitalAdmin' && 'Manage hospital profile, ICU bed capacity, empaneled doctors roster, emergency trauma status, and ABDM HFR sync.'}
              {role === 'Pharmacist' && 'Scan prescription QR codes, check CDSCO drug schedules, verify dosages, dispense medicines, and maintain audit records.'}
              {role === 'DataAdmin' && 'Platform governance dashboard for user management, HFR/HPR verifications, system audit logs, and global analytics.'}
            </p>

            {/* Hero Quick CTA Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                onClick={() => setActiveTab('prescription')}
                className="btn btn-cyan"
                style={{ padding: '12px 26px', fontSize: '0.96rem' }}
              >
                <Sparkles size={18} />
                <span>Scan Prescription</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setActiveTab('hospitals')}
                className="btn btn-secondary"
                style={{ padding: '12px 22px', fontSize: '0.96rem' }}
              >
                <Building2 size={18} />
                <span>Find Trauma Centers</span>
              </button>

              <button
                onClick={onEmergencyClick}
                className="btn btn-emergency"
                style={{ padding: '12px 22px', fontSize: '0.96rem' }}
              >
                <HeartPulse size={18} />
                <span>Emergency SOS</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '10px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hf-cyan)' }}>100%</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safety Guardrails</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hf-primary)' }}>3 Languages</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EN • తెలుగు • हिन्दी</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>24/7 Voice & AI</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Healthcare Hub</div>
              </div>
            </div>
          </div>

          {/* Hero Right 3D Medical Orb Experience */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <HealthFlowAIOrb size={320} interactive={true} />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              background: 'rgba(10, 18, 35, 0.8)',
              backdropFilter: 'blur(12px)',
              padding: '6px 14px',
              borderRadius: 'var(--hf-radius-full)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              fontSize: '0.78rem',
              color: 'var(--hf-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }} />
              <span>Spatial AI Core Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Quick Action Cards Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Quick Actions & Healthcare Services</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>Instant access to diagnostic intelligence, emergency networks, and government benefits</p>
          </div>
          <span className="badge badge-cyan">3D Interactive</span>
        </div>

        <div className="grid-3">
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={() => {
                if (action.isEmergency) {
                  onEmergencyClick();
                } else {
                  setActiveTab(action.id);
                }
              }}
              className="hf-3d-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '230px',
                borderLeft: `3px solid ${action.accentColor}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge ${action.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                  {action.badge}
                </span>
                <div style={{ marginTop: '-12px', marginRight: '-12px' }}>
                  {action.component3D}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {action.desc}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--hf-cyan)'
                }}>
                  <span>Launch Module</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Contextual Insights & Healthcare Stream */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {/* ABDM Health Records & QR Verification */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(0, 201, 167, 0.15)',
              border: '1px solid rgba(0, 201, 167, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00c9a7'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>ABDM & Digital Records</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>Cryptographically signed offline QR</p>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
            Access Ayushman Bharat Digital Mission (ABDM) electronic health records, consent-backed doctor sharing, and instant offline emergency QR cards.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setActiveTab('records')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
              <FileText size={16} />
              <span>My Records</span>
            </button>
            <button onClick={() => setActiveTab('qr')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
              <QrCode size={16} />
              <span>QR Scanner</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
