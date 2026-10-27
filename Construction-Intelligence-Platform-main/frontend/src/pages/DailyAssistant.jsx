import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CloudSun, Thermometer, Wind, Droplets, Plus, X, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { assistantAPI } from '../api/client';
import { exportDailyPDF } from '../utils/pdfExport';

const ACTIVITY_SUGGESTIONS = [
  'Concrete pouring', 'Brickwork / Masonry', 'Scaffolding erection',
  'Crane / Lifting operations', 'Electrical work', 'Plumbing',
  'Painting / Waterproofing', 'Earthwork / Excavation', 'RCC slab casting',
  'Steel erection', 'Finishing work', 'Foundation work',
];

const PRESET_DAILY_SCENARIOS = [
  {
    label: 'Monsoon Pouring (Mumbai)',
    location: 'Andheri East, Mumbai',
    workforce: '45',
    activities: ['Concrete pouring', 'Scaffolding erection', 'Electrical work'],
    notes: 'RCC slab casting on 5th floor today with overcast conditions expected',
  },
  {
    label: 'High-Rise Scaffolding (Delhi)',
    location: 'Dwarka, New Delhi',
    workforce: '30',
    activities: ['Scaffolding erection', 'Crane / Lifting operations', 'Steel erection'],
    notes: 'External facade staging installation up to 14th floor',
  },
  {
    label: 'Excavation & Foundations (Bengaluru)',
    location: 'Electronic City, Bengaluru',
    workforce: '25',
    activities: ['Earthwork / Excavation', 'Foundation work', 'Plumbing'],
    notes: 'Basement raft pit digging and subsoil drainage pipe installation',
  },
];

const REC_COLORS = {
  PROCEED: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', text: '#4ade80' },
  PROCEED_WITH_CAUTION: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', text: '#facc15' },
  DELAY: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', text: '#fb923c' },
  CANCEL: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#f87171' },
};

const REC_ICONS = { PROCEED: '✅', PROCEED_WITH_CAUTION: '⚠️', DELAY: '⏰', CANCEL: '🚫' };

export default function DailyAssistant() {
  const [location, setLocation] = useState('');
  const [workforce, setWorkforce] = useState('');
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const loadPreset = (preset) => {
    setLocation(preset.location);
    setWorkforce(preset.workforce);
    setActivities([...preset.activities]);
    setNotes(preset.notes);
    toast.success(`Loaded preset: ${preset.label}`);
  };

  const toggleActivity = (a) => {
    setActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const addCustom = () => {
    if (customActivity.trim() && !activities.includes(customActivity.trim())) {
      setActivities(prev => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) { toast.error('Please enter site location'); return; }
    if (activities.length === 0) { toast.error('Please select at least one activity'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await assistantAPI.daily({
        location, activities, workforce_count: parseInt(workforce) || 0, notes,
      });
      setResult(res.data);
      toast.success('Daily advisory ready!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const w = result?.weather;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🌤️ Daily Site Assistant</h1>
        <p className="page-subtitle">Get live weather data (via Open-Meteo) and AI-powered activity advisories tailored to your construction site operations.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(168,85,247,0.15)' }}>
            <CloudSun size={20} color="#c084fc" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="card-title">Site & Activity Details</div>
            <div className="card-subtitle">Configure site location and planned activities for today</div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PRESET_DAILY_SCENARIOS.map((p, idx) => (
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
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="daily-location">Site Location / City *</label>
              <input id="daily-location" className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Andheri East, Mumbai" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="daily-workforce">Active Workforce Count</label>
              <input id="daily-workforce" className="form-input" type="number" value={workforce} onChange={e => setWorkforce(e.target.value)} placeholder="45" min="0" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Planned Activities for Today *</label>
            <div className="tag-list" style={{ marginBottom: '0.75rem' }}>
              {ACTIVITY_SUGGESTIONS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleActivity(a)}
                  className="tag"
                  style={{
                    cursor: 'pointer',
                    background: activities.includes(a) ? 'rgba(168,85,247,0.2)' : '',
                    borderColor: activities.includes(a) ? 'rgba(168,85,247,0.5)' : '',
                    color: activities.includes(a) ? '#c084fc' : '',
                    transition: 'all 0.2s',
                  }}
                >
                  {activities.includes(a) ? '✓ ' : '+ '}{a}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="form-input"
                value={customActivity}
                onChange={e => setCustomActivity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                placeholder="Add custom activity..."
                id="daily-custom-activity"
              />
              <button type="button" className="btn btn-secondary" onClick={addCustom}><Plus size={16} /></button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="daily-notes">Special Conditions / Notes</label>
            <textarea id="daily-notes" className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special circumstances, ongoing work areas, critical curing zones..." />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="get-daily-advisory-btn">
            <CloudSun size={18} />
            {loading ? 'Fetching Weather & Generating Advisory...' : 'Get Daily Advisory & Briefing'}
          </button>
        </form>
      </div>

      {loading && <Loader message="Fetching live meteorological data and cross-referencing activity safety rules..." />}

      {result && (
        <div className="result-section">
          {/* Weather Card */}
          <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(15,23,42,0.8))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(168,85,247,0.2)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RiskBadge level={result.overall_site_status} size="lg" />
                <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600 }}>SITE OPERATIONAL STATUS</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportDailyPDF(result, location)}
                id="export-daily-pdf-btn"
              >
                <FileText size={14} />
                Download Toolbox Briefing PDF
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Conditions · {location}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{w?.condition}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{result.summary}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {[
                  { icon: <Thermometer size={16} />, label: 'Temperature', value: `${w?.temperature_c}°C` },
                  { icon: <Wind size={16} />, label: 'Wind Speed', value: `${w?.wind_speed_kmh} km/h` },
                  { icon: <Droplets size={16} />, label: 'Precipitation', value: `${w?.precipitation_mm} mm` },
                  { icon: <Droplets size={16} />, label: 'Humidity', value: `${w?.humidity_percent}%` },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ color: '#c084fc', marginBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Advisories */}
          <ResultCard
            title="Activity Advisories & Justifications"
            icon="📋"
            result={result}
            module="daily_assistant"
            onExportPDF={() => exportDailyPDF(result, location)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.activity_advice?.map((a, i) => {
                const colors = REC_COLORS[a.recommendation] || REC_COLORS.PROCEED;
                return (
                  <div key={i} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.2rem' }}>{REC_ICONS[a.recommendation] || '📋'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{a.activity}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.reason}</div>
                      </div>
                      <span style={{ color: colors.text, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {a.recommendation.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ResultCard>

          <div className="result-grid" style={{ marginTop: '1.25rem' }}>
            <ResultCard title="Morning Safety Briefing (Toolbox Talk)" icon="🦺">
              <ul className="info-list">
                {result.safety_briefing?.map((s, i) => (
                  <li key={i} style={{ borderLeftColor: '#c084fc' }}>
                    <span className="bullet" style={{ background: '#c084fc' }} />{s}
                  </li>
                ))}
              </ul>
            </ResultCard>
            <ResultCard title="Site Weather Precautions" icon="⚠️">
              <ul className="info-list">
                {result.daily_precautions?.map((p, i) => (
                  <li key={i}><span className="bullet" style={{ background: '#facc15' }} />{p}</li>
                ))}
              </ul>
            </ResultCard>
          </div>
        </div>
      )}
    </div>
  );
}
