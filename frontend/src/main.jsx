import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const triggerLabels = {
  BID_RECEIVED: 'Bid received',
  ANY_RANK_CHANGE: 'Any rank change',
  L1_RANK_CHANGE: 'L1 rank change'
};

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function money(value) {
  if (value === null || value === undefined) return 'No bids';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
}

function dateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function timeRemaining(closeTime, status, now = Date.now()) {
  if (status !== 'Active') return status;
  const diff = new Date(closeTime).getTime() - now;
  if (diff <= 0) return 'Close check due';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, '0')}s remaining`;
}

function toDateTimeLocal(date) {
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Layout({ role, setRole }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/auctions">British Auction RFQ</Link>
        <nav>
          <Link to="/auctions">Auctions</Link>
          {role === 'Buyer' && <Link to="/create">Create RFQ</Link>}
        </nav>
        <div className="role-switch" aria-label="Demo role switch">
          {['Buyer', 'Supplier'].map((item) => (
            <button key={item} className={role === item ? 'active' : ''} onClick={() => setRole(item)}>
              {item}
            </button>
          ))}
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/auctions" />} />
        <Route path="/auctions" element={<AuctionList role={role} />} />
        <Route path="/auctions/:id" element={<AuctionDetails role={role} />} />
        <Route path="/create" element={role === 'Buyer' ? <CreateRfq /> : <Navigate to="/auctions" />} />
      </Routes>
    </div>
  );
}

function AuctionList({ role }) {
  const [rfqs, setRfqs] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    api('/rfqs')
      .then(setRfqs)
      .catch((error) => setState({ loading: false, error: error.message }))
      .finally(() => setState((current) => ({ ...current, loading: false })));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Auction desk</p>
          <h1>Open British Auctions</h1>
        </div>
        {role === 'Buyer' && <Link className="primary-action" to="/create">New RFQ</Link>}
      </section>
      {state.loading && <p className="notice">Loading auctions...</p>}
      {state.error && <p className="error">{state.error}</p>}
      {!state.loading && rfqs.length === 0 && <p className="notice">No auctions yet. Create the first RFQ to begin.</p>}
      <section className="auction-grid">
        {rfqs.map((rfq) => (
          <Link className="auction-card" key={rfq.id} to={`/auctions/${rfq.id}`}>
            <div>
              <span className={`status ${rfq.status.replace(' ', '-').toLowerCase()}`}>{rfq.status}</span>
              <h2>{rfq.name}</h2>
              <p>{rfq.reference_id}</p>
            </div>
            <dl>
              <div><dt>Lowest bid</dt><dd>{money(rfq.current_lowest_bid)}</dd></div>
              <div><dt>Countdown</dt><dd>{timeRemaining(rfq.current_bid_close_time, rfq.status, now)}</dd></div>
              <div><dt>Current close</dt><dd>{dateTime(rfq.current_bid_close_time)}</dd></div>
              <div><dt>Forced close</dt><dd>{dateTime(rfq.forced_bid_close_time)}</dd></div>
            </dl>
          </Link>
        ))}
      </section>
    </main>
  );
}

function CreateRfq() {
  const navigate = useNavigate();
  const now = new Date();
  const [form, setForm] = useState({
    referenceId: `RFQ-${Date.now().toString().slice(-6)}`,
    name: '',
    bidStartTime: toDateTimeLocal(now),
    bidCloseTime: toDateTimeLocal(new Date(now.getTime() + 60 * 60000)),
    forcedBidCloseTime: toDateTimeLocal(new Date(now.getTime() + 120 * 60000)),
    pickupServiceDate: new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10),
    triggerWindowMinutes: 10,
    extensionDurationMinutes: 5,
    extensionTriggerType: 'BID_RECEIVED'
  });
  const [error, setError] = useState('');

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (new Date(form.bidCloseTime) <= new Date(form.bidStartTime)) {
      setError('Bid Close Time must be greater than Bid Start Time');
      return;
    }
    if (new Date(form.forcedBidCloseTime) <= new Date(form.bidCloseTime)) {
      setError('Forced Close Time must be greater than Bid Close Time');
      return;
    }
    try {
      const rfq = await api('/rfqs', { method: 'POST', body: JSON.stringify(form) });
      navigate(`/auctions/${rfq.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page narrow">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Buyer console</p>
          <h1>Create British Auction RFQ</h1>
        </div>
      </section>
      <form className="form-panel" onSubmit={submit}>
        <label>RFQ Reference<input name="referenceId" value={form.referenceId} onChange={update} required /></label>
        <label>RFQ Name<input name="name" value={form.name} onChange={update} required placeholder="e.g. Mumbai to Delhi FTL movement" /></label>
        <div className="form-grid">
          <label>Bid Start<input type="datetime-local" name="bidStartTime" value={form.bidStartTime} onChange={update} required /></label>
          <label>Bid Close<input type="datetime-local" name="bidCloseTime" value={form.bidCloseTime} onChange={update} required /></label>
          <label>Forced Close<input type="datetime-local" name="forcedBidCloseTime" value={form.forcedBidCloseTime} onChange={update} required /></label>
          <label>Pickup / Service Date<input type="date" name="pickupServiceDate" value={form.pickupServiceDate} onChange={update} required /></label>
          <label>Trigger Window Minutes<input type="number" min="1" name="triggerWindowMinutes" value={form.triggerWindowMinutes} onChange={update} required /></label>
          <label>Extension Duration Minutes<input type="number" min="1" name="extensionDurationMinutes" value={form.extensionDurationMinutes} onChange={update} required /></label>
        </div>
        <label>Extension Trigger
          <select name="extensionTriggerType" value={form.extensionTriggerType} onChange={update}>
            {Object.entries(triggerLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-action" type="submit">Create RFQ</button>
      </form>
    </main>
  );
}

function AuctionDetails({ role }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: '', success: '' });
  const [now, setNow] = useState(Date.now());

  async function load() {
    setState((current) => ({ ...current, loading: true }));
    try {
      setData(await api(`/rfqs/${id}`));
      setState((current) => ({ ...current, loading: false, error: '' }));
    } catch (error) {
      setState({ loading: false, error: error.message, success: '' });
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function runCloseCheck() {
    try {
      const result = await api(`/rfqs/${id}/close-check`, { method: 'POST' });
      setState({ loading: false, error: '', success: `Close check complete. Status: ${result.status}` });
      await load();
    } catch (error) {
      setState({ loading: false, error: error.message, success: '' });
    }
  }

  if (state.loading && !data) return <main className="page"><p className="notice">Loading auction...</p></main>;
  if (state.error && !data) return <main className="page"><p className="error">{state.error}</p></main>;

  const { rfq, bids, activityLogs } = data;
  return (
    <main className="page">
      <section className="details-hero">
        <div>
          <span className={`status ${rfq.status.replace(' ', '-').toLowerCase()}`}>{rfq.status}</span>
          <h1>{rfq.name}</h1>
          <p>{rfq.reference_id}</p>
        </div>
        <dl>
          <div><dt>Current close</dt><dd>{dateTime(rfq.current_bid_close_time)}</dd></div>
          <div><dt>Countdown</dt><dd>{timeRemaining(rfq.current_bid_close_time, rfq.status, now)}</dd></div>
          <div><dt>Forced close</dt><dd>{dateTime(rfq.forced_bid_close_time)}</dd></div>
          <div><dt>Trigger</dt><dd>{triggerLabels[rfq.extension_trigger_type]}</dd></div>
          <div><dt>Window / Extension</dt><dd>{rfq.trigger_window_minutes}m / {rfq.extension_duration_minutes}m</dd></div>
        </dl>
        <button className="secondary-action" type="button" onClick={runCloseCheck}>Run close check</button>
      </section>
      {state.success && <p className="success">{state.success}</p>}
      {state.error && <p className="error">{state.error}</p>}
      <div className="details-grid">
        <section className="panel wide">
          <h2>Supplier Rankings</h2>
          <BidTable bids={bids} />
        </section>
        {role === 'Supplier' && (
          <section className="panel">
            <h2>Submit Quote</h2>
            {rfq.status === 'Active'
              ? <BidForm rfqId={id} onDone={(message) => { setState({ loading: false, error: '', success: message }); load(); }} onError={(message) => setState({ loading: false, error: message, success: '' })} />
              : <p className="notice">Bidding is unavailable because this auction is {rfq.status}.</p>}
          </section>
        )}
        {role === 'Buyer' && <section className="panel"><h2>Buyer View</h2><p className="muted">Switch to Supplier to place demo bids. Buyers can monitor rankings and audit trail.</p></section>}
        <section className="panel activity">
          <h2>Activity Log</h2>
          {activityLogs.length === 0 && <p className="muted">No activity yet.</p>}
          {activityLogs.map((log) => (
            <article key={log.id} className="log-item">
              <strong>{log.activity_type.replace('_', ' ')}</strong>
              <p>{log.message}</p>
              {(log.previous_close_time || log.new_close_time) && <small>{dateTime(log.previous_close_time)} {'->'} {dateTime(log.new_close_time)}</small>}
              <time>{dateTime(log.created_at)}</time>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function BidTable({ bids }) {
  if (bids.length === 0) return <p className="notice">No supplier bids submitted yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th><th>Carrier</th><th>Freight</th><th>Origin</th><th>Destination</th><th>Total</th><th>Transit</th><th>Validity</th><th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
            <tr key={bid.id}>
              <td><span className="rank">{bid.rank}</span></td>
              <td>{bid.carrier_name}</td>
              <td>{money(bid.freight_charges)}</td>
              <td>{money(bid.origin_charges)}</td>
              <td>{money(bid.destination_charges)}</td>
              <td><strong>{money(bid.total_price)}</strong></td>
              <td>{bid.transit_time}</td>
              <td>{bid.quote_validity?.slice(0, 10)}</td>
              <td>{dateTime(bid.submitted_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BidForm({ rfqId, onDone, onError }) {
  const [form, setForm] = useState({
    carrierName: 'Atlas Freight',
    freightCharges: 25000,
    originCharges: 3000,
    destinationCharges: 3500,
    transitTime: '3 days',
    quoteValidity: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  });
  const total = useMemo(() => Number(form.freightCharges || 0) + Number(form.originCharges || 0) + Number(form.destinationCharges || 0), [form]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    try {
      const result = await api(`/rfqs/${rfqId}/bids`, { method: 'POST', body: JSON.stringify(form) });
      onDone(result.extension?.shouldExtend ? 'Bid submitted and auction time extended.' : 'Bid submitted successfully.');
    } catch (error) {
      onError(error.message);
    }
  }

  return (
    <form className="bid-form" onSubmit={submit}>
      <label>Carrier Name<input name="carrierName" value={form.carrierName} onChange={update} required /></label>
      <label>Freight Charges<input type="number" min="0" name="freightCharges" value={form.freightCharges} onChange={update} required /></label>
      <label>Origin Charges<input type="number" min="0" name="originCharges" value={form.originCharges} onChange={update} required /></label>
      <label>Destination Charges<input type="number" min="0" name="destinationCharges" value={form.destinationCharges} onChange={update} required /></label>
      <label>Transit Time<input name="transitTime" value={form.transitTime} onChange={update} required /></label>
      <label>Quote Validity<input type="date" name="quoteValidity" value={form.quoteValidity} onChange={update} required /></label>
      <p className="total-preview">Total: {money(total)}</p>
      <button className="primary-action" type="submit">Submit Bid</button>
    </form>
  );
}

function App() {
  const [role, setRole] = useState('Buyer');
  return (
    <BrowserRouter>
      <Layout role={role} setRole={setRole} />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
