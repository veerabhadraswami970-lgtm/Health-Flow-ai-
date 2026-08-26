import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import HealthcareShield3D from './3d/HealthcareShield3D';
import { UserCheck, X, PlusCircle, Trash2, Shield, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export default function TrustedContactModal({ t, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    permissions: {
      READ_RECORDS: false,
      VIEW_QR: false,
      INITIATE_SOS: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      const data = await healthflowApi.listTrustedContacts();
      setContacts(data || []);
    } catch (err) {
      console.error('Failed to fetch trusted contacts', err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: !prev.permissions[perm],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      contact: {
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      permissions: Object.entries(formData.permissions)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
    };
    try {
      await healthflowApi.grantTrustedContact(payload);
      setShowForm(false);
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        address: '',
        permissions: { READ_RECORDS: false, VIEW_QR: false, INITIATE_SOS: false },
      });
      fetchContacts();
    } catch (err) {
      console.error('Failed to add trusted contact', err);
      setError(err.message || 'Unable to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (contactId) => {
    if (!window.confirm(t?.confirm_revoke || 'Are you sure you want to revoke access for this trusted contact?')) return;
    try {
      await healthflowApi.revokeTrustedContact(contactId);
      fetchContacts();
    } catch (err) {
      console.error('Failed to revoke contact', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(0, 201, 167, 0.15)',
            border: '1px solid rgba(0, 201, 167, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-primary)'
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t?.trusted_contacts || "Trusted Caretaker & Family Consent Network"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              Delegate granular healthcare authorization, emergency proxy trigger & QR access to verified family members.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
        >
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          <span>{showForm ? 'Cancel Form' : (t?.add_contact || 'Add Trusted Caretaker')}</span>
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 75, 99, 0.1)', border: '1px solid rgba(255, 75, 99, 0.3)', color: '#ff7b8d', padding: '12px 16px', borderRadius: 'var(--hf-radius-md)' }}>
          {error}
        </div>
      )}

      {/* Add Contact Form Card */}
      {showForm && (
        <div className="hf-3d-card animate-slide-up" style={{ padding: '28px', borderLeft: '4px solid var(--hf-primary)' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, marginBottom: '16px' }}>
            Register New Caretaker & Delegate Granular Consent
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Full Name</label>
                <input placeholder="e.g. Priya Kumar" name="name" value={formData.name} onChange={handleInputChange} required className="input-field" style={{ marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Relationship</label>
                <input placeholder="e.g. Spouse, Daughter, Sibling" name="relationship" value={formData.relationship} onChange={handleInputChange} required className="input-field" style={{ marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Phone Number</label>
                <input placeholder="+919876543210" name="phone" value={formData.phone} onChange={handleInputChange} required className="input-field" style={{ marginTop: '4px', fontFamily: 'var(--hf-font-mono)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--hf-text-muted)', fontWeight: 700 }}>Email Address</label>
                <input placeholder="priya@example.com" name="email" value={formData.email} onChange={handleInputChange} className="input-field" style={{ marginTop: '4px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Delegated Permissions & Access Scopes:
              </label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--hf-border-subtle)' }}>
                  <input type="checkbox" checked={formData.permissions.READ_RECORDS} onChange={() => handlePermissionToggle('READ_RECORDS')} />
                  <span style={{ fontSize: '0.86rem', color: '#f8fafc' }}>{t?.read_records || 'Read EHR Health Records'}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--hf-border-subtle)' }}>
                  <input type="checkbox" checked={formData.permissions.VIEW_QR} onChange={() => handlePermissionToggle('VIEW_QR')} />
                  <span style={{ fontSize: '0.86rem', color: '#f8fafc' }}>{t?.view_qr || 'View & Present Health QR'}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--hf-border-subtle)' }}>
                  <input type="checkbox" checked={formData.permissions.INITIATE_SOS} onChange={() => handlePermissionToggle('INITIATE_SOS')} />
                  <span style={{ fontSize: '0.86rem', color: '#f8fafc' }}>{t?.initiate_sos || 'Initiate Emergency 108 SOS'}</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px', width: 'fit-content' }}>
              <Shield size={16} />
              <span>{loading ? (t?.saving || 'Granting Authorization...') : (t?.add_contact || 'Confirm & Save Trusted Caretaker')}</span>
            </button>
          </form>
        </div>
      )}

      {/* Contacts List Grid */}
      <div className="hf-card" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, marginBottom: '16px' }}>
          Active Caretakers ({contacts.length})
        </h3>

        {contacts.length === 0 ? (
          <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-muted)' }}>
            No trusted caretakers registered yet. Add a family member to allow automated emergency proxy routing.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {contacts.map((c) => (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  background: 'rgba(10, 18, 35, 0.65)',
                  padding: '20px',
                  borderRadius: 'var(--hf-radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderLeft: '4px solid var(--hf-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>{c.contact?.name}</span>
                      <span className="badge badge-verified">{c.contact?.relationship}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--hf-cyan)', fontFamily: 'var(--hf-font-mono)', marginTop: '2px' }}>
                      {c.contact?.phone}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(c.id)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', color: 'var(--hf-danger)' }}
                    title={t?.revoke || 'Revoke'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--hf-text-secondary)' }}>
                  <strong>Permissions:</strong> {c.permissions?.join(', ') || 'No permissions'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
