'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import {
  LayoutDashboard,
  Code2,
  FileCode2,
  PlayCircle,
  FolderKanban,
  BookOpen,
  History,
  BarChart3,
  Settings,
  Bot,
  LogOut,
  UserCheck,
  Shield,
  Activity,
  ShoppingBag,
  PieChart,
  Cpu
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Mission Control', path: '/dashboard/mission-control', icon: Cpu },
  { name: 'Subscribed Portfolio', path: '/dashboard/portfolio', icon: FolderKanban },
  { name: 'Portfolio Optimizer', path: '/dashboard/portfolio/optimizer', icon: PieChart },
  { name: 'Strategies', path: '/dashboard/strategies', icon: Code2 },
  { name: 'Strategy Builder', path: '/dashboard/strategies/builder', icon: FileCode2 },
  { name: 'Backtesting', path: '/dashboard/backtesting', icon: History },
  { name: 'Backtest Validation', path: '/dashboard/backtesting/validation', icon: BarChart3 },
  { name: 'Paper Trading', path: '/dashboard/paper-trading', icon: PlayCircle },
  { name: 'Market Option Chain', path: '/dashboard/market', icon: Activity },
  { name: 'Risk Control', path: '/dashboard/risk', icon: Shield },
  { name: 'Trade Journal', path: '/dashboard/journal', icon: BookOpen },
  { name: 'AI Assistant', path: '/dashboard/ai-assistant', icon: Bot },
  { name: 'Plugin Marketplace', path: '/dashboard/marketplace', icon: ShoppingBag },
  { name: 'System Observability', path: '/dashboard/observability', icon: Activity },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
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
    <aside className="w-64 min-h-screen bg-[#060a16] border-r border-gray-800 flex flex-col justify-between">
      {/* Top Section - Brand */}
      <div>
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white tracking-wider text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              A
            </div>
            <div>
              <span className="font-extrabold text-sm text-white uppercase tracking-wider block">
                Igris <span className="text-brand">Quant Lab</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase">
                v1.1.0 Terminal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-brand/15 text-brand border border-brand/20 shadow-glass-inset'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Operator State */}
      <div className="p-4 border-t border-gray-800 bg-[#040710]/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-bloomberg-green animate-pulse" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Engine Online
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
            title="Disconnect Terminal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-950/60 border border-gray-900 shadow-glass-inset">
          <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-brand" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Operator'}</p>
            <p className="text-[10px] text-gray-500 truncate font-mono">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
