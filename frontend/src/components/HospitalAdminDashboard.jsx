import React, { useState } from 'react';
import { 
  Building2, Bed, Activity, ShieldCheck, UserCheck, 
  Clock, Plus, Save, Phone, MapPin, CheckCircle 
} from 'lucide-react';

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
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Hospital Administration Portal
              </h2>
              <span className="badge badge-verified">HFR ID: {hospitalInfo.hfr_id}</span>
            </div>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {hospitalInfo.name} • ABDM Health Facility Registry Operations & ICU Capacity Hub.
            </p>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="animate-slide-up" style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          padding: '14px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={20} />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Admin Form */}
      <form onSubmit={handleSave} className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-blue)' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 800, marginBottom: '20px' }}>
          Hospital Profile & Bed Capacity Management
        </h3>

        <div className="grid-2" style={{ gap: '18px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Facility Name</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.name}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>ABDM HFR ID</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.hfr_id}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, hfr_id: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Total Inpatient Beds</label>
            <input
              type="number"
              className="input-field"
              value={hospitalInfo.total_beds}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, total_beds: parseInt(e.target.value, 10) })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Available ICU Trauma Beds</label>
            <input
              type="number"
              className="input-field"
              value={hospitalInfo.icu_beds}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, icu_beds: parseInt(e.target.value, 10) })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Primary Helpline</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.helpline}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, helpline: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>24/7 Trauma Emergency Contact</label>
            <input
              type="text"
              className="input-field"
              value={hospitalInfo.emergency_contact}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, emergency_contact: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Hospital Address</label>
            <textarea
              className="input-field"
              rows="2"
              value={hospitalInfo.address}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#f8fafc', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={hospitalInfo.has_emergency}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, has_emergency: e.target.checked })}
              style={{ accentColor: 'var(--hf-danger)', width: '18px', height: '18px' }}
            />
            <span>24/7 Emergency & Trauma Unit Active</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#f8fafc', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={hospitalInfo.has_dialysis}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, has_dialysis: e.target.checked })}
              style={{ accentColor: 'var(--hf-primary)', width: '18px', height: '18px' }}
            />
            <span>Dialysis Unit Available</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.92rem' }}>
          <Save size={18} />
          <span>Save & Sync with ABDM HFR Registry</span>
        </button>
      </form>
    </div>
  );
}
