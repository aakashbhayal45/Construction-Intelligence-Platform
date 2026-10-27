import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Plus, X, FileText, Sparkles, Package, Users, ShieldAlert, BarChart3 } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { planningAPI } from '../api/client';
import { exportPlanningPDF } from '../utils/pdfExport';

const formatINR = (val) => {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const RISK_COLORS = { LOW: '#4ade80', MEDIUM: '#facc15', HIGH: '#f87171' };

const PRESET_PLANS = [
  {
    label: '3,000 sqft Residential Villa',
    data: {
      project_type: 'residential', size_sqft: '3000', budget_inr: '7500000',
      deadline_months: '18', workforce_count: '30', location: 'Pune, Maharashtra',
      special_requirements: ['Earthquake zone III compliance', 'Rainwater harvesting system'],
      notes: 'G+2 structure with basement parking and RCC framed structure',
    }
  },
  {
    label: '12,000 sqft Commercial Tech Park',
    data: {
      project_type: 'commercial', size_sqft: '12000', budget_inr: '35000000',
      deadline_months: '24', workforce_count: '65', location: 'Whitefield, Bengaluru',
      special_requirements: ['LEED Gold green building certification', 'High-capacity VRF HVAC'],
      notes: 'G+4 commercial building with dual elevators and backup generator yard',
    }
  },
  {
    label: '5,000 sqft Industrial Warehouse',
    data: {
      project_type: 'industrial', size_sqft: '5000', budget_inr: '12000000',
      deadline_months: '12', workforce_count: '25', location: 'Bhiwandi, Maharashtra',
      special_requirements: ['High-load FM2 industrial flooring', 'PEB steel portal frame'],
      notes: 'Pre-engineered steel building with 10m clear height and 2 loading docks',
    }
  }
];

export default function Planning() {
  const [form, setForm] = useState({
    project_type: 'residential', size_sqft: '', budget_inr: '',
    deadline_months: '', workforce_count: '', location: '', notes: '',
    special_requirements: [],
  });
  const [newReq, setNewReq] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadPreset = (preset) => {
    setForm({ ...preset.data });
    toast.success(`Loaded preset: ${preset.label}`);
  };

  const addReq = () => {
    if (newReq.trim() && !form.special_requirements.includes(newReq.trim())) {
      set('special_requirements', [...form.special_requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const removeReq = (i) => set('special_requirements', form.special_requirements.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.size_sqft || !form.budget_inr || !form.deadline_months || !form.workforce_count) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...form,
        size_sqft: parseFloat(form.size_sqft),
        budget_inr: parseFloat(form.budget_inr),
        deadline_months: parseInt(form.deadline_months),
        workforce_count: parseInt(form.workforce_count),
      };
      const res = await planningAPI.generate(payload);
      setResult(res.data);
      toast.success('Project plan generated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">📅 Construction Project Planning</h1>
        <p className="page-subtitle">Generate comprehensive project plans with phase schedules, Bill of Quantities (BOQ), labor allocations, and risk registers.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(14,165,233,0.15)' }}>
            <Calendar size={20} color="#38bdf8" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="card-title">Project Parameters</div>
            <div className="card-subtitle">Define project scope or select a template</div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PRESET_PLANS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loadPreset(p)}
                style={{ fontSize: '0.75rem' }}
              >
                <Sparkles size={12} color="var(--primary)" />
                {p.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="plan-type">Project Type</label>
              <select id="plan-type" className="form-select" value={form.project_type} onChange={e => set('project_type', e.target.value)}>
                <option value="residential">Residential Villa / Complex</option>
                <option value="commercial">Commercial Office / Tech Park</option>
                <option value="industrial">Industrial Warehouse / Factory</option>
                <option value="infrastructure">Infrastructure / Civil Works</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-size">Total Area (sq ft) *</label>
              <input id="plan-size" className="form-input" type="number" value={form.size_sqft} onChange={e => set('size_sqft', e.target.value)} placeholder="3000" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-budget">Total Budget (₹ INR) *</label>
              <input id="plan-budget" className="form-input" type="number" value={form.budget_inr} onChange={e => set('budget_inr', e.target.value)} placeholder="7500000" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-deadline">Deadline Target (Months) *</label>
              <input id="plan-deadline" className="form-input" type="number" value={form.deadline_months} onChange={e => set('deadline_months', e.target.value)} placeholder="18" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-workers">Workforce Team Size *</label>
              <input id="plan-workers" className="form-input" type="number" value={form.workforce_count} onChange={e => set('workforce_count', e.target.value)} placeholder="30" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-location">Site Location</label>
              <input id="plan-location" className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g., Pune, Maharashtra" />
            </div>
          </div>

          {/* Special Requirements */}
          <div className="form-group">
            <label className="form-label">Special Requirements & Codes</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                className="form-input"
                value={newReq}
                onChange={e => setNewReq(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())}
                placeholder="e.g., Seismic Zone III compliance, green building certification..."
                id="plan-special-req-input"
              />
              <button type="button" className="btn btn-secondary" onClick={addReq} id="add-req-btn">
                <Plus size={16} />
              </button>
            </div>
            <div className="tag-list">
              {form.special_requirements.map((r, i) => (
                <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {r}
                  <button type="button" onClick={() => removeReq(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="plan-notes">Additional Context & Scope Notes</label>
            <textarea id="plan-notes" className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Structure details, parking provisions, design constraints..." />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="generate-plan-btn">
            <Calendar size={18} />
            {loading ? 'Synthesizing Project Plan...' : 'Generate Comprehensive Project Plan'}
          </button>
        </form>
      </div>

      {loading && <Loader message="AI is calculating timeline dependencies, material BOQ, and risk matrices..." />}

      {result && (
        <div className="result-section">
          {/* Summary Banner */}
          <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(15,23,42,0.8))', border: '1px solid rgba(14,165,233,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(14,165,233,0.2)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
                {form.project_type?.toUpperCase()} MASTER PLAN · {form.location || 'SITE'}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportPlanningPDF(result, form)}
                id="export-plan-pdf-btn"
              >
                <FileText size={14} />
                Download Master Plan PDF
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Estimated Project Duration</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#38bdf8' }}>{result.total_duration_weeks} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--text-secondary)' }}>weeks (~{(result.total_duration_weeks / 4.33).toFixed(1)} months)</span></div>
            </div>
            <div className="result-summary">{result.summary}</div>
            {result.critical_path?.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(14,165,233,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
                <strong>Critical Path Dependency Chain:</strong> {result.critical_path.join(' → ')}
              </div>
            )}
          </div>

          {/* Phases Timeline */}
          <ResultCard
            title="Project Phases & Timeline Schedule"
            icon="📋"
            result={result}
            module="planning"
            onExportPDF={() => exportPlanningPDF(result, form)}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Phase Name</th>
                    <th>Timeline</th>
                    <th>Duration</th>
                    <th>Key Milestones</th>
                  </tr>
                </thead>
                <tbody>
                  {result.phases?.map((p, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                          {p.phase_name}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          W{p.start_week} – W{p.end_week}
                        </span>
                      </td>
                      <td>{p.duration_weeks} wks</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {p.milestones?.join(' • ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultCard>

          {/* NEW: Material Estimates & Labor Breakdown (Previously Missing in UI!) */}
          <div className="result-grid" style={{ marginTop: '1.25rem' }}>
            {/* Material Estimates */}
            <ResultCard title="Material Bill of Quantities (BOQ)" icon="📦">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Quantity</th>
                      <th>Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.material_estimates?.map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{m.material}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.quantity}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {formatINR(m.estimated_cost_inr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultCard>

            {/* Labor Breakdown */}
            <ResultCard title="Labor & Trade Allocation" icon="👷">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Trade</th>
                      <th>Crew</th>
                      <th>Duration</th>
                      <th>Labor Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.labor_breakdown?.map((l, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{l.trade}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.count} workers</td>
                        <td style={{ fontSize: '0.8rem' }}>{l.duration_weeks} wks</td>
                        <td style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>{formatINR(l.cost_inr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultCard>
          </div>

          {/* Budget Breakdown */}
          <div style={{ marginTop: '1.25rem' }}>
            <ResultCard title="Capital Budget Allocation" icon="💰">
              {result.budget_breakdown?.map((b, i) => (
                <div key={i} style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.category}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatINR(b.amount_inr)} ({b.percentage?.toFixed(1)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(b.percentage || 0, 100)}%` }} />
                  </div>
                </div>
              ))}
            </ResultCard>
          </div>

          {/* Risk Register */}
          <div style={{ marginTop: '1.25rem' }}>
            <ResultCard title="Risk Register & Mitigation Protocols" icon="⚠️">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Identified Risk Event</th>
                      <th>Probability</th>
                      <th>Impact</th>
                      <th>Mitigation Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.risk_register?.map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.risk}</td>
                        <td>
                          <span style={{ color: RISK_COLORS[r.probability] || '#facc15', fontWeight: 700, fontSize: '0.8rem' }}>
                            {r.probability}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: RISK_COLORS[r.impact] || '#f87171', fontWeight: 700, fontSize: '0.8rem' }}>
                            {r.impact}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultCard>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <ResultCard title="Project Manager Execution Recommendations" icon="💡">
                <ul className="info-list">
                  {result.recommendations.map((r, i) => (
                    <li key={i} style={{ borderLeftColor: 'var(--primary)' }}>
                      <span className="bullet" style={{ background: 'var(--primary)' }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </ResultCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
