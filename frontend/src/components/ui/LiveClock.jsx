import React from 'react';
import { useNow } from '../../hooks/useNow';

export function LiveClock({ label = 'Live time' }) {
  const now = useNow(1000);
  const date = new Date(now);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">
        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
    </div>
  );
}
