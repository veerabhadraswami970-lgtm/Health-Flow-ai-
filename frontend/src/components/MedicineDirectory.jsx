import React, { useState, useEffect } from 'react';
import { healthflowApi } from '../services/api';
import Medicine3D from './3d/Medicine3D';
import { Pill, Search, ShieldCheck, AlertTriangle, AlertCircle, Info, Sparkles, BookOpen, X } from 'lucide-react';

export default function MedicineDirectory({ t }) {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMedExplanation, setSelectedMedExplanation] = useState(null);
  const [loadingExp, setLoadingExp] = useState(false);
  const [orderMed, setOrderMed] = useState(null);
  const [rxAttached, setRxAttached] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    loadMedicines();
  }, [query]);

  async function loadMedicines() {
    setLoading(true);
    try {
      const data = await healthflowApi.searchMedicines(query);
      setMedicines(data || []);
    } catch (err) {
      console.error('Medicine search error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOrderClick(med) {
    setOrderMed(med);
    setRxAttached(false);
    setOrderPlaced(null);
  }

  function handleConfirmOrder() {
    if (orderMed?.prescription_required && !rxAttached) {
      alert("This is a Schedule H prescription drug. Please upload/attach a valid prescription before placing order.");
      return;
    }
    const orderId = `ORD-MED-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderPlaced({
      id: orderId,
      medicine: orderMed.brand_name,
      pharmacy: 'Apollo Pharmacy Central',
      delivery_est: 'Within 2 hours',
      status: 'CONFIRMED'
    });
  }

  async function handleExplainMedicine(medId) {
    setLoadingExp(true);
    try {
      const res = await healthflowApi.getMedicineExplanation(medId);
      setSelectedMedExplanation(res);
    } catch (err) {
      console.error('Failed to get explanation:', err);
    } finally {
      setLoadingExp(false);
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
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hf-warning)'
          }}>
            <Pill size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t.med_header || "Medicine Directory & Intelligence"}
            </h2>
            <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.9rem' }}>
              {t.med_sub || "CDSCO Pharmacopoeia verified generics, indications & AI plain language summaries."}
            </p>
          </div>
        </div>

        <span className="badge badge-warning">
          <ShieldCheck size={12} />
          <span>CDSCO Verified Formulary</span>
        </span>
      </div>

      {/* Search Input */}
      <div className="hf-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Search size={22} color="var(--hf-cyan)" />
        <input
          type="text"
          className="input-field"
          placeholder={t.search_med_placeholder || "Search by brand name or generic compound (e.g. Metformin, Paracetamol, Telmisartan)..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', padding: '6px 0', fontSize: '1.05rem', boxShadow: 'none' }}
        />
      </div>

      {/* Grid of Medicines */}
      <div className="grid-2">
        {medicines.map((m) => (
          <div
            key={m.id}
            className="hf-3d-card"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--hf-warning)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 800 }}>{m.brand_name}</h3>
                  <span className="badge badge-central">{m.strength}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--hf-cyan)', fontWeight: 700, marginTop: '2px' }}>
                  {m.generic_name}
                </div>
              </div>

              <span className={`badge ${m.prescription_required ? 'badge-warning' : 'badge-verified'}`}>
                {m.prescription_required ? 'Schedule H (Rx)' : 'OTC'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--hf-text-secondary)' }}>
              <strong>Composition:</strong> {m.composition} • <em>{m.manufacturer}</em>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--hf-radius-md)' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--hf-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                {t.indications || "Indications"}:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {m.indications?.map((ind, i) => (
                  <span key={i} style={{ background: 'rgba(0, 201, 167, 0.15)', color: '#00c9a7', fontSize: '0.76rem', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#ff7b8d' }}>
              <AlertCircle size={16} color="var(--hf-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{m.warnings}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--hf-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => handleOrderClick(m)}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                <span>{m.prescription_required ? 'Order Medicine (Rx Req)' : 'Order OTC Medicine'}</span>
              </button>

              <button
                onClick={() => handleExplainMedicine(m.id)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                <Sparkles size={14} color="var(--hf-cyan)" />
                <span>AI Plain Explanation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Plain Language Modal */}
      {selectedMedExplanation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="hf-3d-card" style={{ maxWidth: '640px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(0, 242, 254, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <span className="badge badge-verified">CDSCO Pharmacopoeia Verified</span>
                <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: '6px', fontWeight: 800 }}>
                  {selectedMedExplanation.medicine?.brand_name} ({selectedMedExplanation.medicine?.generic_name})
                </h3>
              </div>
              <button
                onClick={() => setSelectedMedExplanation(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--hf-text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: 'rgba(0, 201, 167, 0.08)', border: '1px solid rgba(0, 201, 167, 0.3)', padding: '16px', borderRadius: 'var(--hf-radius-md)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--hf-primary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                  DATABASE VERIFIED SUMMARY:
                </span>
                <p style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
                  {selectedMedExplanation.database_verified_summary}
                </p>
              </div>

              <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '16px', borderRadius: 'var(--hf-radius-md)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--hf-cyan)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                  AI PLAIN LANGUAGE EXPLANATION:
                </span>
                <div style={{ fontSize: '0.88rem', color: '#f1f5f9', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {selectedMedExplanation.ai_plain_language_explanation}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 75, 99, 0.08)', border: '1px solid rgba(255, 75, 99, 0.3)', padding: '16px', borderRadius: 'var(--hf-radius-md)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--hf-danger)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                  SAFETY & DRUG INTERACTIONS:
                </span>
                <p style={{ fontSize: '0.88rem', color: '#ffb3bd' }}>
                  {selectedMedExplanation.safety_advisory}
                </p>
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--hf-text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--hf-border-subtle)', paddingTop: '12px' }}>
                * {selectedMedExplanation.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Order Verification Modal */}
      {orderMed && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.9)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="hf-3d-card" style={{ maxWidth: '540px', width: '100%', padding: '28px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span className={`badge ${orderMed.prescription_required ? 'badge-warning' : 'badge-eligible'}`}>
                  {orderMed.prescription_required ? 'Schedule H Rx Required' : 'OTC Direct Order'}
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginTop: '6px', fontWeight: 800 }}>
                  Order: {orderMed.brand_name} ({orderMed.strength})
                </h3>
              </div>
              <button onClick={() => setOrderMed(null)} style={{ background: 'transparent', border: 'none', color: 'var(--hf-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {orderPlaced ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <ShieldCheck size={56} color="#34d399" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, marginBottom: '6px' }}>
                  Medicine Order Confirmed!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--hf-text-secondary)', marginBottom: '16px' }}>
                  Order #{orderPlaced.id} placed with {orderPlaced.pharmacy}. Delivery estimated {orderPlaced.delivery_est}.
                </p>
                <button onClick={() => setOrderMed(null)} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                  Close
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', fontSize: '0.86rem', color: 'var(--hf-text-secondary)' }}>
                  <div><strong>Generic:</strong> {orderMed.generic_name}</div>
                  <div><strong>Composition:</strong> {orderMed.composition}</div>
                  <div><strong>Manufacturer:</strong> {orderMed.manufacturer}</div>
                </div>

                {orderMed.prescription_required && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>
                      ⚠️ Prescription Required for Schedule H Drug
                    </div>
                    <p style={{ color: 'var(--hf-text-secondary)', fontSize: '0.8rem', marginBottom: '10px' }}>
                      Federal health laws require verified doctor prescription before dispensing this medication.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#f8fafc', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={rxAttached}
                        onChange={(e) => setRxAttached(e.target.checked)}
                        style={{ accentColor: '#34d399', width: '16px', height: '16px' }}
                      />
                      <span>I have attached / verified valid Prescription QR Token</span>
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button onClick={() => setOrderMed(null)} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
                    Cancel
                  </button>
                  <button onClick={handleConfirmOrder} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                    Place Pharmacy Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
