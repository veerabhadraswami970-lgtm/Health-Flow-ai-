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
  Search, RefreshCw, AlertCircle, Sparkles, HeartPulse, Calendar
} from 'lucide-react';
import '../styles/landing.css';

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

const CITY_COORDINATES = {
  "Chennai": { latitude: 13.0827, longitude: 80.2707, address: "Chennai Center, Tamil Nadu", isFallback: false },
  "Hyderabad": { latitude: 17.3850, longitude: 78.4867, address: "Hyderabad Center, Telangana", isFallback: false },
  "New Delhi": { latitude: 28.6139, longitude: 77.2090, address: "New Delhi Center, Delhi", isFallback: false },
  "Visakhapatnam": { latitude: 17.6868, longitude: 83.2185, address: "Visakhapatnam Center, Andhra Pradesh", isFallback: false },
  "Bengaluru": { latitude: 12.9716, longitude: 77.5946, address: "Bengaluru Center, Karnataka", isFallback: false }
};

export default function HospitalDiscovery({ t, onEmergencyClick, onBookAppointment }) {
  const [hospitals, setHospitals] = useState([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [hasDialysis, setHasDialysis] = useState(false);
  const [radiusKm, setRadiusKm] = useState(500);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      setUserLocation(CITY_COORDINATES[selectedCity]);
    }
  };

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
      
      {/* Command Center Header Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 110, 105, 0.12) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}>
              <Building2 size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-teal">
                  <Sparkles size={13} /> ABDM HFR REGISTRY
                </span>
                <span className="badge badge-verified">
                  <CheckCircle2 size={13} /> GPS Proximity Live
                </span>
              </div>
              <h2 className="font-editorial-serif" style={{ fontSize: '1.85rem', color: 'var(--hf-ink)', margin: '4px 0 0 0' }}>
                Hospitals & Medical Facilities
              </h2>
              <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                Find certified hospitals near your GPS location, check ICU bed capacity, and book instant OPD appointments.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDetectLocation}
              className="btn btn-secondary"
              disabled={locating}
              style={{ fontSize: '0.88rem', padding: '10px 20px', borderRadius: '9999px' }}
            >
              <Compass size={16} className={locating ? 'spin-animation' : ''} color="var(--hf-teal)" />
              <span>{locating ? "Acquiring GPS..." : "Detect GPS Position"}</span>
            </button>

            <button
              onClick={onEmergencyClick}
              className="btn btn-emergency"
              style={{ fontSize: '0.88rem', padding: '10px 20px', borderRadius: '9999px' }}
            >
              <HeartPulse size={16} />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Proximity Controls Bar */}
      <div className="glass-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--hf-ink-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} color="var(--hf-teal)" />
            <span>Search Facility / Specialty</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Apollo, Cardiology, Trauma..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginTop: '6px', padding: '10px 14px', fontSize: '0.9rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--hf-ink-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={14} color="var(--hf-sage)" />
            <span>Proximity Radius</span>
          </label>
          <select 
            className="select-field" 
            value={radiusKm} 
            onChange={(e) => setRadiusKm(Number(e.target.value))} 
            style={{ marginTop: '6px', padding: '10px', fontSize: '0.9rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}
          >
            {RADIUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--hf-ink-muted)', fontWeight: '700' }}>City / Region</label>
          <select className="select-field" value={city} onChange={(e) => handleCityChange(e.target.value)} style={{ marginTop: '6px', padding: '10px', fontSize: '0.9rem', background: '#ffffff', color: 'var(--hf-ink)', border: '1px solid rgba(22, 32, 36, 0.15)' }}>
            <option value="">All Cities</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="New Delhi">New Delhi</option>
            <option value="Visakhapatnam">Visakhapatnam</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--hf-ink)', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              style={{ accentColor: 'var(--hf-coral)', width: '18px', height: '18px' }}
            />
            <span>24/7 Trauma Emergency Only</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--hf-ink)', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={hasDialysis}
              onChange={(e) => setHasDialysis(e.target.checked)}
              style={{ accentColor: 'var(--hf-teal)', width: '18px', height: '18px' }}
            />
            <span>Has Dialysis Unit</span>
          </label>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--hf-text-secondary)' }}>
          <RefreshCw size={28} className="spin-animation" style={{ margin: '0 auto 12px auto', display: 'block' }} color="var(--hf-teal)" />
          <span>Searching ABDM HFR Registry & calculating Haversine proximity...</span>
        </div>
      )}

      {/* Empty State Fallback */}
      {!loading && hospitals.length === 0 && (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Hospital3D size={120} />
          <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', marginTop: '16px', marginBottom: '8px' }}>
            No verified facilities found within {radiusKm} km
          </h3>
          <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Try expanding your search radius to 50 km or clearing active filters.
          </p>
          <button 
            onClick={() => setRadiusKm(50)} 
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '9999px' }}
          >
            Expand Radius to 50 km
          </button>
        </div>
      )}

      {/* Hospital Results Grid (PLACED ABOVE THE MAP) */}
      {!loading && hospitals.length > 0 && (
        <div className="grid-2" style={{ gap: '24px' }}>
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="glass-card"
              style={{ 
                padding: '28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                borderLeft: hosp.has_24_7_emergency ? '4px solid var(--hf-coral)' : '4px solid var(--hf-teal)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-verified" style={{ fontSize: '0.74rem' }}>
                      <CheckCircle2 size={11} /> ABDM HFR: {hosp.hfr_id}
                    </span>
                    {hosp.has_24_7_emergency && (
                      <span className="badge badge-danger" style={{ fontSize: '0.74rem' }}>
                        24/7 Trauma Emergency
                      </span>
                    )}
                  </div>
                  <h3 className="font-editorial-serif" style={{ fontSize: '1.4rem', color: 'var(--hf-ink)', margin: 0 }}>{hosp.name}</h3>
                  <span style={{ fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>{hosp.facility_type}</span>
                </div>

                {/* Distance Badge */}
                <div style={{ 
                  background: 'rgba(15, 110, 105, 0.08)', 
                  border: '1px solid rgba(15, 110, 105, 0.2)', 
                  padding: '8px 16px', 
                  borderRadius: '12px', 
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  <div className="font-editorial-serif" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--hf-teal)' }}>
                    {hosp.distance_km} km
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--hf-text-muted)' }}>Proximity</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--hf-ink-muted)' }}>
                <MapPin size={18} color="var(--hf-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{hosp.address}, {hosp.city}, {hosp.state} - {hosp.pincode}</span>
              </div>

              {/* Badges for Facilities */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span className="badge badge-teal"><Bed size={13} /> {hosp.total_beds} Total Beds ({hosp.icu_beds} ICU)</span>
                {hosp.has_dialysis && <span className="badge badge-verified"><Activity size={13} /> Dialysis Unit</span>}
                {hosp.has_blood_bank && <span className="badge badge-danger"><Droplet size={13} /> e-RaktKosh Blood Bank</span>}
              </div>

              {/* Empaneled Schemes */}
              <div style={{ background: 'rgba(15, 110, 105, 0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(15, 110, 105, 0.12)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hf-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Empaneled Govt Schemes:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {hosp.schemes_empaneled?.map((s, i) => (
                    <span key={i} style={{ background: '#ffffff', border: '1px solid rgba(15, 110, 105, 0.2)', color: 'var(--hf-teal)', fontSize: '0.78rem', padding: '4px 12px', borderRadius: '8px', fontWeight: 700 }}>
                      {s.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions & Helplines */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(22, 32, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--hf-ink)' }}>
                    <Phone size={15} color="var(--hf-teal)" />
                    <span>Helpline: <strong style={{ color: 'var(--hf-teal)' }}>{hosp.helpline}</strong></span>
                  </div>
                  {hosp.has_24_7_emergency && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--hf-coral)', fontWeight: 700, marginTop: '2px' }}>
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
                    style={{ padding: '10px 20px', fontSize: '0.88rem', borderRadius: '9999px' }}
                  >
                    <Calendar size={15} />
                    <span>Book Appointment</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.85rem', borderRadius: '9999px' }}
                  >
                    <Navigation size={15} color="var(--hf-teal)" />
                    <span>Directions</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spatial 3D Leaflet Map Container (PLACED BELOW THE HOSPITAL CARDS LIST) */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', color: 'var(--hf-ink)', margin: 0 }}>
            Interactive 3D Spatial Map & Proximity Radar
          </h3>
          <span className="badge badge-teal">Live Leaflet Radar</span>
        </div>

        <div className="glass-card" style={{ padding: '8px', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ height: '420px', width: '100%', borderRadius: '18px', overflow: 'hidden', position: 'relative' }}>
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
                    color: '#0f6e69',
                    fillColor: '#0f6e69',
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
                      <button
                        onClick={() => {
                          if (onBookAppointment) {
                            onBookAppointment(hosp);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          color: '#0f6e69',
                          fontWeight: 700,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <span>Book Appointment Now</span> →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
