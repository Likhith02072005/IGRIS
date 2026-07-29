'use client';

import React, { useState, useEffect } from 'react';
import { useCapitalStore } from '../../store/capital';
import CapitalEditModal from '../../components/layout/CapitalEditModal';
import { Edit2, RotateCcw, TrendingUp, TrendingDown, Zap } from 'lucide-react';

// Simulated Tickers
const initialTickers = [
  { name: 'NIFTY 50', price: 24302.50, change: 112.40, pct: 0.46 },
  { name: 'BANKNIFTY', price: 52410.80, change: -185.30, pct: -0.35 },
  { name: 'SENSEX', price: 79900.20, change: 395.10, pct: 0.50 },
  { name: 'INDIA VIX', price: 13.42, change: -0.58, pct: -4.14 },
];

const initialGainers = [
  { symbol: 'RELIANCE', price: 3120.40, change: 1.85 },
  { symbol: 'TCS', price: 3950.15, change: 2.10 },
  { symbol: 'HDFCBANK', price: 1654.80, change: 1.42 },
];

const initialLosers = [
  { symbol: 'INFY', price: 1545.30, change: -2.30 },
  { symbol: 'ICICIBANK', price: 1122.50, change: -1.15 },
  { symbol: 'LT', price: 3512.00, change: -0.95 },
];

export default function DashboardHome() {
  const [tickers, setTickers] = useState(initialTickers);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { capital } = useCapitalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFreshMode, setIsFreshMode] = useState(true); // Default to Fresh 0 Mode

  // Simulate real-time ticker tick updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev => 
        prev.map(t => {
          const delta = (Math.random() - 0.5) * (t.name === 'INDIA VIX' ? 0.05 : 5.0);
          const newPrice = Number((t.price + delta).toFixed(2));
          const newChange = Number((t.change + delta).toFixed(2));
          const newPct = Number(((newChange / (t.price - newChange)) * 100).toFixed(2));
          return { ...t, price: newPrice, change: newChange, pct: newPct };
        })
      );
      setLastUpdated(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#1a1a2e] font-heading">
              Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-[11px] font-bold border border-[#7c3aed]/20">
              {isFreshMode ? 'FRESH 0 MODE' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5 font-medium">
            Last sync: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        {/* Actions & Ticker tape */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFreshMode(!isFreshMode)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-white/60 bg-white/60 hover:bg-white text-xs text-[#1a1a2e] hover:text-[#7c3aed] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7c3aed]" />
            {isFreshMode ? 'Switch to Demo Mode' : 'Reset All to Fresh ₹0'}
          </button>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            {tickers.map((t, i) => {
              const isPositive = t.change >= 0;
              return (
                <React.Fragment key={t.name}>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748b] font-medium">{t.name}</span>
                    <span className="font-mono text-[#1a1a2e] font-bold">{t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`font-mono font-semibold ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isPositive ? '+' : ''}{t.pct}%
                    </span>
                  </div>
                  {i < tickers.length - 1 && <span className="text-slate-300">|</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main KPI Stats grid - Phone optimized grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card: Capital */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-30 sm:h-32 cursor-pointer transition-all group border-l-4 border-l-[#7c3aed] hover:border-r-4 hover:border-r-[#7c3aed]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#64748b] uppercase tracking-wider">Current capital</span>
            <Edit2 className="w-4 h-4 text-[#64748b] group-hover:text-[#7c3aed] transition-colors" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] group-hover:text-[#7c3aed] font-mono transition-colors truncate">
              ₹{capital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#7c3aed] font-semibold block mt-1">Click to customize capital balance</span>
          </div>
        </div>

        {/* Card: Today's PnL */}
        <div className="card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-30 sm:h-32 border-l-4 border-l-[#10b981]">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748b] uppercase tracking-wider">Today&apos;s PnL</span>
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold font-mono ${isFreshMode ? 'text-[#1a1a2e]' : 'text-[#10b981]'}`}>
              {isFreshMode ? '₹0.00' : '+₹24,500.00'}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#64748b] font-medium block mt-1">{isFreshMode ? 'Fresh Session Baseline' : '+2.45% intraday ROI'}</span>
          </div>
        </div>

        {/* Card: Weekly PnL */}
        <div className="card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-30 sm:h-32 border-l-4 border-l-[#10b981]">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748b] uppercase tracking-wider">Weekly PnL</span>
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold font-mono ${isFreshMode ? 'text-[#1a1a2e]' : 'text-[#10b981]'}`}>
              {isFreshMode ? '₹0.00' : '+₹89,100.00'}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#64748b] font-medium block mt-1">{isFreshMode ? 'Fresh Session Baseline' : '+8.91% weekly ROI'}</span>
          </div>
        </div>

        {/* Card: Max Drawdown */}
        <div className="card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-30 sm:h-32 border-l-4 border-l-[#ef4444]">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748b] uppercase tracking-wider">Max Drawdown</span>
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold font-mono ${isFreshMode ? 'text-[#1a1a2e]' : 'text-[#ef4444]'}`}>
              {isFreshMode ? '0.00%' : '-4.12%'}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#64748b] font-medium block mt-1">Controlled peak-to-trough</span>
          </div>
        </div>
      </div>

      {/* Advanced performance ratio cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {[
          { label: 'Sharpe ratio', val: isFreshMode ? '0.00' : '2.84', color: 'text-[#7c3aed]' },
          { label: 'Sortino ratio', val: isFreshMode ? '0.00' : '3.12', color: 'text-[#7c3aed]' },
          { label: 'Calmar ratio', val: isFreshMode ? '0.00' : '3.45', color: 'text-[#7c3aed]' },
          { label: 'Profit factor', val: isFreshMode ? '0.00' : '1.92', color: 'text-[#10b981]' },
          { label: 'Expectancy', val: isFreshMode ? '₹0.00' : '+₹1,420.00', color: 'text-[#10b981]' },
          { label: 'Win rate', val: isFreshMode ? '0.0%' : '62.5%', color: 'text-[#10b981]' },
        ].map(item => (
          <div key={item.label} className="card p-3.5 rounded-2xl flex flex-col justify-between h-18 sm:h-20">
            <span className="text-[11px] sm:text-xs font-semibold text-[#64748b]">{item.label}</span>
            <p className={`text-sm sm:text-base font-bold font-mono ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics & Live Market Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left 2 Cols: Detailed stats + Allocation */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Detailed Stats Block */}
          <div className="card p-4 sm:p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-base font-bold text-[#1a1a2e] font-heading">
                Statistics
              </h2>
              {isFreshMode && (
                <span className="text-xs font-mono text-[#7c3aed] font-bold">Fresh Session</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Open trades', val: isFreshMode ? '0' : '2' },
                { label: 'Closed trades', val: isFreshMode ? '0' : '142' },
                { label: 'Loss rate', val: isFreshMode ? '0.0%' : '37.5%' },
                { label: 'Net profit', val: isFreshMode ? '₹0.00' : '+₹1,54,200.00' },
                { label: 'Largest win', val: isFreshMode ? '₹0.00' : '+₹45,000.00' },
                { label: 'Largest loss', val: isFreshMode ? '₹0.00' : '-₹18,000.00' },
                { label: 'Avg win', val: isFreshMode ? '₹0.00' : '+₹9,400.00' },
                { label: 'Avg loss', val: isFreshMode ? '₹0.00' : '-₹5,120.00' },
                { label: 'Avg hold time', val: isFreshMode ? '0 mins' : '42 mins' },
                { label: 'Daily return', val: isFreshMode ? '0.00%' : '+0.42%' },
                { label: 'Monthly return', val: isFreshMode ? '0.00%' : '+9.45%' },
                { label: 'Expectancy ratio', val: isFreshMode ? '0.00' : '1.83' },
              ].map(stat => (
                <div key={stat.label} className="border-b border-slate-100 pb-2.5">
                  <span className="text-[11px] sm:text-xs text-[#64748b] font-medium block mb-0.5">{stat.label}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1a1a2e] font-mono">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio allocation */}
          <div className="card p-4 sm:p-6 rounded-2xl">
            <div className="mb-4 sm:mb-6 flex justify-between items-center">
              <h2 className="text-base font-bold text-[#1a1a2e] font-heading">
                Allocation
              </h2>
              <span className="text-xs text-[#64748b] font-medium hidden sm:inline">Proportional Allocation</span>
            </div>
            
            <div className="space-y-3.5">
              {[
                { name: 'Nifty Options (Straddles)', pct: 0.45, alloc: '45%', color: 'bg-[#7c3aed]' },
                { name: 'BankNifty Momentum Buying', pct: 0.30, alloc: '30%', color: 'bg-indigo-500' },
                { name: 'Liquid Funds / Collateral', pct: 0.15, alloc: '15%', color: 'bg-[#10b981]' },
                { name: 'Midcap Directional Selling', pct: 0.10, alloc: '10%', color: 'bg-amber-400' },
              ].map(asset => {
                const amount = capital * asset.pct;
                return (
                  <div key={asset.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-medium gap-2">
                      <span className="text-[#475569] truncate">{asset.name}</span>
                      <span className="text-[#1a1a2e] font-mono font-bold flex-shrink-0">
                        {asset.alloc} (₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${asset.color}`} style={{ width: asset.alloc }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Live Market Panel */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Live Market panel */}
          <div className="card p-4 sm:p-6 rounded-2xl space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-[#1a1a2e] font-heading">
                Market
              </h2>
              <span className="text-xs text-[#10b981] font-mono font-bold">
                LIVE
              </span>
            </div>

            {/* Advance/Decline */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-[#10b981]">Advances: 34</span>
                <span className="text-[#ef4444]">Declines: 16</span>
              </div>
              <div className="h-2 w-full bg-[#ef4444] rounded-full flex overflow-hidden">
                <div className="h-full bg-[#10b981]" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <span className="text-xs text-[#64748b] font-bold block mb-2">
                  Top Gainers
                </span>
                <div className="space-y-2">
                  {initialGainers.map(g => (
                    <div key={g.symbol} className="flex justify-between items-center text-[11px] sm:text-xs font-medium">
                      <span className="text-[#1a1a2e] font-bold truncate mr-1">{g.symbol}</span>
                      <span className="text-[#10b981] font-mono font-bold flex-shrink-0">+{g.change}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-[#64748b] font-bold block mb-2">
                  Top Losers
                </span>
                <div className="space-y-2">
                  {initialLosers.map(l => (
                    <div key={l.symbol} className="flex justify-between items-center text-[11px] sm:text-xs font-medium">
                      <span className="text-[#1a1a2e] font-bold truncate mr-1">{l.symbol}</span>
                      <span className="text-[#ef4444] font-mono font-bold flex-shrink-0">{l.change}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sector Heatmap Preview */}
            <div className="space-y-2.5">
              <span className="text-xs text-[#64748b] font-bold block">
                Sectors
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center font-mono font-bold">
                <div className="bg-[#10b981]/15 border border-[#10b981]/30 p-1.5 sm:p-2 rounded-xl text-[#10b981]">IT<br/>+1.45%</div>
                <div className="bg-[#10b981]/15 border border-[#10b981]/30 p-1.5 sm:p-2 rounded-xl text-[#10b981]">BANK<br/>+0.82%</div>
                <div className="bg-[#ef4444]/15 border border-[#ef4444]/30 p-1.5 sm:p-2 rounded-xl text-[#ef4444]">PHARMA<br/>-0.65%</div>
                <div className="bg-[#10b981]/15 border border-[#10b981]/30 p-1.5 sm:p-2 rounded-xl text-[#10b981]">METAL<br/>+0.22%</div>
                <div className="bg-[#ef4444]/15 border border-[#ef4444]/30 p-1.5 sm:p-2 rounded-xl text-[#ef4444]">AUTO<br/>-1.20%</div>
                <div className="bg-slate-100 border border-slate-200 p-1.5 sm:p-2 rounded-xl text-[#64748b]">FIN<br/>0.00%</div>
              </div>
            </div>

            {/* Market Status and Option Chain KPI */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Status</span>
                <span className="text-[#10b981] font-bold">Open</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">PCR</span>
                <span className="text-[#1a1a2e] font-mono font-bold">1.14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Nifty ATM OI</span>
                <span className="text-[#1a1a2e] font-mono font-bold">1.2M / 1.4M</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Capital Edit Modal */}
      <CapitalEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
