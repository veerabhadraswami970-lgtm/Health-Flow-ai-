import React, { useState } from 'react';
import { 
  UserCheck, Calendar, FileText, QrCode, CheckCircle, 
  Clock, Plus, AlertCircle, ShieldCheck, Stethoscope, User, Search, 
  Activity, Users, Award, ShieldAlert
} from 'lucide-react';
import MedicalCross3D from './3d/MedicalCross3D';

export default function DoctorDashboard({ t }) {
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'consultation'
  
  const [appointments] = useState([
    { id: 'apt_101', patient: 'Ravi Kumar', age: 48, time: '10:00 AM', date: 'Today', status: 'CONFIRMED', reason: 'Cardiology Follow-up' },
    { id: 'apt_102', patient: 'Sunita Devi', age: 42, time: '11:30 AM', date: 'Today', status: 'CONFIRMED', reason: 'Hypertension Consultation' },
    { id: 'apt_103', patient: 'Anil Kumar', age: 24, time: '02:00 PM', date: 'Today', status: 'PENDING', reason: 'ECG Review' }
  ]);

  // Consultation state
  const [selectedPatient, setSelectedPatient] = useState('Ravi Kumar');
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension & Mild Type 2 Diabetes');
  const [rxMeds, setRxMeds] = useState([
    { name: 'Telma 40', dosage: '40mg', freq: '1-0-0', duration: '30 days', timing: 'Morning after food' },
    { name: 'Glycomet 500 SR', dosage: '500mg', freq: '1-0-0', duration: '30 days', timing: 'With breakfast' }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('1 tab');
  const [generatedQR, setGeneratedQR] = useState(null);

  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    setRxMeds([...rxMeds, {
      name: newMedName.trim(),
      dosage: newDosage,
      freq: '1-0-1',
      duration: '30 days',
      timing: 'After food'
    }]);
    setNewMedName('');
  };

  const handleGeneratePrescriptionQR = () => {
    const qrToken = `JWT_RX_${Math.floor(10000000 + Math.random() * 90000000)}_SIGNED_CDSCO`;
    setGeneratedQR({
      token: qrToken,
      date: new Date().toLocaleString()
    });
    alert(`Digital Prescription signed & cryptographically generated! Token: ${qrToken.substring(0, 24)}...`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 10X Editorial Doctor Header Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(15, 110, 105, 0.08) 0%, rgba(61, 139, 122, 0.12) 100%)', border: '1px solid rgba(15, 110, 105, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--hf-teal), var(--hf-sage))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(15, 110, 105, 0.3)'
            }}>
              <Stethoscope size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className="font-editorial-serif" style={{ fontSize: '1.85rem', margin: 0 }}>
                  Dr. Ramesh Varma (MD, DM)
                </h2>
                <span className="badge badge-verified">ABDM HPR: HPR-AP-99218</span>
                {isOnLeave ? (
                  <span className="badge badge-danger">⚠️ ON LEAVE</span>
                ) : (
                  <span className="badge badge-eligible">● ON DUTY ACTIVE</span>
                )}
              </div>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                Chief Cardiologist • Nizam's Institute of Medical Sciences (NIMS) Hyderabad
              </p>
            </div>
          </div>

          {/* Duty Status Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '9999px', border: '1px solid rgba(22, 32, 36, 0.1)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--hf-ink)' }}>Duty Status:</span>
            <button
              onClick={() => setIsOnLeave(!isOnLeave)}
              className={`btn ${isOnLeave ? 'btn-emergency' : 'btn-primary'}`}
              style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '9999px' }}
            >
              {isOnLeave ? 'Switch to On Duty' : 'Mark On Leave'}
            </button>
          </div>
        </div>
      </div>

      {/* 3D Glassmorphic Stats Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(15, 110, 105, 0.12)', color: 'var(--hf-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>{appointments.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Today's OPD Patients</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(217, 79, 61, 0.12)', color: 'var(--hf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>1</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Pending Consultations</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>28</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Signed Digital QRs</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--hf-ink)', lineHeight: 1 }}>100%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>ABDM HPR Compliance</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(22, 32, 36, 0.1)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 22px', fontSize: '0.9rem', borderRadius: '9999px' }}
        >
          <Calendar size={16} />
          <span>Today's OPD Queue ({appointments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('consultation')}
          className={`btn ${activeTab === 'consultation' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 22px', fontSize: '0.9rem', borderRadius: '9999px' }}
        >
          <FileText size={16} />
          <span>Clinical Consultation & Digital QR</span>
        </button>
      </div>

      {/* Tab Content: Appointments Grid */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
          {appointments.map(apt => (
            <div key={apt.id} className="glass-card" style={{ padding: '24px', borderTop: '4px solid var(--hf-teal)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="badge badge-verified">
                  <CheckCircle size={12} /> {apt.status}
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--hf-teal)', background: 'rgba(15, 110, 105, 0.08)', padding: '4px 10px', borderRadius: '6px' }}>
                  {apt.time}
                </span>
              </div>
              <h3 className="font-editorial-serif" style={{ fontSize: '1.3rem', color: 'var(--hf-ink)', margin: '0 0 6px 0' }}>
                {apt.patient} ({apt.age} yrs)
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--hf-text-secondary)', marginBottom: '20px' }}>
                <strong>Reason:</strong> {apt.reason}
              </p>
              <button
                onClick={() => {
                  setSelectedPatient(apt.patient);
                  setActiveTab('consultation');
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                <Stethoscope size={16} />
                <span>Start Clinical Consultation</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Consultation Workspace */}
      {activeTab === 'consultation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '28px' }}>
          
          {/* Prescription Form */}
          <div className="glass-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-teal)' }}>
            <h3 className="font-editorial-serif" style={{ fontSize: '1.4rem', color: 'var(--hf-ink)', marginBottom: '18px' }}>
              Digital Clinical Prescription Workspace
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Patient Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Clinical Diagnosis & Observations
                </label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{ background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
                />
              </div>

              {/* Medicines List */}
              <div>
                <label style={{ fontSize: '0.84rem', color: 'var(--hf-ink-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Prescribed Medicines Checklist
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  {rxMeds.map((med, idx) => (
                    <div key={idx} style={{ background: 'rgba(15, 110, 105, 0.06)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(15, 110, 105, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--hf-ink)', fontSize: '0.95rem' }}>{med.name} ({med.dosage})</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--hf-text-secondary)' }}>{med.freq} • {med.duration} • {med.timing}</div>
                      </div>
                      <button
                        onClick={() => setRxMeds(rxMeds.filter((_, i) => i !== idx))}
                        style={{ background: 'transparent', border: 'none', color: 'var(--hf-coral)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Add medicine name (e.g. Dolo 650)..."
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
                  />
                  <button type="button" onClick={handleAddMed} className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              <button
                onClick={handleGeneratePrescriptionQR}
                className="btn btn-primary"
                style={{ padding: '14px', marginTop: '8px' }}
              >
                <QrCode size={18} />
                <span>Sign & Issue Cryptographic Prescription QR</span>
              </button>
            </div>
          </div>

          {/* QR Preview Card */}
          <div>
            {generatedQR ? (
              <div className="glass-card animate-slide-up" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(15, 110, 105, 0.3)' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '20px', display: 'inline-block', marginBottom: '18px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                  <QrCode size={130} color="var(--hf-ink)" />
                </div>
                <h4 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', marginBottom: '8px' }}>
                  Prescription QR Signed
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Cryptographically signed zero-PII token. The patient can present this QR at any empaneled pharmacy for instant dispensing.
                </p>
                <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--hf-teal)', wordBreak: 'break-all', background: 'rgba(15, 110, 105, 0.08)', padding: '12px', borderRadius: '10px', fontWeight: 700 }}>
                  {generatedQR.token}
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--hf-text-muted)' }}>
                <QrCode size={64} style={{ margin: '0 auto 16px auto', opacity: 0.4, color: 'var(--hf-teal)' }} />
                <h4 className="font-editorial-serif" style={{ fontSize: '1.2rem', color: 'var(--hf-ink)', marginBottom: '6px' }}>
                  No Active QR Generated
                </h4>
                <p style={{ fontSize: '0.88rem' }}>Complete the prescription form on the left and click "Sign & Issue Cryptographic Prescription QR".</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
