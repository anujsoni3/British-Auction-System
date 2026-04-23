import React from 'react';

function getStatusTone(status) {
  if (status === 'ACTIVE') return 'text-brand-accent border-brand-accent/30 bg-brand-accent/10';
  if (status === 'CLOSED') return 'text-rose-300 border-rose-500/35 bg-rose-500/10';
  if (status === 'FORCE_CLOSED') return 'text-slate-300 border-slate-500/35 bg-slate-500/10';
  return 'text-slate-300 border-slate-500/35 bg-slate-500/10';
}

function getStatusLabel(status) {
  if (status === 'FORCE_CLOSED') return 'FORCE CLOSED';
  return String(status || '').replace('_', ' ');
}

export function StatusBadge({ status, large = false }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-3 py-1 font-semibold tracking-wide ${large ? 'text-sm' : 'text-xs'} ${getStatusTone(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
