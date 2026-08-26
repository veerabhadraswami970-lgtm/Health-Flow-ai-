import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { FolderLock, ShieldCheck, ShieldAlert, CheckCircle, XCircle, FileText, UserCheck, Clock, Lock, Activity, AlertTriangle, Phone, Building, Pill, Calendar, Heart, Sparkles } from 'lucide-react';

export default function HealthRecords({ t }) {
  const [activeSubTab, setActiveSubTab] = useState('documents'); // 'documents' | 'history' | 'profile'
  const [records, setRecords] = useState([]);
  const [consents, setConsents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [recs, cons, prof, hist] = await Promise.all([
        healthflowApi.getMyHealthRecords('patient_ravi_kumar').catch(() => []),
        healthflowApi.getPatientConsents('patient_ravi_kumar').catch(() => []),
        healthflowApi.getPatientProfile('patient_ravi_kumar').catch(() => null),
        healthflowApi.getMedicalHistory('patient_ravi_kumar').catch(() => null)
      ]);
      setRecords(recs || []);
      setConsents(cons || []);
      setProfile(prof);
      setMedicalHistory(hist);
    } catch (err) {
      console.error('Failed to load health records/profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConsentAction(consentId, action) {
    try {
      await healthflowApi.actOnConsent({
        consent_id: consentId,
        patient_id: 'patient_ravi_kumar',
        action: action
      });
      loadData();
    } catch (err) {
      console.error('Consent action failed:', err);
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
            <FolderLock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.ehr_header || "ABDM Health Records & Consent Locker"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.ehr_sub || "End-to-end encrypted electronic health record repository with granular patient consent management."}
            </p>
          </div>
        </div>

        <span className="badge badge-verified">
          <Lock size={12} />
          <span>ABDM Encrypted Storage</span>
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '14px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('documents')}
          className={`btn ${activeSubTab === 'documents' ? 'btn-cyan' : 'btn-secondary'}`}
          style={{ fontSize: '0.86rem', padding: '8px 18px' }}
        >
          <FileText size={16} />
          <span>Documents & Consents ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`btn ${activeSubTab === 'history' ? 'btn-cyan' : 'btn-secondary'}`}
          style={{ fontSize: '0.86rem', padding: '8px 18px' }}
        >
          <Activity size={16} />
          <span>Medical History Timeline ({medicalHistory?.total_entries || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`btn ${activeSubTab === 'profile' ? 'btn-cyan' : 'btn-secondary'}`}
          style={{ fontSize: '0.86rem', padding: '8px 18px' }}
        >
          <UserCheck size={16} />
          <span>Patient Health Profile & SOS Contacts</span>
        </button>
      </div>

      {/* Subtab 1: Documents & Consent Requests */}
      {activeSubTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {/* Active Consent Requests Section */}
          <div className="hf-card" style={{ padding: '26px', borderLeft: '4px solid var(--hf-cyan)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={22} color="var(--hf-cyan)" />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Consent Authorization Requests</h3>
            </div>

            {consents.length === 0 ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--hf-text-muted)', fontStyle: 'italic' }}>
                No active pending consent requests. Doctors cannot access your health documents without your explicit cryptographic authorization.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {consents.map((c) => (
                  <div
                    key={c.id}
                    className="glass-card"
                    style={{
                      background: 'rgba(10, 18, 35, 0.65)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>{c.requester_name}</span>
                        <span className="badge badge-central">{c.requester_role}</span>
                        <span className={`badge ${c.status === 'GRANTED' ? 'badge-verified' : (c.status === 'REVOKED' ? 'badge-danger' : 'badge-warning')}`}>
                          {c.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>
                        <strong>Purpose:</strong> {c.purpose} • Permitted: {c.allowed_record_types.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', marginTop: '2px' }}>
                        Valid until: {new Date(c.expires_at).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {c.status === 'PENDING' && (
                        <button
                          onClick={() => handleConsentAction(c.id, 'GRANT')}
                          className="btn btn-primary"
                          style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                        >
                          <CheckCircle size={14} />
                          <span>{t.grant_consent_btn || "Grant Access"}</span>
                        </button>
                      )}
                      {c.status === 'GRANTED' && (
                        <button
                          onClick={() => handleConsentAction(c.id, 'REVOKE')}
                          className="btn btn-secondary"
                          style={{ padding: '6px 16px', fontSize: '0.82rem', color: 'var(--hf-danger)' }}
                        >
                          <XCircle size={14} />
                          <span>{t.revoke_consent_btn || "Revoke Access"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Health Documents Grid */}
          <div>
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 800, marginBottom: '18px' }}>
              {t.my_records || "My Health Documents"} ({records.length})
            </h3>

            <div className="grid-2">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="hf-3d-card"
                  style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--hf-primary)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <span className="badge badge-central">{rec.record_type}</span>
                      <h4 style={{ fontSize: '1.25rem', color: '#ffffff', marginTop: '6px', fontWeight: 800 }}>{rec.title}</h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>{rec.facility_name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>{rec.date}</span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>
                    {rec.summary}
                  </p>

                  {rec.details && Object.keys(rec.details).length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 'var(--hf-radius-md)', fontSize: '0.82rem', color: 'var(--hf-primary)' }}>
                      {Object.entries(rec.details).map(([k, v]) => (
                        <div key={k}>• {k.toUpperCase()}: <strong>{v}</strong></div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)' }}>
                      Doctor: {rec.doctor_name || 'Medical Officer'}
                    </span>
                    <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
                      <Lock size={10} /> Encrypted Locker
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Medical History Timeline */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="hf-card" style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Aggregated Clinical History</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)', marginTop: '2px' }}>
                Chronological ledger of consultations, hospital admissions, procedures, and prescribed medications.
              </p>
            </div>
            <div>
              <span className="badge badge-verified" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                Total Records: {medicalHistory?.total_entries || 0}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {medicalHistory?.entries?.map((entry) => (
              <div
                key={entry.id}
                className="hf-3d-card"
                style={{ padding: '24px', borderLeft: '4px solid var(--hf-cyan)', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-central">{entry.treatment_type}</span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--hf-text-muted)' }}>{entry.date}</span>
                    </div>
                    <h4 style={{ fontSize: '1.25rem', color: '#ffffff', marginTop: '6px', fontWeight: 800 }}>{entry.diagnosis}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--hf-cyan)' }}>{entry.hospital_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>{entry.doctor_name}</div>
                  </div>
                </div>

                {entry.procedures && entry.procedures.length > 0 && (
                  <div style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
                    <strong>Procedures:</strong> {entry.procedures.join(', ')}
                  </div>
                )}

                {entry.medicines && entry.medicines.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 'var(--hf-radius-md)' }}>
                    <Pill size={15} color="var(--hf-primary)" />
                    <span style={{ fontSize: '0.82rem', color: 'var(--hf-primary)', fontWeight: 700 }}>Medications:</span>
                    <span style={{ fontSize: '0.84rem', color: '#ffffff' }}>{entry.medicines.join(' • ')}</span>
                  </div>
                )}

                {entry.notes && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--hf-border-subtle)', paddingTop: '8px' }}>
                    Notes: {entry.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Patient Health Profile */}
      {activeSubTab === 'profile' && profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
          {/* Card 1: Core Health Identity */}
          <div className="hf-3d-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--hf-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={22} color="var(--hf-danger)" />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Core Health Identity</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--hf-text-muted)', fontSize: '0.86rem' }}>Full Name</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>{profile.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--hf-text-muted)', fontSize: '0.86rem' }}>Age & Gender</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>{profile.age} yrs • {profile.gender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--hf-text-muted)', fontSize: '0.86rem' }}>Blood Group</span>
                <span className="badge badge-danger" style={{ fontSize: '0.88rem', fontWeight: 800 }}>{profile.blood_group || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--hf-text-muted)', fontSize: '0.86rem' }}>Location</span>
                <span style={{ color: '#ffffff', fontSize: '0.92rem' }}>{profile.city}, {profile.state}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--hf-text-muted)', fontSize: '0.86rem' }}>Contact Phone</span>
                <span style={{ color: 'var(--hf-cyan)', fontFamily: 'var(--hf-font-mono)', fontSize: '0.92rem' }}>{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Critical Medical Flags */}
          <div className="hf-3d-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--hf-danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={22} color="var(--hf-warning)" />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Critical Medical Flags</h3>
            </div>

            <div>
              <span style={{ fontSize: '0.84rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Known Drug & Substance Allergies:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.known_allergies?.map((alg, i) => (
                  <span key={i} className="badge badge-danger" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                    ⚠ {alg}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Existing Chronic Conditions:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.existing_diseases?.map((dis, i) => (
                  <span key={i} className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                    {dis}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Emergency Contacts */}
          <div className="hf-3d-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--hf-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={22} color="var(--hf-primary)" />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Emergency SOS Contacts</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.emergency_contact_1?.name && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{profile.emergency_contact_1.name}</span>
                    <span className="badge badge-verified">{profile.emergency_contact_1.relationship}</span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--hf-cyan)', marginTop: '4px', fontFamily: 'var(--hf-font-mono)' }}>
                    {profile.emergency_contact_1.phone}
                  </div>
                </div>
              )}

              {profile.emergency_contact_2?.name && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{profile.emergency_contact_2.name}</span>
                    <span className="badge badge-central">{profile.emergency_contact_2.relationship}</span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--hf-cyan)', marginTop: '4px', fontFamily: 'var(--hf-font-mono)' }}>
                    {profile.emergency_contact_2.phone}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
