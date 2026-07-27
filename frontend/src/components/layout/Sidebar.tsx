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
  { name: 'Portfolio', path: '/dashboard/portfolio', icon: FolderKanban },
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
  { name: 'Marketplace', path: '/dashboard/marketplace', icon: ShoppingBag },
  { name: 'Observability', path: '/dashboard/observability', icon: Activity },
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
    <aside className="w-64 min-h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col justify-between">
      {/* Logo */}
      <div>
        <div className="p-6 border-b border-[#1a1a1a]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
            <span className="text-white font-bold text-lg tracking-tight">IGRIS</span>
            <span className="text-[#444] text-xs ml-auto">v1.1.0</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'text-[#22d3ee] bg-[#22d3ee]/5 border-l-2 border-[#22d3ee]'
                    : 'text-[#666] hover:text-white border-l-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User section */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-sm text-white truncate">{user?.name || 'Operator'}</p>
            <p className="text-xs text-[#666] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-[#666] hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
