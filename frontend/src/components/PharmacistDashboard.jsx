import React, { useState } from 'react';
import { 
  Scan, QrCode, CheckCircle2, AlertCircle, Pill, 
  Search, PackageCheck, History, ShieldCheck, Clock, FileText, UserCheck 
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
      
      {/* Pharmacist Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Pill size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Pharmacist Dispensing Portal
              </h2>
              <span className="badge badge-verified">License: TS-PHARM-88219</span>
            </div>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Apollo Medical Pharmacy • Verified QR Token Authenticator & CDSCO Schedule Compliance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            <ShieldCheck size={14} /> Zero-PII QR Authenticated
          </span>
        </div>
      </div>

      {/* Main Grid: QR Scanner & Active Verification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.2fr)', gap: '28px' }}>
        
        {/* Left Column: QR Token Input & Medicine Inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Scanner Card */}
          <div className="hf-card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <QrCode size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800 }}>Scan / Input Prescription QR Token</h3>
            </div>

            <form onSubmit={handleVerifyToken} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Enter Secure Token or Scan QR
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. rx_88192_nims or paste signed JWT QR string"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                  <Scan size={16} />
                  <span>{loading ? 'Authenticating...' : 'Authenticate Prescription'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setTokenInput('rx_demo_9821')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '10px' }}
                >
                  Demo Rx
                </button>
              </div>
            </form>
          </div>

          {/* Quick Medicine Inventory Search */}
          <div className="hf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#f8fafc' }}>
                <PackageCheck size={18} color="var(--hf-cyan)" />
                <span>Pharmacy Stock & Schedule Check</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--hf-text-muted)' }}>Live Inventory</span>
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="Search stock by brand or generic name..."
              value={searchMed}
              onChange={(e) => setSearchMed(e.target.value)}
              style={{ marginBottom: '14px', padding: '8px 12px', fontSize: '0.85rem' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {filteredMeds.map((m, idx) => (
                <div key={idx} style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--hf-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--hf-text-secondary)' }}>{m.generic} • <span style={{ color: '#fbbf24' }}>{m.schedule}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: m.stock > 100 ? '#34d399' : '#f87171' }}>
                      {m.stock} units
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--hf-text-muted)' }}>₹{m.price} / strip</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authenticated Prescription Details & Dispensing Form */}
        <div>
          {scannedRx ? (
            <div className="hf-3d-card animate-slide-up" style={{ padding: '28px', borderLeft: '4px solid #34d399' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--hf-border-subtle)' }}>
                <div>
                  <span className="badge badge-eligible" style={{ marginBottom: '4px' }}>
                    <CheckCircle2 size={12} /> AUTHENTICATED PRESCRIPTION
                  </span>
                  <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
                    Patient: {scannedRx.patient_name} ({scannedRx.patient_age} yrs)
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--hf-text-muted)' }}>Prescription ID</div>
                  <div style={{ fontFamily: 'monospace', color: '#34d399', fontWeight: 700 }}>{scannedRx.id}</div>
                </div>
              </div>

              {/* Prescribing Doctor & Hospital */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
                <div><strong>Doctor:</strong> {scannedRx.doctor_name}</div>
                <div><strong>Facility:</strong> {scannedRx.clinic_or_hospital}</div>
                <div><strong>Diagnosis:</strong> <span style={{ color: '#f8fafc' }}>{scannedRx.diagnosis}</span></div>
                <div><strong>Date Prescribed:</strong> {scannedRx.prescription_date}</div>
              </div>

              {/* Prescribed Items Checklist */}
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 700, marginBottom: '12px' }}>
                Prescribed Medicines Checklist:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {scannedRx.items.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
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
              <form onSubmit={handleDispenseSubmit} style={{ background: 'rgba(0,0,0,0.4)', padding: '18px', borderRadius: '14px', border: '1px solid var(--hf-border-subtle)' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700, marginBottom: '12px' }}>
                  Update Dispensing Status & Audit Trail
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Dispense Status
                    </label>
                    <select
                      className="select-field"
                      value={dispenseStatus}
                      onChange={(e) => setDispenseStatus(e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="DISPENSED" style={{ background: '#0b1325' }}>DISPENSED (Complete)</option>
                      <option value="PARTIALLY_DISPENSED" style={{ background: '#0b1325' }}>PARTIALLY DISPENSED</option>
                      <option value="EXPIRED" style={{ background: '#0b1325' }}>EXPIRED</option>
                      <option value="CANCELLED" style={{ background: '#0b1325' }}>CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Pharmacist Notes
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Dispensed 30 tabs batch #B981"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                  <PackageCheck size={18} />
                  <span>Confirm Dispense & Log Status</span>
                </button>
              </form>
            </div>
          ) : (
            /* Empty State */
            <div className="hf-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Prescription3D size={120} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px' }}>
                No Active Prescription Loaded
              </h3>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 20px auto' }}>
                Enter a valid prescription QR token or scan the patient's prescription barcode to view clinical details and dispense medicines.
              </p>
              <button 
                onClick={() => setTokenInput('rx_demo_9821')}
                className="btn btn-secondary" 
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Load Sample Prescription
              </button>
            </div>
          )}

          {/* Dispensing Audit History */}
          <div className="hf-card" style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
              <History size={18} color="var(--hf-cyan)" />
              <span>Recent Dispensing Audit Trail</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((h, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--hf-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>{h.patient_name} ({h.rx_id})</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--hf-text-secondary)' }}>
                      Doc: {h.doctor_name} • Items: {h.items.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${h.status === 'DISPENSED' ? 'badge-eligible' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {h.status}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--hf-text-muted)', marginTop: '2px' }}>{h.date}</div>
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
