import React, { useState } from 'react';
import { 
  UserCheck, Stethoscope, Building2, Pill, Lock, 
  CheckCircle, ShieldCheck, X, Upload, FileText 
} from 'lucide-react';

export default function RoleRegistrationModal({ role, onClose, onComplete, t }) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states per role
  const [patientData, setPatientData] = useState({
    name: 'Ravi Kumar',
    age: 48,
    gender: 'Male',
    blood_group: 'O+',
    phone: '9876543210',
    emergency_contact: '9876500000',
    address: 'Banjara Hills, Hyderabad',
    abha_id: 'abha-9981-2291',
    existing_diseases: 'Hypertension, Type 2 Diabetes'
  });

  const [doctorData, setDoctorData] = useState({
    name: 'Dr. Ramesh Varma',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    license_no: 'MCI-54892-AP',
    experience_years: 18,
    hospital: "Nizam's Institute of Medical Sciences (NIMS)",
    hpr_id: 'HPR-AP-99218',
    phone: '9849012345'
  });

  const [hospitalData, setHospitalData] = useState({
    hospital_name: "Nizam's Institute of Medical Sciences (NIMS)",
    type: 'Government Autonomous Super Speciality',
    address: 'Punjagutta, Hyderabad, Telangana 500082',
    helpline: '040-23489000',
    emergency_contact: '040-23489108',
    hfr_id: 'IN36100029',
    facilities: 'Trauma ICU, Dialysis, Cardiac Surgery, MRI, CT',
    departments: 'Cardiology, Neurology, Nephrology, Oncology',
    operating_hours: '24/7 Emergency & OPD (08:00 AM - 04:00 PM)'
  });

  const [pharmacistData, setPharmacistData] = useState({
    name: 'Srikanth Reddy',
    pharmacy_name: 'Apollo Medical Pharmacy Central',
    address: 'Road No 1, Banjara Hills, Hyderabad',
    license_no: 'TS-PHARM-88219',
    qualification: 'B.Pharm, Registered Pharmacist',
    phone: '9885099881'
  });

  const [adminData, setAdminData] = useState({
    name: 'System Super Admin',
    admin_key: 'HF-SYS-ADMIN-9981'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Registration & Account Verification successful for ${role} persona!`);
      setTimeout(() => {
        onComplete(role, isLoginMode ? 'login' : 'register');
      }, 1000);
    }, 700);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="hf-3d-card animate-slide-up" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '32px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(0, 242, 254, 0.35)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>STEP 3 • ROLE-BASED ONBOARDING</span>
            <h2 style={{ fontSize: '1.65rem', color: '#ffffff', fontWeight: 800 }}>
              {isLoginMode ? `Sign In as ${role}` : `${role} Registration & Verification`}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.88rem', marginTop: '2px' }}>
              {isLoginMode ? 'Enter credentials to access your dashboard.' : `Complete official ${role} credentials for verified access.`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--hf-text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Toggle Sign In / Register */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setIsLoginMode(false)}
            className={`btn ${!isLoginMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px', fontSize: '0.84rem' }}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => setIsLoginMode(true)}
            className={`btn ${isLoginMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px', fontSize: '0.84rem' }}
          >
            Existing User Sign In
          </button>
        </div>

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* PATIENT REGISTRATION FORM */}
          {role === 'Patient' && !isLoginMode && (
            <>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" className="input-field" value={patientData.name} onChange={(e) => setPatientData({ ...patientData, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Age & Gender</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" className="input-field" value={patientData.age} onChange={(e) => setPatientData({ ...patientData, age: e.target.value })} style={{ width: '80px' }} required />
                    <select className="select-field" value={patientData.gender} onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}>
                      <option value="Male" style={{ background: '#0b1325' }}>Male</option>
                      <option value="Female" style={{ background: '#0b1325' }}>Female</option>
                      <option value="Other" style={{ background: '#0b1325' }}>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Blood Group</label>
                  <select className="select-field" value={patientData.blood_group} onChange={(e) => setPatientData({ ...patientData, blood_group: e.target.value })}>
                    <option value="O+" style={{ background: '#0b1325' }}>O+</option>
                    <option value="A+" style={{ background: '#0b1325' }}>A+</option>
                    <option value="B+" style={{ background: '#0b1325' }}>B+</option>
                    <option value="AB+" style={{ background: '#0b1325' }}>AB+</option>
                    <option value="O-" style={{ background: '#0b1325' }}>O-</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input type="text" className="input-field" value={patientData.phone} onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Existing ABHA Health ID (Optional)</label>
                <input type="text" className="input-field" placeholder="Enter ABHA ID (e.g., 14-digit or username)" value={patientData.abha_id} onChange={(e) => setPatientData({ ...patientData, abha_id: e.target.value })} />
              </div>
            </>
          )}

          {/* DOCTOR REGISTRATION FORM */}
          {role === 'Doctor' && !isLoginMode && (
            <>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Doctor Name</label>
                  <input type="text" className="input-field" value={doctorData.name} onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Specialization</label>
                  <input type="text" className="input-field" value={doctorData.specialization} onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Medical Qualification</label>
                  <input type="text" className="input-field" value={doctorData.qualification} onChange={(e) => setDoctorData({ ...doctorData, qualification: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Medical Council Registration No</label>
                  <input type="text" className="input-field" value={doctorData.license_no} onChange={(e) => setDoctorData({ ...doctorData, license_no: e.target.value })} required />
                </div>
              </div>
              <div style={{ background: 'rgba(0, 201, 167, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 201, 167, 0.3)', fontSize: '0.8rem', color: '#34d399' }}>
                <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
                ABDM Healthcare Professional Registry (HPR) verification request will be initiated.
              </div>
            </>
          )}

          {/* HOSPITAL ADMIN FORM */}
          {role === 'HospitalAdmin' && !isLoginMode && (
            <>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Hospital Name</label>
                  <input type="text" className="input-field" value={hospitalData.hospital_name} onChange={(e) => setHospitalData({ ...hospitalData, hospital_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ABDM HFR ID</label>
                  <input type="text" className="input-field" value={hospitalData.hfr_id} onChange={(e) => setHospitalData({ ...hospitalData, hfr_id: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>24/7 Trauma Emergency Contact</label>
                  <input type="text" className="input-field" value={hospitalData.emergency_contact} onChange={(e) => setHospitalData({ ...hospitalData, emergency_contact: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Key Facilities</label>
                  <input type="text" className="input-field" value={hospitalData.facilities} onChange={(e) => setHospitalData({ ...hospitalData, facilities: e.target.value })} required />
                </div>
              </div>
            </>
          )}

          {/* PHARMACIST FORM */}
          {role === 'Pharmacist' && !isLoginMode && (
            <>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pharmacist Name</label>
                  <input type="text" className="input-field" value={pharmacistData.name} onChange={(e) => setPharmacistData({ ...pharmacistData, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pharmacy Name</label>
                  <input type="text" className="input-field" value={pharmacistData.pharmacy_name} onChange={(e) => setPharmacistData({ ...pharmacistData, pharmacy_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pharmacy License No</label>
                  <input type="text" className="input-field" value={pharmacistData.license_no} onChange={(e) => setPharmacistData({ ...pharmacistData, license_no: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Qualification</label>
                  <input type="text" className="input-field" value={pharmacistData.qualification} onChange={(e) => setPharmacistData({ ...pharmacistData, qualification: e.target.value })} required />
                </div>
              </div>
            </>
          )}

          {/* SIGN IN FORM (Common fallback for Existing Users) */}
          {isLoginMode && (
            <>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>User Identifier / Registered Phone / License ID</label>
                <input type="text" className="input-field" placeholder={`Enter registered ${role} ID or Phone`} defaultValue="user_ravi_kumar" required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Security Passcode / OTP</label>
                <input type="password" className="input-field" defaultValue="••••••••" required />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            <span>{loading ? 'Verifying Account & Role Credentials...' : (isLoginMode ? `Sign In to ${role} Dashboard` : `Complete ${role} Registration`)}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
