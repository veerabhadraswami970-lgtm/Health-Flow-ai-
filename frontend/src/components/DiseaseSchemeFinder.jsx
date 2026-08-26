import React, { useState } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { Stethoscope, Sparkles, CheckCircle2, ArrowRight, ShieldAlert, FileText, ExternalLink } from 'lucide-react';

const QUICK_DISEASES = [
  "Heart Attack & Angioplasty",
  "Kidney Failure & Hemodialysis",
  "Cancer & Chemotherapy",
  "Brain Stroke & Neurosurgery",
  "Total Knee Replacement",
  "Severe Burn Trauma & ICU"
];

export default function DiseaseSchemeFinder({ t }) {
  const [diseaseQuery, setDiseaseQuery] = useState('');
  const [state, setState] = useState('Telangana');
  const [income, setIncome] = useState(200000);
  const [age, setAge] = useState(48);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  async function handleSearch(term) {
    const q = term || diseaseQuery;
    if (!q) return;
    setLoading(true);
    try {
      const res = await healthflowApi.recommendByDisease({
        disease_or_symptom: q,
        age: parseInt(age, 10),
        state: state,
        annual_income: parseFloat(income),
        category: "BPL"
      });
      setResults(res);
    } catch (err) {
      console.error('Disease recommendation error:', err);
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
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-blue)'
          }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.disease_header || "Disease & Surgery Package Scheme Finder"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.disease_sub || "Identify covered surgical & medical treatment packages under central and state health schemes."}
            </p>
          </div>
        </div>

        <span className="badge badge-central">
          <Sparkles size={12} />
          <span>Ayushman Bharat Surgical Packages</span>
        </span>
      </div>

      {/* Disease Query Input Card */}
      <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-blue)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Enter Diagnosed Condition, Surgery or Clinical Symptom
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input-field"
                placeholder={t.enter_disease_placeholder || "e.g. Heart Bypass, Knee Replacement, Oncology Chemotherapy, Dialysis..."}
                value={diseaseQuery}
                onChange={(e) => setDiseaseQuery(e.target.value)}
                style={{ flex: '1 1 320px', padding: '12px 18px', fontSize: '0.95rem' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !diseaseQuery}
                className="btn btn-cyan"
                style={{ padding: '12px 24px' }}
              >
                <Sparkles size={16} />
                <span>{loading ? 'Analyzing Packages...' : (t.find_matching_schemes || 'Find Covered Packages')}</span>
              </button>
            </div>
          </div>

          {/* Quick Select Chips */}
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
              Frequently Queried Surgical & Medical Packages:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {QUICK_DISEASES.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDiseaseQuery(d);
                    handleSearch(d);
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--hf-radius-full)',
                    fontSize: '0.8rem'
                  }}
                >
                  + {d}
                </button>
              ))}
            </div>
          </div>

          {/* Demographics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--hf-border-subtle)' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Resident State</label>
              <select className="select-field" value={state} onChange={(e) => setState(e.target.value)} style={{ padding: '9px', fontSize: '0.88rem', marginTop: '4px' }}>
                <option value="Telangana" style={{ background: '#0b1325' }}>Telangana</option>
                <option value="Andhra Pradesh" style={{ background: '#0b1325' }}>Andhra Pradesh</option>
                <option value="Tamil Nadu" style={{ background: '#0b1325' }}>Tamil Nadu</option>
                <option value="West Bengal" style={{ background: '#0b1325' }}>West Bengal</option>
                <option value="Delhi" style={{ background: '#0b1325' }}>Delhi</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Annual Income (₹)</label>
              <input type="number" className="input-field" value={income} onChange={(e) => setIncome(e.target.value)} style={{ padding: '9px', fontSize: '0.88rem', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Patient Age</label>
              <input type="number" className="input-field" value={age} onChange={(e) => setAge(e.target.value)} style={{ padding: '9px', fontSize: '0.88rem', marginTop: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--hf-cyan)', fontWeight: 800 }}>
              Identified Coverage Packages for "{diseaseQuery}":
            </h3>
            <span className="badge badge-verified">
              Deterministic Rules Engine
            </span>
          </div>

          <div className="grid-2">
            {results.results?.map((res) => {
              const isEligible = res.status === 'POTENTIALLY_ELIGIBLE';
              return (
                <div
                  key={res.scheme.id}
                  className="hf-3d-card"
                  style={{
                    padding: '24px',
                    borderLeft: '4px solid var(--hf-cyan)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <span className="badge badge-central">{res.scheme.type}</span>
                      <h4 style={{ fontSize: '1.25rem', color: '#ffffff', marginTop: '6px', fontWeight: 800 }}>{res.scheme.name}</h4>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--hf-primary)' }}>
                      {res.scheme.coverage_amount}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>
                    {res.ai_explanation}
                  </p>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--hf-radius-md)' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--hf-cyan)', display: 'block', marginBottom: '6px' }}>
                      Matched Specialty Entitlements:
                    </span>
                    {res.matched_criteria?.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginTop: '2px' }}>
                        <CheckCircle2 size={14} color="var(--hf-primary)" />
                        <span>{c.details}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)' }}>
                      Helpline: {res.scheme.helpline}
                    </span>
                    {res.official_source?.url && (
                      <a
                        href={res.official_source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <span>Empaneled Network</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '16px', borderRadius: 'var(--hf-radius-md)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <ShieldAlert size={22} color="var(--hf-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.84rem', color: '#fef3c7', lineHeight: 1.5 }}>
              <strong>Important Medical & Legal Disclaimer:</strong> {results.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
