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
  FileText, Activity, Droplet, Pill, AlertCircle, PhoneCall, Mic, QrCode,
  Users, CheckCircle2, Award, Heart, Globe, Calendar
} from 'lucide-react';
import '../styles/landing.css';

export default function DashboardHome({ t, setActiveTab, onEmergencyClick, role }) {
  const quickActions = [
    {
      id: 'prescription',
      title: 'AI Prescription Scanner',
      desc: 'Multilingual OCR, CDSCO drug verification & AI dosage insights',
      badge: 'Flagship AI',
      badgeClass: 'badge-teal',
      component3D: <Prescription3D size={110} />,
      accentColor: 'var(--hf-teal)'
    },
    {
      id: 'hospitals',
      title: 'Hospitals & Trauma Centers',
      desc: 'Live 3D spatial map, ICU bed availability & emergency routing',
      badge: 'Live HFR Map',
      badgeClass: 'badge-verified',
      component3D: <Hospital3D size={110} />,
      accentColor: 'var(--hf-sage)'
    },
    {
      id: 'blood_bank',
      title: 'Blood Bank Network',
      desc: 'Real-time e-RaktKosh inventory & donor matching',
      badge: 'e-RaktKosh',
      badgeClass: 'badge-danger',
      component3D: <BloodDrop3D size={110} />,
      accentColor: 'var(--hf-coral)'
    },
    {
      id: 'schemes',
      title: 'Government Health Schemes',
      desc: 'Ayushman Bharat (PM-JAY), Aarogyasri & instant eligibility',
      badge: 'AB-PMJAY',
      badgeClass: 'badge-eligible',
      component3D: <HealthcareShield3D size={110} />,
      accentColor: '#3b82f6'
    },
    {
      id: 'medicines',
      title: 'Medicine Intelligence',
      desc: 'Generic alternatives, drug interactions & side-effect safety',
      badge: 'CDSCO Shield',
      badgeClass: 'badge-gold',
      component3D: <Medicine3D size={110} />,
      accentColor: 'var(--hf-gold)'
    },
    {
      id: 'emergency_action',
      title: 'Emergency SOS Response',
      desc: '1-Tap ambulance dispatch, trauma alerts & ICE contact ping',
      badge: 'Urgent 24/7',
      badgeClass: 'badge-danger',
      component3D: <EmergencyPulse size={100} />,
      accentColor: 'var(--hf-danger-red)',
      isEmergency: true
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Editorial Hero Banner — Matching Overview & Impact Design */}
      <section className="glass-card" style={{
        padding: '40px',
        borderRadius: '32px',
        background: 'linear-gradient(135deg, rgba(15, 110, 105, 0.08) 0%, rgba(217, 79, 61, 0.12) 100%)',
        border: '1px solid rgba(15, 110, 105, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)',
          alignItems: 'center',
          gap: '36px'
        }}>
          {/* Hero Left Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                <span>Active Role: {role} Persona</span>
              </span>
              <span className="badge badge-verified">
                <ShieldCheck size={13} />
                <span>ABDM & RBAC Secured</span>
              </span>
            </div>

            <h1 className="font-editorial-serif" style={{ fontSize: '2.6rem', color: 'var(--hf-ink)', margin: 0, lineHeight: 1.15 }}>
              Good Morning, <br />
              <span style={{ color: 'var(--hf-teal)' }}>
                {role === 'Patient' && 'Welcome to your Health Hub.'}
                {role === 'Doctor' && 'Dr. Ramesh Varma (Cardiology).'}
                {role === 'HospitalAdmin' && "NIMS Hospital Admin Center."}
                {role === 'Pharmacist' && 'Apollo Pharmacy Dispensing Desk.'}
                {role === 'DataAdmin' && 'System Super Admin Console.'}
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--hf-text-secondary)', maxWidth: '580px', lineHeight: 1.65, margin: 0 }}>
              {role === 'Patient' && 'Manage your personal health records, AI prescriptions, doctor appointments, emergency SOS, and government welfare schemes.'}
              {role === 'Doctor' && 'View today\'s OPD appointments, search patient medical histories, add clinical diagnosis, and issue signed digital QR prescriptions.'}
              {role === 'HospitalAdmin' && 'Manage hospital profile, ICU bed capacity, empaneled doctors roster, emergency trauma status, and ABDM HFR sync.'}
              {role === 'Pharmacist' && 'Scan prescription QR codes, check CDSCO drug schedules, verify dosages, dispense medicines, and maintain audit records.'}
              {role === 'DataAdmin' && 'Platform governance dashboard for user management, HFR/HPR verifications, system audit logs, and global analytics.'}
            </p>

            {/* Quick Actions Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                onClick={() => setActiveTab('prescription')}
                className="btn btn-primary"
                style={{ padding: '12px 26px', fontSize: '0.95rem', borderRadius: '9999px' }}
              >
                <Sparkles size={18} />
                <span>Scan Prescription</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setActiveTab('hospitals')}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '9999px' }}
              >
                <Building2 size={18} />
                <span>Trauma Centers</span>
              </button>

              <button
                onClick={onEmergencyClick}
                className="btn btn-emergency"
                style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '9999px' }}
              >
                <HeartPulse size={18} />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>

          {/* Hero Right 3D Spatial Interactive Core */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <HealthFlowAIOrb size={300} interactive={true} />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '8px 18px',
              borderRadius: '9999px',
              border: '1px solid rgba(15, 110, 105, 0.2)',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--hf-teal)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--hf-teal)', boxShadow: '0 0 8px var(--hf-teal)' }} />
              <span>Spatial AI Intelligence Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Glassmorphic Impact Statistics Bar — Matching Overview & Impact */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(15, 110, 105, 0.12)', color: 'var(--hf-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="font-editorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>250,000+</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>Lives Reached</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(45, 115, 101, 0.12)', color: 'var(--hf-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} />
          </div>
          <div>
            <div className="font-editorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>98%</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>Patient Satisfaction</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(217, 79, 61, 0.12)', color: 'var(--hf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="font-editorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>4,500+</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>Empaneled Doctors</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(180, 83, 9, 0.12)', color: 'var(--hf-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="font-editorial-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>12M+</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>Records Digitized</div>
          </div>
        </div>
      </section>

      {/* Quick Action Modules Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 className="font-editorial-serif" style={{ fontSize: '1.6rem', color: 'var(--hf-ink)', margin: 0 }}>
              Healthcare Services & Quick Action Hub
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--hf-text-secondary)', margin: '4px 0 0 0' }}>
              Instant diagnostic intelligence, emergency networks, and government health schemes
            </p>
          </div>
          <span className="badge badge-teal">3D Interactive</span>
        </div>

        <div className="grid-3" style={{ gap: '24px' }}>
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
              className="glass-card"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '250px',
                borderLeft: `4px solid ${action.accentColor}`,
                cursor: 'pointer',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge ${action.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                  {action.badge}
                </span>
                <div style={{ marginTop: '-12px', marginRight: '-12px' }}>
                  {action.component3D}
                </div>
              </div>

              <div>
                <h3 className="font-editorial-serif" style={{ fontSize: '1.3rem', color: 'var(--hf-ink)', marginBottom: '8px' }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {action.desc}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: 'var(--hf-teal)'
                }}>
                  <span>Launch Module</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABDM Records & Digital Consent Banner */}
      <section>
        <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--hf-teal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--hf-teal), var(--hf-sage))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(15, 110, 105, 0.3)'
              }}>
                <QrCode size={26} />
              </div>
              <div>
                <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', margin: 0 }}>
                  Ayushman Bharat Digital Mission (ABDM) Health Records
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--hf-text-secondary)', margin: '4px 0 0 0' }}>
                  Consent-backed EHR records, doctor access management, and cryptographic offline emergency QR tokens.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveTab('records')} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem', borderRadius: '9999px' }}>
                <FileText size={16} />
                <span>My Records</span>
              </button>
              <button onClick={() => setActiveTab('qr')} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem', borderRadius: '9999px' }}>
                <QrCode size={16} />
                <span>Health QR Token</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
