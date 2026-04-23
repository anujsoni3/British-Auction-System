import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfqApi } from '../lib/api';
import { toDateTimeLocal } from '../lib/formatters';
import { inputClassName, PrimaryButton, ShellCard } from '../components/ui/Dashboard';

export function RfqCreatePage() {
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);
  const [form, setForm] = useState({
    referenceId: '',
    name: '',
    bidStartTime: toDateTimeLocal(now),
    bidCloseTime: toDateTimeLocal(new Date(now.getTime() + 60 * 60000)),
    forcedCloseTime: toDateTimeLocal(new Date(now.getTime() + 120 * 60000)),
    pickupServiceDate: toDateTimeLocal(new Date(now.getTime() + 24 * 60 * 60000)),
    triggerWindowMinutes: 10,
    extensionMinutes: 5,
    triggerType: 'ANY_BID'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const rfq = await rfqApi('/rfqs', { method: 'POST', body: JSON.stringify(form) });
      navigate(`/rfqs/${rfq.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-w-0">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent">Buyer Console</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Create RFQ auction</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">Set the commercial lane, bidding window, extension trigger, and forced close guardrail.</p>
        </div>
        <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 px-5 py-4 text-sm text-brand-muted shadow-neon-sm">
          <span className="font-semibold text-brand-accent">Buyer action:</span> publish a controlled reverse auction.
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ShellCard className="p-6 sm:p-8">
          <form className="space-y-8" onSubmit={onSubmit}>
            <section>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Auction identity</h2>
                  <p className="mt-1 text-sm text-brand-muted">Name the RFQ so buyers and suppliers can scan it quickly.</p>
                </div>
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Step 1</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Reference ID</span>
                  <input className={inputClassName} name="referenceId" placeholder="RFQ-BA-1001" value={form.referenceId} onChange={onChange} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">RFQ Name</span>
                  <input className={inputClassName} name="name" placeholder="Mumbai to Delhi linehaul" value={form.name} onChange={onChange} required />
                </label>
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Timing controls</h2>
                  <p className="mt-1 text-sm text-brand-muted">Define the bidding window and the hard stop.</p>
                </div>
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Step 2</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Bid Start Time</span>
                  <input className={inputClassName} type="datetime-local" name="bidStartTime" value={form.bidStartTime} onChange={onChange} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Bid Close Time</span>
                  <input className={inputClassName} type="datetime-local" name="bidCloseTime" value={form.bidCloseTime} onChange={onChange} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Forced Close Time</span>
                  <input className={inputClassName} type="datetime-local" name="forcedCloseTime" value={form.forcedCloseTime} onChange={onChange} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Pickup / Service Date</span>
                  <input className={inputClassName} type="datetime-local" name="pickupServiceDate" value={form.pickupServiceDate} onChange={onChange} required />
                </label>
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Extension policy</h2>
                  <p className="mt-1 text-sm text-brand-muted">Choose what extends the auction near close.</p>
                </div>
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Step 3</span>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Trigger Type</span>
                  <select className={inputClassName} name="triggerType" value={form.triggerType} onChange={onChange}>
                    <option value="ANY_BID">Any Bid</option>
                    <option value="ANY_RANK_CHANGE">Any Rank Change</option>
                    <option value="L1_CHANGE">L1 Change</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Trigger Window</span>
                  <input className={inputClassName} type="number" min="1" name="triggerWindowMinutes" value={form.triggerWindowMinutes} onChange={onChange} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Extension Duration</span>
                  <input className={inputClassName} type="number" min="1" name="extensionMinutes" value={form.extensionMinutes} onChange={onChange} required />
                </label>
              </div>
            </section>

            {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <p className="text-sm text-brand-muted">Extensions can move the close time, but never beyond the forced close time.</p>
              <PrimaryButton disabled={loading}>
                {loading ? 'Creating...' : 'Create RFQ'}
              </PrimaryButton>
            </div>
          </form>
        </ShellCard>

        <aside className="space-y-6">
          <ShellCard className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent">Live configuration</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{form.referenceId || 'Draft RFQ'}</h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">{form.name || 'Auction name will appear here.'}</p>
            <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-brand-muted">Trigger</span>
                <span className="font-medium text-white">{form.triggerType.replaceAll('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-brand-muted">Window</span>
                <span className="font-medium text-white">{form.triggerWindowMinutes} min</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-brand-muted">Extension</span>
                <span className="font-medium text-brand-accent">{form.extensionMinutes} min</span>
              </div>
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">Workflow</p>
            <div className="mt-5 space-y-4">
              {['Create auction', 'Suppliers submit bids', 'Ranking recalculates', 'Close check locks result'].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-semibold ${index === 0 ? 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent' : 'border-white/10 bg-white/5 text-brand-muted'}`}>{index + 1}</span>
                  <span className="text-sm text-brand-text">{item}</span>
                </div>
              ))}
            </div>
          </ShellCard>
        </aside>
      </div>
    </main>
  );
}
