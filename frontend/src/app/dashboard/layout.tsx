'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import CapitalEditModal from '../../components/layout/CapitalEditModal';
import { useAuthStore, hydrateAuth } from '../../store/auth';
import { useCapitalStore, hydrateCapital } from '../../store/capital';
import { Bell, Power, Edit3, TrendingUp, TrendingDown } from 'lucide-react';

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
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: '#f0f2f5' }}>
        <div className="text-center text-sm text-[#94a3b8]">
          <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading IGRIS...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden" style={{ background: '#f0f2f5' }}>
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area - offset by sidebar width */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden ml-64">
        
        {/* HEADER — Frosted Glass */}
        <header className="h-14 sticky top-0 z-50 flex items-center justify-between px-6" style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.45)',
        }}>
          {/* Left Block - Live Indices */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-sm font-medium">
            {/* NIFTY */}
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] text-xs font-semibold">NIFTY</span>
              <span className="text-[#1a1a2e] font-mono font-semibold text-sm">
                {nifty.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-semibold font-mono flex items-center gap-0.5 ${nifty.pct >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {nifty.pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {nifty.pct >= 0 ? '+' : ''}{nifty.pct}%
              </span>
            </div>

            <div className="h-4 w-px bg-[rgba(0,0,0,0.08)]" />

            {/* BANKNIFTY */}
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] text-xs font-semibold">BANKNIFTY</span>
              <span className="text-[#1a1a2e] font-mono font-semibold text-sm">
                {banknifty.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-semibold font-mono flex items-center gap-0.5 ${banknifty.pct >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {banknifty.pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {banknifty.pct >= 0 ? '+' : ''}{banknifty.pct}%
              </span>
            </div>

            <div className="h-4 w-px bg-[rgba(0,0,0,0.08)]" />

            {/* VIX */}
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] text-xs font-semibold">VIX</span>
              <span className="text-[#1a1a2e] font-mono font-semibold text-sm">{vix.price.toFixed(2)}</span>
              <span className={`text-xs font-semibold font-mono ${vix.pct >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                {vix.pct >= 0 ? '+' : ''}{vix.pct}%
              </span>
            </div>
          </div>

          {/* Right Block - Capital, Today PnL, Controls */}
          <div className="flex items-center gap-5 flex-shrink-0 text-sm">
            
            {/* Clickable Capital Badge */}
            <button
              onClick={() => setIsCapitalModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all group cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
              title="Click to adjust your capital"
            >
              <span className="text-[#94a3b8] text-xs font-medium group-hover:text-[#7c3aed] transition-colors">Capital:</span>
              <span className="font-mono text-[#1a1a2e] font-semibold group-hover:text-[#7c3aed] transition-colors">
                ₹{capital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <Edit3 className="w-3 h-3 text-[#94a3b8] group-hover:text-[#7c3aed] transition-colors" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] text-xs font-medium">Today</span>
              <span className="text-[#1a1a2e] font-mono font-semibold">₹0.00</span>
            </div>

            <div className="h-4 w-px bg-[rgba(0,0,0,0.08)]" />

            <div className="flex items-center gap-3">
              <button className="text-[#94a3b8] hover:text-[#7c3aed] transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/50">
                <Bell className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleLogout}
                className="text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/50"
                title="Sign out"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6">
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
