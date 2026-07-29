'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import {
  LayoutDashboard, LineChart, Cpu, FlaskConical, Bot, PieChart, Briefcase,
  CandlestickChart, PlayCircle, Satellite, ShieldAlert, Eye, BarChart3,
  BookOpenText, Store, Hammer, LogOut, Zap, X, Flame
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mission Control', href: '/dashboard/mission-control', icon: Satellite },
  { divider: true, label: 'Trading' },
  { label: 'Nifty 1m Scalper (DMA)', href: '/dashboard/strategies/nifty-scalper', icon: Flame },
  { label: 'Nifty Martingale AI (25)', href: '/dashboard/strategies/nifty-martingale', icon: Zap },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase },
  { label: 'Portfolio Optimizer', href: '/dashboard/portfolio/optimizer', icon: PieChart },
  { label: 'Strategies', href: '/dashboard/strategies', icon: LineChart },
  { label: 'Strategy Builder', href: '/dashboard/strategies/builder', icon: Hammer },
  { divider: true, label: 'Analysis' },
  { label: 'Backtesting', href: '/dashboard/backtesting', icon: FlaskConical },
  { label: 'Backtest Validation', href: '/dashboard/backtesting/validation', icon: Cpu },
  { label: 'Paper Trading', href: '/dashboard/paper-trading', icon: PlayCircle },
  { label: 'Market Option Chain', href: '/dashboard/market', icon: CandlestickChart },
  { divider: true, label: 'Insights' },
  { label: 'Risk Control', href: '/dashboard/risk', icon: ShieldAlert },
  { label: 'Observability', href: '/dashboard/observability', icon: Eye },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Trade Journal', href: '/dashboard/journal', icon: BookOpenText },
  { label: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
  { label: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        
        {/* Logo & Mobile Close */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center shadow-md shadow-[#7c3aed]/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1a1a2e] tracking-tight font-heading">IGRIS</h1>
              <span className="text-[10px] text-slate-500 font-semibold">v1.1.0 · Scalping Ready</span>
            </div>
          </div>

          {/* Close button for Mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-200/60" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
          {navItems.map((item, i) => {
            if ('divider' in item && item.divider) {
              return (
                <div key={i} className="pt-4 pb-1.5 px-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#7c3aed]/10 text-[#7c3aed] shadow-xs border border-[#7c3aed]/15 font-bold'
                    : 'text-slate-600 hover:text-[#1a1a2e] hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  item.label === 'Nifty 1m Scalper (DMA)' ? 'text-amber-500' : isActive ? 'text-[#7c3aed]' : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
                {item.label === 'Nifty 1m Scalper (DMA)' && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[9px] font-bold">
                    1M
                  </span>
                )}
                {item.label === 'Nifty Martingale AI (25)' && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] text-[9px] font-bold">
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-200/60" />

        {/* User section */}
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1a1a2e] truncate">{user?.name || 'Operator'}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email || 'operator@igris.lab'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-[#ef4444] hover:bg-[#ef4444]/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
