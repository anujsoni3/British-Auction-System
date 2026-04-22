import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

function formatMoney(value) {
  if (value == null) return 'No bids';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function toDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function AuthPage({ mode, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SUPPLIER'
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
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password, role: form.role };
      const result = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      onSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-1">{mode === 'login' ? 'Login' : 'Create account'}</h1>
        <p className="text-slate-400 mb-6">British Auction System</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
              placeholder="Full name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          )}
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
            type="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />

          {mode === 'signup' && (
            <select
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
              name="role"
              value={form.role}
              onChange={onChange}
            >
              <option value="SUPPLIER">Supplier</option>
              <option value="BUYER">Buyer</option>
            </select>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 font-semibold"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          {mode === 'login' ? (
            <span>
              No account? <Link className="text-emerald-400" to="/signup">Sign up</Link>
            </span>
          ) : (
            <span>
              Have an account? <Link className="text-emerald-400" to="/login">Login</Link>
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

function AppShell({ user, setUser }) {
  const navigate = useNavigate();

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/rfqs" className="font-bold text-lg">British Auction</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">{user.name} ({user.role})</span>
            {user.role === 'BUYER' && (
              <Link className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600" to="/rfqs/new">New RFQ</Link>
            )}
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/rfqs" element={<RfqList user={user} />} />
        <Route
          path="/rfqs/new"
          element={user.role === 'BUYER' ? <RfqCreate /> : <Navigate to="/rfqs" replace />}
        />
        <Route path="/rfqs/:id" element={<RfqDetail user={user} />} />
        <Route path="*" element={<Navigate to="/rfqs" replace />} />
      </Routes>
    </div>
  );
}

function RfqList({ user }) {
  const [rfqs, setRfqs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/rfqs')
      .then(setRfqs)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">RFQs</h1>
      {error && <p className="text-red-400 mb-3">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rfqs.map((rfq) => (
          <Link key={rfq.id} to={`/rfqs/${rfq.id}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700">
            <p className="text-xs text-slate-400 mb-1">{rfq.status}</p>
            <h2 className="font-semibold mb-2">{rfq.name}</h2>
            <p className="text-sm text-slate-300">Lowest bid: {formatMoney(rfq.lowestBid)}</p>
            <p className="text-sm text-slate-300">Bids: {rfq.bidCount}</p>
            <p className="text-sm text-slate-300">Close: {formatDate(rfq.bidCloseTime)}</p>
            {user.role === 'BUYER' && <p className="text-xs text-emerald-400 mt-2">Buyer controls enabled</p>}
          </Link>
        ))}
      </div>
    </main>
  );
}

function RfqCreate() {
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);
  const [form, setForm] = useState({
    name: '',
    bidStartTime: toDateTimeLocal(now),
    bidCloseTime: toDateTimeLocal(new Date(now.getTime() + 60 * 60000)),
    forcedCloseTime: toDateTimeLocal(new Date(now.getTime() + 120 * 60000)),
    triggerWindowMinutes: 10,
    extensionMinutes: 5,
    triggerType: 'ANY_BID'
  });
  const [error, setError] = useState('');

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const rfq = await api('/rfqs', { method: 'POST', body: JSON.stringify(form) });
      navigate(`/rfqs/${rfq.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create RFQ</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded bg-slate-900 border border-slate-700 p-2" name="name" placeholder="RFQ name" value={form.name} onChange={onChange} required />
        <div className="grid md:grid-cols-2 gap-3">
          <input className="rounded bg-slate-900 border border-slate-700 p-2" type="datetime-local" name="bidStartTime" value={form.bidStartTime} onChange={onChange} required />
          <input className="rounded bg-slate-900 border border-slate-700 p-2" type="datetime-local" name="bidCloseTime" value={form.bidCloseTime} onChange={onChange} required />
          <input className="rounded bg-slate-900 border border-slate-700 p-2" type="datetime-local" name="forcedCloseTime" value={form.forcedCloseTime} onChange={onChange} required />
          <select className="rounded bg-slate-900 border border-slate-700 p-2" name="triggerType" value={form.triggerType} onChange={onChange}>
            <option value="ANY_BID">Any Bid</option>
            <option value="ANY_RANK_CHANGE">Any Rank Change</option>
            <option value="L1_CHANGE">L1 Change</option>
          </select>
          <input className="rounded bg-slate-900 border border-slate-700 p-2" type="number" min="1" name="triggerWindowMinutes" value={form.triggerWindowMinutes} onChange={onChange} required />
          <input className="rounded bg-slate-900 border border-slate-700 p-2" type="number" min="1" name="extensionMinutes" value={form.extensionMinutes} onChange={onChange} required />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2">Create</button>
      </form>
    </main>
  );
}

function RfqDetail({ user }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [bidForm, setBidForm] = useState({
    freightCharges: 0,
    originCharges: 0,
    destinationCharges: 0,
    transitTime: ''
  });

  async function load() {
    try {
      setError('');
      setData(await api(`/rfqs/${id}`));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function onBidChange(event) {
    setBidForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitBid(event) {
    event.preventDefault();
    try {
      await api(`/rfqs/${id}/bids`, { method: 'POST', body: JSON.stringify(bidForm) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function runCloseCheck() {
    try {
      await api(`/rfqs/${id}/close-check`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!data) {
    return <main className="max-w-6xl mx-auto p-4">{error ? <p className="text-red-400">{error}</p> : <p>Loading...</p>}</main>;
  }

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-slate-400 text-sm">{data.rfq.status}</p>
        <h1 className="text-2xl font-bold">{data.rfq.name}</h1>
        <p className="text-slate-300">Close time: {formatDate(data.rfq.bidCloseTime)}</p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {user.role === 'BUYER' && (
        <button className="rounded bg-slate-800 hover:bg-slate-700 px-4 py-2" onClick={runCloseCheck}>
          Run Close Check
        </button>
      )}

      {user.role === 'SUPPLIER' && (
        <form className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2" onSubmit={submitBid}>
          <h2 className="font-semibold">Place Bid</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <input className="rounded bg-slate-800 border border-slate-700 p-2" type="number" min="0" name="freightCharges" placeholder="Freight" value={bidForm.freightCharges} onChange={onBidChange} required />
            <input className="rounded bg-slate-800 border border-slate-700 p-2" type="number" min="0" name="originCharges" placeholder="Origin" value={bidForm.originCharges} onChange={onBidChange} required />
            <input className="rounded bg-slate-800 border border-slate-700 p-2" type="number" min="0" name="destinationCharges" placeholder="Destination" value={bidForm.destinationCharges} onChange={onBidChange} required />
            <input className="rounded bg-slate-800 border border-slate-700 p-2" name="transitTime" placeholder="Transit time" value={bidForm.transitTime} onChange={onBidChange} required />
          </div>
          <button className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2">Submit Bid</button>
        </form>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold mb-3">Rankings</h2>
        <div className="space-y-2">
          {data.rankings.map((bid) => (
            <div key={bid.id} className="flex items-center justify-between border border-slate-800 rounded p-2">
              <span>{bid.rank} - {bid.supplier.name}</span>
              <span>{formatMoney(bid.price)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function AppContent() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    api('/auth/me')
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/rfqs" replace /> : <AuthPage mode="login" onSuccess={setUser} />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/rfqs" replace /> : <AuthPage mode="signup" onSuccess={setUser} />}
      />
      <Route
        path="/*"
        element={user ? <AppShell user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
