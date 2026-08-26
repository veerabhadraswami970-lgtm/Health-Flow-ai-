import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import { getUserLocation, calculateHaversineDistance, DEFAULT_LOCATION } from '../services/locationService';
import BloodDrop3D from './3d/BloodDrop3D';
import { 
  Droplet, MapPin, Phone, ShieldCheck, Clock, CheckCircle2, 
  AlertTriangle, Navigation, ExternalLink, Compass, RefreshCw, Sparkles
} from 'lucide-react';

const BLOOD_GROUPS = ["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Platelets", "Plasma"];

export default function BloodBankFinder({ t }) {
  const [banks, setBanks] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    handleDetectLocation();
  }, []);

  useEffect(() => {
    loadBloodBanks();
  }, [selectedGroup, city, userLocation.latitude, userLocation.longitude]);

  async function handleDetectLocation() {
    setLocating(true);
    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
    } catch (e) {
      console.warn("Could not detect GPS location for blood banks:", e);
    } finally {
      setLocating(false);
    }
  }

  async function loadBloodBanks() {
    setLoading(true);
    try {
      const data = await healthflowApi.searchBloodBanks({
        blood_group: selectedGroup === "All" ? undefined : selectedGroup,
        city: city || undefined,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude
      });
      setBanks(data || []);
    } catch (err) {
      console.error('Blood bank search error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Title Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 75, 99, 0.15)',
            border: '1px solid rgba(255, 75, 99, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-danger)'
          }}>
            <Droplet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t?.nav_blood_bank || "Blood Bank & Inventory (e-RaktKosh)"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              National Blood Transfusion Council (e-RaktKosh) verified live inventory & GPS proximity routing.
            </p>
          </div>
        </div>

        <button 
          onClick={handleDetectLocation}
          className="btn btn-secondary"
          disabled={locating}
          style={{ fontSize: '0.86rem', padding: '9px 18px' }}
        >
          <Compass size={16} className={locating ? 'spin-animation' : ''} color="var(--hf-danger)" />
          <span>{locating ? "Acquiring GPS..." : "Find Nearest to Me"}</span>
        </button>
      </div>

      {/* Group Selector & Filter Bar */}
      <div className="hf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '4px solid var(--hf-danger)' }}>
        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--hf-text-muted)', fontWeight: 800, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t?.select_blood_group || "Select Blood Group / Component"}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={selectedGroup === g ? "btn btn-emergency" : "btn btn-secondary"}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: 'var(--hf-radius-md)'
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>{t?.city_filter || "Filter by City"}</label>
            <select className="select-field" value={city} onChange={(e) => setCity(e.target.value)} style={{ marginTop: '6px', padding: '9px', fontSize: '0.88rem' }}>
              <option value="" style={{ background: '#0b1325' }}>All Cities</option>
              <option value="Hyderabad" style={{ background: '#0b1325' }}>Hyderabad</option>
              <option value="New Delhi" style={{ background: '#0b1325' }}>New Delhi</option>
              <option value="Visakhapatnam" style={{ background: '#0b1325' }}>Visakhapatnam</option>
              <option value="Bengaluru" style={{ background: '#0b1325' }}>Bengaluru</option>
            </select>
          </div>

          <div style={{ flex: '2 1 300px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hf-text-secondary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} color="var(--hf-primary)" />
            <span>Real-time integration with Ministry of Health e-RaktKosh centralized portal.</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hf-text-secondary)' }}>
          <RefreshCw size={26} className="spin-animation" style={{ margin: '0 auto 10px auto', display: 'block' }} color="var(--hf-danger)" />
          <span>Querying e-RaktKosh live stock availability...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && banks.length === 0 && (
        <div className="hf-card" style={{ padding: '40px', textAlign: 'center' }}>
          <BloodDrop3D size={120} />
          <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginTop: '12px', marginBottom: '6px' }}>
            No verified blood banks with "{selectedGroup}" stock found
          </h3>
          <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Try selecting "All" blood groups or selecting another major city.
          </p>
          <button 
            onClick={() => setSelectedGroup('All')} 
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            Show All Available Units
          </button>
        </div>
      )}

      {/* Blood Bank Cards Grid */}
      {!loading && banks.length > 0 && (
        <div className="grid-2">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="hf-3d-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderLeft: '4px solid var(--hf-danger)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={11} /> e-RaktKosh ID: {bank.eraktkosh_id}
                    </span>
                    <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                      {bank.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '2px' }}>{bank.name}</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--hf-text-secondary)' }}>Affiliated: {bank.hospital_affiliation}</span>
                </div>

                {bank.distance_km && (
                  <div style={{
                    background: 'rgba(255, 75, 99, 0.12)',
                    border: '1px solid rgba(255, 75, 99, 0.3)',
                    padding: '6px 12px',
                    borderRadius: 'var(--hf-radius-md)',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--hf-danger)' }}>
                      {bank.distance_km} km
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--hf-text-muted)' }}>Proximity</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--hf-text-secondary)' }}>
                <MapPin size={18} color="var(--hf-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{bank.address}, {bank.city}, {bank.state}</span>
              </div>

              {/* Stock Inventory Matrix */}
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: 'var(--hf-radius-md)', border: '1px solid var(--hf-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--hf-text-muted)', textTransform: 'uppercase' }}>
                    Available Units (Verified Today):
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--hf-primary)' }}>
                    <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} /> Live Stock
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '8px' }}>
                  {bank.inventory && Object.entries(bank.inventory).map(([grp, count]) => (
                    <div
                      key={grp}
                      style={{
                        background: grp === selectedGroup ? 'rgba(255, 75, 99, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                        border: grp === selectedGroup ? '1px solid var(--hf-danger)' : '1px solid var(--hf-border-subtle)',
                        padding: '6px 4px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: grp === selectedGroup ? '#ff7b8d' : '#f8fafc' }}>
                        {grp}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: count > 0 ? 'var(--hf-primary)' : 'var(--hf-text-muted)' }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact and Navigation */}
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#f8fafc' }}>
                  <Phone size={15} color="var(--hf-danger)" />
                  <span>Helpline: <strong style={{ color: '#ff7b8d' }}>{bank.contact_phone}</strong></span>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${bank.latitude},${bank.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <Navigation size={14} color="var(--hf-cyan)" />
                  <span>Directions</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
