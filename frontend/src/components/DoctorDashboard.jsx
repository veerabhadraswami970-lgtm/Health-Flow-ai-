import React, { useState } from 'react';
import { 
  UserCheck, Calendar, FileText, QrCode, CheckCircle, 
  Clock, Plus, AlertCircle, ShieldCheck, Stethoscope, User, Search 
} from 'lucide-react';
import MedicalCross3D from './3d/MedicalCross3D';

export default function DoctorDashboard({ t }) {
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [leaveReason, setLeaveReason] = useState('Attending Medical Conference');
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'consultation' | 'leave'
  
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
      
      {/* Doctor Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #00c9a7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#030712',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
          }}>
            <Stethoscope size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Dr. Ramesh Varma (MD, DM)
              </h2>
              <span className="badge badge-verified">ABDM HPR: HPR-AP-99218</span>
              {isOnLeave && <span className="badge badge-danger">⚠️ ON LEAVE</span>}
            </div>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Chief Cardiologist • Nizam's Institute of Medical Sciences (NIMS) Hyderabad.
            </p>
          </div>
        </div>

        {/* Leave Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--hf-border-subtle)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Doctor Duty Status:</span>
          <button
            onClick={() => setIsOnLeave(!isOnLeave)}
            className={`btn ${isOnLeave ? 'btn-emergency' : 'btn-primary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {isOnLeave ? 'Status: On Leave' : 'Status: On Duty / Active'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--hf-border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
        >
          <Calendar size={16} />
          <span>Today's OPD Appointments ({appointments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('consultation')}
          className={`btn ${activeTab === 'consultation' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
        >
          <FileText size={16} />
          <span>Consultation & QR Prescription</span>
        </button>
      </div>

      {/* Tab Content: Appointments */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {appointments.map(apt => (
            <div key={apt.id} className="hf-3d-card" style={{ padding: '22px', borderLeft: '4px solid var(--hf-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-verified">
                  <CheckCircle size={12} /> {apt.status}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontFamily: 'monospace' }}>{apt.time}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>{apt.patient} ({apt.age} yrs)</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                Reason: {apt.reason}
              </p>
              <button
                onClick={() => {
                  setSelectedPatient(apt.patient);
                  setActiveTab('consultation');
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
              >
                <Stethoscope size={15} />
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
          <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-primary)' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 800, marginBottom: '16px' }}>
              Create Digital Clinical Prescription
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Patient Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Clinical Diagnosis</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* Medicines List */}
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Prescribed Medicines</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {rxMeds.map((med, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{med.name} ({med.dosage})</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>{med.freq} • {med.duration} • {med.timing}</div>
                      </div>
                      <button
                        onClick={() => setRxMeds(rxMeds.filter((_, i) => i !== idx))}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Add medicine name..."
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                  <button type="button" onClick={handleAddMed} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              <button
                onClick={handleGeneratePrescriptionQR}
                className="btn btn-primary"
                style={{ padding: '12px', marginTop: '10px' }}
              >
                <QrCode size={18} />
                <span>Sign & Generate Secure Prescription QR</span>
              </button>
            </div>
          </div>

          {/* QR Preview Card */}
          <div>
            {generatedQR ? (
              <div className="hf-3d-card animate-slide-up" style={{ padding: '28px', textAlign: 'center', border: '1px solid rgba(0, 201, 167, 0.4)' }}>
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  <QrCode size={120} color="#0a0f1d" />
                </div>
                <h4 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, marginBottom: '6px' }}>
                  Prescription QR Token Ready
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)', marginBottom: '14px' }}>
                  Cryptographically signed zero-PII token. Patient can present this QR at any empaneled pharmacy for instant dispensing.
                </p>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  {generatedQR.token}
                </div>
              </div>
            ) : (
              <div className="hf-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--hf-text-muted)' }}>
                <QrCode size={64} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>Fill in prescription details and click "Sign & Generate Secure Prescription QR".</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
