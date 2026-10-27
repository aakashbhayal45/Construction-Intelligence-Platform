import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, AlertTriangle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import RiskBadge from '../components/RiskBadge';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { cracksAPI } from '../api/client';
import { exportCrackPDF } from '../utils/pdfExport';

const PRESET_CRACK_CONTEXTS = [
  'Diagonal crack near window on load-bearing masonry wall',
  'Horizontal crack along RCC beam-column junction, noticed 3 weeks ago',
  'Hairline map cracking across external plaster facade',
];

export default function Cracks() {
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
    if (!file) { toast.error('Please upload a crack photo'); return; }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('notes', notes);
      const res = await cracksAPI.analyze(fd);
      setResult(res.data);
      toast.success('Crack analysis complete!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = {
    MONITOR: '#4ade80',
    REPAIR_SOON: '#fb923c',
    REPAIR_IMMEDIATELY: '#f87171',
    EVACUATE: '#dc2626',
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🔍 Structural Crack Detection</h1>
        <p className="page-subtitle">Upload a photo of a structural crack to classify type, evaluate severity, assess risks, and receive engineering repair recommendations.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <Search size={20} color="#fb923c" />
          </div>
          <div>
            <div className="card-title">Crack Photo Analysis</div>
            <div className="card-subtitle">Close-up photos with good lighting provide optimal structural evaluation</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <ImageUploader
            onFileSelect={handleFileSelect}
            sampleUrl="/samples/crack_sample.jpg"
            sampleName="crack_sample.jpg"
            sampleLabel="Load Demo Crack Photo"
          />

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="crack-notes" style={{ margin: 0 }}>Additional Context (Optional)</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {PRESET_CRACK_CONTEXTS.map((ctx, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNotes(ctx)}
                    style={{
                      background: 'rgba(249, 115, 22, 0.08)',
                      border: '1px solid rgba(249, 115, 22, 0.2)',
                      borderRadius: '999px',
                      color: 'var(--warning)',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    + {ctx.split(' ')[0]}...
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="crack-notes"
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="E.g., load-bearing wall, ground floor, noticed 2 weeks ago..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !file}
            id="analyze-crack-btn"
          >
            <Search size={18} />
            {loading ? 'Analyzing Structural Crack...' : 'Analyze Crack'}
          </button>
        </form>
      </div>

      {loading && <Loader message="AI vision is measuring crack profile and calculating structural risk..." />}

      {result && (
        <div className="result-section">
          {/* Header */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <RiskBadge level={result.severity} size="lg" />
                <span style={{
                  background: `${urgencyColor[result.urgency] || '#fb923c'}22`,
                  color: urgencyColor[result.urgency] || '#fb923c',
                  border: `1px solid ${urgencyColor[result.urgency] || '#fb923c'}44`,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  🔔 Urgency: {result.urgency?.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportCrackPDF(result, notes)}
                id="export-crack-pdf-top"
              >
                <FileText size={14} />
                Download Diagnostic PDF
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(15,23,42,0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crack Type</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', fontSize: '1rem' }}>{result.crack_type}</div>
                  </div>
                  <div style={{ background: 'rgba(15,23,42,0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Width</div>
                    <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '1rem' }}>{result.width_estimate_mm}</div>
                  </div>
                </div>

                <div className="result-summary">{result.summary}</div>
              </div>

              {imagePreviewUrl && (
                <div style={{ width: '150px', height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  <img src={imagePreviewUrl} alt="Audited crack" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          <div className="result-grid">
            <ResultCard
              title="Structural Risk Assessment"
              icon="🏗️"
              result={result}
              module="cracks"
              onExportPDF={() => exportCrackPDF(result, notes)}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{result.structural_risk}</p>
            </ResultCard>

            <ResultCard title="Likely Causes" icon="🔎">
              <ul className="info-list">
                {result.likely_causes.map((c, i) => (
                  <li key={i}>
                    <span className="bullet" style={{ background: '#f97316' }} />
                    {c}
                  </li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Repair Recommendations" icon="🔧" result={result} module="cracks">
              <ul className="info-list">
                {result.repair_recommendations.map((r, i) => (
                  <li key={i} style={{ borderLeftColor: '#4ade80' }}>
                    <span className="bullet" style={{ background: '#4ade80' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </ResultCard>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#f87171', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Statutory Engineering Disclaimer:</div>
              <div>{result.disclaimer}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
