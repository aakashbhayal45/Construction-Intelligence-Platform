import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Shield, Search, Home, Calendar, CloudSun, MessageSquare,
  Activity, Database, Zap, CheckCircle, AlertCircle, Key, RefreshCw, X, ArrowRight
} from 'lucide-react';
import { historyAPI, healthAPI, settingsAPI } from '../api/client';

const MODULES = [
  { to: '/safety', icon: '🦺', title: 'Safety Monitoring', desc: 'Upload site photos to detect PPE violations, scaffolding hazards, and unsafe conditions.', color: '#ef4444' },
  { to: '/cracks', icon: '🔍', title: 'Crack Detection', desc: 'Analyze structural cracks — classification, severity, likely causes, and repair methods.', color: '#f97316' },
  { to: '/valuation', icon: '🏠', title: 'Real Estate Valuation', desc: 'AI-powered property market estimates with micro-market analytics in INR.', color: '#22c55e' },
  { to: '/planning', icon: '📅', title: 'Project Planning', desc: 'Generate complete project plans with phase schedules, BOQ materials, labor, and risk registers.', color: '#0ea5e9' },
  { to: '/daily', icon: '🌤️', title: 'Daily Site Assistant', desc: 'Live Open-Meteo weather intelligence and AI-tailored daily activity advisories.', color: '#a855f7' },
  { to: '/chat', icon: '💬', title: 'Knowledge Assistant', desc: 'Chat with an expert on Indian building standards (IS 456, NBC 2016, IS 1893).', color: '#f59e0b' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, safety: 0, cracks: 0, valuations: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [health, setHealth] = useState(null);
  const [settings, setSettings] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const loadData = () => {
    historyAPI.get(null, 200).then(r => {
      const data = r.data;
      setStats({
        total: data.length,
        safety: data.filter(d => d.module === 'safety').length,
        cracks: data.filter(d => d.module === 'crack_detection').length,
        valuations: data.filter(d => d.module === 'valuation').length,
      });
      setRecentItems(data.slice(0, 4));
    }).catch(() => {});

    healthAPI.check().then(r => setHealth(r.data)).catch(() => {});
    settingsAPI.get().then(r => setSettings(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setSavingKey(true);
    try {
      await settingsAPI.setKey(newKey.trim());
      toast.success('Gemini API key updated!');
      setNewKey('');
      setShowKeyModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await settingsAPI.testKey();
      setTestResult(res.data);
      if (res.data.connected) {
        toast.success(res.data.message);
      } else {
        toast(res.data.message, { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error('Test connection failed: ' + err.message);
    } finally {
      setTestingKey(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">🏗️ Construction Intelligence Platform</h1>
            <p className="page-subtitle">Multimodal AI decision support for construction engineers, inspectors, and developers</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowKeyModal(true)}
              id="config-api-key-btn"
              style={{ fontSize: '0.75rem' }}
            >
              <Key size={13} />
              {settings?.ai_key_configured ? 'API Key Configured' : 'Configure Gemini Key'}
            </button>
            {health && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '999px',
                background: health.mode === 'live' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${health.mode === 'live' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                color: health.mode === 'live' ? '#4ade80' : 'var(--primary)',
                fontWeight: 600,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: health.mode === 'live' ? '#22c55e' : '#f59e0b' }} />
                {health.mode === 'live' ? `Live AI · ${health.gemini_model}` : 'Demo Simulation Engine Active'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '0.85rem 1.25rem',
        background: 'linear-gradient(90deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={18} color="var(--primary)" />
          <div style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>System Status: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Backend Online  •  SQLite Database Synchronized  •  Open-Meteo Weather Active  •  
              {settings?.ai_key_configured ? ' Gemini 2.0 Flash Live' : ' Ready for Demo Mode (Zero config required)'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTestKey}
          disabled={testingKey}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
        >
          <RefreshCw size={12} className={testingKey ? 'spin' : ''} />
          {testingKey ? 'Testing...' : 'Test AI Link'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Analyses</div>
          <Database className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.safety}</div>
          <div className="stat-label">Safety Inspections</div>
          <Shield className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.cracks}</div>
          <div className="stat-label">Crack Analyses</div>
          <Search className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.valuations}</div>
          <div className="stat-label">Valuations</div>
          <Home className="stat-icon" />
        </div>
      </div>

      {/* Modules */}
      <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
        Decision Support Modules
      </h2>
      <div className="module-grid">
        {MODULES.map(({ to, icon, title, desc, color }) => (
          <Link key={to} to={to} className="module-card">
            <span className="module-icon" style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}>{icon}</span>
            <div className="module-title">{title}</div>
            <div className="module-desc">{desc}</div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              <Zap size={12} />
              Launch module →
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Recent Inspections & Analyses
            </h2>
            <Link to="/history" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View full database <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Input Context</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        {item.module.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {item.input_summary}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Link to="/history" className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--border-focus)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Google Gemini API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Enter your Google AI Studio Gemini API key to activate live multimodal AI processing. If no key is set, the platform operates seamlessly using its built-in simulation engine.
            </p>

            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>Current Status:</div>
              <div style={{ color: settings?.ai_key_configured ? '#4ade80' : 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                {settings?.masked_key || 'Not configured'}
              </div>
            </div>

            <form onSubmit={handleSaveKey}>
              <div className="form-group">
                <label className="form-label" htmlFor="gemini-key-input">New Gemini API Key (starts with AIza...)</label>
                <input
                  id="gemini-key-input"
                  className="form-input"
                  type="password"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="Paste your AIzaSy... key here"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowKeyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingKey || !newKey.trim()}
                >
                  {savingKey ? 'Saving...' : 'Save & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(245,158,11,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <Activity size={14} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--primary)' }} />
        Powered by Google Gemini multimodal AI. All analyses are advisory — consult licensed structural engineers and safety auditors for statutory compliance.
      </div>
    </div>
  );
}
