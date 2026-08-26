import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { CheckCircle, AlertTriangle, XCircle, ExternalLink, Phone, FileText, Award, ShieldCheck, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function SchemeFinder({ t }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Eligibility Form State
  const [age, setAge] = useState(48);
  const [income, setIncome] = useState(180000);
  const [state, setState] = useState('Telangana');
  const [category, setCategory] = useState('BPL / White Ration Card');
  const [disease, setDisease] = useState('Diabetes Type 2');
  const [autoFilled, setAutoFilled] = useState(false);
  
  // Results
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadSchemes();
    autoPopulateFromProfile();
  }, [selectedState, selectedType]);

  async function autoPopulateFromProfile() {
    try {
      const patientId = localStorage.getItem('hf_patient_id') || 'patient_ravi_kumar';
      const prof = await healthflowApi.getPatientProfile(patientId);
      if (prof) {
        if (prof.age) setAge(prof.age);
        if (prof.state) setState(prof.state);
        if (prof.existing_diseases && prof.existing_diseases.length > 0) {
          setDisease(prof.existing_diseases.join(', '));
        }
        setAutoFilled(true);
      }
    } catch (err) {
      console.warn("Could not auto-populate profile in scheme finder:", err);
    }
  }

  async function loadSchemes() {
    setLoading(true);
    try {
      const data = await healthflowApi.getSchemes(selectedState, selectedType);
      setSchemes(data || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckEligibility(e) {
    if (e) e.preventDefault();
    setEvaluating(true);
    try {
      const res = await healthflowApi.checkEligibility({
        age: parseInt(age, 10),
        annual_income: parseFloat(income),
        state: state,
        category: category,
        disease: disease || undefined
      });
      setEligibilityResult(res);
    } catch (err) {
      console.error('Eligibility check error:', err);
    } finally {
      setEvaluating(false);
    }
  }

  const filteredSchemes = schemes.filter(s => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header & Subtitle */}
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
            <Award size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.scheme_header || "Government Health Schemes & AB-PMJAY"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.scheme_sub || "Central & State welfare schemes with deterministic eligibility evaluation."}
            </p>
          </div>
        </div>

        <span className="badge badge-central">
          <ShieldCheck size={12} />
          <span>Ayushman Bharat Verified</span>
        </span>
      </div>

      {/* Interactive Rules-Based Eligibility Engine Calculator Card */}
      <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--hf-cyan)" />
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Instant Rules-Based Eligibility Engine</h3>
          </div>
          <span className="badge badge-verified">Deterministic Verification</span>
        </div>

        {autoFilled && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '18px',
            fontSize: '0.85rem',
            color: '#93c5fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>✨ Auto-populated from your registered HealthFlow Patient Profile (Age: {age}, State: {state}, Conditions: {disease || 'None'}).</span>
            <button type="button" onClick={handleCheckEligibility} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.76rem', color: '#93c5fd', borderColor: '#93c5fd' }}>
              Auto Check Schemes
            </button>
          </div>
        )}

        <form onSubmit={handleCheckEligibility} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
              {t.age_label || "Patient Age"}
            </label>
            <input
              type="number"
              className="input-field"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="0"
              max="120"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
              {t.annual_income_label || "Annual Household Income (₹)"}
            </label>
            <input
              type="number"
              className="input-field"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              min="0"
              step="10000"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
              {t.select_state || "State of Residence"}
            </label>
            <select
              className="select-field"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="All India" style={{ background: '#0b1325' }}>All India</option>
              <option value="Telangana" style={{ background: '#0b1325' }}>Telangana</option>
              <option value="Andhra Pradesh" style={{ background: '#0b1325' }}>Andhra Pradesh</option>
              <option value="Tamil Nadu" style={{ background: '#0b1325' }}>Tamil Nadu</option>
              <option value="West Bengal" style={{ background: '#0b1325' }}>West Bengal</option>
              <option value="Delhi" style={{ background: '#0b1325' }}>Delhi</option>
              <option value="Karnataka" style={{ background: '#0b1325' }}>Karnataka</option>
              <option value="Maharashtra" style={{ background: '#0b1325' }}>Maharashtra</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
              {t.category_label || "Socio-Economic Category"}
            </label>
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="BPL / White Ration Card" style={{ background: '#0b1325' }}>BPL / White Ration Card</option>
              <option value="SECC Deprived" style={{ background: '#0b1325' }}>SECC Deprived</option>
              <option value="Antyodaya Anna Yojana (AAY)" style={{ background: '#0b1325' }}>Antyodaya Anna Yojana (AAY)</option>
              <option value="SC / ST" style={{ background: '#0b1325' }}>SC / ST</option>
              <option value="OBC" style={{ background: '#0b1325' }}>OBC</option>
              <option value="General" style={{ background: '#0b1325' }}>General</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
              Disease / Medical Condition (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Heart Surgery, Dialysis, Oncology Chemotherapy, Kidney Transplant..."
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={evaluating}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {evaluating ? 'Evaluating Scheme Rules & Guidelines...' : (t.check_eligibility_btn || 'Check My Scheme Eligibility')}
            </button>
          </div>
        </form>

        {/* Eligibility Results Breakdown */}
        {eligibilityResult && (
          <div style={{ marginTop: '26px', borderTop: '1px solid var(--hf-border-subtle)', paddingTop: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ fontSize: '1.2rem', color: 'var(--hf-primary)', fontWeight: 800 }}>
                Evaluation Results: {eligibilityResult.matched_count} Potential Match(es)
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>
                Evaluated {eligibilityResult.total_evaluated} official schemes
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {eligibilityResult.results.map((res) => {
                const isEligible = res.status === 'POTENTIALLY_ELIGIBLE';
                const isPartial = res.status === 'PARTIALLY_ELIGIBLE';
                return (
                  <div
                    key={res.scheme.id}
                    className="glass-card"
                    style={{
                      background: isEligible ? 'rgba(0, 201, 167, 0.08)' : (isPartial ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 75, 99, 0.05)'),
                      border: `1px solid ${isEligible ? 'rgba(0, 201, 167, 0.35)' : (isPartial ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 75, 99, 0.25)')}`,
                      borderRadius: 'var(--hf-radius-md)',
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff' }}>{res.scheme.name}</span>
                          <span className={`badge ${isEligible ? 'badge-eligible' : (isPartial ? 'badge-warning' : 'badge-danger')}`}>
                            {isEligible ? (t.potentially_eligible || 'Potentially Eligible') : (isPartial ? (t.partially_eligible || 'Partially Eligible') : (t.not_eligible || 'Not Eligible'))} ({res.match_score}%)
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', marginTop: '6px' }}>
                          {res.ai_explanation}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--hf-primary)' }}>
                          {res.scheme.coverage_amount}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Details */}
                    <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', display: 'block', marginBottom: '6px' }}>
                          MATCHED CRITERIA ({res.matched_criteria?.length || 0})
                        </span>
                        {res.matched_criteria?.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginTop: '3px' }}>
                            <CheckCircle size={14} color="var(--hf-primary)" />
                            <span>{c.details}</span>
                          </div>
                        ))}
                      </div>

                      {res.unmet_criteria?.length > 0 && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ff7b8d', display: 'block', marginBottom: '6px' }}>
                            UNMET CRITERIA ({res.unmet_criteria.length})
                          </span>
                          {res.unmet_criteria.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginTop: '3px' }}>
                              <XCircle size={14} color="var(--hf-danger)" />
                              <span>{c.details}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Required Documents Checklist */}
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--hf-text-muted)' }}>Documents:</span>
                      {res.required_documents?.map((doc, i) => (
                        <span key={i} style={{ fontSize: '0.76rem', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '6px' }}>
                          {doc}
                        </span>
                      ))}
                      {res.official_source?.url && (
                        <a
                          href={res.official_source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '0.76rem' }}
                        >
                          <span>Official Portal</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--hf-text-muted)', fontStyle: 'italic' }}>
              * {eligibilityResult.disclaimer}
            </p>
          </div>
        )}
      </div>

      {/* Directory of Verified Schemes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Verified Government Health Schemes ({filteredSchemes.length})</h3>
          
          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              placeholder={t.search_schemes_placeholder || "Search schemes..."}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ width: '260px', padding: '8px 14px', fontSize: '0.88rem' }}
            />
            <select
              className="select-field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: '140px', padding: '8px', fontSize: '0.88rem' }}
            >
              <option value="" style={{ background: '#0b1325' }}>All Types</option>
              <option value="Central" style={{ background: '#0b1325' }}>Central</option>
              <option value="State" style={{ background: '#0b1325' }}>State</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          {filteredSchemes.map((s) => (
            <div key={s.id} className="hf-3d-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className={`badge ${s.type === 'Central' ? 'badge-central' : 'badge-state'}`}>
                      {s.type} • {s.state}
                    </span>
                    <span className="badge badge-verified">
                      <ShieldCheck size={12} /> {s.data_version}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>{s.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--hf-text-secondary)' }}>{s.department}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0, 201, 167, 0.1)', padding: '12px 16px', borderRadius: 'var(--hf-radius-md)', border: '1px solid rgba(0, 201, 167, 0.25)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--hf-primary)', textTransform: 'uppercase', fontWeight: 800 }}>
                  {t.coverage_label || "Annual Family Health Coverage"}:
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#00c9a7' }}>
                  {s.coverage_amount}
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>
                {s.summary}
              </p>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--hf-text-primary)', display: 'block', marginBottom: '6px' }}>
                  {t.benefits_label || "Key Health Benefits"}:
                </span>
                <ul style={{ paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--hf-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {s.benefits?.slice(0, 3).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--hf-primary)' }}>
                  <Phone size={14} />
                  <span>{t.helpline || "Toll-Free"}: <strong>{s.helpline}</strong></span>
                </div>

                <a
                  href={s.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  <span>{t.apply_portal || "Official Portal"}</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Source: {s.source_organization}</span>
                <span>{t.last_verified || "Verified"}: {new Date(s.last_verified).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
