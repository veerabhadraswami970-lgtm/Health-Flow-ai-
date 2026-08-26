const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "") || "/api/v1";

export function getAuthToken() {
  return localStorage.getItem("healthflow_token") || "";
}

export function setAuthSession(token, user) {
  if (token) localStorage.setItem("healthflow_token", token);
  if (user) localStorage.setItem("healthflow_user", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem("healthflow_token");
  localStorage.removeItem("healthflow_user");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("healthflow_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: options.body instanceof FormData ? {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers
      } : headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const errorMsg = err.detail || err.error?.message || err.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on [${endpoint}]:`, error);
    throw error;
  }
}

export const healthflowApi = {
  // 1. Schemes & Eligibility
  getSchemes: (state = "", type = "") => 
    fetchJson(`/schemes?${state ? `state=${encodeURIComponent(state)}&` : ''}${type ? `type=${encodeURIComponent(type)}` : ''}`),
  getSchemeById: (id) => fetchJson(`/schemes/${id}`),
  checkEligibility: (data) => fetchJson("/schemes/eligibility", { method: "POST", body: JSON.stringify(data) }),
  recommendByDisease: (data) => fetchJson("/schemes/recommend-by-disease", { method: "POST", body: JSON.stringify(data) }),

  // 2. Prescriptions
  processPrescriptionText: (formData) => 
    fetch(`${API_BASE}/prescriptions/process`, { method: "POST", body: formData }).then(r => r.json()),
  uploadPrescriptionFile: (formData) => 
    fetch(`${API_BASE}/prescriptions/upload`, { method: "POST", body: formData }).then(r => r.json()),
  getPrescriptionById: (id) => fetchJson(`/prescriptions/${id}`),
  getPatientPrescriptions: (patientId) => fetchJson(`/prescriptions/patient/${patientId}`),
  verifyPrescription: (id, update) => fetchJson(`/prescriptions/${id}/verify`, { method: "POST", body: JSON.stringify(update) }),
  initiateScanPrep: (formData) => fetch(`${API_BASE}/prescriptions/scan-prep/initiate`, { method: "POST", body: formData }).then(r => r.json()),

  // 3. Medicines
  searchMedicines: (query = "") => fetchJson(`/medicines/search?query=${encodeURIComponent(query)}`),
  getMedicineExplanation: (id) => fetchJson(`/medicines/${id}`),
  scanMedicineImage: (formData) => fetch(`${API_BASE}/medicines/scan`, { method: "POST", body: formData }).then(r => r.json()),

  // 4. Secure QR
  generateQR: (data) => fetchJson("/qr/generate", { method: "POST", body: JSON.stringify(data) }),
  verifyQR: (data) => fetchJson("/qr/verify", { method: "POST", body: JSON.stringify(data) }),

  // 5. Health Records & Consent
  getMyHealthRecords: (patientId = "patient_ravi_kumar") => fetchJson(`/health-records?patient_id=${patientId}`),
  getPatientConsents: (patientId = "patient_ravi_kumar") => fetchJson(`/health-records/consents/patient/${patientId}`),
  actOnConsent: (data) => fetchJson("/health-records/consents/action", { method: "POST", body: JSON.stringify(data) }),

  // 6. Doctors (ABDM HPR)
  searchDoctors: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return fetchJson(`/doctors/search?${queryStr}`);
  },

  // 7. Hospitals (ABDM HFR)
  searchHospitals: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return fetchJson(`/hospitals/search?${queryStr}`);
  },

  // 8. Appointments (ABDM UHI)
  bookAppointment: (data) => fetchJson("/appointments/book", { method: "POST", body: JSON.stringify(data) }),
  cancelAppointment: (data) => fetchJson("/appointments/cancel", { method: "POST", body: JSON.stringify(data) }),
  rescheduleAppointment: (data) => fetchJson("/appointments/reschedule", { method: "POST", body: JSON.stringify(data) }),
  getPatientAppointments: (patientId) => fetchJson(`/appointments/patient/${patientId}`),

  // 9. Blood Banks (e-RaktKosh)
  searchBloodBanks: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return fetchJson(`/blood-banks/search?${queryStr}`);
  },

  // 10. Voice Assistant
  interactVoice: (data) => fetchJson("/voice/interact", { method: "POST", body: JSON.stringify(data) }),

  // 11. Telephony Webhooks
  telephonyIncomingCall: (data) => fetchJson("/voice/incoming", { method: "POST", body: JSON.stringify(data) }),
  telephonyVerifyPin: (data) => fetchJson("/voice/verify-pin", { method: "POST", body: JSON.stringify(data) }),

  // New endpoint to retrieve telephony call logs for debugging/monitoring
  getTelephonyCallLogs: () => fetchJson("/voice/call-logs"),

  // 12. Reminders
  getPatientReminders: (patientId = "patient_ravi_kumar") => fetchJson(`/reminders/patient/${patientId}`),
  triggerTestReminder: (reminderId) => fetchJson(`/reminders/${reminderId}/trigger`, { method: "POST" }),

  // 13. Emergency SOS
  triggerEmergencySOS: (data) => fetchJson("/emergency/sos", { method: "POST", body: JSON.stringify(data) }),

  // 14. Admin Overview
  getAdminOverview: () => fetchJson("/admin/overview"),
  ingestDataset: (data) => fetchJson("/admin/ingest", { method: "POST", body: JSON.stringify(data) }),

  // 15. Health QR (My Health QR)
  generateHealthQR: (data) => fetchJson("/health-qr/generate", { method: "POST", body: JSON.stringify(data) }),
  scanHealthQR: (data) => fetchJson("/health-qr/scan", { method: "POST", body: JSON.stringify(data) }),
  revokeHealthQR: (data) => fetchJson("/health-qr/revoke", { method: "POST", body: JSON.stringify(data) }),
  getActiveHealthQRs: (patientId = "patient_ravi_kumar") => fetchJson(`/health-qr/active/${patientId}`),

  // 16. Patient Profile & Emergency Contacts
  getPatientProfile: (patientId = "patient_ravi_kumar") => fetchJson(`/patients/${patientId}`),
  updatePatientProfile: (patientId, data) => fetchJson(`/patients/${patientId}`, { method: "PUT", body: JSON.stringify(data) }),
  getEmergencyContacts: (patientId = "patient_ravi_kumar") => fetchJson(`/patients/${patientId}/emergency-contacts`),
  registerPatient: (data) => fetchJson("/patients/register", { method: "POST", body: JSON.stringify(data) }),

  // Trusted Contacts API
  grantTrustedContact: (data) => fetchJson("/trusted-contacts/grant", { method: "POST", body: JSON.stringify(data) }),
  listTrustedContacts: () => fetchJson("/trusted-contacts/list"),
  revokeTrustedContact: (contactId) => fetchJson(`/trusted-contacts/${contactId}`, { method: "DELETE" }),

  // 17. Medical History
  getMedicalHistory: (patientId = "patient_ravi_kumar") => fetchJson(`/medical-history/${patientId}`),
  addMedicalHistoryEntry: (data) => fetchJson("/medical-history", { method: "POST", body: JSON.stringify(data) }),
  getPatientMedicines: (patientId = "patient_ravi_kumar") => fetchJson(`/medical-history/${patientId}/medicines`),
  getPatientHospitals: (patientId = "patient_ravi_kumar") => fetchJson(`/medical-history/${patientId}/hospitals`),

  // 18. Authentication & Sessions
  loginUser: (data) => fetchJson("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  registerUser: (data) => fetchJson("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getAuthProfile: () => fetchJson("/auth/profile"),

  // 19. AI Accident Detection & Emergency Response
  postAccidentEvent: (data) => fetchJson("/accident/events", { method: "POST", body: JSON.stringify(data) }),
  evaluateAccidentTelemetry: (data) => fetchJson("/accident/evaluate", { method: "POST", body: JSON.stringify(data) }),
  createEmergencyIncident: (data) => fetchJson("/accident/incidents", { method: "POST", body: JSON.stringify(data) }),
  getEmergencyIncident: (incidentId) => fetchJson(`/accident/incidents/${incidentId}`),
  confirmEmergencyIncident: (incidentId) => fetchJson(`/accident/incidents/${incidentId}/confirm`, { method: "POST" }),
  cancelEmergencyIncident: (incidentId, reason = "USER_CONFIRMED_SAFE") => 
    fetchJson(`/accident/incidents/${incidentId}/cancel`, { method: "POST", body: JSON.stringify(reason) }),
  getNearbyEmergencyHospitals: (city = "Hyderabad", lat = null, lng = null) => 
    fetchJson(`/accident/nearby-hospitals?city=${encodeURIComponent(city)}${lat ? `&lat=${lat}&lng=${lng}` : ''}`),
  notifyEmergencyContacts: (data) => fetchJson("/accident/contacts/notify", { method: "POST", body: JSON.stringify(data) }),
  getAccidentSettings: (patientId = "patient_ravi_kumar") => fetchJson(`/accident/settings/${patientId}`),
  updateAccidentSettings: (patientId = "patient_ravi_kumar", data = {}) => 
    fetchJson(`/accident/settings/${patientId}`, { method: "PUT", body: JSON.stringify(data) })
};



