import React from 'react';
import { useNow } from '../../hooks/useNow';

export function Countdown({ targetTime, status, compact = false }) {
  const now = useNow();
  const remainingMs = targetTime ? new Date(targetTime).getTime() - now : 0;

  if (status === 'CLOSED' || status === 'FORCE_CLOSED' || remainingMs <= 0) {
    return <span className={compact ? 'text-rose-300' : 'text-rose-300 font-semibold'}>Auction Closed</span>;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = days > 0
    ? `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
    : `${String(hours * 60 + minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return <span className={compact ? 'text-emerald-300' : 'text-emerald-300 font-semibold'}>{formatted}</span>;
}
