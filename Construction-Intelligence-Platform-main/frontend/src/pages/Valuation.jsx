import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Home, IndianRupee, FileText, Sparkles, Building, Layers } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { valuationAPI } from '../api/client';
import { exportValuationPDF } from '../utils/pdfExport';

const formatINR = (val) => {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const AMENITIES_LIST = [
  'Parking', 'Gym', 'Swimming Pool', 'Clubhouse',
  'Generator Backup', 'CCTV', 'Lift/Elevator',
  'Garden/Park', 'Security', '24x7 Water'
];

const PRESET_PROPERTIES = [
  {
    label: 'Bandra West 2BHK Flat (Mumbai)',
    data: {
      location: 'Bandra West, Mumbai', area_sqft: '1200', property_type: 'apartment',
      age_years: '8', bedrooms: 2, bathrooms: 2, condition: 'GOOD',
      floor_number: '7', total_floors: '20', notes: 'Sea view from living room, prime location',
      amenities: ['Parking', 'Gym', 'CCTV', 'Lift/Elevator'],
    }
  },
  {
    label: 'Whitefield 3BHK Villa (Bangalore)',
    data: {
      location: 'Whitefield, Bengaluru', area_sqft: '2400', property_type: 'villa',
      age_years: '3', bedrooms: 3, bathrooms: 3, condition: 'EXCELLENT',
      floor_number: '1', total_floors: '2', notes: 'Gated community, corner plot, solar power',
      amenities: ['Parking', 'Gym', 'Swimming Pool', 'Clubhouse', 'Garden/Park', 'Security'],
    }
  },
  {
    label: 'Connaught Place Commercial (Delhi)',
    data: {
      location: 'Connaught Place, New Delhi', area_sqft: '1800', property_type: 'commercial',
      age_years: '12', bedrooms: 0, bathrooms: 2, condition: 'GOOD',
      floor_number: '3', total_floors: '8', notes: 'Metro station adjacent, high footfall zone',
      amenities: ['Parking', 'Generator Backup', 'Lift/Elevator', 'Security', '24x7 Water'],
    }
  }
];

export default function Valuation() {
  const [form, setForm] = useState({
    location: '', area_sqft: '', property_type: 'apartment',
    age_years: '', bedrooms: 2, bathrooms: 2, condition: 'GOOD',
    floor_number: '', total_floors: '', notes: '', amenities: [],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadPreset = (preset) => {
    setForm({ ...preset.data });
    toast.success(`Loaded preset: ${preset.label}`);
  };

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location || !form.area_sqft) { toast.error('Location and area are required'); return; }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...form,
        area_sqft: parseFloat(form.area_sqft),
        age_years: parseInt(form.age_years) || 0,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        floor_number: form.floor_number ? parseInt(form.floor_number) : null,
        total_floors: form.total_floors ? parseInt(form.total_floors) : null,
      };
      const res = await valuationAPI.estimate(payload);
      setResult(res.data);
      toast.success('Valuation complete!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CONFIDENCE_BADGE = { HIGH: 'badge-safe', MEDIUM: 'badge-medium', LOW: 'badge-caution' };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🏠 Real Estate Valuation</h1>
        <p className="page-subtitle">AI-powered property value estimates with Indian market analysis and micro-market comparables. All values in INR.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>
            <Home size={20} color="#4ade80" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="card-title">Property Details</div>
            <div className="card-subtitle">Input specifications or load quick demo presets</div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PRESET_PROPERTIES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loadPreset(p)}
                style={{ fontSize: '0.75rem' }}
              >
                <Sparkles size={12} color="var(--primary)" />
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="val-location">Location / Area *</label>
              <input id="val-location" className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g., Bandra West, Mumbai" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-area">Super Built-up Area (sq ft) *</label>
              <input id="val-area" className="form-input" type="number" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} placeholder="1200" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-type">Property Type</label>
              <select id="val-type" className="form-select" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Villa / Bungalow</option>
                <option value="plot">Plot / Land</option>
                <option value="commercial">Commercial Office</option>
                <option value="warehouse">Warehouse / Industrial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-age">Age of Construction (Years)</label>
              <input id="val-age" className="form-input" type="number" value={form.age_years} onChange={e => set('age_years', e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-beds">Bedrooms</label>
              <input id="val-beds" className="form-input" type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-baths">Bathrooms</label>
              <input id="val-baths" className="form-input" type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-condition">Condition</label>
              <select id="val-condition" className="form-select" value={form.condition} onChange={e => set('condition', e.target.value)}>
                {['POOR','FAIR','GOOD','EXCELLENT'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="val-floor">Floor Number</label>
              <input id="val-floor" className="form-input" type="number" value={form.floor_number} onChange={e => set('floor_number', e.target.value)} placeholder="e.g., 7" min="0" />
            </div>
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label className="form-label">Amenities & Features</label>
            <div className="tag-list">
              {AMENITIES_LIST.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className="tag"
                  style={{
                    cursor: 'pointer',
                    background: form.amenities.includes(a) ? 'rgba(245,158,11,0.2)' : '',
                    borderColor: form.amenities.includes(a) ? 'rgba(245,158,11,0.5)' : '',
                    color: form.amenities.includes(a) ? 'var(--primary)' : '',
                    transition: 'all 0.2s',
                  }}
                >
                  {form.amenities.includes(a) ? '✓ ' : '+ '}{a}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="val-notes">Additional Context</label>
            <textarea id="val-notes" className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Corner unit, sea view, main road facing..." />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="estimate-valuation-btn">
            <IndianRupee size={18} />
            {loading ? 'Evaluating Market Data...' : 'Estimate Market Valuation'}
          </button>
        </form>
      </div>

      {loading && <Loader message="AI is querying market metrics, comparable transactions & property factors..." />}

      {result && (
        <div className="result-section">
          {/* Price Banner */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(15,23,42,0.8))', border: '1px solid rgba(34,197,94,0.2)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(34,197,94,0.15)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <span className={`badge ${CONFIDENCE_BADGE[result.confidence] || 'badge-safe'}`}>
                Confidence: {result.confidence}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportValuationPDF(result, form)}
                id="export-valuation-pdf-btn"
              >
                <FileText size={14} />
                Download Valuation Certificate PDF
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated Fair Market Value Range
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4ade80' }}>
                {formatINR(result.min_price_inr)} – {formatINR(result.max_price_inr)}
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                ₹{result.per_sqft_rate_inr?.toLocaleString('en-IN')} per sq ft
              </div>
            </div>
          </div>

          <div className="result-grid">
            <ResultCard
              title="Key Value Drivers"
              icon="📈"
              result={result}
              module="valuation"
              onExportPDF={() => exportValuationPDF(result, form)}
            >
              <ul className="info-list">
                {result.key_value_drivers.map((d, i) => (
                  <li key={i}><span className="bullet" style={{ background: '#4ade80' }} />{d}</li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Negative Factors & Depreciation" icon="📉">
              <ul className="info-list">
                {result.negative_factors.map((d, i) => (
                  <li key={i}><span className="bullet" style={{ background: '#f87171' }} />{d}</li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Market Trend Analysis" icon="📊">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>{result.market_trend}</p>
              {result.comparable_properties?.length > 0 && (
                <>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comparable Properties</div>
                  <ul className="info-list">
                    {result.comparable_properties.map((c, i) => <li key={i}><span className="bullet" style={{ background: '#0ea5e9' }} />{c}</li>)}
                  </ul>
                </>
              )}
            </ResultCard>

            <ResultCard title="Assumptions & Summary" icon="📋" result={result} module="valuation">
              <ul className="info-list">
                {result.assumptions.map((a, i) => <li key={i}><span className="bullet" style={{ background: '#a855f7' }} />{a}</li>)}
              </ul>
              <div className="result-summary" style={{ marginTop: '1rem' }}>{result.summary}</div>
            </ResultCard>
          </div>
        </div>
      )}
    </div>
  );
}
