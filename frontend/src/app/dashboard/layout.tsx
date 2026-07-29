'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import CapitalEditModal from '../../components/layout/CapitalEditModal';
import { useAuthStore, hydrateAuth } from '../../store/auth';
import { useCapitalStore, hydrateCapital } from '../../store/capital';
import { Bell, Power, Edit3, TrendingUp, TrendingDown, Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { capital } = useCapitalStore();
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Top Navbar Ticker States
  const [nifty, setNifty] = useState({ price: 24302.50, pct: 0.46 });
  const [banknifty, setBanknifty] = useState({ price: 52410.80, pct: -0.35 });
  const [vix, setVix] = useState({ price: 13.42, pct: -4.14 });

  // Dynamic simulated price feeds
  useEffect(() => {
    hydrateAuth();
    hydrateCapital();

    if (!useAuthStore.getState().isAuthenticated) {
      router.push('/auth/login');
    }

    const interval = setInterval(() => {
      setNifty(prev => {
        const delta = (Math.random() - 0.5) * 4;
        const newPrice = Number((prev.price + delta).toFixed(2));
        return { price: newPrice, pct: Number((((newPrice - 24190) / 24190) * 100).toFixed(2)) };
      });
      setBanknifty(prev => {
        const delta = (Math.random() - 0.5) * 8;
        const newPrice = Number((prev.price + delta).toFixed(2));
        return { price: newPrice, pct: Number((((newPrice - 52595) / 52595) * 100).toFixed(2)) };
      });
      setVix(prev => {
        const delta = (Math.random() - 0.5) * 0.08;
        const newPrice = Number(Math.max(8.0, prev.price + delta).toFixed(2));
        return { price: newPrice, pct: Number((((newPrice - 14.0) / 14.0) * 100).toFixed(2)) };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center text-sm text-[#94a3b8]">
          <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading IGRIS...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f0f2f5]">
      {/* Sidebar navigation (Desktop permanent, Mobile slide-in drawer) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area - offset only on lg screens */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden lg:ml-64 ml-0">
        
        {/* HEADER — Frosted Glass with Mobile Hamburger */}
        <header
          className="h-14 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 gap-3"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Mobile Menu Button + Ticker */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 min-w-0 flex-1">
            {/* Hamburger Button for Phone View */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-700 hover:text-[#7c3aed] transition-colors cursor-pointer flex-shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Live Ticker Feed - Horizontal scrollable on phone */}
            <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap">
              {/* NIFTY */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">NIFTY</span>
                <span className="text-[#1a1a2e] font-mono">
                  {nifty.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono flex items-center gap-0.5 ${nifty.pct >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {nifty.pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {nifty.pct >= 0 ? '+' : ''}{nifty.pct}%
                </span>
              </div>

              <div className="h-3.5 w-px bg-slate-200" />

              {/* BANKNIFTY */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">BANKNIFTY</span>
                <span className="text-[#1a1a2e] font-mono">
                  {banknifty.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono flex items-center gap-0.5 ${banknifty.pct >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {banknifty.pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {banknifty.pct >= 0 ? '+' : ''}{banknifty.pct}%
                </span>
              </div>

              <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

              {/* VIX */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">VIX</span>
                <span className="text-[#1a1a2e] font-mono">{vix.price.toFixed(2)}</span>
                <span className={`font-mono ${vix.pct >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                  {vix.pct >= 0 ? '+' : ''}{vix.pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls - Capital Badge */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
            {/* Clickable Capital Badge */}
            <button
              onClick={() => setIsCapitalModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/70 border border-slate-200 hover:border-[#7c3aed]/40 transition-all cursor-pointer shadow-2xs"
              title="Click to adjust your capital"
            >
              <span className="text-slate-400 text-[10px] sm:text-xs font-bold hidden sm:inline">Capital:</span>
              <span className="font-mono text-[#1a1a2e] font-bold text-xs sm:text-sm">
                ₹{capital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <Edit3 className="w-3 h-3 text-[#7c3aed]" />
            </button>

            <div className="flex items-center gap-1">
              <button className="text-slate-400 hover:text-[#7c3aed] transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/60">
                <Bell className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-[#ef4444] transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/60"
                title="Sign out"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Content body with phone padding tuning */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>

      {/* Capital Edit Modal */}
      <CapitalEditModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
      />
    </div>
  );
}
