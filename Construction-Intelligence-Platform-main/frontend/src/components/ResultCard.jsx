import React from 'react';
import { FileJson, FileText } from 'lucide-react';

export default function ResultCard({ title, icon, children, result, module, onExportPDF }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module || 'result'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card result-section">
      <div className="card-header">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
          <span className="card-title">{title}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onExportPDF && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onExportPDF}
              id={`export-pdf-${module || 'card'}`}
              title="Download formal PDF inspection report"
            >
              <FileText size={14} />
              Export PDF Report
            </button>
          )}
          {result && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={exportJSON}
              id={`export-json-${module || 'card'}`}
              title="Export structured JSON"
            >
              <FileJson size={14} />
              JSON
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
