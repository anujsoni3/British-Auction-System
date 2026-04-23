import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { inputClassName, PrimaryButton, ShellCard } from '../components/ui/Dashboard';
import { Clock3, Eye, Gavel, Lock, Trophy, User, ShieldCheck } from 'lucide-react';

export function AuthPage({ mode, onSuccess }) {
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
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      const result = await authApi(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      onSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-bg px-6 py-10 text-brand-text">
      <div className="mx-auto max-w-[1440px]">
        <Link to="/login" className="inline-flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-md text-brand-accent">
            <Gavel className="h-10 w-10" />
          </span>
          <span className="text-2xl font-bold tracking-[0.12em] text-white">RFQ <span className="text-brand-accent">AUCTION</span></span>
        </Link>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.25fr_0.9fr]">
          <section className="overflow-hidden rounded-lg border border-white/15 bg-brand-surface/90 shadow-surface">
            <div className="relative min-h-[360px] bg-premium-glow-center p-10 sm:p-14">
              <div className="absolute right-12 top-8 hidden h-80 w-80 rounded-full bg-brand-accent/8 blur-3xl lg:block" />
              <div className="absolute right-16 top-20 hidden h-56 w-72 rounded-lg border border-brand-accent/20 bg-black/25 p-5 lg:block">
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-accent" />
                  <span className="h-2 w-2 rounded-full bg-brand-muted" />
                  <span className="h-2 w-2 rounded-full bg-brand-muted" />
                </div>
                <div className="mt-6 grid grid-cols-[70px_1fr] gap-4">
                  <div className="space-y-3">
                    <span className="block h-5 rounded bg-brand-accent/25" />
                    <span className="block h-3 rounded bg-white/10" />
                    <span className="block h-3 rounded bg-white/10" />
                  </div>
                  <div className="relative h-28">
                    <div className="absolute bottom-6 left-0 h-12 w-16 rounded-t-full border-t-4 border-brand-accent/70" />
                    <div className="absolute bottom-8 left-14 h-20 w-20 rounded-t-full border-t-4 border-brand-accent" />
                    <Gavel className="absolute bottom-0 right-0 h-24 w-24 rotate-12 text-brand-accent drop-shadow-[0_0_22px_rgba(0,230,118,0.3)]" />
                  </div>
                </div>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">RFQ Auction</p>
              <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-white">
                Auction control for <span className="text-brand-accent">buyer</span> and <span className="text-brand-accent">supplier</span> teams.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-brand-muted">
                Monitor live rankings, extension rules, hard close discipline, and savings without losing operational context.
              </p>
            </div>

            <div className="grid gap-5 p-8 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent"><Trophy className="h-8 w-8" /></span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">Competition</p>
                <p className="mt-4 text-3xl font-semibold text-brand-accent text-glow">L1</p>
                <p className="mt-2 text-xs leading-5 text-brand-muted">Rank changes stay visible as suppliers improve price.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/15 text-purple-300"><Lock className="h-8 w-8" /></span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">Control</p>
                <p className="mt-4 text-3xl font-semibold text-white">Hard close</p>
                <p className="mt-2 text-xs leading-5 text-brand-muted">Extensions respect the configured forced close time.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-300"><Clock3 className="h-8 w-8" /></span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">Visibility</p>
                <p className="mt-4 text-3xl font-semibold text-white">10s</p>
                <p className="mt-2 text-xs leading-5 text-brand-muted">Auction views poll for fresh rankings and logs.</p>
              </div>
            </div>
          </section>

          <ShellCard className="p-8 sm:p-10 xl:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent">{mode === 'login' ? 'Welcome Back' : 'Create Access'}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{mode === 'login' ? 'Login to RFQ Auction' : 'Create your account'}</h2>
            <p className="mt-3 text-sm text-brand-muted">Secure access for buyers and suppliers.</p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              {mode === 'signup' ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Full name</span>
                  <input className={inputClassName} placeholder="Anuj Soni" name="name" value={form.name} onChange={onChange} required />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-brand-muted">Email</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-accent" />
                  <input className={`${inputClassName} pl-11`} type="email" placeholder="you@example.com" name="email" value={form.email} onChange={onChange} required />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-brand-muted">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-accent" />
                  <input className={`${inputClassName} pl-11 pr-11`} type="password" placeholder="Enter password" name="password" value={form.password} onChange={onChange} required />
                  <Eye className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                </div>
              </label>

              {mode === 'signup' ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-muted">Role</span>
                  <select className={inputClassName} name="role" value={form.role} onChange={onChange}>
                    <option value="SUPPLIER">Supplier</option>
                    <option value="BUYER">Buyer</option>
                  </select>
                </label>
              ) : null}

              {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

              {mode === 'login' ? (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-brand-muted">
                    <input type="checkbox" className="h-4 w-4 accent-brand-accent" defaultChecked />
                    Remember me
                  </label>
                  <span className="font-medium text-brand-accent">Forgot password?</span>
                </div>
              ) : null}

              <PrimaryButton type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
              </PrimaryButton>

              <div className="flex items-center gap-4 text-sm text-brand-muted">
                <span className="h-px flex-1 bg-white/10" />
                OR
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button type="button" className="w-full rounded-md border border-brand-accent/25 bg-black/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent/10">
                Continue with Google
              </button>
            </form>

            <div className="mt-6 text-sm text-brand-muted">
              {mode === 'login' ? (
                <span>No account yet? <Link className="font-medium text-brand-accent" to="/signup">Sign up</Link></span>
              ) : (
                <span>Already registered? <Link className="font-medium text-brand-accent" to="/login">Login</Link></span>
              )}
            </div>
          </ShellCard>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-brand-muted">
          <ShieldCheck className="h-5 w-5 text-brand-accent" />
          Secure • Reliable • Real-time
        </div>
      </div>
    </main>
  );
}
