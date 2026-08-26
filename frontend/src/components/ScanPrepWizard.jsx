import React, { useState } from 'react';
import { healthflowApi } from '../services/api';
import Prescription3D from './3d/Prescription3D';
import { Scan, AlertTriangle, Pill, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ScanPrepWizard({ t }) {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);

  async function handleAnalyze() {
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('raw_text', rawText);
      formData.append('patient_id', 'patient_ravi_kumar');
      const res = await healthflowApi.initiateScanPrep(formData);
      setParsed(res);
    } catch (err) {
      console.error('Scan‑prep error:', err);
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
            <Scan size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t?.scan_prep_header || "Clinical Prescription Scan & Parser Preview"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t?.scan_prep_sub || "Paste OCR-extracted clinical text to preview parsed medicines, dosage schedules, and confidence scores."}
            </p>
          </div>
        </div>

        <span className="badge badge-verified">
          <Sparkles size={12} />
          <span>CDSCO Linked Parser</span>
        </span>
      </div>

      <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-primary)' }}>
        <label style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
          Raw Clinical Transcription or OCR Text
        </label>
        <textarea
          className="input-field"
          rows="6"
          placeholder={t?.scan_prep_placeholder || "Paste clinical text here, e.g.:\nTab Telma 40mg 1-0-0 x 30 days\nTab Glycomet 500 SR 1-0-0 x 30 days"}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          style={{ fontFamily: 'var(--hf-font-mono)', fontSize: '0.88rem', resize: 'vertical' }}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !rawText.trim()}
          className="btn btn-cyan"
          style={{ padding: '13px', width: '100%', marginTop: '16px', fontSize: '0.95rem' }}
        >
          <Scan size={18} />
          <span>{loading ? (t?.scanning || 'Parsing Clinical Compounds...') : (t?.scan_btn || 'Run Clinical Parse Preview')}</span>
        </button>
      </div>

      {parsed && (
        <div className="hf-card animate-slide-up" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={20} color="var(--hf-primary)" />
              <span>{t?.parsed_medicines || 'Parsed Medicines & Confidence Scores'} ({parsed.items?.length || 0})</span>
            </h4>
            <span className="badge badge-verified">Parsed Successfully</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {parsed.items?.map((item, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  background: item.needs_human_verification ? 'rgba(245, 158, 11, 0.08)' : 'rgba(10, 18, 35, 0.65)',
                  border: `1px solid ${item.needs_human_verification ? 'rgba(245, 158, 11, 0.35)' : 'var(--hf-border-subtle)'}`,
                  borderRadius: 'var(--hf-radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>{item.medicine_name}</span>
                    {item.strength && <span className="badge badge-central">{item.strength}</span>}
                    {item.generic_name && (
                      <span className="badge badge-verified" style={{ textTransform: 'none' }}>
                        Generic: {item.generic_name}
                      </span>
                    )}
                    {item.needs_human_verification && (
                      <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                        <AlertTriangle size={12} /> Needs Verification
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', marginTop: '4px' }}>
                    <strong>Schedule:</strong> {item.frequency} • {item.duration} • <em style={{ color: 'var(--hf-cyan)' }}>{item.food_timing}</em>
                  </div>
                  {item.instructions && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', marginTop: '2px' }}>
                      Notes: {item.instructions}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>OCR Confidence</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: item.ocr_confidence >= 0.8 ? 'var(--hf-primary)' : 'var(--hf-warning)' }}>
                    {Math.round(item.ocr_confidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
