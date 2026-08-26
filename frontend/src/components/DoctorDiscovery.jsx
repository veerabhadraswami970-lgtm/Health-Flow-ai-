import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import MedicalCross3D from './3d/MedicalCross3D';
import { UserCheck, Search, MapPin, Calendar, Star, CheckCircle, Clock, Video, Building2, Sparkles, Phone } from 'lucide-react';

export default function DoctorDiscovery({ t, onBookDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, [query, specialty, city, language]);

  async function loadDoctors() {
    setLoading(true);
    try {
      const data = await healthflowApi.searchDoctors({
        query: query || undefined,
        specialty: specialty || undefined,
        city: city || undefined,
        language: language || undefined
      });
      setDoctors(data || []);
    } catch (err) {
      console.error('Doctor search error:', err);
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
            background: 'rgba(0, 201, 167, 0.15)',
            border: '1px solid rgba(0, 201, 167, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-primary)'
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.nav_doctors || "Doctor Discovery & ABDM HPR Registry"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Certified Healthcare Professional Registry (HPR) practitioners with live OPD schedules.
            </p>
          </div>
        </div>

        <span className="badge badge-verified">
          <CheckCircle size={12} />
          <span>ABDM HPR Certified</span>
        </span>
      </div>

      {/* Filters Bar */}
      <div className="hf-card" style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Search Doctor or Hospital</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Ramesh, NIMS, AIIMS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginTop: '6px', padding: '9px 12px', fontSize: '0.88rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Specialty</label>
          <select className="select-field" value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={{ marginTop: '6px', padding: '9px', fontSize: '0.88rem' }}>
            <option value="" style={{ background: '#0b1325' }}>All Specialties</option>
            <option value="Cardiology" style={{ background: '#0b1325' }}>Cardiology</option>
            <option value="Endocrinology" style={{ background: '#0b1325' }}>Endocrinology & Diabetes</option>
            <option value="Pediatrics" style={{ background: '#0b1325' }}>Pediatrics</option>
            <option value="Pulmonology" style={{ background: '#0b1325' }}>Pulmonology</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>City</label>
          <select className="select-field" value={city} onChange={(e) => setCity(e.target.value)} style={{ marginTop: '6px', padding: '9px', fontSize: '0.88rem' }}>
            <option value="" style={{ background: '#0b1325' }}>All Cities</option>
            <option value="Hyderabad" style={{ background: '#0b1325' }}>Hyderabad</option>
            <option value="New Delhi" style={{ background: '#0b1325' }}>New Delhi</option>
            <option value="Visakhapatnam" style={{ background: '#0b1325' }}>Visakhapatnam</option>
            <option value="Bengaluru" style={{ background: '#0b1325' }}>Bengaluru</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Consultation Language</label>
          <select className="select-field" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginTop: '6px', padding: '9px', fontSize: '0.88rem' }}>
            <option value="" style={{ background: '#0b1325' }}>All Languages</option>
            <option value="Telugu" style={{ background: '#0b1325' }}>Telugu</option>
            <option value="Hindi" style={{ background: '#0b1325' }}>Hindi</option>
            <option value="English" style={{ background: '#0b1325' }}>English</option>
            <option value="Kannada" style={{ background: '#0b1325' }}>Kannada</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="grid-2">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="hf-3d-card"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--hf-primary)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 800 }}>{doc.name}</h3>
                  <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle size={11} /> HPR: {doc.hpr_id || doc.id}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--hf-cyan)', fontWeight: 700, marginTop: '2px' }}>
                  {doc.specialty}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>
                  {doc.qualification} • {doc.experience_years} yrs clinical exp
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', padding: '6px 10px', borderRadius: 'var(--hf-radius-md)' }}>
                <Star size={15} color="#f59e0b" fill="#f59e0b" />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>{doc.rating}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--hf-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="var(--hf-cyan)" />
                <span>{doc.hospital_name} ({doc.city}, {doc.state})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--hf-primary)" />
                <span>Languages: {doc.languages.join(', ')}</span>
              </div>
            </div>

            {/* Available Slots Chips */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--hf-radius-md)' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--hf-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Available OPD Slots Today:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {doc.slots.map((s, i) => (
                  <span key={i} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.78rem', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>
                    <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)' }}>OPD Consultation Fee</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  ₹{doc.consultation_fee}
                </div>
              </div>

              <button
                onClick={() => onBookDoctor(doc)}
                className="btn btn-primary"
                style={{ padding: '9px 18px', fontSize: '0.88rem' }}
              >
                <Calendar size={16} />
                <span>Book via UHI Network</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
