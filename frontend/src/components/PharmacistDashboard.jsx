import React, { useState } from 'react';
import { 
  Scan, QrCode, CheckCircle2, AlertCircle, Pill, 
  Search, PackageCheck, History, ShieldCheck, Clock, FileText, UserCheck, Package, Award
} from 'lucide-react';
import Prescription3D from './3d/Prescription3D';

export default function PharmacistDashboard({ t }) {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedRx, setScannedRx] = useState(null);
  const [dispenseStatus, setDispenseStatus] = useState('DISPENSED');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([
    {
      rx_id: 'rx_demo_9821',
      patient_name: 'Ravi Kumar',
      doctor_name: 'Dr. Ramesh Varma',
      date: '2026-08-24 18:30',
      status: 'DISPENSED',
      items: ['Telma 40mg', 'Glycomet 500mg']
    }
  ]);
  const [searchMed, setSearchMed] = useState('');
  const [medStock] = useState([
    { name: 'Telma 40', generic: 'Telmisartan 40mg', stock: 240, price: 95.0, schedule: 'Schedule H' },
    { name: 'Glycomet 500 SR', generic: 'Metformin 500mg', stock: 180, price: 42.0, schedule: 'Schedule H' },
    { name: 'Dolo 650', generic: 'Paracetamol 650mg', stock: 520, price: 30.5, schedule: 'OTC' },
    { name: 'Azithral 500', generic: 'Azithromycin 500mg', stock: 85, price: 118.0, schedule: 'Schedule H1' },
    { name: 'Pan 40', generic: 'Pantoprazole 40mg', stock: 310, price: 78.0, schedule: 'Schedule H' }
  ]);

  // Demo prescription lookup
  const handleVerifyToken = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    try {
      setTimeout(() => {
        setScannedRx({
          id: tokenInput.trim().startsWith('rx_') ? tokenInput.trim() : 'rx_88192_nims',
          patient_name: 'Ravi Kumar',
          patient_age: 48,
          doctor_name: 'Dr. Ramesh Varma, MD DM',
          clinic_or_hospital: 'NIMS Hospital Hyderabad',
          prescription_date: '2026-08-24',
          diagnosis: 'Essential Hypertension & Type 2 Diabetes',
          status: 'ACTIVE',
          items: [
            { name: 'Telma 40', strength: '40mg', freq: '1-0-0', duration: '30 days', timing: 'Morning after food', verified: true },
            { name: 'Glycomet 500 SR', strength: '500mg', freq: '1-0-0', duration: '30 days', timing: 'With breakfast', verified: true },
            { name: 'Dolo 650', strength: '650mg', freq: '1-0-1 SOS', duration: '3 days', timing: 'After food', verified: true }
          ]
        });
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDispenseSubmit = (e) => {
    e.preventDefault();
    if (!scannedRx) return;

    const newRecord = {
      rx_id: scannedRx.id,
      patient_name: scannedRx.patient_name,
      doctor_name: scannedRx.doctor_name,
      date: new Date().toLocaleString(),
      status: dispenseStatus,
      items: scannedRx.items.map(i => i.name)
    };

    setHistory([newRecord, ...history]);
    setScannedRx(prev => ({ ...prev, status: dispenseStatus }));
    alert(`Prescription marked as ${dispenseStatus}! Dispensing audit record created.`);
  };

  const filteredMeds = medStock.filter(m => 
    m.name.toLowerCase().includes(searchMed.toLowerCase()) || 
    m.generic.toLowerCase().includes(searchMed.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 10X Editorial Pharmacist Header Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(45, 115, 101, 0.08) 0%, rgba(15, 110, 105, 0.12) 100%)', border: '1px solid rgba(45, 115, 101, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--hf-sage), var(--hf-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(45, 115, 101, 0.3)'
            }}>
              <Pill size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className="font-editorial-serif" style={{ fontSize: '1.85rem', margin: 0 }}>
                  Pharmacist Dispensing Portal
                </h2>
                <span className="badge badge-verified">License: TS-PHARM-88219</span>
              </div>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                Apollo Medical Pharmacy • QR Token Verification & CDSCO Schedule-H Shield
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-teal" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> Zero-PII QR Authenticated
            </span>
          </div>
        </div>
      </div>

      {/* 3D Glassmorphic Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(15, 110, 105, 0.12)', color: 'var(--hf-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{history.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Dispensed Today</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(45, 115, 101, 0.12)', color: 'var(--hf-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>520</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>In-Stock Medicines</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(217, 79, 61, 0.12)', color: 'var(--hf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>2</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Pending QR Scans</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(180, 83, 9, 0.12)', color: 'var(--hf-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>100%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>CDSCO Schedule-H Pass</div>
          </div>
        </div>
      </div>

      {/* Main Grid: QR Scanner & Active Verification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.2fr)', gap: '28px' }}>
        
        {/* Left Column: QR Token Input & Medicine Inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Scanner Card */}
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--hf-sage)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <QrCode size={22} color="var(--hf-sage)" />
              <h3 className="font-editorial-serif" style={{ fontSize: '1.3rem', color: 'var(--hf-ink)', margin: 0 }}>
                Scan / Input Prescription QR Token
              </h3>
            </div>

            <form onSubmit={handleVerifyToken} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Enter Secure Token or Scan QR Code
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. rx_88192_nims or paste signed JWT string"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{ fontSize: '0.9rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  <Scan size={16} />
                  <span>{loading ? 'Authenticating...' : 'Authenticate Prescription'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setTokenInput('rx_demo_9821')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '12px 18px' }}
                >
                  Load Sample Rx
                </button>
              </div>
            </form>
          </div>

          {/* Quick Medicine Inventory Search */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--hf-ink)' }}>
                <PackageCheck size={18} color="var(--hf-teal)" />
                <span>Pharmacy Stock & Schedule Check</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>Live Inventory</span>
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="Search stock by brand or generic name..."
              value={searchMed}
              onChange={(e) => setSearchMed(e.target.value)}
              style={{ marginBottom: '14px', padding: '10px 14px', fontSize: '0.88rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
              {filteredMeds.map((m, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(22, 32, 36, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--hf-ink)', fontSize: '0.9rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>{m.generic} • <span style={{ color: 'var(--hf-gold)', fontWeight: 700 }}>{m.schedule}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: m.stock > 100 ? 'var(--hf-teal)' : 'var(--hf-coral)' }}>
                      {m.stock} units
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)' }}>₹{m.price} / strip</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authenticated Prescription Details & Dispensing Form */}
        <div>
          {scannedRx ? (
            <div className="glass-card animate-slide-up" style={{ padding: '28px', borderLeft: '4px solid var(--hf-teal)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(22, 32, 36, 0.1)' }}>
                <div>
                  <span className="badge badge-eligible" style={{ marginBottom: '4px' }}>
                    <CheckCircle2 size={12} /> AUTHENTICATED PRESCRIPTION
                  </span>
                  <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', margin: 0 }}>
                    Patient: {scannedRx.patient_name} ({scannedRx.patient_age} yrs)
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)' }}>Prescription ID</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--hf-teal)', fontWeight: 800 }}>{scannedRx.id}</div>
                </div>
              </div>

              {/* Prescribing Doctor & Hospital */}
              <div style={{ background: 'rgba(15, 110, 105, 0.06)', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--hf-ink-muted)' }}>
                <div><strong>Doctor:</strong> {scannedRx.doctor_name}</div>
                <div><strong>Facility:</strong> {scannedRx.clinic_or_hospital}</div>
                <div><strong>Diagnosis:</strong> <span style={{ color: 'var(--hf-ink)', fontWeight: 600 }}>{scannedRx.diagnosis}</span></div>
                <div><strong>Date Prescribed:</strong> {scannedRx.prescription_date}</div>
              </div>

              {/* Prescribed Items Checklist */}
              <h4 style={{ fontSize: '0.95rem', color: 'var(--hf-ink)', fontWeight: 700, marginBottom: '12px' }}>
                Prescribed Medicines Checklist:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {scannedRx.items.map((item, idx) => (
                  <div key={idx} style={{
                    background: '#ffffff',
                    border: '1px solid rgba(15, 110, 105, 0.2)',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--hf-ink)', fontSize: '0.95rem' }}>
                        {idx + 1}. {item.name} ({item.strength})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--hf-text-secondary)' }}>
                        Dosage: {item.freq} • Duration: {item.duration} • Timing: {item.timing}
                      </div>
                    </div>
                    <span className="badge badge-eligible" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={11} /> Verified CDSCO
                    </span>
                  </div>
                ))}
              </div>

              {/* Dispense Form */}
              <form onSubmit={handleDispenseSubmit} style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(22, 32, 36, 0.1)' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--hf-ink)', fontWeight: 700, marginBottom: '14px' }}>
                  Update Dispensing Status & Audit Trail
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Dispense Status
                    </label>
                    <select
                      className="select-field"
                      value={dispenseStatus}
                      onChange={(e) => setDispenseStatus(e.target.value)}
                      style={{ padding: '10px', fontSize: '0.88rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
                    >
                      <option value="DISPENSED">DISPENSED (Complete)</option>
                      <option value="PARTIALLY_DISPENSED">PARTIALLY DISPENSED</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Pharmacist Notes
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Dispensed 30 tabs batch #B981"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ padding: '10px', fontSize: '0.88rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  <PackageCheck size={18} />
                  <span>Confirm Dispense & Log Audit Trail</span>
                </button>
              </form>
            </div>
          ) : (
            /* Empty State */
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Prescription3D size={120} />
              </div>
              <h3 className="font-editorial-serif" style={{ fontSize: '1.3rem', color: 'var(--hf-ink)', marginBottom: '8px' }}>
                No Active Prescription Loaded
              </h3>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 24px auto' }}>
                Enter a valid prescription QR token or scan the patient's prescription barcode to view clinical details and dispense medicines.
              </p>
              <button 
                onClick={() => setTokenInput('rx_demo_9821')}
                className="btn btn-secondary" 
                style={{ padding: '10px 22px', fontSize: '0.88rem' }}
              >
                Load Sample Prescription
              </button>
            </div>
          )}

          {/* Dispensing Audit History */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--hf-ink)', marginBottom: '16px' }}>
              <History size={18} color="var(--hf-teal)" />
              <span>Recent Dispensing Audit Trail</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((h, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(22, 32, 36, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--hf-ink)', fontSize: '0.9rem' }}>{h.patient_name} ({h.rx_id})</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>
                      Doc: {h.doctor_name} • Items: {h.items.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${h.status === 'DISPENSED' ? 'badge-eligible' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                      {h.status}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)', marginTop: '4px' }}>{h.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
