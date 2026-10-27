import React from 'react';

const BADGE_MAP = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
  SAFE: 'badge-safe',
  CAUTION: 'badge-caution',
  UNSAFE: 'badge-unsafe',
  WARNING: 'badge-warning',
  MONITOR: 'badge-low',
  REPAIR_SOON: 'badge-high',
  REPAIR_IMMEDIATELY: 'badge-critical',
  EVACUATE: 'badge-critical',
  PROCEED: 'badge-safe',
  PROCEED_WITH_CAUTION: 'badge-caution',
  DELAY: 'badge-high',
  CANCEL: 'badge-critical',
};

const DOT_COLORS = {
  LOW: '#4ade80', SAFE: '#4ade80', MONITOR: '#4ade80', PROCEED: '#4ade80',
  MEDIUM: '#facc15', CAUTION: '#facc15', PROCEED_WITH_CAUTION: '#facc15',
  HIGH: '#fb923c', WARNING: '#fb923c', REPAIR_SOON: '#fb923c', DELAY: '#fb923c',
  CRITICAL: '#f87171', UNSAFE: '#f87171', REPAIR_IMMEDIATELY: '#f87171',
  EVACUATE: '#f87171', CANCEL: '#f87171',
};

export default function RiskBadge({ level, showDot = true, size = 'md' }) {
  const cls = BADGE_MAP[level?.toUpperCase()] || 'badge-medium';
  const color = DOT_COLORS[level?.toUpperCase()] || '#facc15';

  return (
    <span className={`badge ${cls}`} style={size === 'lg' ? { fontSize: '0.875rem', padding: '0.4rem 1rem' } : {}}>
      {showDot && (
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }} />
      )}
      {level}
    </span>
  );
}
