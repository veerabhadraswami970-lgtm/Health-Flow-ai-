import React, { useState } from 'react';
import { healthflowApi, getStoredUser } from '../services/api';
import Prescription3D from './3d/Prescription3D';
import Medicine3D from './3d/Medicine3D';
import { 
  FileUp, Scan, CheckCircle2, AlertTriangle, User, Calendar, 
  ShieldCheck, QrCode, Pill, CheckSquare, Upload, FileText, 
  Sparkles, RefreshCw, X, Eye, HelpCircle, ShieldAlert, ArrowRight, Activity
} from 'lucide-react';

const SAMPLE_RX_TEXT = `Dr. Ramesh Varma, MD, DM (Cardiology) - NIMS Hyderabad
Registration No: MCI-54892-AP
Patient: Ravi Kumar, Age: 48 yrs, Date: 2026-08-19
Diagnosis: Essential Hypertension & Type 2 Diabetes Mellitus

Rx:
1. Tab Telma 40mg (Telmisartan) - 1-0-0 (Morning after breakfast) x 30 days
2. Tab Glycomet 500 SR (Metformin) - 1-0-0 (With morning meal) x 30 days
3. Tab Dolo 650 (Paracetamol) - 1-0-1 (After food, SOS for fever/pain) x 5 days
4. Tab Azithral 500 (Handwritten cursive query) - 0-0-1 (After dinner) x 3 days`;

export default function PrescriptionAnalyzer({ t, role }) {
  const [mode, setMode] = useState('upload'); // 'upload' or 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [rxText, setRxText] = useState(SAMPLE_RX_TEXT);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: AI Reading, 2: Extracting, 3: Verified
  const [prescription, setPrescription] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [activeTabMedicine, setActiveTabMedicine] = useState(null);
  const [medicineDetails, setMedicineDetails] = useState({});
  const [showQRModal, setShowQRModal] = useState(false);

  const currentUser = getStoredUser();
  const currentPatientId = currentUser?.patient_id || 'patient_ravi_kumar';

  // Handle Drag & Drop / File Select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || e;
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please select a smaller image or PDF.");
      return;
    }

    setSelectedFile(file);

    if (file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Main Submit OCR & Processing with Staged Visual Progress
  async function handleAnalyze() {
    setLoading(true);
    setScanStep(1);
    setPrescription(null);

    try {
      const formData = new FormData();
      formData.append('patient_id', currentPatientId);

      let resPromise;
      if (mode === 'upload' && selectedFile) {
        formData.append('file', selectedFile);
        resPromise = healthflowApi.uploadPrescriptionFile(formData);
      } else {
        formData.append('raw_text', rxText);
        resPromise = healthflowApi.processPrescriptionText(formData);
      }

      // Step 2 indicator
      setTimeout(() => {
        if (loading) setScanStep(2);
      }, 900);

      const res = await resPromise;

      setScanStep(3);
      setPrescription(res);

      if (res && res.items) {
        fetchMedicineIntelligence(res.items);
      }
    } catch (err) {
      console.error('Prescription processing error:', err);
      alert(err.message || 'Failed to process prescription. Please verify file format.');
      setScanStep(0);
    } finally {
      setLoading(false);
    }
  }

  // CDSCO Database Linkage helper
  async function fetchMedicineIntelligence(items) {
    const detailsMap = {};
    for (const item of items) {
      try {
        const query = item.generic_name || item.medicine_name;
        const results = await healthflowApi.searchMedicines(query);
        if (results && results.length > 0) {
          detailsMap[item.id] = results[0];
        }
      } catch (e) {
        console.warn(`Could not fetch details for ${item.medicine_name}`, e);
      }
    }
    setMedicineDetails(detailsMap);
  }

  // Certified verification by Doctor / Pharmacist
  async function handleVerifyByProfessional() {
    if (!prescription) return;
    setVerifying(true);
    try {
      const res = await healthflowApi.verifyPrescription(prescription.id, {
        notes: verifyNotes || "Prescription verified by authorized healthcare professional."
      });
      setPrescription(res);
    } catch (err) {
      console.error('Verification error:', err);
      alert(err.message || "Failed to submit verification.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Title Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--hf-cyan)'
            }}>
              <Scan size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {t?.prescription_header || "AI Prescription Scanner & Normalization"}
              </h2>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
                Spatial holographic OCR linked with CDSCO medicine intelligence & cryptographic QR tokens.
              </p>
            </div>
          </div>
        </div>

        <span className="badge badge-cyan">
          <Sparkles size={12} />
          <span>CDSCO & ABDM Ready</span>
        </span>
      </div>

      {/* Flagship 3D Scanning Surface Card */}
      <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-cyan)' }}>
        {/* Input Mode Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setMode('upload')}
              className={mode === 'upload' ? 'btn btn-cyan' : 'btn btn-secondary'}
              style={{ fontSize: '0.86rem', padding: '8px 18px' }}
            >
              <FileUp size={16} />
              <span>Upload Document (JPG / PNG / PDF)</span>
            </button>

            <button
              onClick={() => setMode('text')}
              className={mode === 'text' ? 'btn btn-cyan' : 'btn btn-secondary'}
              style={{ fontSize: '0.86rem', padding: '8px 18px' }}
            >
              <FileText size={16} />
              <span>Paste Clinical Rx Text</span>
            </button>
          </div>

          {mode === 'text' && (
            <button
              onClick={() => setRxText(SAMPLE_RX_TEXT)}
              style={{ background: 'transparent', border: 'none', color: 'var(--hf-cyan)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              Load Sample Clinical Rx
            </button>
          )}
        </div>

        {/* Holographic 3D Drag & Drop Upload Zone */}
        {mode === 'upload' && (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`hf-scanner-frame ${loading ? 'scanning' : ''}`}
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '230px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading && <div className="hf-scanner-beam" />}

            {filePreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 5 }}>
                <img 
                  src={filePreview} 
                  alt="Prescription Preview" 
                  style={{ maxHeight: '200px', borderRadius: '14px', border: '2px solid var(--hf-cyan)', boxShadow: '0 8px 30px rgba(0, 242, 254, 0.3)' }} 
                />
                <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>{selectedFile?.name}</span>
                <label className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 16px', cursor: 'pointer' }}>
                  <span>Change File</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            ) : selectedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 5 }}>
                <FileText size={48} color="var(--hf-cyan)" />
                <span style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 700 }}>{selectedFile.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                <label className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 16px', cursor: 'pointer' }}>
                  <span>Change Document</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 5 }}>
                <Prescription3D size={120} isScanning={loading} />
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '4px' }}>
                    Drag & Drop Prescription Slip Here
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                    Supports doctor slips in JPG, PNG, WEBP, or PDF formats (Up to 10MB).
                  </p>
                </div>
                <label className="btn btn-primary" style={{ padding: '9px 24px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <span>Browse Device Files</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <textarea
            className="input-field"
            rows="7"
            value={rxText}
            onChange={(e) => setRxText(e.target.value)}
            style={{ fontFamily: 'var(--hf-font-mono)', fontSize: '0.9rem', resize: 'vertical' }}
            placeholder="Paste clinical prescription note here..."
          />
        )}

        {/* Staged Scan Progress Indicator */}
        {loading && (
          <div style={{
            marginTop: '18px',
            padding: '16px 20px',
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: 'var(--hf-radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Activity className="spin-animation" size={24} color="var(--hf-cyan)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--hf-cyan)', fontSize: '0.95rem' }}>
                {scanStep === 1 && "AI is reading prescription document & running optical character recognition..."}
                {scanStep === 2 && "Extracting medicines, dosages, frequencies & querying CDSCO database..."}
                {scanStep === 3 && "Verifying safety guardrails & generating cryptographic token..."}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)' }}>
                Real-time neural pipeline execution • Please wait
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (mode === 'upload' && !selectedFile && !rxText)}
          className="btn btn-cyan"
          style={{ padding: '14px', width: '100%', marginTop: '18px', borderRadius: 'var(--hf-radius-md)', fontSize: '0.98rem' }}
        >
          <Scan size={18} className={loading ? 'spin-animation' : ''} />
          <span>{loading ? 'Processing Prescription Intelligence...' : 'Scan & Extract Medicines with AI'}</span>
        </button>
      </div>

      {/* Extracted Intelligence Results */}
      {prescription && (
        <div className="hf-card animate-slide-up" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
          
          {/* Top Status & Verification Badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.45rem', color: '#ffffff' }}>Prescription ID: {prescription.id}</h3>
                <span className={`badge ${prescription.status === 'VERIFIED_BY_PROFESSIONAL' ? 'badge-verified' : 'badge-warning'}`}>
                  {prescription.status === 'VERIFIED_BY_PROFESSIONAL' ? 'Verified by Doctor' : 'Human Review Advised'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>
                Prescribed by: <strong style={{ color: '#f8fafc' }}>{prescription.doctor_name}</strong> ({prescription.doctor_qualification || 'Physician'}) • {prescription.clinic_or_hospital}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowQRModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.86rem', padding: '8px 18px' }}
              >
                <QrCode size={16} />
                <span>Show 3D Health QR Card</span>
              </button>

              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '8px 18px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-glass)', textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  OCR Confidence
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: prescription.overall_ocr_confidence >= 0.85 ? 'var(--hf-primary)' : 'var(--hf-warning)' }}>
                  {Math.round(prescription.overall_ocr_confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Patient Details & Diagnosis Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            background: 'rgba(18, 30, 56, 0.5)',
            padding: '20px',
            borderRadius: 'var(--hf-radius-lg)',
            border: '1px solid var(--hf-border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase' }}>Patient Name & Age</span>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.05rem', marginTop: '2px' }}>
                {prescription.patient_name} ({prescription.patient_age} yrs)
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase' }}>Prescription Date</span>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.05rem', marginTop: '2px' }}>
                {prescription.prescription_date}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase' }}>Clinical Diagnosis</span>
              <div style={{ fontWeight: 700, color: 'var(--hf-cyan)', fontSize: '1.05rem', marginTop: '2px' }}>
                {prescription.diagnosis}
              </div>
            </div>
          </div>

          {/* Extracted Medicines 3D Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} color="var(--hf-primary)" />
                <span>Extracted Medicines & Dosage Protocol:</span>
              </h4>
              <span className="badge badge-verified">{prescription.items?.length || 0} Compounds</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {prescription.items.map((item, idx) => {
                const cdscoInfo = medicineDetails[item.id];
                return (
                  <div
                    key={item.id || idx}
                    className="glass-card"
                    style={{
                      background: item.needs_human_verification ? 'rgba(245, 158, 11, 0.08)' : 'rgba(10, 18, 35, 0.65)',
                      border: `1px solid ${item.needs_human_verification ? 'rgba(245, 158, 11, 0.35)' : 'var(--hf-border-subtle)'}`,
                      borderRadius: 'var(--hf-radius-lg)',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 340px' }}>
                      <div style={{ width: '60px', height: '60px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Medicine3D size={60} colorTop={0x00f2fe} colorBottom={item.needs_human_verification ? 0xf59e0b : 0x00c9a7} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff' }}>{item.medicine_name}</span>
                          {item.strength && <span className="badge badge-central">{item.strength}</span>}
                          {item.generic_name && (
                            <span className="badge badge-verified" style={{ textTransform: 'none' }}>
                              Generic: {item.generic_name}
                            </span>
                          )}
                          {item.needs_human_verification && (
                            <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                              <AlertTriangle size={12} /> Needs Human Review
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', marginTop: '6px' }}>
                          <div><strong style={{ color: '#34d399' }}>📋 Extracted from Prescription:</strong> Dosage: {item.frequency} • Duration: {item.duration} • Timing: {item.food_timing}</div>
                          <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
                            <strong style={{ color: 'var(--hf-cyan)' }}>🤖 AI General Background Info:</strong> {cdscoInfo ? (cdscoInfo.indications || 'Commonly prescribed for cardiovascular/metabolic regulation.') : 'General medical compound information.'}
                          </div>
                        </div>

                        {item.needs_human_verification && (
                          <div style={{
                            marginTop: '8px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#f87171',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <ShieldAlert size={14} />
                            <span>⚠️ Unable to confidently read this medicine. Please confirm with your doctor/pharmacist.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)', display: 'block' }}>OCR Confidence</span>
                      <strong style={{ fontSize: '1.05rem', color: item.ocr_confidence >= 0.8 ? 'var(--hf-primary)' : 'var(--hf-warning)' }}>
                        {Math.round(item.ocr_confidence * 100)}%
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Professional Doctor / Pharmacist Sign-Off section */}
          {prescription.status !== 'VERIFIED_BY_PROFESSIONAL' && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '22px',
              borderRadius: 'var(--hf-radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#a5b4fc" />
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a5b4fc' }}>
                  Doctor & Pharmacist Sign-Off Verification (ABDM Protocol)
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
                Verify and certify extracted dosage details under ABDM clinical workflow standards.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter doctor license number or clinical verification notes..."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  style={{ flex: '1 1 280px', padding: '10px 16px', fontSize: '0.88rem' }}
                />
                <button
                  onClick={handleVerifyByProfessional}
                  disabled={verifying}
                  className="btn btn-primary"
                  style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                >
                  <CheckSquare size={16} />
                  <span>{verifying ? 'Certifying...' : 'Certify & Verify Rx'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Holographic 3D Digital Prescription Card Modal */}
      {showQRModal && prescription && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="hf-3d-card" style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center', position: 'relative', border: '1px solid rgba(0, 242, 254, 0.4)' }}>
            <button
              onClick={() => setShowQRModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--hf-text-muted)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--hf-cyan)'
            }}>
              <QrCode size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '6px' }}>
              Digital Prescription Card
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)', marginBottom: '22px' }}>
              Cryptographically signed ABDM health token for pharmacy dispensing.
            </p>

            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '18px',
              boxShadow: '0 0 35px rgba(0, 242, 254, 0.4)'
            }}>
              <div style={{
                width: '180px',
                height: '180px',
                background: '#0a0f1d',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <QrCode size={110} color="#00f2fe" />
                <span style={{ marginTop: '6px', fontSize: '0.65rem', color: '#94a3b8', wordBreak: 'break-all' }}>
                  {prescription.secure_qr_token?.substring(0, 24) || prescription.id}...
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(18, 30, 56, 0.6)',
              padding: '12px',
              borderRadius: 'var(--hf-radius-md)',
              fontSize: '0.8rem',
              color: 'var(--hf-text-secondary)',
              border: '1px solid var(--hf-border-subtle)'
            }}>
              <div><strong>Patient:</strong> {prescription.patient_name} • <strong>Doctor:</strong> {prescription.doctor_name}</div>
              <div style={{ color: 'var(--hf-cyan)', marginTop: '4px' }}>Expires in 24 hours • Instant Pharmacy Verifiable</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
