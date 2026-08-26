import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { ShieldCheck, Activity, Database, Key, Server, RefreshCw, FileText, CheckCircle2, UploadCloud, Radio, Sparkles } from 'lucide-react';

export default function AdminDashboard({ t }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ingestCategory, setIngestCategory] = useState('Schemes');
  const [ingestSourceName, setIngestSourceName] = useState('NHA Ayushman Master Sync');
  const [ingestSourceUrl, setIngestSourceUrl] = useState('https://pmjay.gov.in');
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    setLoading(true);
    try {
      const data = await healthflowApi.getAdminOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleIngestSample() {
    setIngesting(true);
    try {
      const sampleData = [
        {
          id: "pmjay_central_sync",
          name: "Ayushman Bharat - PMJAY Master Feed",
          type: "Central",
          state: "All India",
          coverage_amount: "₹5,00,000 per family per year",
          summary: "Verified synchronized national master health insurance dataset."
        }
      ];

      const res = await healthflowApi.ingestDataset({
        source_name: ingestSourceName,
        source_url: ingestSourceUrl,
        source_type: "Government Portal",
        data_category: ingestCategory,
        raw_json_data: sampleData,
        version: "v3.5.0"
      });
      setIngestResult(res);
      loadOverview();
    } catch (err) {
      console.error('Ingestion error:', err);
    } finally {
      setIngesting(false);
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
            <Server size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.nav_admin || "Observability, Provenance & Admin Hub"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Real-time system observability, cryptographic dataset provenance, and HIPAA/ABDM-grade immutable audit trails.
            </p>
          </div>
        </div>

        <button
          onClick={loadOverview}
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
          <span>Refresh Observability</span>
        </button>
      </div>

      {overview && (
        <>
          {/* Key Metrics Counters */}
          <div className="grid-4">
            <div className="hf-3d-card" style={{ padding: '22px', textAlign: 'center', borderLeft: '4px solid var(--hf-primary)' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Verified Schemes</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--hf-primary)', marginTop: '4px', letterSpacing: '-0.03em' }}>
                {overview.counts.schemes}
              </div>
            </div>

            <div className="hf-3d-card" style={{ padding: '22px', textAlign: 'center', borderLeft: '4px solid var(--hf-cyan)' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Verified Medicines</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--hf-cyan)', marginTop: '4px', letterSpacing: '-0.03em' }}>
                {overview.counts.medicines}
              </div>
            </div>

            <div className="hf-3d-card" style={{ padding: '22px', textAlign: 'center', borderLeft: '4px solid var(--hf-blue)' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>ABDM HPR / HFR</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--hf-blue)', marginTop: '4px', letterSpacing: '-0.03em' }}>
                {overview.counts.doctors + overview.counts.hospitals}
              </div>
            </div>

            <div className="hf-3d-card" style={{ padding: '22px', textAlign: 'center', borderLeft: '4px solid var(--hf-warning)' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Audit Trail Logs</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--hf-warning)', marginTop: '4px', letterSpacing: '-0.03em' }}>
                {overview.counts.total_audit_events}
              </div>
            </div>
          </div>

          {/* Integration Gateway Status */}
          <div className="hf-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, marginBottom: '16px' }}>
              Healthcare Integration Gateways
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {Object.entries(overview.integrations).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>{k.toUpperCase()}</span>
                  <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance & Ingestion Engine */}
          <div className="hf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
                Dataset Provenance & SHA-256 Checksums
              </h3>
              <span className="badge badge-verified">
                <ShieldCheck size={12} /> Cryptographic Proof
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--hf-border-subtle)', color: 'var(--hf-text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Source Name</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Version</th>
                    <th style={{ padding: '10px' }}>SHA-256 Checksum</th>
                    <th style={{ padding: '10px' }}>Last Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.data_sources.map((src) => (
                    <tr key={src.source_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px', color: '#ffffff', fontWeight: 700 }}>{src.source_name}</td>
                      <td style={{ padding: '10px', color: 'var(--hf-primary)' }}>{src.source_type}</td>
                      <td style={{ padding: '10px', color: 'var(--hf-text-secondary)' }}>{src.version}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-cyan)', fontSize: '0.78rem' }}>
                        {src.checksum_sha256.slice(0, 16)}...
                      </td>
                      <td style={{ padding: '10px', color: 'var(--hf-text-secondary)' }}>
                        {new Date(src.verified_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Access Audit Trail */}
          <div className="hf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
              Immutable Compliance Audit Logs ({overview.recent_audit_logs.length})
            </h3>

            <div style={{ background: 'rgba(0,0,0,0.45)', padding: '16px', borderRadius: 'var(--hf-radius-md)', maxHeight: '300px', overflowY: 'auto', fontFamily: 'var(--hf-font-mono)', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--hf-border-subtle)' }}>
              {overview.recent_audit_logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--hf-cyan)' }}>{log.timestamp ? log.timestamp.split('T')[1].slice(0, 8) : ''}</span>
                  <span style={{ color: log.status === 'SUCCESS' ? 'var(--hf-primary)' : 'var(--hf-danger)', fontWeight: 800 }}>
                    [{log.action}]
                  </span>
                  <span style={{ color: '#ffffff' }}>
                    {log.resource_type}:{log.resource_id}
                  </span>
                  <span style={{ color: 'var(--hf-text-muted)', marginLeft: 'auto' }}>
                    Actor: {log.actor_role} ({log.actor_id})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
