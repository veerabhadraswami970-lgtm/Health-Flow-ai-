import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { healthflowApi } from '../services/api';
import { getUserLocation, RADIUS_OPTIONS, DEFAULT_LOCATION } from '../services/locationService';
import Hospital3D from './3d/Hospital3D';
import LocationPulse from './3d/LocationPulse';
import { 
  Building2, MapPin, Phone, ShieldAlert, CheckCircle2, Bed, 
  Droplet, Activity, Compass, Navigation, Filter, ExternalLink,
  Search, RefreshCw, AlertCircle, Sparkles, HeartPulse
} from 'lucide-react';

// Custom Spatial Marker Icons
const hospitalIcon = L.divIcon({
  className: 'hospital-marker',
  html: `<div style="background: linear-gradient(135deg, #00f2fe, #00a8ff); width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0, 242, 254, 0.7); font-size: 16px; transition: transform 0.2s ease;">🏥</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const emergencyHospitalIcon = L.divIcon({
  className: 'emergency-hospital-marker',
  html: `<div style="background: linear-gradient(135deg, #ff4b63, #b31028); width: 40px; height: 40px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(255, 75, 99, 0.9); font-size: 18px;">🚨</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="background: linear-gradient(135deg, #00c9a7, #008f75); width: 36px; height: 36px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(0, 201, 167, 0.9); font-size: 18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Component to dynamically re-center map when user location changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function HospitalDiscovery({ t, onEmergencyClick, onBookAppointment }) {
  const [hospitals, setHospitals] = useState([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [hasDialysis, setHasDialysis] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    handleDetectLocation();
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [query, city, emergencyOnly, hasDialysis, radiusKm, userLocation.latitude, userLocation.longitude]);

  async function handleDetectLocation() {
    setLocating(true);
    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
    } catch (e) {
      console.warn("Could not get GPS location, using fallback:", e);
    } finally {
      setLocating(false);
    }
  }

  async function loadHospitals() {
    setLoading(true);
    try {
      const data = await healthflowApi.searchHospitals({
        query: query || undefined,
        city: city || undefined,
        emergency_only: emergencyOnly || undefined,
        has_dialysis: hasDialysis || undefined,
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: radiusKm
      });
      setHospitals(data || []);
    } catch (err) {
      console.error('Hospital search error:', err);
    } finally {
      setLoading(false);
    }
  }

  const mapCenter = [userLocation.latitude, userLocation.longitude];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Command Center Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-blue)'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t?.nav_hospitals || "Hospital & Facility Discovery"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Spatial ABDM HFR Registry with real-time ICU trauma capacity & Haversine proximity routing.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDetectLocation}
            className="btn btn-secondary"
            disabled={locating}
            style={{ fontSize: '0.86rem', padding: '9px 18px' }}
          >
            <Compass size={16} className={locating ? 'spin-animation' : ''} color="var(--hf-primary)" />
            <span>{locating ? "Acquiring GPS..." : "Detect GPS Position"}</span>
          </button>

          <button
            onClick={onEmergencyClick}
            className="btn btn-emergency"
            style={{ fontSize: '0.86rem', padding: '9px 18px' }}
          >
            <HeartPulse size={16} />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Spatial Leaflet Map Container */}
      <div className="hf-card" style={{ padding: '6px', borderRadius: 'var(--hf-radius-xl)', overflow: 'hidden' }}>
        <div style={{ height: '400px', width: '100%', borderRadius: 'var(--hf-radius-lg)', overflow: 'hidden', position: 'relative' }}>
          <MapContainer 
            center={mapCenter} 
            zoom={12} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <RecenterMap center={mapCenter} />

            {/* User GPS Location Marker & Radial Proximity Pulse */}
            <Marker position={mapCenter} icon={userLocationIcon}>
              <Popup>
                <div style={{ padding: '8px', textAlign: 'center', color: '#030712' }}>
                  <strong style={{ color: '#008f75', display: 'block', marginBottom: '2px', fontSize: '0.9rem' }}>
                    Your Biometric Location
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#4b5563' }}>
                    {userLocation.isFallback ? "Default City Center (GPS Idle)" : userLocation.address}
                  </span>
                </div>
              </Popup>
            </Marker>

            {radiusKm < 500 && (
              <Circle
                center={mapCenter}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#00f2fe',
                  fillColor: '#00f2fe',
                  fillOpacity: 0.08,
                  weight: 2,
                  dashArray: '6, 12'
                }}
              />
            )}

            {/* Hospital Markers */}
            {hospitals.map((hosp) => (
              <Marker
                key={hosp.id}
                position={[hosp.latitude, hosp.longitude]}
                icon={hosp.has_24_7_emergency ? emergencyHospitalIcon : hospitalIcon}
                eventHandlers={{
                  click: () => setSelectedHospital(hosp)
                }}
              >
                <Popup>
                  <div style={{ minWidth: '220px', padding: '6px', color: '#030712' }}>
                    <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                      {hosp.facility_type}
                    </div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginTop: '2px', marginBottom: '4px' }}>
                      {hosp.name}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>
                      📍 {hosp.address} ({hosp.distance_km} km away)
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        🛏️ {hosp.total_beds} Beds
                      </span>
                      {hosp.has_24_7_emergency && (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          🚨 24/7 Trauma
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        color: '#0284c7',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <span>Get Live Directions</span> ↗
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Filter & Proximity Controls */}
      <div className="hf-card" style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} color="var(--hf-cyan)" />
            <span>Search Facility / Specialty</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. AIIMS, Cardiology, Trauma..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginTop: '6px', padding: '9px 14px', fontSize: '0.88rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={14} color="var(--hf-primary)" />
            <span>Proximity Radius</span>
          </label>
          <select 
            className="select-field" 
            value={radiusKm} 
            onChange={(e) => setRadiusKm(Number(e.target.value))} 
            style={{ marginTop: '6px', padding: '9px', fontSize: '0.88rem' }}
          >
            {RADIUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: '#0b1325' }}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: '700' }}>City / Region</label>
          <select className="select-field" value={city} onChange={(e) => setCity(e.target.value)} style={{ marginTop: '6px', padding: '9px', fontSize: '0.88rem' }}>
            <option value="" style={{ background: '#0b1325' }}>All Cities</option>
            <option value="Chennai" style={{ background: '#0b1325' }}>Chennai</option>
            <option value="Hyderabad" style={{ background: '#0b1325' }}>Hyderabad</option>
            <option value="New Delhi" style={{ background: '#0b1325' }}>New Delhi</option>
            <option value="Visakhapatnam" style={{ background: '#0b1325' }}>Visakhapatnam</option>
            <option value="Bengaluru" style={{ background: '#0b1325' }}>Bengaluru</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#f8fafc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              style={{ accentColor: 'var(--hf-danger)', width: '16px', height: '16px' }}
            />
            <span>24/7 Trauma Emergency Only</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#f8fafc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasDialysis}
              onChange={(e) => setHasDialysis(e.target.checked)}
              style={{ accentColor: 'var(--hf-primary)', width: '16px', height: '16px' }}
            />
            <span>Has Dialysis Unit</span>
          </label>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hf-text-secondary)' }}>
          <RefreshCw size={26} className="spin-animation" style={{ margin: '0 auto 10px auto', display: 'block' }} color="var(--hf-cyan)" />
          <span>Searching ABDM HFR Registry & calculating Haversine proximity...</span>
        </div>
      )}

      {/* Empty State Fallback */}
      {!loading && hospitals.length === 0 && (
        <div className="hf-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Hospital3D size={120} />
          <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginTop: '12px', marginBottom: '6px' }}>
            No verified facilities found within {radiusKm} km
          </h3>
          <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Try expanding your search radius to 50 km or clearing active filters.
          </p>
          <button 
            onClick={() => setRadiusKm(50)} 
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            Expand Radius to 50 km
          </button>
        </div>
      )}

      {/* Hospital Results Grid */}
      {!loading && hospitals.length > 0 && (
        <div className="grid-2">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="hf-3d-card"
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '18px',
                borderLeft: hosp.has_24_7_emergency ? '4px solid var(--hf-danger)' : '4px solid var(--hf-cyan)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={11} /> ABDM HFR: {hosp.hfr_id}
                    </span>
                    {hosp.has_24_7_emergency && (
                      <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                        24/7 Trauma Emergency
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '2px' }}>{hosp.name}</h3>
                  <span style={{ fontSize: '0.84rem', color: 'var(--hf-text-secondary)' }}>{hosp.facility_type}</span>
                </div>

                {/* Distance Badge */}
                <div style={{ 
                  background: 'rgba(0, 242, 254, 0.12)', 
                  border: '1px solid rgba(0, 242, 254, 0.3)', 
                  padding: '6px 14px', 
                  borderRadius: 'var(--hf-radius-md)', 
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--hf-cyan)' }}>
                    {hosp.distance_km} km
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--hf-text-muted)' }}>Proximity</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: 'var(--hf-text-secondary)' }}>
                <MapPin size={18} color="var(--hf-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{hosp.address}, {hosp.city}, {hosp.state} - {hosp.pincode}</span>
              </div>

              {/* Badges for Facilities */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span className="badge badge-central"><Bed size={13} /> {hosp.total_beds} Total Beds ({hosp.icu_beds} ICU)</span>
                {hosp.has_dialysis && <span className="badge badge-verified"><Activity size={13} /> Dialysis Unit</span>}
                {hosp.has_blood_bank && <span className="badge badge-danger"><Droplet size={13} /> e-RaktKosh Blood Bank</span>}
              </div>

              {/* Empaneled Schemes */}
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 14px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--hf-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Empaneled Govt Schemes:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {hosp.schemes_empaneled?.map((s, i) => (
                    <span key={i} style={{ background: 'rgba(0, 201, 167, 0.15)', border: '1px solid rgba(0, 201, 167, 0.3)', color: '#00c9a7', fontSize: '0.76rem', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                      {s.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions & Helplines */}
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: '#f8fafc' }}>
                    <Phone size={15} color="var(--hf-primary)" />
                    <span>Helpline: <strong style={{ color: 'var(--hf-primary)' }}>{hosp.helpline}</strong></span>
                  </div>
                  {hosp.has_24_7_emergency && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--hf-danger)', fontWeight: 700, marginTop: '2px' }}>
                      24/7 Trauma: {hosp.emergency_contact}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (onBookAppointment) {
                        onBookAppointment(hosp);
                      }
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '9999px' }}
                  >
                    <Calendar size={14} />
                    <span>Book Appointment</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem', borderRadius: '9999px' }}
                  >
                    <Navigation size={14} color="var(--hf-cyan)" />
                    <span>Directions</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
