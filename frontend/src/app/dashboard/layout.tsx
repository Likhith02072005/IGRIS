'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore, hydrateAuth } from '../../store/auth';
import { 
  Wifi, CircleDollarSign, ArrowUpRight, ArrowDownRight, Bell, Shield, 
  Settings, User, Power, RefreshCw, Sun, Moon
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [lastTick, setLastTick] = useState(new Date());

  // Top Navbar Ticker States
  const [nifty, setNifty] = useState({ price: 24302.50, pct: 0.46 });
  const [banknifty, setBanknifty] = useState({ price: 52410.80, pct: -0.35 });
  const [vix, setVix] = useState({ price: 13.42, pct: -4.14 });
  const [latency, setLatency] = useState(9);

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
      setLastTick(new Date());
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-sm tracking-widest uppercase">Validating Terminal Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#02050b] min-h-screen w-full text-foreground overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* PREMIUM TOP NAVBAR */}
        <header className="h-16 bg-[#040812]/90 border-b border-gray-800/80 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-md">
          {/* Left Block - Platform Brand and Live Indices */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-light flex-shrink-0">
              Igris Terminal
            </span>
            
            <div className="h-4 w-[1px] bg-gray-800 flex-shrink-0" />

            {/* Indices Tapes */}
            <div className="flex items-center gap-4 text-[11px] font-semibold flex-shrink-0">
              {/* NIFTY */}
              <div className="flex items-center gap-1.5 bg-gray-950/65 border border-gray-900 px-2.5 py-1 rounded-md">
                <span className="text-gray-500 font-mono">NIFTY</span>
                <span className="text-white font-mono">{nifty.price.toLocaleString()}</span>
                <span className={`text-[9px] font-mono ${nifty.pct >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                  {nifty.pct >= 0 ? '▲' : '▼'} {Math.abs(nifty.pct)}%
                </span>
              </div>

              {/* BANKNIFTY */}
              <div className="flex items-center gap-1.5 bg-gray-950/65 border border-gray-900 px-2.5 py-1 rounded-md">
                <span className="text-gray-500 font-mono">BANKNIFTY</span>
                <span className="text-white font-mono">{banknifty.price.toLocaleString()}</span>
                <span className={`text-[9px] font-mono ${banknifty.pct >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                  {banknifty.pct >= 0 ? '▲' : '▼'} {Math.abs(banknifty.pct)}%
                </span>
              </div>

              {/* INDIA VIX */}
              <div className="flex items-center gap-1.5 bg-gray-950/65 border border-gray-900 px-2.5 py-1 rounded-md">
                <span className="text-gray-500 font-mono">VIX</span>
                <span className="text-white font-mono">{vix.price}</span>
                <span className={`text-[9px] font-mono ${vix.pct >= 0 ? 'text-bloomberg-red' : 'text-bloomberg-green'}`}>
                  {vix.pct >= 0 ? '▲' : '▼'} {Math.abs(vix.pct)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Block - Portfolio Value, Today PnL and Controls */}
          <div className="flex items-center gap-6 flex-shrink-0">
            
            {/* Live Portfolio Value */}
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-4.5 h-4.5 text-brand" />
              <div>
                <span className="text-[8px] text-gray-500 font-bold block uppercase tracking-wider">Portfolio Net Asset</span>
                <span className="text-xs font-bold text-white font-mono">$100,000.00</span>
              </div>
            </div>

            {/* Today's Profit & Loss */}
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4.5 h-4.5 text-bloomberg-green" />
              <div>
                <span className="text-[8px] text-gray-500 font-bold block uppercase tracking-wider">Today&apos;s PnL</span>
                <span className="text-xs font-bold text-bloomberg-green font-mono">+$2,450.00</span>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-gray-800" />

            {/* System Status Indicators */}
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-bloomberg-green animate-pulse" />
                <span className="font-mono text-[10px] text-gray-500 uppercase">Broker Linked</span>
              </div>

              <div className="flex items-center gap-1">
                <Wifi className="w-4 h-4 text-bloomberg-green" />
                <span className="font-mono text-[10px]">{latency}ms</span>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-gray-800" />

            {/* Notification and Setting items */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-gray-950/60 border border-gray-900 text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand rounded-full" />
              </button>
              
              <button className="p-2 rounded-lg bg-gray-950/60 border border-gray-900 text-gray-400 hover:text-white transition-colors">
                <Moon className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-gray-950/60 border border-gray-900 text-gray-400 hover:text-red-500 transition-colors"
                title="Log Out Terminal"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Content body layout */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Ambient background glows */}
          <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
          
          {children}
        </main>
      </div>
    </div>
  );
}
