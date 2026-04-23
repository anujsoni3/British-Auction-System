import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { rfqApi } from '../lib/api';
import { formatDate, formatDateTimeShort, formatMoney, formatTriggerType } from '../lib/formatters';
import { Countdown } from '../components/ui/Countdown';
import { EmptyState, inputClassName, LoadingState, PrimaryButton, SecondaryButton, ShellCard } from '../components/ui/Dashboard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Timeline, normalizeTimelineMessage } from '../components/ui/Timeline';
import { CalendarDays, Clock3, Gavel, Package, ShieldCheck, TrendingUp, Upload, Users } from 'lucide-react';

export function RfqDetailPage({ user }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [runningCloseCheck, setRunningCloseCheck] = useState(false);
  const [bidForm, setBidForm] = useState({
    freightCharges: 0,
    originCharges: 0,
    destinationCharges: 0,
    transitTime: '',
    quoteValidity: ''
  });

  async function load({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);
      const result = await rfqApi(`/rfqs/${id}`);
      setData(result);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
      if (silent) setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;
    let intervalId;

    async function initialLoad() {
      if (active) await load();
      intervalId = window.setInterval(() => {
        if (active) load({ silent: true });
      }, 10000);
    }

    initialLoad();

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [id]);

  function onBidChange(event) {
    setBidForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitBid(event) {
    event.preventDefault();
    try {
      setSubmittingBid(true);
      setError('');
      await rfqApi(`/rfqs/${id}/bids`, { method: 'POST', body: JSON.stringify(bidForm) });
      await load({ silent: true });
      setBidForm({
        freightCharges: 0,
        originCharges: 0,
        destinationCharges: 0,
        transitTime: '',
        quoteValidity: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingBid(false);
    }
  }

  async function runCloseCheck() {
    try {
      setRunningCloseCheck(true);
      setError('');
      await rfqApi(`/rfqs/${id}/close-check`, { method: 'POST' });
      await load({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningCloseCheck(false);
    }
  }

  const bidPreview = Number(bidForm.freightCharges || 0) + Number(bidForm.originCharges || 0) + Number(bidForm.destinationCharges || 0);
  const latestExtensionLog = data?.logs?.find((log) => log.eventType === 'AUCTION_EXTENDED');

  if (loading && !data) {
    return <main className="min-w-0"><LoadingState title="Loading auction..." body="Pulling current ranking, logs, and pricing details." /></main>;
  }

  if (!data) {
    return <main className="min-w-0"><div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">{error || 'Unable to load RFQ.'}</div></main>;
  }

  return (
    <main className="min-w-0">
      <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <ShellCard className="bg-premium-glow-center p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-accent">{data.rfq.referenceId || 'RFQ'}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{data.rfq.name}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-muted">Auction progress, ranking movement, close-time extensions, and savings in one control room.</p>
            </div>
            <StatusBadge status={data.rfq.status} large />
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3">
            <div className="bg-black/25 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"><Package className="h-4 w-4" /></span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Supplier</p>
              </div>
              <p className="mt-3 text-xl font-semibold text-brand-accent text-glow">{data.summary?.l1Supplier || 'No bids yet'}</p>
            </div>
            <div className="bg-black/25 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"><TrendingUp className="h-4 w-4" /></span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Lowest Price</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{formatMoney(data.summary?.finalPrice)}</p>
            </div>
            <div className="bg-black/25 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"><Gavel className="h-4 w-4" /></span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Savings</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{Number(data.summary?.savingsPercent || 0).toFixed(2)}%</p>
            </div>
          </div>
        </ShellCard>

        <ShellCard className="relative overflow-hidden border-brand-accent/25 bg-brand-accent/5 p-7 shadow-neon-sm">
          <Gavel className="absolute right-8 top-8 h-16 w-16 text-brand-accent/15" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-accent">Live Countdown</p>
              <div className="mt-4 text-4xl font-semibold tracking-tight text-brand-accent text-glow">
                <Countdown targetTime={data.rfq.bidCloseTime} status={data.rfq.status} />
              </div>
            </div>
            <span className="h-3 w-3 rounded-full bg-brand-accent shadow-neon-md motion-safe:animate-pulse" />
          </div>
          <div className="mt-6 space-y-3 border-t border-brand-accent/20 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-brand-muted">Current close</span>
              <span className="font-medium text-white">{formatDate(data.rfq.bidCloseTime)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-muted">Forced close</span>
              <span className="font-medium text-white">{formatDate(data.rfq.forcedCloseTime)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-muted">Refresh</span>
              <span className="font-medium text-brand-accent">{refreshing ? 'Refreshing...' : '10s polling'}</span>
            </div>
          </div>
        </ShellCard>
      </section>

      {error ? <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">{error}</div> : null}

      <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ShellCard className="p-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-blue-300" />
            <h2 className="text-xl font-semibold text-white">Auction Schedule</h2>
          </div>
          <p className="mt-2 text-sm text-brand-muted">Timing, close guardrails, and extension visibility.</p>

          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-black/20 p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Pickup / Service</p><p className="mt-2 text-sm font-semibold text-brand-text">{formatDate(data.rfq.pickupServiceDate)}</p></div>
            <div className="bg-black/20 p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Current Close</p><p className="mt-2 text-sm font-semibold text-brand-text">{formatDate(data.rfq.bidCloseTime)}</p></div>
            <div className="bg-black/20 p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Forced Close</p><p className="mt-2 text-sm font-semibold text-brand-text">{formatDate(data.rfq.forcedCloseTime)}</p></div>
            <div className="bg-black/20 p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Total Bids</p><p className="mt-2 text-xl font-semibold text-brand-accent">{data.summary?.totalBids ?? 0}</p></div>
          </div>

          {latestExtensionLog ? (
            <div className="mt-8 rounded-lg border border-brand-accent/30 bg-brand-accent/5 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-accent text-glow">Latest Extension</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-text">{normalizeTimelineMessage(latestExtensionLog)}</p>
              <p className="mt-3 text-xs text-brand-muted">Updated close time: {formatDate(data.rfq.bidCloseTime)}</p>
            </div>
          ) : null}
        </ShellCard>

        <ShellCard className="relative overflow-hidden p-8">
          <ShieldCheck className="absolute right-7 top-7 h-20 w-20 text-white/5" />
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-300" />
            <h2 className="text-xl font-semibold text-white">Rules</h2>
          </div>
          <div className="mt-6 space-y-5 text-sm">
            <div className="flex justify-between gap-4"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Trigger Window</p><p className="font-medium text-brand-text">{data.rfq.triggerWindowMinutes} minutes</p></div>
            <div className="flex justify-between gap-4"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Extension Duration</p><p className="font-medium text-brand-text">{data.rfq.extensionMinutes} minutes</p></div>
            <div className="flex justify-between gap-4"><p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Trigger Type</p><p className="font-medium text-brand-text">{formatTriggerType(data.rfq.triggerType)}</p></div>
          </div>

          {user.role === 'BUYER' ? (
            <SecondaryButton className="mt-8 w-full" onClick={runCloseCheck} disabled={runningCloseCheck}>
              {runningCloseCheck ? 'Running...' : 'Run Close Check'}
            </SecondaryButton>
          ) : null}
        </ShellCard>
      </section>

      <section className="mb-8 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <ShellCard className="overflow-hidden">
          <div className="border-b border-white/5 px-8 py-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-300" />
              <h2 className="text-xl font-semibold text-white">Ranking Table</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">Every quote in the auction, with L1 highlighted for quick scanning.</p>
          </div>

          {data.rankings.length === 0 ? (
              <div className="p-8"><EmptyState title="No bids yet." body="No bids yet. Be the first to place a bid." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/5 bg-black/20 text-left text-[10px] uppercase tracking-[0.2em] text-brand-muted">
                  <tr>
                    <th className="px-8 py-5">Rank</th>
                    <th className="px-8 py-5">Supplier</th>
                    <th className="px-8 py-5">Freight</th>
                    <th className="px-8 py-5">Origin</th>
                    <th className="px-8 py-5">Destination</th>
                    <th className="px-8 py-5">Total</th>
                    <th className="px-8 py-5">Transit</th>
                    <th className="px-8 py-5">Quote Validity</th>
                    <th className="px-8 py-5">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.map((bid) => {
                    const isLeader = bid.rank === 'L1';
                    return (
                      <tr key={bid.id} className={`border-b border-white/5 transition-colors duration-300 ${isLeader ? 'bg-brand-accent/8 border-l-2 border-l-brand-accent shadow-[inset_0_0_20px_rgba(0,230,118,0.05)]' : 'bg-transparent hover:bg-white/[0.02]'}`}>
                        <td className="px-8 py-4"><span className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${isLeader ? 'bg-brand-accent text-black shadow-neon-sm' : 'bg-white/10 text-brand-text'}`}>{bid.rank}</span></td>
                        <td className={`px-8 py-5 font-medium ${isLeader ? 'text-brand-accent text-glow' : 'text-white'}`}>{bid.supplier.name}</td>
                        <td className="px-8 py-5 text-brand-text">{formatMoney(bid.freightCharges)}</td>
                        <td className="px-8 py-5 text-brand-text">{formatMoney(bid.originCharges)}</td>
                        <td className="px-8 py-5 text-brand-text">{formatMoney(bid.destinationCharges)}</td>
                        <td className={`px-8 py-5 font-semibold ${isLeader ? 'text-brand-accent text-glow' : 'text-white'}`}>{formatMoney(bid.price)}</td>
                        <td className="px-8 py-5 text-brand-text">{bid.transitTime}</td>
                        <td className="px-8 py-5 text-brand-text">{bid.quoteValidity || '-'}</td>
                        <td className="px-8 py-5 text-brand-muted">{formatDateTimeShort(bid.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ShellCard>

        <ShellCard className="p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-300" />
              <h2 className="text-xl font-semibold text-white">Place Bid</h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-muted">Supplier Mode</p>
          </div>

          {user.role === 'SUPPLIER' ? (
            <form className="mt-8 space-y-5" onSubmit={submitBid}>
              <div className="grid gap-5">
                <label className="block"><span className="mb-2 block text-xs font-medium text-brand-muted">Freight charges</span><input className={inputClassName} type="number" min="0" name="freightCharges" value={bidForm.freightCharges} onChange={onBidChange} required /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-brand-muted">Origin charges</span><input className={inputClassName} type="number" min="0" name="originCharges" value={bidForm.originCharges} onChange={onBidChange} required /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-brand-muted">Destination charges</span><input className={inputClassName} type="number" min="0" name="destinationCharges" value={bidForm.destinationCharges} onChange={onBidChange} required /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-brand-muted">Transit time</span><input className={inputClassName} name="transitTime" placeholder="2 days" value={bidForm.transitTime} onChange={onBidChange} required /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-brand-muted">Quote validity</span><input className={inputClassName} name="quoteValidity" placeholder="7 days from bid date" value={bidForm.quoteValidity} onChange={onBidChange} required /></label>
              </div>

              <div className="mt-2 rounded-lg border border-brand-accent/20 bg-brand-accent/5 px-6 py-5 shadow-neon-sm">
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-accent">Bid Preview</p>
                <p className="mt-3 text-3xl font-light tracking-tight text-brand-accent text-glow">{formatMoney(bidPreview)}</p>
              </div>

              <PrimaryButton className="w-full py-4" disabled={submittingBid}>
                {submittingBid ? 'Submitting...' : 'Submit Bid'}
              </PrimaryButton>
            </form>
          ) : (
            <div className="mt-6 flex items-center gap-6 rounded-lg border border-dashed border-white/20 bg-black/20 px-8 py-8 text-sm leading-relaxed text-brand-muted">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300"><Upload className="h-7 w-7" /></span>
              <p className="max-w-sm text-lg leading-7">Supplier users place bids here. Buyers monitor timing and outcome.</p>
            </div>
          )}
        </ShellCard>
      </section>

      <section>
        <ShellCard className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-blue-300" />
                <h2 className="text-xl font-semibold text-white">Auction Timeline</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">Created events, bid activity, status changes, and extensions in readable order.</p>
            </div>
          </div>
          <div className="mt-8"><Timeline logs={data.logs} /></div>
        </ShellCard>
      </section>
    </main>
  );
}
