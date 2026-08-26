import React, { useState } from 'react';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { 
  User, Phone, Mail, MapPin, Heart, ShieldAlert, Pill, 
  Calendar, Upload, Camera, CheckCircle2, AlertCircle, 
  ArrowRight, ArrowLeft, RefreshCw, QrCode, Sparkles, 
  Plus, Trash2, FileText, Check, ShieldCheck
} from 'lucide-react';
import { healthflowApi, setAuthSession } from '../services/api';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const RELATIONSHIPS = ["Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Guardian", "Friend", "Other"];
const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", 
  "Kerala", "Delhi", "Uttar Pradesh", "Gujarat", "West Bengal", "Rajasthan", 
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Assam"
];

const INITIAL_FORM = {
  // Step 1: Personal
  full_name: '',
  date_of_birth: '',
  age: '',
  gender: 'Male',
  height: '',
  weight: '',
  blood_group: 'B+',
  aadhaar_abha_id: '',
  preferred_language: 'en',
  profile_photo: '',

  // Step 2: Contact
  phone: '',
  email: '',
  password: '',
  confirm_password: '',
  alternate_phone: '',
  address: '',
  city: 'Hyderabad',
  state: 'Telangana',
  district: 'Hyderabad',
  pincode: '',

  // Step 3: Emergency Contacts
  emergency_contact: {
    name: '',
    relationship: 'Spouse',
    phone: '',
    alternate_phone: '',
    address: ''
  },
  alternate_emergency_contact: {
    name: '',
    relationship: 'Friend',
    phone: '',
    alternate_phone: '',
    address: ''
  },

  // Step 4: Medical Profile
  existing_conditions: [],
  allergies: [],
  allergy_details: '',
  current_medications: [
    { medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '30 days' }
  ],
  medical_history: {
    surgeries: [],
    hospitalizations: [],
    major_illnesses: [],
    notes: ''
  }
};

const COMMON_CONDITIONS = ["Diabetes Type 2", "Hypertension", "Asthma", "Thyroid Disorder", "Coronary Artery Disease", "CKD"];
const COMMON_ALLERGIES = ["Penicillin", "Sulfa Drugs", "NSAIDs / Aspirin", "Peanuts", "Dust / Pollen", "No Known Allergies"];

export default function RegistrationWizard({ t }) {
  const regT = t?.registration || {};
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [customCondition, setCustomCondition] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');

  // Auto calculate age from DOB
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let calculatedAge = '';
    if (dobVal) {
      const birthDate = new Date(dobVal);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age > 0 ? age : 0;
    }
    setFormData(prev => ({
      ...prev,
      date_of_birth: dobVal,
      age: calculatedAge ? calculatedAge.toString() : ''
    }));
    if (errors.date_of_birth) {
      setErrors(prev => ({ ...prev, date_of_birth: null }));
    }
  };

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Validation
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
        newErrors.full_name = "Full name is required (min 2 characters)";
      }
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = "Date of birth is required";
      }
      if (formData.height && (isNaN(formData.height) || Number(formData.height) <= 0 || Number(formData.height) > 300)) {
        newErrors.height = "Height must be a valid number in cm (1 - 300)";
      }
      if (formData.weight && (isNaN(formData.weight) || Number(formData.weight) <= 0 || Number(formData.weight) > 500)) {
        newErrors.weight = "Weight must be a valid number in kg (1 - 500)";
      }
    }

    if (currentStep === 2) {
      const phoneDigits = (formData.phone || '').replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = "Valid 10-digit primary phone is required";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        newErrors.email = "Valid email address is required";
      }
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
      const pinDigits = (formData.pincode || '').replace(/\D/g, '');
      if (pinDigits.length !== 6) {
        newErrors.pincode = "Valid 6-digit postal PIN code is required";
      }
      if (!formData.address.trim()) {
        newErrors.address = "Residential address is required";
      }
    }

    if (currentStep === 3) {
      if (!formData.emergency_contact.name.trim()) {
        newErrors.emergency_name = "Primary emergency contact name is required";
      }
      const emgDigits = (formData.emergency_contact.phone || '').replace(/\D/g, '');
      if (emgDigits.length < 10) {
        newErrors.emergency_phone = "Valid 10-digit emergency contact phone is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chronic conditions toggle
  const toggleCondition = (cond) => {
    setFormData(prev => {
      const exists = prev.existing_conditions.includes(cond);
      return {
        ...prev,
        existing_conditions: exists 
          ? prev.existing_conditions.filter(c => c !== cond)
          : [...prev.existing_conditions, cond]
      };
    });
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !formData.existing_conditions.includes(customCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        existing_conditions: [...prev.existing_conditions, customCondition.trim()]
      }));
      setCustomCondition('');
    }
  };

  // Allergies toggle
  const toggleAllergy = (allergy) => {
    setFormData(prev => {
      if (allergy === "No Known Allergies") {
        return { ...prev, allergies: ["No Known Allergies"] };
      }
      const withoutNone = prev.allergies.filter(a => a !== "No Known Allergies");
      const exists = withoutNone.includes(allergy);
      const updated = exists ? withoutNone.filter(a => a !== allergy) : [...withoutNone, allergy];
      return { ...prev, allergies: updated.length > 0 ? updated : ["No Known Allergies"] };
    });
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !formData.allergies.includes(customAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies.filter(a => a !== "No Known Allergies"), customAllergy.trim()]
      }));
      setCustomAllergy('');
    }
  };

  // Medications management
  const addMedicationRow = () => {
    setFormData(prev => ({
      ...prev,
      current_medications: [
        ...prev.current_medications,
        { medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '30 days' }
      ]
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData(prev => {
      const meds = [...prev.current_medications];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, current_medications: meds };
    });
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      current_medications: prev.current_medications.filter((_, i) => i !== index)
    }));
  };

  // Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setLoading(true);
    setApiError(null);

    try {
      // Filter out empty medication rows
      const validMeds = formData.current_medications.filter(m => m.medicine_name.trim());
      
      const patientPayload = {
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        blood_group: formData.blood_group,
        aadhaar_abha_id: formData.aadhaar_abha_id.trim() || undefined,
        profile_photo: formData.profile_photo || undefined,
        preferred_language: formData.preferred_language,

        phone: formData.phone.trim(),
        email: formData.email.trim(),
        alternate_phone: formData.alternate_phone.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        district: formData.district || formData.city.trim(),
        pincode: formData.pincode.trim(),

        emergency_contact: {
          name: formData.emergency_contact.name.trim(),
          relationship: formData.emergency_contact.relationship,
          phone: formData.emergency_contact.phone.trim(),
          alternate_phone: formData.alternate_phone.trim() || "",
          address: formData.emergency_contact.address.trim() || ""
        },
        alternate_emergency_contact: formData.alternate_emergency_contact.name.trim() ? {
          name: formData.alternate_emergency_contact.name.trim(),
          relationship: formData.alternate_emergency_contact.relationship,
          phone: formData.alternate_emergency_contact.phone.trim(),
          alternate_phone: formData.alternate_emergency_contact.alternate_phone.trim() || "",
          address: formData.alternate_emergency_contact.address.trim() || ""
        } : null,

        existing_conditions: formData.existing_conditions,
        allergies: formData.allergies.length > 0 ? formData.allergies : ["No Known Allergies"],
        allergy_details: formData.allergy_details.trim() || undefined,
        current_medications: validMeds,
        medical_history: formData.medical_history
      };

      const registerPayload = {
        email: formData.email.trim(),
        password: formData.password,
        role: "Patient",
        patient_info: patientPayload
      };

      const result = await healthflowApi.registerUser(registerPayload);
      if (result && result.access_token) {
        setAuthSession(result.access_token, {
          user_id: result.user_id,
          patient_id: result.patient_id,
          role: result.role,
          name: result.name
        });
      }
      setSuccessData(result);
    } catch (err) {
      console.error("Patient Registration error:", err);
      setApiError(err.message || "Failed to complete patient registration. Please verify details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadHealthProfile = () => {
    if (!successData) return;
    const profileText = `================================================
HEALTHFLOW AI — PATIENT HEALTH PROFILE
================================================

PATIENT IDENTIFICATION
------------------------------------------------
HealthFlow Patient ID : ${successData.patient_id} (Internal HealthFlow ID)
ABHA Health ID       : ${formData.aadhaar_abha_id || 'Not linked'}
Legal Name           : ${formData.full_name}
Date of Birth        : ${formData.date_of_birth} (Age: ${formData.age || 'N/A'})
Gender               : ${formData.gender}
Blood Group          : ${formData.blood_group}
Height               : ${formData.height ? formData.height + ' cm' : 'N/A'}
Weight               : ${formData.weight ? formData.weight + ' kg' : 'N/A'}
Preferred Language   : ${formData.preferred_language}

CONTACT INFORMATION
------------------------------------------------
Mobile Phone         : ${formData.phone}
Email Address        : ${formData.email}
Address              : ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}

EMERGENCY CONTACTS
------------------------------------------------
Primary Contact      : ${formData.emergency_contact.name} (${formData.emergency_contact.relationship}) - ${formData.emergency_contact.phone}
Secondary Contact    : ${formData.alternate_emergency_contact.name ? `${formData.alternate_emergency_contact.name} (${formData.alternate_emergency_contact.relationship}) - ${formData.alternate_emergency_contact.phone}` : 'None'}

CLINICAL PROFILE
------------------------------------------------
Existing Diseases    : ${formData.existing_conditions.join(', ') || 'None reported'}
Allergies            : ${formData.allergies.join(', ') || 'No known allergies'}
Allergy Details      : ${formData.allergy_details || 'N/A'}
Ongoing Medications  : ${formData.current_medications.map(m => `${m.medicine_name} (${m.dosage}, ${m.frequency})`).join('; ') || 'None'}
Surgeries / Notes    : ${formData.medical_history.notes || 'None'}

Cryptographic Health QR Token:
${successData.qr_code || 'N/A'}

================================================
Generated on: ${new Date().toLocaleString()}
HealthFlow AI — Healthcare Without Barriers
================================================`;

    const blob = new Blob([profileText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthProfile_${successData.patient_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setStep(1);
    setSuccessData(null);
    setErrors({});
    setApiError(null);
  };

  // If successful registration, show confirmation card
  if (successData) {
    return (
      <div className="registration-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="hf-3d-card animate-slide-up" style={{ padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0, 201, 167, 0.4)' }}>
          <div style={{ margin: '0 auto 16px auto', display: 'flex', justifyContent: 'center' }}>
            <HealthcareShield3D size={120} />
          </div>

          <h2 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '8px', fontWeight: 800 }}>
            {regT.success_title || "Patient Registration Successful!"}
          </h2>
          <p style={{ color: 'var(--hf-text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Patient profile registered in HealthFlow registry with instant emergency readiness.
          </p>

          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '0.85rem',
            color: '#93c5fd',
            textAlign: 'center'
          }}>
            ℹ️ <strong>Patient ID: {successData.patient_id}</strong> is an internal HealthFlow system identifier. (This is NOT an official ABHA Health ID).
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            textAlign: 'left',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                HealthFlow Patient ID
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#34d399', fontFamily: 'monospace', marginTop: '4px' }}>
                {successData.patient_id}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Patient Legal Name
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f9fafb', marginTop: '4px' }}>
                {formData.full_name}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Blood Group, Height & Weight
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f9fafb', marginTop: '4px' }}>
                <span className="badge badge-eligible" style={{ marginRight: '8px' }}>{formData.blood_group}</span>
                {formData.height ? `${formData.height} cm` : ''} {formData.weight ? `• ${formData.weight} kg` : ''}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                ABHA Health ID
              </span>
              <div style={{ fontSize: '0.95rem', color: formData.aadhaar_abha_id ? '#34d399' : 'var(--text-muted)', marginTop: '4px' }}>
                {formData.aadhaar_abha_id || 'Not linked'}
              </div>
            </div>
          </div>

          {/* Cryptographic QR preview */}
          {successData.qr_code && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                <QrCode size={96} color="#0a0f1d" />
              </div>
              <div style={{ textAlign: 'left', maxWidth: '380px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                  <ShieldCheck size={18} />
                  {regT.qr_label || "Cryptographic Emergency Health QR"}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Zero-PII encrypted access token for emergency responders.
                </p>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  Token: {successData.qr_code.substring(0, 32)}...
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={downloadHealthProfile} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
              <FileText size={16} />
              <span>Download Health Profile</span>
            </button>
            <button onClick={handleReset} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <RefreshCw size={16} />
              <span>Register Another Patient</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: regT.step1_title || "Personal", icon: <User size={16} /> },
    { num: 2, title: regT.step2_title || "Contact", icon: <MapPin size={16} /> },
    { num: 3, title: regT.step3_title || "Emergency", icon: <ShieldAlert size={16} /> },
    { num: 4, title: regT.step4_title || "Medical", icon: <Heart size={16} /> },
    { num: 5, title: regT.step5_title || "ABHA & Review", icon: <FileText size={16} /> },
  ];

  return (
    <div className="registration-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem', fontWeight: '600', marginBottom: '10px' }}>
          <Sparkles size={15} />
          <span>Unified Patient Onboarding</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '8px', background: 'linear-gradient(135deg, #f9fafb 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {regT.header || "Patient Registration & ABHA Health ID"}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          {regT.sub || "Comprehensive healthcare onboarding with cryptographic Health QR and instant emergency profile creation."}
        </p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="wizard-progress-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        background: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(12px)',
        padding: '14px 20px',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)'
      }}>
        {stepsList.map((s, idx) => {
          const isCompleted = step > s.num;
          const isActive = step === s.num;
          return (
            <React.Fragment key={s.num}>
              <div 
                onClick={() => isCompleted && setStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: isCompleted ? 'pointer' : 'default',
                  opacity: isActive || isCompleted ? 1 : 0.45,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : (isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)'),
                  border: isActive ? '2px solid var(--accent-teal)' : (isCompleted ? 'none' : '1px solid var(--border-subtle)'),
                  color: isCompleted ? '#ffffff' : (isActive ? '#34d399' : 'var(--text-secondary)'),
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  {isCompleted ? <Check size={16} /> : s.num}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: isActive ? '700' : '600', color: isActive ? '#f9fafb' : 'var(--text-secondary)' }}>
                    {s.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: isCompleted ? '#34d399' : (isActive ? 'var(--accent-teal)' : 'var(--text-muted)') }}>
                    {isCompleted ? 'Completed' : (isActive ? 'In Progress' : 'Pending')}
                  </span>
                </div>
              </div>

              {idx < stepsList.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  margin: '0 12px',
                  background: isCompleted ? 'var(--accent-teal)' : 'var(--border-subtle)',
                  transition: 'background 0.3s ease'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Wizard Form Container */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        
        {/* Top API Error if any */}
        {apiError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} />
            <span>{apiError}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <User size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', color: '#f9fafb' }}>
                {regT.step1_title || "Step 1: Personal Information"}
              </h3>
            </div>

            {/* Profile Photo Upload & Preview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '16px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
              border: '1px dashed var(--border-subtle)',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: formData.profile_photo ? 'none' : 'rgba(255, 255, 255, 0.05)',
                border: '2px solid var(--accent-teal)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}>
                {formData.profile_photo ? (
                  <img src={formData.profile_photo} alt="Patient Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={42} color="var(--text-muted)" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#f9fafb', marginBottom: '4px' }}>
                  {regT.photo_upload || "Patient Photograph"}
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Upload a clear portrait for photo identity badge and ABDM card generation (PNG/JPG, max 2MB).
                </p>
                <label className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 14px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <Camera size={14} />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
                {formData.profile_photo && (
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, profile_photo: '' }))}
                    style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.full_name || "Full Legal Name"} *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ravi Kumar"
                  value={formData.full_name}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, full_name: e.target.value }));
                    if (errors.full_name) setErrors(prev => ({ ...prev, full_name: null }));
                  }}
                />
                {errors.full_name && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.full_name}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.dob || "Date of Birth"} *
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.date_of_birth}
                  onChange={handleDobChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date_of_birth && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.date_of_birth}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.age || "Calculated Age (Years)"}
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Auto-calculated from DOB"
                  value={formData.age}
                  onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.gender || "Gender"}
                </label>
                <select
                  className="select-field"
                  value={formData.gender}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 172"
                  value={formData.height}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, height: e.target.value }));
                    if (errors.height) setErrors(prev => ({ ...prev, height: null }));
                  }}
                />
                {errors.height && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.height}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 68"
                  value={formData.weight}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, weight: e.target.value }));
                    if (errors.weight) setErrors(prev => ({ ...prev, weight: null }));
                  }}
                />
                {errors.weight && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.weight}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.blood_group || "Blood Group"}
                </label>
                <select
                  className="select-field"
                  value={formData.blood_group}
                  onChange={e => setFormData(prev => ({ ...prev, blood_group: e.target.value }))}
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.language || "Preferred Communication Language"}
                </label>
                <select
                  className="select-field"
                  value={formData.preferred_language}
                  onChange={e => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.abha_id || "ABHA Health ID / Aadhaar Reference (Optional)"}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 14-digit ABHA Number (12-3456-7890-1234) or abha_address@abdm"
                  value={formData.aadhaar_abha_id}
                  onChange={e => setFormData(prev => ({ ...prev, aadhaar_abha_id: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT & ADDRESS */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <MapPin size={22} color="#3b82f6" />
              <h3 style={{ fontSize: '1.25rem', color: '#f9fafb' }}>
                {regT.step2_title || "Step 2: Contact Information & Address"}
              </h3>
            </div>

            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.phone || "Primary Mobile (+91)"} *
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                  }}
                />
                {errors.phone && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.phone}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.email || "Email Address"} *
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. patient@example.com"
                  value={formData.email}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                  }}
                />
                {errors.email && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Account Password *
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                  }}
                />
                {errors.password && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.password}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, confirm_password: e.target.value }));
                    if (errors.confirm_password) setErrors(prev => ({ ...prev, confirm_password: null }));
                  }}
                />
                {errors.confirm_password && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.confirm_password}</p>}
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.alt_phone || "Alternate Mobile Number (Optional)"}
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. 9123456780"
                  value={formData.alternate_phone}
                  onChange={e => setFormData(prev => ({ ...prev, alternate_phone: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.address || "Residential Street Address"} *
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="House / Flat No., Street, Landmark, Area"
                  value={formData.address}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, address: e.target.value }));
                    if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                  }}
                />
                {errors.address && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.address}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.city || "City / Town"} *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Hyderabad"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value, district: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.state || "State / Union Territory"} *
                </label>
                <select
                  className="select-field"
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                >
                  {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {regT.pincode || "Postal PIN Code (6 Digits)"} *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="input-field"
                  placeholder="e.g. 500001"
                  value={formData.pincode}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, pincode: e.target.value }));
                    if (errors.pincode) setErrors(prev => ({ ...prev, pincode: null }));
                  }}
                />
                {errors.pincode && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.pincode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EMERGENCY CONTACTS */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <ShieldAlert size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.25rem', color: '#f9fafb' }}>
                {regT.step3_title || "Step 3: Emergency Contacts"}
              </h3>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#fbbf24'
            }}>
              Emergency contacts will be automatically notified during SOS triggers and embedded into the 108 ambulance triage QR code.
            </div>

            {/* Primary Emergency Contact */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span className="badge badge-eligible">Primary Contact</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f9fafb' }}>First Responder Notification</span>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {regT.emg_name || "Emergency Contact Name"} *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Lakshmi Kumar"
                    value={formData.emergency_contact.name}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, name: val }
                      }));
                      if (errors.emergency_name) setErrors(prev => ({ ...prev, emergency_name: null }));
                    }}
                  />
                  {errors.emergency_name && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.emergency_name}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {regT.emg_relation || "Relationship"} *
                  </label>
                  <select
                    className="select-field"
                    value={formData.emergency_contact.relationship}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, relationship: val }
                      }));
                    }}
                  >
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {regT.emg_phone || "Emergency Contact Phone (+91)"} *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="e.g. 9876543219"
                    value={formData.emergency_contact.phone}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, phone: val }
                      }));
                      if (errors.emergency_phone) setErrors(prev => ({ ...prev, emergency_phone: null }));
                    }}
                  />
                  {errors.emergency_phone && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.emergency_phone}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Alternate Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="e.g. 9876500000"
                    value={formData.emergency_contact.alternate_phone}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, alternate_phone: val }
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Secondary Emergency Contact (Optional) */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span className="badge badge-central">Secondary Contact</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Optional Backup Guardian</span>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {regT.alt_emg_name || "Secondary Contact Name"}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Suresh Rao"
                    value={formData.alternate_emergency_contact.name}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        alternate_emergency_contact: { ...prev.alternate_emergency_contact, name: val }
                      }));
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {regT.alt_emg_relation || "Relationship"}
                  </label>
                  <select
                    className="select-field"
                    value={formData.alternate_emergency_contact.relationship}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        alternate_emergency_contact: { ...prev.alternate_emergency_contact, relationship: val }
                      }));
                    }}
                  >
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {regT.alt_emg_phone || "Secondary Contact Phone"}
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="e.g. 9811223344"
                    value={formData.alternate_emergency_contact.phone}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        alternate_emergency_contact: { ...prev.alternate_emergency_contact, phone: val }
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: MEDICAL INFORMATION */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Heart size={22} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem', color: '#f9fafb' }}>
                {regT.step4_title || "Step 4: Medical History & Clinical Profile"}
              </h3>
            </div>

            {/* Existing Chronic Conditions */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#f9fafb', marginBottom: '8px' }}>
                {regT.existing_conditions || "Existing Chronic Conditions"}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {COMMON_CONDITIONS.map(cond => {
                  const isSelected = formData.existing_conditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: isSelected ? '1px solid #34d399' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#34d399' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}{cond}
                    </button>
                  );
                })}
              </div>

              {/* Custom condition add input */}
              <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  placeholder="Other condition..."
                  value={customCondition}
                  onChange={e => setCustomCondition(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomCondition(); } }}
                />
                <button type="button" onClick={addCustomCondition} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Known Allergies */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#f9fafb', marginBottom: '8px' }}>
                {regT.allergies || "Known Drug / Food Allergies"}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {COMMON_ALLERGIES.map(allergy => {
                  const isSelected = formData.allergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: isSelected ? '1px solid #f87171' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#fca5a5' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}{allergy}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  placeholder="Other allergy..."
                  value={customAllergy}
                  onChange={e => setCustomAllergy(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
                />
                <button type="button" onClick={addCustomAllergy} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Add
                </button>
              </div>

              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Specific allergy reactions (e.g. anaphylaxis with penicillin, rash with sulfa)"
                  value={formData.allergy_details}
                  onChange={e => setFormData(prev => ({ ...prev, allergy_details: e.target.value }))}
                />
              </div>
            </div>

            {/* Current Ongoing Medications */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f9fafb' }}>
                  {regT.current_meds || "Current Ongoing Medications"}
                </label>
                <button type="button" onClick={addMedicationRow} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                  <Plus size={13} /> {regT.add_med_btn || "Add Medicine"}
                </button>
              </div>

              {formData.current_medications.map((med, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr auto',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder={regT.med_name_placeholder || "Medicine Name (e.g. Metformin 500mg)"}
                    value={med.medicine_name}
                    onChange={e => updateMedication(idx, 'medicine_name', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="Dosage (e.g. 1 tab)"
                    value={med.dosage}
                    onChange={e => updateMedication(idx, 'dosage', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder={regT.med_freq_placeholder || "Freq (1-0-1)"}
                    value={med.frequency}
                    onChange={e => updateMedication(idx, 'frequency', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(idx)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                    title="Remove Medication"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Medical Notes / Past Surgeries */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Major Surgeries / Hospitalizations / Clinical Notes (Optional)
              </label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="e.g. Appendectomy 2021, Stent in LAD 2023, No major hospitalizations"
                value={formData.medical_history.notes}
                onChange={e => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    medical_history: { ...prev.medical_history, notes: val }
                  }));
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 5: ABHA / HEALTH ID & REVIEW */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <FileText size={22} color="#00c9a7" />
              <h3 style={{ fontSize: '1.25rem', color: '#f9fafb' }}>
                Step 5: ABHA Health ID & Profile Review
              </h3>
            </div>

            {/* ABHA Workflow Card */}
            <div style={{
              background: 'rgba(0, 201, 167, 0.08)',
              border: '1px solid rgba(0, 201, 167, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#34d399', fontWeight: '700', fontSize: '0.95rem' }}>
                <ShieldCheck size={18} />
                ABHA Health ID (Ayushman Bharat Digital Mission)
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Connect your 14-digit official ABHA Number or ABHA Address to enable seamless health record exchange across Indian healthcare facilities.
              </p>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#f9fafb', marginBottom: '6px' }}>
                  ABHA Health ID / Aadhaar Reference
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 14-digit ABHA Number (12-3456-7890-1234) or user@abdm"
                  value={formData.aadhaar_abha_id}
                  onChange={e => setFormData(prev => ({ ...prev, aadhaar_abha_id: e.target.value }))}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                paddingTop: '10px',
                borderTop: '1px dashed rgba(0, 201, 167, 0.2)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}>
                <div>
                  Don't have an ABHA ID yet?
                </div>
                <a
                  href="https://abha.abdm.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#34d399', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Connect / Learn at official ABHA Portal ↗
                </a>
              </div>
            </div>

            {/* Profile Review Summary */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                Review Registration Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.86rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong style={{ color: '#f8fafc' }}>{formData.full_name || 'N/A'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> <strong style={{ color: '#f8fafc' }}>{formData.date_of_birth} ({formData.age || 0} yrs)</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Blood Group:</span> <strong style={{ color: '#34d399' }}>{formData.blood_group}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Height / Weight:</span> <strong style={{ color: '#f8fafc' }}>{formData.height ? `${formData.height} cm` : 'N/A'} / {formData.weight ? `${formData.weight} kg` : 'N/A'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Mobile Phone:</span> <strong style={{ color: '#f8fafc' }}>{formData.phone}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong style={{ color: '#f8fafc' }}>{formData.email}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>City / State:</span> <strong style={{ color: '#f8fafc' }}>{formData.city}, {formData.state}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Emergency Contact:</span> <strong style={{ color: '#fbbf24' }}>{formData.emergency_contact.name} ({formData.emergency_contact.phone})</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>{regT.prev_step || "Previous Step"}</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button type="button" onClick={handleNext} className="btn btn-primary">
              <span>{regT.next_step || "Save & Continue"}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '220px' }}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-animation" />
                  <span>{regT.submitting || "Creating Profile..."}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{regT.submit_btn || "Complete Patient Registration"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
