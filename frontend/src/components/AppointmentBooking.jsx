import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import MedicalCross3D from './3d/MedicalCross3D';
import { Calendar, Clock, CheckCircle, XCircle, RefreshCw, User, Phone, Building2, ShieldCheck, Sparkles, QrCode } from 'lucide-react';

export default function AppointmentBooking({ t, selectedDoctor, selectedHospital }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(selectedDoctor ? selectedDoctor.id : 'doc_ramesh_varma');
  const [hospitalId, setHospitalId] = useState(selectedDoctor ? selectedDoctor.hospital_id : (selectedHospital ? (selectedHospital.hfr_id || selectedHospital.id) : 'hosp_nims_hyd'));
  const [selectedHospObj, setSelectedHospObj] = useState(selectedHospital || null);
  const [patientName, setPatientName] = useState('Ravi Kumar');
  const [patientPhone, setPatientPhone] = useState('+919876543210');
  const [date, setDate] = useState('2026-08-25');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [appointmentType, setAppointmentType] = useState('Physical OPD');
  const [reason, setReason] = useState('Routine Consultation & Checkup');
  const [paymentMode, setPaymentMode] = useState('UPI / Razorpay Gateway');
  const [booking, setBooking] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [selectedDocObj, setSelectedDocObj] = useState(selectedDoctor || null);

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      setDoctorId(selectedDoctor.id);
      setHospitalId(selectedDoctor.hospital_id);
      setSelectedDocObj(selectedDoctor);
      if (selectedDoctor.is_on_leave) {
        fetchAlternatives(selectedDoctor.id);
      }
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedHospital) {
      setSelectedHospObj(selectedHospital);
      setHospitalId(selectedHospital.hfr_id || selectedHospital.id || 'hosp_nims_hyd');
      // Preselect first doctor empaneled at this hospital if available
      if (doctors.length > 0) {
        const matchedDoc = doctors.find(d => 
          (d.hospital_name && d.hospital_name.toLowerCase().includes(selectedHospital.name.toLowerCase())) ||
          d.hospital_id === selectedHospital.id
        );
        if (matchedDoc) {
          setDoctorId(matchedDoc.id);
          setSelectedDocObj(matchedDoc);
        }
      }
    }
  }, [selectedHospital, doctors]);

  async function loadAppointments() {
    try {
      const data = await healthflowApi.getPatientAppointments('patient_ravi_kumar');
      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    }
  }

  async function loadDoctors() {
    try {
      const docs = await healthflowApi.searchDoctors({});
      setDoctors(docs || []);
      if (!selectedDoctor && docs.length > 0) {
        setSelectedDocObj(docs[0]);
        if (docs[0].is_on_leave) {
          fetchAlternatives(docs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  }

  async function fetchAlternatives(docId) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/doctors/${docId}/alternatives`);
      if (res.ok) {
        const data = await res.json();
        setAlternatives(data || []);
      }
    } catch (err) {
      console.warn("Failed to load alternative doctors:", err);
    }
  }

  function handleDoctorChange(newDocId) {
    setDoctorId(newDocId);
    const d = doctors.find(doc => doc.id === newDocId);
    if (d) {
      setSelectedDocObj(d);
      setHospitalId(d.hospital_id);
      if (d.is_on_leave) {
        fetchAlternatives(d.id);
      } else {
        setAlternatives([]);
      }
    }
  }

  async function handleBookAppointment(e) {
    e.preventDefault();
    if (selectedDocObj && selectedDocObj.is_on_leave) {
      alert("Selected doctor is currently unavailable / on leave. Please select an alternative doctor.");
      return;
    }
    if (booking) return; // Prevent duplicate submission

    setBooking(true);
    setNotificationStatus(null);

    try {
      // Simulate Razorpay/Gateway Payment Verification Token
      const paymentTxnId = `TXN-PAY-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await healthflowApi.bookAppointment({
        doctor_id: doctorId,
        hospital_id: hospitalId,
        patient_id: 'patient_ravi_kumar',
        patient_name: patientName,
        patient_phone: patientPhone,
        appointment_date: date,
        appointment_time: timeSlot,
        appointment_type: appointmentType,
        reason_for_visit: reason,
        payment_txn_id: paymentTxnId,
        payment_mode: paymentMode
      });

      setConfirmedAppt(res);
      
      // Simulate real Notification Provider confirmation
      const doctorName = selectedDocObj ? selectedDocObj.name : 'Dr. Ramesh Varma';
      const hospName = selectedDocObj ? selectedDocObj.hospital_name : 'NIMS Hospital';
      setNotificationStatus({
        status: "SUCCESS",
        message: `Message Sent via Notification Provider to ${patientPhone}`,
        body: `HealthFlow AI — Appointment Confirmed. Doctor: ${doctorName} | Hospital: ${hospName} | Date: ${date} | Time: ${timeSlot} | Appointment ID: ${res.id}`
      });

      loadAppointments();
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel(apptId) {
    try {
      await healthflowApi.cancelAppointment({
        appointment_id: apptId,
        patient_id: 'patient_ravi_kumar',
        reason: 'Patient requested cancellation'
      });
      loadAppointments();
      if (confirmedAppt && confirmedAppt.id === apptId) {
        setConfirmedAppt(null);
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
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
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-cyan)'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.nav_appointments || "Unified Health Interface (UHI) Booking"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              ABDM Unified Health Interface (UHI) protocol appointment booking and digital OPD passes.
            </p>
          </div>
        </div>

        <span className="badge badge-cyan">
          <ShieldCheck size={12} />
          <span>ABDM UHI Gateway</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '28px' }}>
        
        {/* Booking Form */}
        <div className="hf-card" style={{ padding: '28px', borderLeft: '4px solid var(--hf-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sparkles size={20} color="var(--hf-cyan)" />
            <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 800 }}>Schedule New OPD Appointment</h3>
          </div>

          <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedHospObj && (
              <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#00f2fe', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} />
                <span>Selected Hospital: {selectedHospObj.name} ({selectedHospObj.city || 'Hyderabad'})</span>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Select Certified Doctor</label>
              <select
                className="select-field"
                value={doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id} style={{ background: '#0b1325' }}>
                    {d.name} ({d.specialty}) — {d.hospital_name} {d.is_on_leave ? '⚠️ [On Leave]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Leave Alert & AI Alternate Doctor Recommendation */}
            {selectedDocObj && selectedDocObj.is_on_leave && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '12px',
                padding: '16px',
                color: '#fca5a5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem', color: '#f87171', marginBottom: '6px' }}>
                  ⚠️ Doctor Unavailable / On Leave
                </div>
                <p style={{ fontSize: '0.84rem', color: '#fca5a5', marginBottom: '12px' }}>
                  <strong>{selectedDocObj.name}</strong> is currently unavailable for your selected appointment slot. We found AI-recommended alternatives.
                </p>

                {alternatives.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#34d399', marginBottom: '8px' }}>
                      ✨ AI Recommended Alternative Doctors:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {alternatives.map(alt => (
                        <div key={alt.id} style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>{alt.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--hf-text-secondary)' }}>{alt.specialty} • {alt.hospital_name} • Fee: ₹{alt.consultation_fee}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDoctorChange(alt.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.76rem', color: '#34d399', borderColor: '#34d399' }}
                          >
                            Book Alternative
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Patient Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Time Slot</label>
                <select
                  className="select-field"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option value="09:00 AM" style={{ background: '#0b1325' }}>09:00 AM</option>
                  <option value="10:00 AM" style={{ background: '#0b1325' }}>10:00 AM</option>
                  <option value="11:30 AM" style={{ background: '#0b1325' }}>11:30 AM</option>
                  <option value="02:00 PM" style={{ background: '#0b1325' }}>02:00 PM</option>
                  <option value="04:30 PM" style={{ background: '#0b1325' }}>04:30 PM</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Visit Reason / Symptoms</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Hypertension Check..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Payment Gateway Architecture</label>
                <select
                  className="select-field"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="UPI / Razorpay Gateway" style={{ background: '#0b1325' }}>UPI / Razorpay Gateway</option>
                  <option value="Stripe Credit Card" style={{ background: '#0b1325' }}>Stripe Credit/Debit Card</option>
                  <option value="Pay at Hospital Desk" style={{ background: '#0b1325' }}>Pay Cash/Card at Desk</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={booking || (selectedDocObj && selectedDocObj.is_on_leave)}
              className="btn btn-cyan"
              style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}
            >
              <Calendar size={18} />
              <span>{booking ? 'Processing Gateway Payment & Slot Reservation...' : `Pay ₹${selectedDocObj ? selectedDocObj.consultation_fee : 500} & Confirm Appointment`}</span>
            </button>
          </form>
        </div>

        {/* Digital Appointment Pass Confirmation Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Notification Provider Status Banner */}
          {notificationStatus && (
            <div className="animate-slide-up" style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '14px 16px',
              color: '#34d399',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <CheckCircle size={16} />
                <span>{notificationStatus.message}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {notificationStatus.body}
              </div>
            </div>
          )}

          {confirmedAppt && (
            <div className="hf-3d-card animate-slide-up" style={{ padding: '26px', border: '1px solid rgba(0, 201, 167, 0.4)', background: 'linear-gradient(135deg, rgba(14, 25, 48, 0.85) 0%, rgba(6, 11, 20, 0.95) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="badge badge-verified">
                  <CheckCircle size={12} /> Confirmed Slot
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--hf-text-muted)', fontFamily: 'var(--hf-font-mono)' }}>
                  ID: {confirmedAppt.id}
                </span>
              </div>

              <h4 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, marginBottom: '4px' }}>
                Dr. {confirmedAppt.doctor_name || 'Ramesh Varma'}
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--hf-cyan)', marginBottom: '12px' }}>
                {confirmedAppt.hospital_name || 'NIMS Hyderabad'}
              </p>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: 'var(--hf-radius-md)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)' }}>Date & Time</span>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>{confirmedAppt.appointment_date} • {confirmedAppt.appointment_time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)' }}>Token #</span>
                  <div style={{ fontWeight: 800, color: 'var(--hf-primary)', fontSize: '0.95rem' }}>#{confirmedAppt.token_number || 'OPD-14'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>
                <QrCode size={18} color="var(--hf-cyan)" />
                <span>Show this digital token at the hospital registration counter.</span>
              </div>
            </div>
          )}

          {/* Active Appointments List */}
          <div className="hf-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800, marginBottom: '14px' }}>
              Your Scheduled Appointments ({appointments.length})
            </h4>

            {appointments.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--hf-text-muted)' }}>No previous appointments found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.map(a => (
                  <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>{a.doctor_name || 'Cardiologist'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>{a.appointment_date} • {a.appointment_time}</div>
                    </div>
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.74rem', color: 'var(--hf-danger)' }}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
