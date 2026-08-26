import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import { getUserLocation, calculateHaversineDistance, DEFAULT_LOCATION } from '../services/locationService';
import EmergencyPulse from './3d/EmergencyPulse';
import { ShieldAlert, PhoneCall, MapPin, AlertTriangle, X, Activity, LifeBuoy, Compass, ExternalLink, HeartPulse } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose, t }) {
  const [sosData, setSosData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      triggerSOSWithLocation();
    }
  }, [isOpen]);

  async function triggerSOSWithLocation() {
    setLoading(true);
    setLocating(true);
    let loc = DEFAULT_LOCATION;
    try {
      loc = await getUserLocation({ timeout: 5000, highAccuracy: true });
      setUserLocation(loc);
    } catch (e) {
      console.warn("Could not get GPS for SOS:", e);
    } finally {
      setLocating(false);
    }

    try {
      const res = await healthflowApi.triggerEmergencySOS({
        city: loc.city || "Hyderabad",
        latitude: loc.latitude,
        longitude: loc.longitude,
        emergency_type: "Acute Medical Emergency SOS"
      });
      setSosData(res);
    } catch (err) {
      console.error('Emergency SOS trigger failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const nearestHosp = sosData?.nearest_trauma_hospitals?.[0];
  const hospDistance = nearestHosp && userLocation.latitude && userLocation.longitude
    ? calculateHaversineDistance(userLocation.latitude, userLocation.longitude, nearestHosp.latitude, nearestHosp.longitude)
    : nearestHosp?.distance_km;

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
      zIndex: 20000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="hf-card animate-slide-up" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '32px',
        border: '2px solid var(--hf-danger)',
        boxShadow: 'var(--hf-shadow-emergency)',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, rgba(28, 12, 20, 0.95) 0%, rgba(10, 18, 35, 0.98) 100%)'
      }}>
        {/* Header with Biometric Calm Urgency Pulse */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <EmergencyPulse size={54} />
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#ff4b63', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {t?.emergency_title || "Emergency Medical SOS & Triage"}
              </h2>
              <span style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)' }}>
                {userLocation.isFallback 
                  ? "Location: Default City Center (Hyderabad)" 
                  : `GPS Triage Coordinates: (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)})`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--hf-text-muted)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Hotlines Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <a
            href="tel:108"
            className="btn btn-emergency"
            style={{ padding: '16px', fontSize: '1.05rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <PhoneCall size={22} />
            <span>{t?.dial_108_btn || "Call Ambulance (108)"}</span>
          </a>

          <a
            href="tel:112"
            className="btn btn-secondary"
            style={{ padding: '16px', fontSize: '1.05rem', border: '1px solid var(--hf-danger)', color: '#ff7b8d', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <PhoneCall size={22} />
            <span>{t?.dial_112_btn || "National Emergency (112)"}</span>
          </a>
        </div>

        {/* Nearest Trauma Hospital Card */}
        {nearestHosp && (
          <div style={{ background: 'rgba(255, 75, 99, 0.08)', border: '1px solid rgba(255, 75, 99, 0.35)', padding: '20px', borderRadius: 'var(--hf-radius-lg)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--hf-danger)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--hf-danger)', textTransform: 'uppercase' }}>
                  Nearest 24/7 Trauma Emergency Center:
                </span>
              </div>
              {hospDistance !== undefined && hospDistance !== null && (
                <span style={{ background: 'rgba(255, 75, 99, 0.25)', color: '#ff7b8d', fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
                  {hospDistance} km away
                </span>
              )}
            </div>

            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              {nearestHosp.name}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)', marginBottom: '14px' }}>
              📍 {nearestHosp.address}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={`tel:${nearestHosp.emergency_contact || nearestHosp.helpline}`}
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.86rem', background: 'linear-gradient(135deg, #ff4b63 0%, #b31028 100%)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <PhoneCall size={16} />
                <span>Call ER Desk: {nearestHosp.emergency_contact || nearestHosp.helpline}</span>
              </a>

              {nearestHosp.latitude && nearestHosp.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${nearestHosp.latitude},${nearestHosp.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <MapPin size={16} color="var(--hf-cyan)" />
                  <span>Navigate Directions</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Automated SOS Notifications Status */}
        {sosData && (
          <div style={{ background: 'rgba(0, 201, 167, 0.08)', border: '1px solid rgba(0, 201, 167, 0.3)', padding: '16px 20px', borderRadius: 'var(--hf-radius-md)', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--hf-primary)', textTransform: 'uppercase' }}>
                Automated Caretaker SOS Dispatch:
              </span>
              <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                Delivered via Cellular Gateway
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sosData.emergency_contacts_notified?.map((c, i) => (
                <span key={i} style={{ background: 'rgba(0,0,0,0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  ✓ {c.name || c.contact_name} ({c.relation || c.relationship || 'Caretaker'})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* First Aid Instructions */}
        {sosData && sosData.first_aid_immediate_instructions && (
          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '20px', borderRadius: 'var(--hf-radius-md)', marginBottom: '18px', border: '1px solid var(--hf-border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--hf-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              {t?.first_aid_guidance || "Immediate First Aid Triage Guidance"}:
            </span>
            <ul style={{ paddingLeft: '18px', fontSize: '0.88rem', color: 'var(--hf-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sosData.first_aid_immediate_instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontStyle: 'italic', borderTop: '1px solid rgba(255, 75, 99, 0.2)', paddingTop: '14px' }}>
          * {sosData?.disclaimer || "HealthFlow AI does not replace emergency trauma services. Please call 108 immediately."}
        </div>
      </div>
    </div>
  );
}
