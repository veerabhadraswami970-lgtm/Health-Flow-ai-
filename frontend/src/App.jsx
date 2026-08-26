import React, { useState } from 'react';
import { translations } from './i18n/translations';
import Navbar from './components/Navbar';
import DashboardHome from './components/DashboardHome';
import SchemeFinder from './components/SchemeFinder';
import DiseaseSchemeFinder from './components/DiseaseSchemeFinder';
import PrescriptionAnalyzer from './components/PrescriptionAnalyzer';
import QRScannerViewer from './components/QRScannerViewer';
import MedicineDirectory from './components/MedicineDirectory';
import DoctorDiscovery from './components/DoctorDiscovery';
import HospitalDiscovery from './components/HospitalDiscovery';
import AppointmentBooking from './components/AppointmentBooking';
import BloodBankFinder from './components/BloodBankFinder';
import TrustedContactModal from './components/TrustedContactModal';
import ScanPrepWizard from './components/ScanPrepWizard';
import MedicineScanner from './components/MedicineScanner';
import HealthRecords from './components/HealthRecords';
import MedicineReminders from './components/MedicineReminders';
import EmergencyModal from './components/EmergencyModal';
import AdminDashboard from './components/AdminDashboard';
import RegistrationWizard from './components/RegistrationWizard';
import PharmacistDashboard from './components/PharmacistDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import HospitalAdminDashboard from './components/HospitalAdminDashboard';
import WelcomeScreen from './components/WelcomeScreen';
import RoleRegistrationModal from './components/RoleRegistrationModal';
import HealthFlowLandingPage from './components/landing/HealthFlowLandingPage';
import { 
  Sparkles, LayoutDashboard, Award, Stethoscope, Scan, QrCode, 
  Pill, UserCheck, Building2, Calendar, Droplet, 
  FolderLock, Bell, Server, UserPlus, Activity, Globe
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en');
  const [role, setRole] = useState('Patient');
  const [activeTab, setActiveTab] = useState('landing');
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [preselectedDoctor, setPreselectedDoctor] = useState(null);
  const [preselectedHospital, setPreselectedHospital] = useState(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [registerRoleModal, setRegisterRoleModal] = useState(null);

  const t = translations[lang] || translations.en;

  // Role-Based Navigation Config
  const ALL_NAV_ITEMS = [
    { id: 'landing', label: '✨ Overview & Impact', icon: <Globe size={18} />, roles: ['Patient', 'Doctor', 'HospitalAdmin', 'Pharmacist', 'DataAdmin'] },
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['Patient', 'Doctor', 'HospitalAdmin', 'Pharmacist', 'DataAdmin'] },
    { id: 'register', label: t.nav_register || "Patient Registration", icon: <UserPlus size={18} />, roles: ['Patient', 'DataAdmin'] },
    { id: 'doctor_portal', label: 'Doctor Portal', icon: <Stethoscope size={18} />, roles: ['Doctor', 'DataAdmin'] },
    { id: 'pharmacist_portal', label: 'Pharmacist Portal', icon: <Pill size={18} />, roles: ['Pharmacist', 'DataAdmin'] },
    { id: 'hospital_admin', label: 'Hospital Admin', icon: <Building2 size={18} />, roles: ['HospitalAdmin', 'DataAdmin'] },
    { id: 'prescription', label: t.nav_prescription || 'AI Prescription', icon: <Scan size={18} />, roles: ['Patient', 'Doctor', 'Pharmacist', 'DataAdmin'] },
    { id: 'hospitals', label: t.nav_hospitals || 'Hospitals (HFR)', icon: <Building2 size={18} />, roles: ['Patient', 'HospitalAdmin', 'DataAdmin'] },
    { id: 'blood_bank', label: t.nav_blood_bank || 'Blood Banks', icon: <Droplet size={18} />, roles: ['Patient', 'DataAdmin'] },
    { id: 'schemes', label: t.nav_schemes || 'Govt Schemes', icon: <Award size={18} />, roles: ['Patient', 'DataAdmin'] },
    { id: 'medicines', label: t.nav_medicines || 'Medicines', icon: <Pill size={18} />, roles: ['Patient', 'Pharmacist', 'DataAdmin'] },
    { id: 'disease_finder', label: t.nav_disease_finder || 'Disease Finder', icon: <Stethoscope size={18} />, roles: ['Patient', 'DataAdmin'] },
    { id: 'doctors', label: t.nav_doctors || 'Find Doctors', icon: <UserCheck size={18} />, roles: ['Patient', 'HospitalAdmin', 'DataAdmin'] },
    { id: 'appointments', label: t.nav_appointments || 'Appointments', icon: <Calendar size={18} />, roles: ['Patient', 'Doctor', 'HospitalAdmin', 'DataAdmin'] },
    { id: 'qr', label: t.nav_qr || 'Health QR', icon: <QrCode size={18} />, roles: ['Patient', 'Doctor', 'Pharmacist', 'DataAdmin'] },
    { id: 'medicine_scanner', label: t.nav_medicine_scanner || 'Med Scanner', icon: <Pill size={18} />, roles: ['Patient', 'Pharmacist', 'DataAdmin'] },
    { id: 'scan_prep', label: t.nav_scan_prep || 'Scan Prep', icon: <Scan size={18} />, roles: ['Patient', 'Pharmacist', 'DataAdmin'] },
    { id: 'records', label: t.nav_records || 'ABDM Records', icon: <FolderLock size={18} />, roles: ['Patient', 'Doctor', 'HospitalAdmin', 'DataAdmin'] },
    { id: 'reminders', label: t.nav_reminders || 'Reminders', icon: <Bell size={18} />, roles: ['Patient', 'DataAdmin'] },
    { id: 'admin', label: t.nav_admin || 'Super Admin Hub', icon: <Server size={18} />, roles: ['DataAdmin'] },
    { id: 'trusted', label: t.nav_trusted || 'Trusted Contacts', icon: <UserCheck size={18} />, roles: ['Patient', 'DataAdmin'] },
  ];

  // Dynamically filter navigation items based on current role
  const NAV_ITEMS = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));

  function handleBookDoctorTrigger(doctorObj) {
    setPreselectedDoctor(doctorObj);
    setActiveTab('appointments');
  }

  function handleBookHospitalTrigger(hospitalObj) {
    setPreselectedHospital(hospitalObj);
    setActiveTab('appointments');
  }

  function handleRoleSelectedFromWelcome(selectedRole) {
    setRole(selectedRole);
    setRegisterRoleModal(selectedRole);
  }

  function handleOnboardingComplete(selectedRole, type) {
    setRegisterRoleModal(null);
    setShowWelcomeScreen(false);
    setRole(selectedRole);
    if (selectedRole === 'Doctor') setActiveTab('doctor_portal');
    else if (selectedRole === 'Pharmacist') setActiveTab('pharmacist_portal');
    else if (selectedRole === 'HospitalAdmin') setActiveTab('hospital_admin');
    else if (selectedRole === 'DataAdmin') setActiveTab('admin');
    else setActiveTab('home');
  }

  return (
    <div className="app-layout">
      {/* 10X Spatial Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        t={t}
        role={role}
        setRole={(newRole) => {
          setRole(newRole);
          if (newRole === 'Doctor') setActiveTab('doctor_portal');
          else if (newRole === 'Pharmacist') setActiveTab('pharmacist_portal');
          else if (newRole === 'HospitalAdmin') setActiveTab('hospital_admin');
          else if (newRole === 'DataAdmin') setActiveTab('admin');
          else setActiveTab('home');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEmergencyClick={() => setEmergencyOpen(true)}
        onShowWelcomeScreen={() => setShowWelcomeScreen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Onboarding Welcome Screen */}
        {showWelcomeScreen ? (
          <HealthFlowLandingPage
            onSelectRole={handleRoleSelectedFromWelcome}
            onOpenEmergencyModal={() => setEmergencyOpen(true)}
            onNavigateTab={(tab) => {
              setShowWelcomeScreen(false);
              setActiveTab(tab);
            }}
            t={t}
          />
        ) : (
          <>
            {/* Spatial Navigation Hubs Bar */}
            <div className="nav-scroll-wrapper" style={{ marginBottom: '28px' }}>
              <div className="nav-tabs">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

        {/* Dynamic Module Rendering */}
        {activeTab === 'landing' && (
          <HealthFlowLandingPage
            onSelectRole={handleRoleSelectedFromWelcome}
            onOpenEmergencyModal={() => setEmergencyOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            t={t}
          />
        )}
        {activeTab === 'home' && (
          <DashboardHome
            t={t}
            setActiveTab={setActiveTab}
            onEmergencyClick={() => setEmergencyOpen(true)}
            role={role}
          />
        )}
        {activeTab === 'doctor_portal' && <DoctorDashboard t={t} />}
        {activeTab === 'pharmacist_portal' && <PharmacistDashboard t={t} />}
        {activeTab === 'hospital_admin' && <HospitalAdminDashboard t={t} />}
        {activeTab === 'schemes' && <SchemeFinder t={t} />}
        {activeTab === 'register' && <RegistrationWizard t={t} onRegistrationComplete={() => setActiveTab('hospitals')} />}
        {activeTab === 'disease_finder' && <DiseaseSchemeFinder t={t} />}
        {activeTab === 'prescription' && <PrescriptionAnalyzer t={t} role={role} />}
        {activeTab === 'qr' && <QRScannerViewer t={t} />}
        {activeTab === 'scan_prep' && <ScanPrepWizard t={t} />}
        {activeTab === 'medicines' && <MedicineDirectory t={t} />}
        {activeTab === 'doctors' && <DoctorDiscovery t={t} onBookDoctor={handleBookDoctorTrigger} />}
        {activeTab === 'medicine_scanner' && <MedicineScanner t={t} />}
        {activeTab === 'hospitals' && <HospitalDiscovery t={t} onEmergencyClick={() => setEmergencyOpen(true)} onBookAppointment={handleBookHospitalTrigger} />}
        {activeTab === 'appointments' && <AppointmentBooking t={t} selectedDoctor={preselectedDoctor} selectedHospital={preselectedHospital} />}
        {activeTab === 'blood_bank' && <BloodBankFinder t={t} />}
        {activeTab === 'records' && <HealthRecords t={t} />}
        {activeTab === 'reminders' && <MedicineReminders t={t} />}
        {activeTab === 'admin' && <AdminDashboard t={t} />}
        {activeTab === 'trusted' && <TrustedContactModal t={t} />}
          </>
        )}
      </main>

      {/* Role Registration & Verification Modal */}
      {registerRoleModal && (
        <RoleRegistrationModal
          role={registerRoleModal}
          onClose={() => setRegisterRoleModal(null)}
          onComplete={handleOnboardingComplete}
          t={t}
        />
      )}

      {/* 10X Calm-Urgency Emergency Assistance Modal */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        t={t}
      />


      {/* Sleek Spatial Footer */}
      <footer style={{
        borderTop: '1px solid var(--hf-border-glass)',
        padding: '28px 24px',
        textAlign: 'center',
        fontSize: '0.84rem',
        color: 'var(--hf-text-secondary)',
        background: 'rgba(6, 11, 20, 0.95)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--hf-text-primary)' }}>HealthFlow AI</span>
            <span>—</span>
            <em style={{ color: 'var(--hf-cyan)' }}>"{t.tagline}"</em>
          </div>
          <div>
            ABDM (HPR/HFR/UHI) & e-RaktKosh Ready • Strict CDSCO Medical Safety Guardrails
          </div>
          <div style={{ color: 'var(--hf-text-muted)' }}>
            Production 3D Build 2026 • English | తెలుగు | हिन्दी
          </div>
        </div>
      </footer>
    </div>
  );
}
