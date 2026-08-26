import React, { useState } from 'react';
import { 
  Building2, Bed, Activity, ShieldCheck, UserCheck, 
  Clock, Plus, Save, Phone, MapPin, CheckCircle, HeartPulse, ShieldAlert
} from 'lucide-react';
import Hospital3D from './3d/Hospital3D';

export default function HospitalAdminDashboard({ t }) {
  const [hospitalInfo, setHospitalInfo] = useState({
    name: "Nizam's Institute of Medical Sciences (NIMS)",
    hfr_id: "IN36100029",
    city: "Hyderabad",
    state: "Telangana",
    address: "Punjagutta, Hyderabad, Telangana 500082",
    helpline: "040-23489000",
    emergency_contact: "040-23489108",
    total_beds: 1450,
    icu_beds: 180,
    has_dialysis: true,
    has_emergency: true,
    empaneled_schemes: ["AB-PMJAY", "Aarogyasri (AP/TG)", "RAN"]
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage("Hospital Profile & Trauma Emergency Capacity updated successfully in ABDM HFR Registry!");
    setTimeout(() => setSavedMessage(''), 4000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 10X Editorial Hospital Header Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 110, 105, 0.12) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}>
              <Building2 size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className="font-editorial-serif" style={{ fontSize: '1.85rem', margin: 0 }}>
                  Hospital Administration Portal
                </h2>
                <span className="badge badge-verified">HFR ID: {hospitalInfo.hfr_id}</span>
              </div>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                {hospitalInfo.name} • ABDM Health Facility Registry (HFR) Operations Hub
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-teal" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> Live ABDM HFR Registry Sync
            </span>
          </div>
        </div>
      </div>

      {/* 3D Glassmorphic Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{hospitalInfo.total_beds}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Total Inpatient Beds</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(217, 79, 61, 0.12)', color: 'var(--hf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{hospitalInfo.icu_beds}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Available ICU Beds</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(15, 110, 105, 0.12)', color: 'var(--hf-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>3</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Empaneled Schemes</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>24/7</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Trauma Unit Active</div>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="animate-slide-up" style={{
          background: 'rgba(15, 110, 105, 0.1)',
          border: '1px solid rgba(15, 110, 105, 0.3)',
          color: 'var(--hf-teal)',
          padding: '16px 20px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.95rem',
          fontWeight: 700
        }}>
          <CheckCircle size={22} />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Admin Form */}
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #3b82f6' }}>
        <h3 className="font-editorial-serif" style={{ fontSize: '1.4rem', color: 'var(--hf-ink)', marginBottom: '22px' }}>
          Hospital Profile & Emergency Capacity Management
        </h3>

        <div className="grid-2" style={{ gap: '20px', marginBottom: '28px' }}>
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Facility Name</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.name}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>ABDM HFR ID</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.hfr_id}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, hfr_id: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Total Inpatient Beds</label>
            <input
              type="number"
              className="input-field"
              value={hospitalInfo.total_beds}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, total_beds: parseInt(e.target.value, 10) })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Available ICU Trauma Beds</label>
            <input
              type="number"
              className="input-field"
              value={hospitalInfo.icu_beds}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, icu_beds: parseInt(e.target.value, 10) })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Primary Helpline Phone</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.helpline}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, helpline: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>24/7 Trauma Emergency Contact</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.emergency_contact}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, emergency_contact: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Hospital Address</label>
            <textarea
              className="input-field"
              rows="2"
              value={hospitalInfo.address}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', marginBottom: '28px', background: 'rgba(15, 110, 105, 0.05)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(15, 110, 105, 0.15)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--hf-ink)', fontWeight: 700, fontSize: '0.95rem' }}>
            <input
              type="checkbox"
              checked={hospitalInfo.has_emergency}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, has_emergency: e.target.checked })}
              style={{ accentColor: 'var(--hf-coral)', width: '20px', height: '20px' }}
            />
            <span>24/7 Emergency & Trauma Unit Active</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--hf-ink)', fontWeight: 700, fontSize: '0.95rem' }}>
            <input
              type="checkbox"
              checked={hospitalInfo.has_dialysis}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, has_dialysis: e.target.checked })}
              style={{ accentColor: 'var(--hf-teal)', width: '20px', height: '20px' }}
            />
            <span>Dialysis Unit Available</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '0.95rem' }}>
          <Save size={18} />
          <span>Save & Sync with ABDM HFR Registry</span>
        </button>
      </form>
    </div>
  );
}
