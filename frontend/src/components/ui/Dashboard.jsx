import React from 'react';

export function ShellCard({ className = '', children }) {
  return (
    <div className={`rounded-lg border border-white/12 bg-brand-surface/95 shadow-surface backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-surface-hover ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, accent = false, helper }) {
  return (
    <ShellCard className={`p-6 ${accent ? 'border-brand-accent/25 bg-brand-accent/5 shadow-neon-sm' : ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">{label}</p>
      <div className={`mt-4 text-3xl font-semibold tracking-tight sm:text-4xl ${accent ? 'text-brand-accent text-glow' : 'text-white'}`}>{value}</div>
      {helper ? <p className="mt-3 text-xs leading-5 text-brand-muted">{helper}</p> : null}
    </ShellCard>
  );
}

export function EmptyState({ title, body }) {
  return (
    <ShellCard className="p-10 text-center">
      <p className="text-xl font-medium text-white">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-muted">{body}</p>
    </ShellCard>
  );
}

export function LoadingState({ title = 'Loading...', body = 'Fetching the latest auction data.' }) {
  return (
    <ShellCard className="flex items-center gap-4 p-6">
      <span className="h-3 w-3 rounded-full bg-brand-accent shadow-neon-md motion-safe:animate-pulse" />
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs text-brand-muted">{body}</p>
      </div>
    </ShellCard>
  );
}

export const inputClassName = 'w-full rounded-md border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition duration-300 placeholder:text-brand-muted/60 focus:border-brand-accent/50 focus:bg-brand-surface focus:ring-1 focus:ring-brand-accent/40';

export function PrimaryButton({ className = '', children, ...props }) {
  return (
    <button
      className={`rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-black shadow-neon-sm transition duration-300 hover:bg-brand-accentHover hover:shadow-neon-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className = '', children, ...props }) {
  return (
    <button
      className={`rounded-md border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-brand-text transition duration-300 hover:border-brand-accent/30 hover:bg-brand-accent/10 hover:text-brand-accent hover:shadow-neon-sm disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
