import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { QrCode, ShieldCheck, Lock, CheckCircle, AlertOctagon, RefreshCw, Key, ShieldAlert, Heart, Activity, AlertTriangle, Phone, FileText, Trash2, Sparkles } from 'lucide-react';

export default function QRScannerViewer({ t }) {
  const [qrType, setQrType] = useState('health_qr'); // 'health_qr' | 'prescription_qr'

  // Prescription QR State
  const [prescriptionId, setPrescriptionId] = useState('rx_001_seed');
  const [generatedRxToken, setGeneratedRxToken] = useState(null);
  const [loadingRxGen, setLoadingRxGen] = useState(false);

  // Health QR State
  const [healthQrMinutes, setHealthQrMinutes] = useState(1440);
  const [generatedHealthToken, setGeneratedHealthToken] = useState(null);
  const [activeHealthQrs, setActiveHealthQrs] = useState([]);
  const [loadingHealthGen, setLoadingHealthGen] = useState(false);

  // Scanner & Verification State
  const [tokenToVerify, setTokenToVerify] = useState('');
  const [scannerRole, setScannerRole] = useState('Doctor');
  const [scannerId, setScannerId] = useState('doc_ramesh_varma');
  const [verifyResult, setVerifyResult] = useState(null);
  const [loadingVerify, setLoadingVerify] = useState(false);

  useEffect(() => {
    loadActiveHealthQrs();
  }, []);

  async function loadActiveHealthQrs() {
    try {
      const res = await healthflowApi.getActiveHealthQRs('patient_ravi_kumar');
      if (res && res.active_qrs) {
        setActiveHealthQrs(res.active_qrs);
      }
    } catch (e) {
      console.error('Failed to load active health QRs:', e);
    }
  }

  async function handleGenerateRxQR() {
    setLoadingRxGen(true);
    try {
      const res = await healthflowApi.generateQR({
        prescription_id: prescriptionId,
        patient_id: 'patient_ravi_kumar',
        doctor_id: 'doc_ramesh_varma',
        expires_minutes: 30
      });
      setGeneratedRxToken(res);
      setTokenToVerify(res.token);
    } catch (err) {
      console.error('Prescription QR Generation error:', err);
    } finally {
      setLoadingRxGen(false);
    }
  }

  async function handleGenerateHealthQR() {
    setLoadingHealthGen(true);
    try {
      const res = await healthflowApi.generateHealthQR({
        patient_id: 'patient_ravi_kumar',
        expires_minutes: parseInt(healthQrMinutes) || 1440
      });
      setGeneratedHealthToken(res);
      setTokenToVerify(res.token);
      loadActiveHealthQrs();
    } catch (err) {
      console.error('Health QR Generation error:', err);
    } finally {
      setLoadingHealthGen(false);
    }
  }

  async function handleRevokeHealthQR(qrId) {
    try {
      await healthflowApi.revokeHealthQR({
        qr_id: qrId,
        patient_id: 'patient_ravi_kumar'
      });
      loadActiveHealthQrs();
      if (generatedHealthToken?.qr_id === qrId) {
        setGeneratedHealthToken(null);
      }
    } catch (err) {
      console.error('Failed to revoke Health QR:', err);
    }
  }

  async function handleVerifyQR() {
    if (!tokenToVerify) return;
    setLoadingVerify(true);
    setVerifyResult(null);

    try {
      if (qrType === 'health_qr') {
        const res = await healthflowApi.scanHealthQR({
          token: tokenToVerify,
          scanner_role: scannerRole,
          scanner_id: scannerId,
          scanner_name: `${scannerRole} Clinical Scanner`
        });
        setVerifyResult({ type: 'health_qr', ...res });
      } else {
        const res = await healthflowApi.verifyQR({
          token: tokenToVerify,
          scanner_role: scannerRole,
          scanner_id: scannerId,
          scanner_name: `${scannerRole} Verification Kiosk`
        });
        setVerifyResult({ type: 'prescription_qr', ...res });
      }
    } catch (err) {
      console.error('QR Verification error:', err);
      setVerifyResult({
        is_valid: false,
        error_message: err.message || 'Verification request failed'
      });
    } finally {
      setLoadingVerify(false);
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
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-cyan)'
          }}>
            <QrCode size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.qr_header || "Cryptographic Health & Rx QR Engine"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.qr_sub || "Zero-knowledge cryptographic tokens for instant doctor triage and pharmacy dispensation."}
            </p>
          </div>
        </div>

        <span className="badge badge-verified">
          <Lock size={12} />
          <span>ECDSA Signed Tokens</span>
        </span>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setQrType('health_qr'); setVerifyResult(null); }}
          className={`btn ${qrType === 'health_qr' ? 'btn-cyan' : 'btn-secondary'}`}
          style={{ padding: '10px 22px', fontSize: '0.92rem' }}
        >
          <Activity size={18} />
          <span>My Health QR (Triage Token)</span>
        </button>

        <button
          onClick={() => { setQrType('prescription_qr'); setVerifyResult(null); }}
          className={`btn ${qrType === 'prescription_qr' ? 'btn-cyan' : 'btn-secondary'}`}
          style={{ padding: '10px 22px', fontSize: '0.92rem' }}
        >
          <FileText size={18} />
          <span>Prescription QR (Pharmacy Token)</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
        
        {/* Generator Card */}
        <div className="hf-3d-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '4px solid var(--hf-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={22} color="var(--hf-cyan)" />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
              {qrType === 'health_qr' ? '1. Generate My Health QR Token' : '1. Generate Signed Prescription QR'}
            </h3>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', lineHeight: 1.5 }}>
            {qrType === 'health_qr'
              ? 'Generates a signed JWT health access token. Zero medical records are stored in the QR image itself. Scanning requires authenticated clinician authorization.'
              : 'Generates a signed JWT prescription access token with 30-minute validity. Contains zero medical history or patient names.'}
          </p>

          {qrType === 'health_qr' ? (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Token Validity Duration</label>
              <select
                className="select-field"
                value={healthQrMinutes}
                onChange={(e) => setHealthQrMinutes(Number(e.target.value))}
                style={{ marginTop: '6px' }}
              >
                <option value={60} style={{ background: '#0b1325' }}>1 Hour (Emergency Triage)</option>
                <option value={720} style={{ background: '#0b1325' }}>12 Hours (Outpatient Visit)</option>
                <option value={1440} style={{ background: '#0b1325' }}>24 Hours (Standard 1 Day)</option>
                <option value={4320} style={{ background: '#0b1325' }}>3 Days (Hospital Stay)</option>
              </select>

              <button
                onClick={handleGenerateHealthQR}
                disabled={loadingHealthGen}
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', marginTop: '16px', fontSize: '0.95rem' }}
              >
                <QrCode size={18} />
                <span>{loadingHealthGen ? 'Signing Health Token...' : 'Generate My Health QR'}</span>
              </button>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Prescription Reference ID</label>
              <input
                type="text"
                className="input-field"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                style={{ marginTop: '6px' }}
              />

              <button
                onClick={handleGenerateRxQR}
                disabled={loadingRxGen}
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', marginTop: '16px', fontSize: '0.95rem' }}
              >
                <QrCode size={18} />
                <span>{loadingRxGen ? 'Signing Token...' : (t.generate_qr_btn || "Generate Signed Rx Token")}</span>
              </button>
            </div>
          )}

          {/* Render Generated QR Preview */}
          {(generatedHealthToken || generatedRxToken) && (
            <div className="animate-slide-up" style={{ background: 'rgba(0,0,0,0.35)', padding: '20px', borderRadius: 'var(--hf-radius-lg)', border: '1px solid var(--hf-border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '16px', width: '170px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0, 242, 254, 0.35)' }}>
                <QrCode size={140} color="#060b14" />
              </div>

              <div style={{ width: '100%' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Signed Cryptographic Token (Encoded in QR):
                </span>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', fontSize: '0.74rem', fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-primary)', wordBreak: 'break-all', maxHeight: '75px', overflowY: 'auto' }}>
                  {qrType === 'health_qr' ? generatedHealthToken?.token : generatedRxToken?.token}
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)' }}>
                Expires At: {new Date(qrType === 'health_qr' ? generatedHealthToken?.expires_at : generatedRxToken?.expires_at).toLocaleTimeString()}
              </div>

              <button
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '8px', fontSize: '0.82rem', marginTop: '4px' }}
              >
                <Sparkles size={14} color="var(--hf-cyan)" />
                <span>Print / Save ABDM Digital Pass</span>
              </button>
            </div>
          )}

          {/* Active Health QRs Management */}
          {qrType === 'health_qr' && activeHealthQrs.length > 0 && (
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--hf-border-subtle)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                Active Patient Health QRs ({activeHealthQrs.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeHealthQrs.map((q) => (
                  <div key={q.qr_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>
                      <span style={{ color: 'var(--hf-cyan)', fontFamily: 'var(--hf-font-mono)' }}>{q.qr_id}</span> • Expires: {new Date(q.expires_at).toLocaleTimeString()}
                    </div>
                    <button
                      onClick={() => handleRevokeHealthQR(q.qr_id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.74rem', color: 'var(--hf-danger)' }}
                    >
                      <Trash2 size={12} />
                      <span>Revoke</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scanner & Resolver Card */}
        <div className="hf-3d-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '4px solid var(--hf-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="var(--hf-primary)" />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
              2. Scan & Cryptographic Verification
            </h3>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', lineHeight: 1.5 }}>
            Authorized doctors, triage staff, or pharmacists scan the QR token. The system verifies cryptographic signature integrity and creates an immutable audit record.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Scanner Role</label>
              <select
                className="select-field"
                value={scannerRole}
                onChange={(e) => setScannerRole(e.target.value)}
                style={{ padding: '9px', fontSize: '0.88rem', marginTop: '4px' }}
              >
                <option value="Doctor" style={{ background: '#0b1325' }}>Doctor</option>
                <option value="HospitalAdmin" style={{ background: '#0b1325' }}>Hospital Admin</option>
                <option value="Paramedic" style={{ background: '#0b1325' }}>Paramedic / SOS</option>
                <option value="Pharmacist" style={{ background: '#0b1325' }}>Pharmacist</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Scanner Facility ID</label>
              <input
                type="text"
                className="input-field"
                value={scannerId}
                onChange={(e) => setScannerId(e.target.value)}
                style={{ padding: '9px', fontSize: '0.88rem', marginTop: '4px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>QR Token Payload</label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Paste or simulate scanning QR token..."
              value={tokenToVerify}
              onChange={(e) => setTokenToVerify(e.target.value)}
              style={{ fontFamily: 'var(--hf-font-mono)', fontSize: '0.78rem', marginTop: '4px' }}
            />
          </div>

          <button
            onClick={handleVerifyQR}
            disabled={loadingVerify || !tokenToVerify}
            className="btn btn-cyan"
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
          >
            <Key size={18} />
            <span>{loadingVerify ? 'Verifying Signature...' : 'Authorize & Resolve Token'}</span>
          </button>

          {/* Verification Results */}
          {verifyResult && (
            <div className="animate-slide-up" style={{
              background: verifyResult.is_valid ? 'rgba(0, 201, 167, 0.1)' : 'rgba(255, 75, 99, 0.1)',
              border: `1px solid ${verifyResult.is_valid ? 'rgba(0, 201, 167, 0.35)' : 'rgba(255, 75, 99, 0.35)'}`,
              borderRadius: 'var(--hf-radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {verifyResult.is_valid ? <CheckCircle size={22} color="var(--hf-primary)" /> : <AlertOctagon size={22} color="var(--hf-danger)" />}
                <span style={{ fontWeight: 800, fontSize: '1rem', color: verifyResult.is_valid ? 'var(--hf-primary)' : 'var(--hf-danger)' }}>
                  {verifyResult.is_valid ? 'Cryptographic Token Verified & Authorized' : 'Verification Denied / Invalid Token'}
                </span>
              </div>

              {/* Health QR Result Display */}
              {verifyResult.is_valid && verifyResult.type === 'health_qr' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem' }}>{verifyResult.patient_name}</span>
                    </div>
                    <span className="badge badge-danger" style={{ fontWeight: 800 }}>
                      Blood: {verifyResult.blood_group || 'Unknown'}
                    </span>
                  </div>

                  {verifyResult.known_allergies?.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--hf-danger)', fontWeight: 700, display: 'block' }}>⚠ Known Allergies:</span>
                      <span style={{ fontSize: '0.86rem', color: '#ffffff' }}>{verifyResult.known_allergies.join(', ')}</span>
                    </div>
                  )}

                  {verifyResult.existing_diseases?.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--hf-warning)', fontWeight: 700, display: 'block' }}>Existing Conditions:</span>
                      <span style={{ fontSize: '0.86rem', color: '#ffffff' }}>{verifyResult.existing_diseases.join(', ')}</span>
                    </div>
                  )}

                  {verifyResult.previous_treatments?.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Recent Treatment History:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {verifyResult.previous_treatments.slice(0, 3).map((t, idx) => (
                          <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                            <strong>{t.date}</strong> — {t.diagnosis} ({t.hospital})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {verifyResult.emergency_contacts?.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--hf-border-subtle)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--hf-primary)', fontWeight: 700, display: 'block' }}>Emergency Contacts:</span>
                      {verifyResult.emergency_contacts.map((c, idx) => (
                        <div key={idx} style={{ fontSize: '0.82rem', color: '#ffffff', marginTop: '2px' }}>
                          • {c.name} ({c.relationship}): <span style={{ fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-cyan)' }}>{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Prescription QR Result Display */}
              {verifyResult.is_valid && verifyResult.type === 'prescription_qr' && verifyResult.prescription && (
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#ffffff' }}>
                    <strong>Prescription:</strong> {verifyResult.prescription.id} (Patient: {verifyResult.prescription.patient_name})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>
                    Doctor: {verifyResult.prescription.doctor_name} • Date: {verifyResult.prescription.prescription_date}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.84rem', color: 'var(--hf-primary)' }}>
                    Medicines: {verifyResult.prescription.items.map(i => i.medicine_name).join(', ')}
                  </div>
                </div>
              )}

              {!verifyResult.is_valid && (
                <div style={{ fontSize: '0.84rem', color: 'var(--hf-danger)' }}>
                  {verifyResult.error_message || 'The cryptographic token provided is invalid or has expired.'}
                </div>
              )}

              {verifyResult.audit_id && (
                <div style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)', borderTop: '1px solid var(--hf-border-subtle)', paddingTop: '8px' }}>
                  Audit ID: <code>{verifyResult.audit_id}</code> • Access logged to compliance journal.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
