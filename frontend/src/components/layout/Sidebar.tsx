'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import {
  LayoutDashboard, LineChart, Cpu, FlaskConical, Bot, PieChart, Briefcase,
  CandlestickChart, PlayCircle, Satellite, ShieldAlert, Eye, BarChart3,
  BookOpenText, Store, Hammer, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mission Control', href: '/dashboard/mission-control', icon: Satellite },
  { divider: true, label: 'Trading' },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase },
  { label: 'Portfolio Optimizer', href: '/dashboard/portfolio/optimizer', icon: PieChart },
  { label: 'Strategies', href: '/dashboard/strategies', icon: LineChart },
  { label: 'Nifty Martingale AI (25)', href: '/dashboard/strategies/nifty-martingale', icon: Zap },
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col" style={{
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.5)',
    }}>
      
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center shadow-md">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#1a1a2e] tracking-tight font-heading">IGRIS</h1>
          <span className="text-[10px] text-[#94a3b8] font-medium">v1.1.0 · Trading Platform</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item, i) => {
          if ('divider' in item && item.divider) {
            return (
              <div key={i} className="pt-5 pb-2 px-3">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#7c3aed]/10 to-[#0ea5e9]/5 text-[#7c3aed] font-semibold shadow-sm border border-[#7c3aed]/10'
                  : 'text-[#475569] hover:text-[#1a1a2e] hover:bg-white/40'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#7c3aed]' : 'text-[#94a3b8]'}`} />
              <span className="truncate">{item.label}</span>
              {item.label === 'Nifty Martingale AI (25)' && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold">
                  LIVE
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent" />

      {/* User section */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1a1a2e] truncate">{user?.name || 'Operator'}</p>
            <p className="text-[10px] text-[#94a3b8] truncate">{user?.email || 'operator@igris.lab'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[#ef4444] hover:bg-[#ef4444]/5 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
