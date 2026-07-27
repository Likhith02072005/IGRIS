'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore, hydrateAuth } from '../../store/auth';
import { Bell, Power } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  // Top Navbar Ticker States
  const [nifty, setNifty] = useState({ price: 24302.50, pct: 0.46 });
  const [banknifty, setBanknifty] = useState({ price: 52410.80, pct: -0.35 });
  const [vix, setVix] = useState({ price: 13.42, pct: -4.14 });
  const [latency, setLatency] = useState(9); // keeping state, even if not shown

  // Dynamic simulated price feeds
  useEffect(() => {
    hydrateAuth();
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
      setLatency(prev => Math.max(4, Math.min(25, prev + Math.floor((Math.random() - 0.5) * 3))));
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-[#666]">
        <div className="text-center text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0a0a0a] min-h-screen w-full text-[#fafafa] overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-14 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-6 sticky top-0 z-50">
          {/* Left Block - Live Indices */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#666]">NIFTY</span>
              <span>{nifty.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={nifty.pct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                {nifty.pct >= 0 ? '+' : ''}{nifty.pct}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#666]">BANKNIFTY</span>
              <span>{banknifty.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={banknifty.pct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                {banknifty.pct >= 0 ? '+' : ''}{banknifty.pct}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#666]">VIX</span>
              <span>{vix.price.toFixed(2)}</span>
              <span className={vix.pct >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}>
                {vix.pct >= 0 ? '+' : ''}{vix.pct}%
              </span>
            </div>
          </div>

          {/* Right Block - Portfolio Value, Today PnL and Controls */}
          <div className="flex items-center gap-6 flex-shrink-0 text-sm">
            
            <div className="flex items-center gap-2">
              <span className="text-[#666]">Portfolio</span>
              <span>₹1,00,00,000.00</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#666]">Today</span>
              <span className="text-[#22c55e]">+₹24,500.00</span>
            </div>

            <div className="h-4 w-[1px] bg-[#1a1a1a]" />

            <div className="flex items-center gap-3">
              <button className="text-[#666] hover:text-[#fafafa] transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleLogout}
                className="text-[#666] hover:text-[#ef4444] transition-colors"
                title="Sign out"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Content body layout */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
