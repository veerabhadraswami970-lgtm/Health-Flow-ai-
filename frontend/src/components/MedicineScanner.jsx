import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import Medicine3D from './3d/Medicine3D';
import { Pill, Upload, Scan, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function MedicineScanner({ t }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResults([]);
      setError('');
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError(t.error_select_file || 'Please select an image file to scan');
      return;
    }
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await healthflowApi.scanMedicineImage(formData);
      setResults(resp.items || []);
    } catch (e) {
      console.error('Medicine scan failed', e);
      setError(t.error_scan_failed || 'Medicine scan failed — please try again with a clear photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-warning)'
          }}>
            <Pill size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.nav_medicine_scanner || "AI Medicine Strip & Pill Scanner"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Optical blister pack and label character recognition mapped with CDSCO formulary database.
            </p>
          </div>
        </div>

        <span className="badge badge-warning">
          <Sparkles size={12} />
          <span>CDSCO Label Vision</span>
        </span>
      </div>

      {/* Flagship Scanner Frame Card */}
      <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-warning)' }}>
        <div
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

          {previewUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 5 }}>
              <img 
                src={previewUrl} 
                alt="Medicine Preview" 
                style={{ maxHeight: '200px', borderRadius: '14px', border: '2px solid var(--hf-warning)', boxShadow: '0 8px 30px rgba(245, 158, 11, 0.3)' }} 
              />
              <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>{file?.name}</span>
              <label className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 16px', cursor: 'pointer' }}>
                <span>Change Image</span>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 5 }}>
              <Medicine3D size={110} />
              <div>
                <h4 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '4px' }}>
                  Upload Medicine Packaging or Pill Bottle Photo
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                  Snap a clear photo of front or back label for instant generic matching.
                </p>
              </div>
              <label className="btn btn-primary" style={{ padding: '9px 24px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <span>Select Medicine Photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '16px', background: 'rgba(255, 75, 99, 0.1)', border: '1px solid rgba(255, 75, 99, 0.3)', color: '#ff7b8d', padding: '12px 16px', borderRadius: 'var(--hf-radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={loading || !file}
          className="btn btn-cyan"
          style={{ padding: '14px', width: '100%', marginTop: '18px', borderRadius: 'var(--hf-radius-md)', fontSize: '0.98rem' }}
        >
          <Scan size={18} className={loading ? 'spin-animation' : ''} />
          <span>{loading ? (t.btn_scanning || 'Scanning Medicine Label...') : (t.btn_scan || 'Identify Medicine with AI')}</span>
        </button>
      </div>

      {/* Identified Results Grid */}
      {results.length > 0 && (
        <div className="hf-card animate-slide-up" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
              {t.label_scan_results || 'Identified Medicines & Confidence Telemetry'}
            </h3>
            <span className="badge badge-verified">{results.length} Matches</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((item, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  background: 'rgba(10, 18, 35, 0.65)',
                  padding: '18px 22px',
                  borderRadius: 'var(--hf-radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Pill size={22} color="var(--hf-cyan)" />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>{item.name}</span>
                    <span className="badge badge-verified" style={{ marginLeft: '10px' }}>CDSCO Match</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(item.confidence * 100)}%`,
                        height: '100%',
                        background: item.confidence >= 0.8 ? 'linear-gradient(90deg, #00c9a7, #00f2fe)' : 'linear-gradient(90deg, #f59e0b, #ff4b63)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: item.confidence >= 0.8 ? 'var(--hf-primary)' : 'var(--hf-warning)' }}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
