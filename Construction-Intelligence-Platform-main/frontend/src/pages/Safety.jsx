import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Shield, HardHat, FileText, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import RiskBadge from '../components/RiskBadge';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { safetyAPI } from '../api/client';
import { exportSafetyPDF } from '../utils/pdfExport';

const PRESET_NOTES = [
  '3-story scaffold with active hot work and concrete pouring',
  'Deep basement excavation with earthmoving machinery',
  'RCC high-rise floor casting with open perimeter edges',
];

export default function Safety() {
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (f) => {
    setFile(f);
    if (f) {
      setImagePreviewUrl(URL.createObjectURL(f));
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please upload a site image'); return; }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('notes', notes);
      const res = await safetyAPI.analyze(fd);
      setResult(res.data);
      toast.success('Safety analysis complete!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.overall_score >= 80 ? '#4ade80'
      : result.overall_score >= 60 ? '#facc15'
      : result.overall_score >= 40 ? '#fb923c'
      : '#f87171'
    : '#4ade80';

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🦺 Construction Site Safety Monitor</h1>
        <p className="page-subtitle">Upload a site photo to detect PPE violations, scaffolding hazards, and unsafe conditions using multimodal AI vision.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Shield size={20} color="#f87171" />
          </div>
          <div>
            <div className="card-title">Site Photo Analysis</div>
            <div className="card-subtitle">Supports JPG, PNG, WebP — Max 5 MB</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <ImageUploader
            onFileSelect={handleFileSelect}
            label="Upload site photo"
            sampleUrl="/samples/site_photo.jpg"
            sampleName="site_photo.jpg"
            sampleLabel="Load Demo Site Photo"
          />

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="safety-notes" style={{ margin: 0 }}>Inspector Notes (Optional)</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {PRESET_NOTES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNotes(preset)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '999px',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    + {preset.split(' ')[0]}...
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="safety-notes"
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="E.g., scaffolding is 3 stories high, workers handling hot work..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !file}
            id="analyze-safety-btn"
          >
            <Shield size={18} />
            {loading ? 'Analyzing Site Image...' : 'Analyze Safety'}
          </button>
        </form>
      </div>

      {loading && <Loader message="AI vision is scanning image for PPE violations & hazards..." />}

      {result && (
        <div className="result-section">
          {/* Score Header */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <RiskBadge level={result.risk_level} size="lg" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {result.violations.length} Violation{result.violations.length === 1 ? '' : 's'} Detected
                </span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportSafetyPDF(result, notes)}
                id="export-safety-pdf-top"
              >
                <FileText size={14} />
                Download Formal Audit PDF
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Score Circle */}
              <div className="score-meter">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.overall_score / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${scoreColor})` }}
                  />
                </svg>
                <div className="score-text">
                  <div className="score-number" style={{ color: scoreColor }}>{result.overall_score}</div>
                  <div className="score-label">Safety Score</div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className="result-summary">{result.summary}</div>
              </div>

              {imagePreviewUrl && (
                <div style={{ width: '140px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  <img src={imagePreviewUrl} alt="Audited site" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          <div className="result-grid">
            {/* Violations */}
            {result.violations.length > 0 && (
              <ResultCard
                title="Violations Detected"
                icon="⚠️"
                result={result}
                module="safety"
                onExportPDF={() => exportSafetyPDF(result, notes)}
              >
                <ul className="info-list">
                  {result.violations.map((v, i) => (
                    <li key={i}>
                      <span className="bullet" style={{ background: '#fb923c' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{v.category}</span>
                          {v.location_in_image && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(245,158,11,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={10} /> {v.location_in_image}
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: '0.2rem' }}>{v.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {/* Missing PPE */}
            {result.missing_ppe.length > 0 && (
              <ResultCard title="Missing PPE" icon="🪖">
                <div className="tag-list">
                  {result.missing_ppe.map((ppe, i) => (
                    <span key={i} className="tag" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                      <HardHat size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                      {ppe}
                    </span>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Hazards */}
            {result.hazards_detected.length > 0 && (
              <ResultCard title="Hazards Detected" icon="🔥">
                <ul className="info-list">
                  {result.hazards_detected.map((h, i) => (
                    <li key={i}>
                      <span className="bullet" style={{ background: '#f87171' }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {/* Immediate Actions */}
            {result.immediate_actions.length > 0 && (
              <ResultCard title="Immediate Actions Required" icon="🚨">
                <ul className="info-list">
                  {result.immediate_actions.map((a, i) => (
                    <li key={i} style={{ borderLeftColor: '#f87171' }}>
                      <span className="bullet" style={{ background: '#f87171' }} />
                      <strong>{a}</strong>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {/* Corrective Actions */}
            <ResultCard title="Corrective Actions Checklist" icon="✅" result={result} module="safety">
              <ul className="info-list">
                {result.corrective_actions.map((a, i) => (
                  <li key={i} style={{ borderLeftColor: '#4ade80' }}>
                    <span className="bullet" style={{ background: '#4ade80' }} />
                    {a}
                  </li>
                ))}
              </ul>
            </ResultCard>
          </div>
        </div>
      )}
    </div>
  );
}
