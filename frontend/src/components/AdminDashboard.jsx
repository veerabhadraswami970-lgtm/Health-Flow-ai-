import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { 
  ShieldCheck, Activity, Database, Key, Server, RefreshCw, 
  FileText, CheckCircle2, UploadCloud, Radio, Sparkles, Award, Lock
} from 'lucide-react';

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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 10X Editorial Super Admin Header Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(217, 79, 61, 0.08) 0%, rgba(15, 110, 105, 0.12) 100%)', border: '1px solid rgba(217, 79, 61, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--hf-coral), var(--hf-rose))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(217, 79, 61, 0.3)'
            }}>
              <Server size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className="font-editorial-serif" style={{ fontSize: '1.85rem', margin: 0 }}>
                  Super Admin Observability & Audit Hub
                </h2>
                <span className="badge badge-verified">Role: Super Admin</span>
              </div>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                System Observability • Cryptographic Dataset Provenance • Immutable ABDM/HIPAA Audit Logs
              </p>
            </div>
          </div>

          <button
            onClick={loadOverview}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '10px 22px', fontSize: '0.88rem', borderRadius: '9999px' }}
          >
            <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {overview && (
        <>
          {/* 3D Glassmorphic Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(15, 110, 105, 0.12)', color: 'var(--hf-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{overview.counts.schemes}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Verified Schemes</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(45, 115, 101, 0.12)', color: 'var(--hf-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{overview.counts.medicines}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Verified Formulations</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{overview.counts.doctors + overview.counts.hospitals}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>ABDM Registries</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(217, 79, 61, 0.12)', color: 'var(--hf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{overview.counts.total_audit_events}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Immutable Audit Logs</div>
              </div>
            </div>
          </div>

          {/* Healthcare Integration Gateways */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', marginBottom: '18px' }}>
              Active National Gateway Connections
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {Object.entries(overview.integrations).map(([k, v]) => (
                <div key={k} style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(22, 32, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--hf-ink)', fontWeight: 700 }}>{k.toUpperCase()}</span>
                  <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Access Audit Trail */}
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', margin: 0 }}>
                Immutable Audit Trail Logs ({overview.recent_audit_logs.length})
              </h3>
              <span className="badge badge-teal">
                <ShieldCheck size={12} /> HIPAA / ABDM Compliant
              </span>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', maxHeight: '320px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--hf-ink-muted)', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid rgba(22, 32, 36, 0.1)' }}>
              {overview.recent_audit_logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', borderBottom: '1px solid rgba(22, 32, 36, 0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--hf-teal)', fontWeight: 700 }}>{log.timestamp ? log.timestamp.split('T')[1].slice(0, 8) : ''}</span>
                  <span style={{ color: log.status === 'SUCCESS' ? 'var(--hf-teal)' : 'var(--hf-coral)', fontWeight: 800 }}>
                    [{log.action}]
                  </span>
                  <span style={{ color: 'var(--hf-ink)', fontWeight: 600 }}>
                    {log.resource_type}:{log.resource_id}
                  </span>
                  <span style={{ color: 'var(--hf-text-secondary)', marginLeft: 'auto' }}>
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
