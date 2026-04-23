import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rfqApi } from '../lib/api';
import { formatDateTimeShort, formatMoney } from '../lib/formatters';
import { Countdown } from '../components/ui/Countdown';
import { EmptyState, LoadingState, ShellCard } from '../components/ui/Dashboard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Activity, Clock3, FileText, Gavel, LineChart, RefreshCw, Target, Trophy, Users } from 'lucide-react';

function MetricCard({ icon: Icon, label, value, helper, tone = 'green' }) {
  const tones = {
    green: 'bg-brand-accent/12 text-brand-accent',
    blue: 'bg-blue-500/15 text-blue-300',
    purple: 'bg-purple-500/15 text-purple-300',
    amber: 'bg-amber-500/15 text-amber-300'
  };

  return (
    <ShellCard className="p-6">
      <div className="flex items-center gap-5">
        <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-sm text-brand-muted">{label}</p>
          {helper ? <p className="mt-2 text-xs text-brand-muted">{helper}</p> : null}
        </div>
      </div>
    </ShellCard>
  );
}

function DashboardTip({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-4 rounded-lg bg-black/20 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-5 text-brand-muted">{body}</p>
      </div>
    </div>
  );
}

export function RfqListPage({ user }) {
  const [rfqs, setRfqs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    async function loadRfqs({ initial = false } = {}) {
      try {
        const result = await rfqApi('/rfqs');
        if (!mounted) return;
        setRfqs(result);
        setError('');
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted && initial) setLoading(false);
      }
    }

    loadRfqs({ initial: true });
    intervalId = window.setInterval(() => loadRfqs(), 10000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const activeRfqs = rfqs.filter((rfq) => rfq.status === 'ACTIVE');
  const nextClosingRfq = [...activeRfqs].sort((a, b) => new Date(a.bidCloseTime) - new Date(b.bidCloseTime))[0];

  return (
    <main className="min-w-0">
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ShellCard className="overflow-hidden bg-premium-glow-center p-8 sm:p-10">
            <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent">Auction Monitor</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">RFQ Dashboard</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-muted">
                Track live countdowns, supplier competition, extension behavior, and business savings from one calm, high-fidelity dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-widest">
                <div className="rounded-md border border-brand-accent/20 bg-brand-accent/5 px-4 py-2 text-brand-accent">10s polling</div>
                <div className="rounded-md border border-white/5 bg-white/5 px-4 py-2 text-brand-muted">Rank visibility</div>
                <div className="rounded-md border border-white/5 bg-white/5 px-4 py-2 text-brand-muted">Extension tracking</div>
              </div>
            </div>

            <div className="relative hidden min-h-44 overflow-hidden rounded-lg border border-brand-accent/20 bg-black/25 p-5 xl:block">
              <div className="absolute right-4 top-5 h-36 w-36 rounded-full bg-brand-accent/10 blur-2xl" />
              <div className="relative rounded-lg border border-brand-accent/25 bg-brand-surface/90 p-4">
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-accent" />
                  <span className="h-2 w-2 rounded-full bg-brand-muted" />
                  <span className="h-2 w-2 rounded-full bg-brand-muted" />
                </div>
                <div className="mt-5 grid grid-cols-[70px_1fr] gap-4">
                  <div className="space-y-3">
                    <span className="block h-5 rounded bg-brand-accent/25" />
                    <span className="block h-3 rounded bg-white/5" />
                    <span className="block h-3 rounded bg-white/5" />
                  </div>
                  <div className="relative h-24">
                    <div className="absolute bottom-3 left-0 h-10 w-16 rounded-t-full border-t-4 border-brand-accent/80" />
                    <div className="absolute bottom-5 left-14 h-16 w-20 rounded-t-full border-t-4 border-brand-accent" />
                    <div className="absolute bottom-8 right-10 h-20 w-24 rounded-t-full border-t-4 border-brand-accent/80" />
                    <Trophy className="absolute bottom-0 right-0 h-16 w-16 text-amber-300 drop-shadow-[0_0_18px_rgba(252,211,77,0.35)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </ShellCard>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Gavel} label="Active Auctions" value={activeRfqs.length} helper="Live right now" tone="green" />
            <MetricCard icon={LineChart} label="Total Bids Tracked" value={rfqs.reduce((sum, rfq) => sum + (rfq.bidCount || 0), 0)} helper="Across all RFQs" tone="blue" />
            <MetricCard icon={Target} label="Open RFQs" value={activeRfqs.length} helper="Currently taking bids" tone="purple" />
            <MetricCard icon={RefreshCw} label="Tracked RFQs" value={rfqs.length} helper="Auto-refresh every 10s" tone="amber" />
          </section>

      {error ? <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">{error}</div> : null}
      {loading ? <LoadingState title="Loading RFQs..." body="Fetching the latest auction data." /> : null}
      {!loading && rfqs.length === 0 ? <EmptyState title="No RFQs available yet." body="Create the first RFQ to start supplier competition." /> : null}

          <ShellCard className="p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">Live Auctions</h2>
                  <span className="h-2 w-2 rounded-full bg-brand-accent shadow-neon-sm" />
                </div>
                <p className="mt-2 text-sm text-brand-muted">Real-time auction activity and bidding status</p>
              </div>
              <Link to="/rfqs" className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-brand-accent transition hover:border-brand-accent/30 hover:bg-brand-accent/10">View All RFQs</Link>
            </div>
            <section className="grid gap-5 xl:grid-cols-2">
        {rfqs.map((rfq) => (
          <Link key={rfq.id} to={`/rfqs/${rfq.id}`} className="block group">
            <div className="h-full rounded-lg border border-white/10 bg-black/20 p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-accent/30 group-hover:shadow-neon-sm">
              <div className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-brand-muted">{rfq.referenceId || 'RFQ'}</p>
                    <h2 className="mt-2 text-xl font-medium text-white">{rfq.name}</h2>
                  </div>
                  <StatusBadge status={rfq.status} />
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Current Lowest Bid</p>
                    <p className="mt-2 text-2xl font-semibold text-brand-accent">{formatMoney(rfq.lowestBid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Time Remaining</p>
                    <div className="mt-2 text-xl font-semibold text-white"><Countdown targetTime={rfq.bidCloseTime} status={rfq.status} compact /></div>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 border-t border-white/5 pt-6 text-sm text-brand-muted sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted/70">Bids</p>
                    <p className="mt-1 text-lg font-semibold text-brand-text">{rfq.bidCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted/70">Close Time</p>
                    <p className="mt-1 text-brand-muted">{formatDateTimeShort(rfq.bidCloseTime)}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  {user.role === 'BUYER' ? <span className="text-[10px] uppercase tracking-[0.25em] text-brand-accent">Buyer controls</span> : <span className="text-[10px] uppercase tracking-[0.25em] text-brand-muted">Supplier view</span>}
                  <span className="rounded-md border border-brand-accent/30 bg-brand-accent/5 px-4 py-2 text-xs font-medium text-brand-accent transition group-hover:bg-brand-accent group-hover:text-black">
                    Open Dashboard
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
            </section>
          </ShellCard>
        </div>

        <aside className="space-y-5">
          <ShellCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white">Open RFQs</p>
                <p className="mt-6 text-4xl font-semibold text-white">{activeRfqs.length}</p>
                <p className="mt-3 text-sm text-brand-muted">Currently taking bids</p>
              </div>
              <FileText className="h-14 w-14 text-brand-accent/40" />
            </div>
          </ShellCard>
          <ShellCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white">Tracked RFQs</p>
                <p className="mt-6 text-4xl font-semibold text-white">{rfqs.length}</p>
                <p className="mt-3 text-sm text-brand-muted">Auto-refresh every 10 seconds</p>
              </div>
              <RefreshCw className="h-14 w-14 text-purple-400/50" />
            </div>
          </ShellCard>
          <ShellCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white">Live Countdown</p>
                {nextClosingRfq ? (
                  <>
                    <p className="mt-5 text-sm font-medium text-white">{nextClosingRfq.name}</p>
                    <div className="mt-3 text-3xl font-semibold tracking-tight text-brand-accent text-glow">
                      <Countdown targetTime={nextClosingRfq.bidCloseTime} status={nextClosingRfq.status} />
                    </div>
                    <p className="mt-3 text-xs text-brand-muted">Closes {formatDateTimeShort(nextClosingRfq.bidCloseTime)}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-base font-semibold text-white">No active countdown</p>
                    <p className="mt-2 text-sm text-brand-muted">Right now</p>
                  </>
                )}
              </div>
              <Clock3 className="h-14 w-14 text-brand-accent/40" />
            </div>
          </ShellCard>
          <ShellCard className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <Activity className="h-5 w-5 text-brand-accent" />
              <h2 className="text-base font-semibold text-white">Dashboard Tips</h2>
            </div>
            <div className="space-y-3">
              <DashboardTip icon={RefreshCw} title="Auto-refresh is active" body="Data updates every 10 seconds" />
              <DashboardTip icon={Gavel} title="Force Closed auctions" body="These auctions have ended manually" />
              <DashboardTip icon={Users} title="Real-time tracking" body="All metrics update by polling" />
            </div>
          </ShellCard>
        </aside>
      </section>
    </main>
  );
}
