import React from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { RfqListPage } from '../pages/RfqListPage';
import { RfqCreatePage } from '../pages/RfqCreatePage';
import { RfqDetailPage } from '../pages/RfqDetailPage';
import { LiveClock } from '../components/ui/LiveClock';
import { Gavel, Headphones, PlusCircle, RefreshCw, Activity } from 'lucide-react';

export function AppShell({ user, setUser }) {
  const navigate = useNavigate();

  async function logout() {
    await authApi('/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/login');
  }

  const navClass = ({ isActive }) =>
    `inline-flex h-full shrink-0 items-center border-b-2 px-5 text-sm font-semibold transition duration-300 ${
      isActive ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-white'
    }`;

  const sideNavClass = ({ isActive }) =>
    `flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition duration-300 ${
      isActive ? 'bg-brand-accent/10 text-brand-accent shadow-neon-sm' : 'text-brand-muted hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-white/10 bg-[#07101d] lg:flex lg:flex-col">
        <Link to="/rfqs" className="flex h-[72px] items-center gap-3 border-b border-white/10 px-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-black">
            <Gavel className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold tracking-[0.14em] text-white">RFQ AUCTION</span>
        </Link>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">Workspace</p>
            <nav className="mt-5 space-y-2">
              <NavLink to="/rfqs" end className={sideNavClass}>
                <span className="flex items-center gap-3"><Activity className="h-4 w-4" /> RFQ Monitor</span>
                <span className="rounded bg-brand-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">Live</span>
              </NavLink>
              {user.role === 'BUYER' ? (
                <NavLink to="/rfqs/new" className={sideNavClass}>
                  <span className="flex items-center gap-3"><PlusCircle className="h-4 w-4" /> Create RFQ</span>
                  <span className="rounded bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">Buyer</span>
                </NavLink>
              ) : (
                <div className="rounded-md px-4 py-3 text-sm text-brand-muted/50">Create RFQ</div>
              )}
            </nav>

            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">Quick Actions</p>
              <div className="mt-4 rounded-lg border border-white/10 bg-brand-surface/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-brand-muted" />
                    <div>
                      <p className="text-sm font-medium text-white">Refresh Mode</p>
                      <p className="text-xs text-brand-muted">10s polling</p>
                    </div>
                  </div>
                  <span className="h-5 w-9 rounded-full bg-brand-accent p-0.5 shadow-neon-sm">
                    <span className="block h-4 w-4 translate-x-4 rounded-full bg-white" />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-brand-surface/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-muted">System Status</p>
                <span className="rounded bg-brand-accent/10 px-2 py-1 text-[10px] font-semibold text-brand-accent">Live</span>
              </div>
              <p className="text-sm leading-6 text-brand-muted">Polling every 10 seconds. WebSocket refresh is not used on auction screens.</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-brand-surface/80 p-4">
            <p className="text-sm font-medium text-white">Need Help?</p>
            <p className="mt-2 text-sm leading-6 text-brand-muted">Contact support for assistance.</p>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-accent/30 px-4 py-2 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent hover:text-black">
              <Headphones className="h-4 w-4" />
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 h-auto border-b border-white/10 bg-brand-bg/90 backdrop-blur-xl lg:h-[72px]">
          <div className="flex h-full flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:py-0">
            <div className="flex min-w-0 items-center gap-4 lg:gap-8">
              <Link to="/rfqs" className="shrink-0 text-lg font-semibold tracking-[0.16em] text-white lg:hidden">RFQ AUCTION</Link>
              <nav className="hidden h-[72px] items-center gap-3 lg:flex">
                <NavLink to="/rfqs" end className={navClass}>Home</NavLink>
                <NavLink to="/rfqs" className={navClass}>RFQs</NavLink>
                {user.role === 'BUYER' ? (
                  <NavLink to="/rfqs/new" className={navClass}>Create RFQ</NavLink>
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-md px-4 py-2 text-sm text-brand-muted/50">Create RFQ</span>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <LiveClock />
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">{user.role}</p>
              </div>
              {user.role === 'BUYER' ? (
                <Link
                  className="hidden rounded-md bg-brand-accent px-5 py-2 text-sm font-semibold text-black shadow-neon-sm transition duration-300 hover:bg-brand-accentHover hover:shadow-neon-md xl:inline-flex"
                  to="/rfqs/new"
                >
                  Create RFQ
                </Link>
              ) : null}
              <button
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-brand-muted transition duration-300 hover:border-white/20 hover:text-white"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <NavLink to="/rfqs" end className={navClass}>Home</NavLink>
            <NavLink to="/rfqs" className={navClass}>RFQs</NavLink>
            {user.role === 'BUYER' ? (
              <NavLink to="/rfqs/new" className={navClass}>Create RFQ</NavLink>
            ) : null}
          </nav>
        </header>
        <div className="px-5 py-7 sm:px-8">
        <Routes>
          <Route path="/rfqs" element={<RfqListPage user={user} />} />
          <Route path="/rfqs/new" element={user.role === 'BUYER' ? <RfqCreatePage /> : <Navigate to="/rfqs" replace />} />
          <Route path="/rfqs/:id" element={<RfqDetailPage user={user} />} />
          <Route path="*" element={<Navigate to="/rfqs" replace />} />
        </Routes>
        </div>
      </div>
    </div>
  );
}
