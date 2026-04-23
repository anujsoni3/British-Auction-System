import React from 'react';
import { formatDate } from '../../lib/formatters';

function timelineIcon(eventType) {
  if (eventType === 'RFQ_CREATED') return '+';
  if (eventType === 'BID_PLACED') return 'B';
  if (eventType === 'AUCTION_EXTENDED') return 'E';
  if (eventType === 'STATUS_UPDATED') return 'S';
  return '.';
}

function timelineLabel(eventType) {
  if (eventType === 'RFQ_CREATED') return 'RFQ created';
  if (eventType === 'BID_PLACED') return 'Bid placed';
  if (eventType === 'AUCTION_EXTENDED') return 'Auction extended';
  if (eventType === 'STATUS_UPDATED') return 'Status updated';
  return 'Activity';
}

export function normalizeTimelineMessage(log) {
  if (log.eventType === 'AUCTION_EXTENDED') {
    const normalized = log.message.replace('Auction extended by', 'Extended by');
    if (/due to/i.test(normalized)) return normalized;
    return `${normalized} due to L1 change`;
  }
  return log.message;
}

export function Timeline({ logs }) {
  if (!logs.length) {
    return <div className="rounded-lg border border-white/10 bg-black/25 px-4 py-5 text-sm text-brand-muted">No activity yet.</div>;
  }

  return (
    <div className="space-y-5">
      {logs.map((log, index) => (
        <div key={log.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold ${log.eventType === 'AUCTION_EXTENDED' ? 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent shadow-neon-sm' : 'border-white/10 bg-white/5 text-brand-muted'}`}>
              {timelineIcon(log.eventType)}
            </div>
            {index < logs.length - 1 ? <div className="mt-2 h-full w-px bg-white/10" /> : null}
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-black/25 px-5 py-4 transition duration-300 hover:border-white/15 hover:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{timelineLabel(log.eventType)}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-brand-muted/70">{formatDate(log.createdAt)}</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-brand-text">{normalizeTimelineMessage(log)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
