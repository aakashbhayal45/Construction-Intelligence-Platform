import React, { useEffect, useState } from 'react';
import { History, Filter, RefreshCw, Trash2, Search, ExternalLink, Image as ImageIcon, Eye, Code2 } from 'lucide-react';
import { historyAPI } from '../api/client';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:8000';

const MODULE_LABELS = {
  safety: { label: 'Safety Monitor', icon: '🦺', color: '#f87171' },
  crack_detection: { label: 'Crack Detection', icon: '🔍', color: '#fb923c' },
  valuation: { label: 'Valuation', icon: '🏠', color: '#4ade80' },
  planning: { label: 'Project Planning', icon: '📅', color: '#38bdf8' },
  daily_assistant: { label: 'Daily Assistant', icon: '🌤️', color: '#c084fc' },
  chat: { label: 'Chat', icon: '💬', color: '#f59e0b' },
};

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'json'
  const [lightboxImg, setLightboxImg] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await historyAPI.get(filter || null, 100);
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [filter]);

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    try {
      await historyAPI.delete(id);
      toast.success(`Deleted analysis #${id}`);
      if (selected?.id === id) setSelected(null);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to delete item: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
      return;
    }
    try {
      await historyAPI.clearAll();
      toast.success('All history cleared');
      setSelected(null);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to clear history: ' + err.message);
    }
  };

  const fmt = (dt) => {
    try { return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return dt; }
  };

  const filteredItems = items.filter(item => {
    if (!search.trim()) return true;
    return (item.input_summary || '').toLowerCase().includes(search.toLowerCase()) ||
           (item.module || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">🗂️ Analysis History & Audit Vault</h1>
            <p className="page-subtitle">Historical repository of all multimodal safety audits, crack diagnostics, valuations, and site plans.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '2rem', width: '180px', fontSize: '0.8rem' }}
                placeholder="Search audits..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 'auto', fontSize: '0.8rem' }} value={filter} onChange={e => setFilter(e.target.value)} id="history-filter">
              <option value="">All Modules</option>
              {Object.entries(MODULE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={fetchHistory} id="refresh-history-btn">
              <RefreshCw size={13} /> Refresh
            </button>
            {items.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleClearAll} style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }} title="Clear all records">
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader-overlay"><div className="loader-spinner" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <History size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <div style={{ color: 'var(--text-secondary)' }}>No matching analyses found.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
          {/* List Table */}
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Photo</th>
                    <th>Input Summary</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const mod = MODULE_LABELS[item.module] || { label: item.module, icon: '📊', color: '#94a3b8' };
                    const hasImage = Boolean(item.image_path);
                    const imgUrl = hasImage ? `${BASE_URL}${item.image_path}` : null;

                    return (
                      <tr
                        key={item.id}
                        style={{ cursor: 'pointer', background: selected?.id === item.id ? 'rgba(245,158,11,0.06)' : '' }}
                        onClick={() => setSelected(item)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{mod.icon}</span>
                            <span style={{ color: mod.color, fontWeight: 600, fontSize: '0.8rem' }}>{mod.label}</span>
                          </div>
                        </td>
                        <td>
                          {hasImage ? (
                            <img
                              src={imgUrl}
                              alt="Audit"
                              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                              onClick={(e) => { e.stopPropagation(); setLightboxImg(imgUrl); }}
                              title="Click to view full photo"
                            />
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                          {item.input_summary}
                        </td>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                          {fmt(item.created_at)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(e, item.id)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.2rem' }}
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{MODULE_LABELS[selected.module]?.icon}</span>
                    <span>{MODULE_LABELS[selected.module]?.label || selected.module}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>#{selected.id}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(selected.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', background: 'rgba(15,23,42,0.8)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('visual')}
                      style={{
                        background: viewMode === 'visual' ? 'var(--primary)' : 'transparent',
                        color: viewMode === 'visual' ? '#0a0f1e' : 'var(--text-secondary)',
                        border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Eye size={11} style={{ display: 'inline', marginRight: 3 }} /> Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('json')}
                      style={{
                        background: viewMode === 'json' ? 'var(--primary)' : 'transparent',
                        color: viewMode === 'json' ? '#0a0f1e' : 'var(--text-secondary)',
                        border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Code2 size={11} style={{ display: 'inline', marginRight: 3 }} /> JSON
                    </button>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelected(null)}
                    style={{ padding: '0.2rem 0.5rem' }}
                  >✕</button>
                </div>
              </div>

              {/* Image Preview if available */}
              {selected.image_path && (
                <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                  <img
                    src={`${BASE_URL}${selected.image_path}`}
                    alt="Audited photo"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setLightboxImg(`${BASE_URL}${selected.image_path}`)}
                    title="Click to view full image"
                  />
                  <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem' }}>
                    Click to enlarge
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', background: 'rgba(15,23,42,0.5)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Input Context:</strong> {selected.input_summary}
              </div>

              {/* View Modes */}
              {viewMode === 'visual' ? (
                <div>
                  {(() => {
                    try {
                      const data = JSON.parse(selected.result_json || '{}');
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                          {data.summary && (
                            <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--text-primary)' }}>
                              <strong style={{ color: 'var(--primary)' }}>Summary: </strong>{data.summary}
                            </div>
                          )}

                          {data.risk_level && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: 'var(--radius-sm)' }}>
                              <span>Risk Level / Score:</span>
                              <span style={{ fontWeight: 700, color: data.risk_level === 'LOW' ? '#4ade80' : '#f87171' }}>
                                {data.risk_level} {data.overall_score !== undefined && `(${data.overall_score}/100)`}
                              </span>
                            </div>
                          )}

                          {data.crack_type && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: 'var(--radius-sm)' }}>
                              <span>Crack Type / Width:</span>
                              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                {data.crack_type} ({data.width_estimate_mm})
                              </span>
                            </div>
                          )}

                          {data.min_price_inr && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: 'var(--radius-sm)' }}>
                              <span>Valuation Range:</span>
                              <span style={{ fontWeight: 700, color: '#4ade80' }}>
                                ₹{data.min_price_inr.toLocaleString('en-IN')} – ₹{data.max_price_inr.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}

                          {data.total_duration_weeks && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: 'var(--radius-sm)' }}>
                              <span>Total Duration:</span>
                              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{data.total_duration_weeks} weeks</span>
                            </div>
                          )}

                          {data.reply && (
                            <div style={{ padding: '0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {data.reply}
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return <div style={{ color: 'var(--text-muted)' }}>Could not parse visual summary.</div>;
                    }
                  })()}
                </div>
              ) : (
                <pre style={{
                  background: 'rgba(15,23,42,0.85)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  fontSize: '0.7rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: '400px',
                }}>
                  {JSON.stringify(JSON.parse(selected.result_json || '{}'), null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: '2rem', cursor: 'zoom-out'
          }}
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Full size audit photo"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '2px solid rgba(245,158,11,0.4)' }}
          />
        </div>
      )}
    </div>
  );
}
