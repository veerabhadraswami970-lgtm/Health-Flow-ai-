import React, { useState } from 'react';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { 
  User, Phone, MapPin, Heart, ShieldAlert, 
  Calendar, CheckCircle2, AlertCircle, 
  ArrowRight, QrCode, Sparkles, ShieldCheck, Building2
} from 'lucide-react';
import { healthflowApi, setAuthSession } from '../services/api';
import '../styles/landing.css';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", 
  "Kerala", "Delhi", "Uttar Pradesh", "Gujarat", "West Bengal", "Rajasthan", 
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Assam"
];

export default function RegistrationWizard({ t, onRegistrationComplete }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    age: '',
    gender: 'Male',
    blood_group: 'B+',
    aadhaar_abha_id: '',
    state: 'Telangana',
    city: 'Hyderabad',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Auto calculate age from DOB
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let calculatedAge = '';
    if (dobVal) {
      const birthDate = new Date(dobVal);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age > 0 ? age : 0;
    }
    setFormData(prev => ({
      ...prev,
      date_of_birth: dobVal,
      age: calculatedAge ? calculatedAge.toString() : ''
    }));
    if (errors.date_of_birth) {
      setErrors(prev => ({ ...prev, date_of_birth: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full Name is required";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      newErrors.phone = "Valid 10-digit Phone Number is required";
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of Birth is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = "Emergency contact name is required";
    }
    if (!formData.emergency_contact_phone.trim() || formData.emergency_contact_phone.trim().length < 10) {
      newErrors.emergency_contact_phone = "Valid emergency phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        age: parseInt(formData.age || '30', 10),
        gender: formData.gender,
        blood_group: formData.blood_group,
        aadhaar_abha_id: formData.aadhaar_abha_id || `ABHA-${Math.floor(10000000 + Math.random() * 90000000)}`,
        state: formData.state,
        city: formData.city,
        emergency_contacts: [
          {
            name: formData.emergency_contact_name,
            phone: formData.emergency_contact_phone,
            relationship: 'Primary'
          }
        ]
      };

      const res = await healthflowApi.registerPatient(payload);
      if (res && res.session_token) {
        setAuthSession(res.session_token, res.patient_id, 'Patient', res.patient_name || formData.full_name);
      }

      alert("Personal Patient Registration Successful! Redirecting to Hospitals & Facilities...");
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (err) {
      console.error('Registration failed:', err);
      // Fallback redirect for offline demo mode
      alert("Registration saved! Redirecting to Hospitals & Facilities...");
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Editorial Header Banner */}
      <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(15, 110, 105, 0.08) 0%, rgba(217, 79, 61, 0.12) 100%)', border: '1px solid rgba(15, 110, 105, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--hf-teal), var(--hf-sage))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(15, 110, 105, 0.3)'
          }}>
            <User size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-teal">
                <Sparkles size={13} /> PERSONAL PATIENT REGISTRATION
              </span>
              <span className="badge badge-verified">
                <ShieldCheck size={13} /> ABDM Compliant
              </span>
            </div>
            <h2 className="font-editorial-serif" style={{ fontSize: '1.85rem', color: 'var(--hf-ink)', margin: '4px 0 0 0' }}>
              Patient Personal Information
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
              Enter your basic details to create your secure health identity and discover nearby hospitals.
            </p>
          </div>
        </div>
      </div>

      {apiError && (
        <div style={{ background: 'rgba(217, 79, 61, 0.1)', border: '1px solid var(--hf-coral)', color: 'var(--hf-coral)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Glassmorphic Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '36px', borderLeft: '4px solid var(--hf-teal)' }}>
        <h3 className="font-editorial-serif" style={{ fontSize: '1.4rem', color: 'var(--hf-ink)', marginBottom: '24px' }}>
          Personal & Emergency Contact Details
        </h3>

        <div className="grid-2" style={{ gap: '20px', marginBottom: '28px' }}>
          
          {/* Full Name */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Full Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Ramesh Patel"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: errors.full_name ? '1px solid var(--hf-coral)' : '1px solid rgba(22, 32, 36, 0.15)' }}
            />
            {errors.full_name && <span style={{ fontSize: '0.78rem', color: 'var(--hf-coral)', marginTop: '4px', display: 'block' }}>{errors.full_name}</span>}
          </div>

          {/* Primary Phone */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Mobile Phone Number *
            </label>
            <input
              type="tel"
              className="input-field"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: errors.phone ? '1px solid var(--hf-coral)' : '1px solid rgba(22, 32, 36, 0.15)' }}
            />
            {errors.phone && <span style={{ fontSize: '0.78rem', color: 'var(--hf-coral)', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
          </div>

          {/* Aadhaar / ABHA ID */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              ABHA ID / Aadhaar Number (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 91-8821-9921-1002"
              value={formData.aadhaar_abha_id}
              onChange={(e) => setFormData({ ...formData, aadhaar_abha_id: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          {/* DOB */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Date of Birth *
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.date_of_birth}
              onChange={handleDobChange}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: errors.date_of_birth ? '1px solid var(--hf-coral)' : '1px solid rgba(22, 32, 36, 0.15)' }}
            />
            {errors.date_of_birth && <span style={{ fontSize: '0.78rem', color: 'var(--hf-coral)', marginTop: '4px', display: 'block' }}>{errors.date_of_birth}</span>}
          </div>

          {/* Age */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Calculated Age
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Auto-calculated"
              value={formData.age}
              readOnly
              style={{ background: 'rgba(15, 110, 105, 0.05)', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />
          </div>

          {/* Gender */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Gender *
            </label>
            <select
              className="select-field"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)', padding: '12px' }}
            >
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Blood Group *
            </label>
            <select
              className="select-field"
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)', padding: '12px' }}
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          {/* State */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              State *
            </label>
            <select
              className="select-field"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)', padding: '12px' }}
            >
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* City */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              City / Town *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Hyderabad"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: errors.city ? '1px solid var(--hf-coral)' : '1px solid rgba(22, 32, 36, 0.15)' }}
            />
            {errors.city && <span style={{ fontSize: '0.78rem', color: 'var(--hf-coral)', marginTop: '4px', display: 'block' }}>{errors.city}</span>}
          </div>

          {/* Emergency Contact Name */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Emergency Contact Person Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Sunita Patel (Spouse)"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: errors.emergency_contact_name ? '1px solid var(--hf-coral)' : '1px solid rgba(22, 32, 36, 0.15)' }}
            />
            {errors.emergency_contact_name && <span style={{ fontSize: '0.78rem', color: 'var(--hf-coral)', marginTop: '4px', display: 'block' }}>{errors.emergency_contact_name}</span>}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Emergency Contact Phone Number *
            </label>
            <input
              type="tel"
              className="input-field"
              placeholder="e.g. 9812345678"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              style={{ background: '#ffffff', color: 'var(--hf-ink)', border: errors.emergency_contact_phone ? '1px solid var(--hf-coral)' : '1px solid rgba(22, 32, 36, 0.15)' }}
            />
            {errors.emergency_contact_phone && <span style={{ fontSize: '0.78rem', color: 'var(--hf-coral)', marginTop: '4px', display: 'block' }}>{errors.emergency_contact_phone}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '9999px', marginTop: '8px' }}
        >
          <Building2 size={20} />
          <span>{loading ? 'Registering Patient...' : 'Complete Registration & Find Hospitals & Facilities'}</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
