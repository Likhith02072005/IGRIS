'use client';

import React, { useState, useEffect } from 'react';
import { useCapitalStore } from '../../store/capital';
import CapitalEditModal from '../../components/layout/CapitalEditModal';
import { Edit2, RotateCcw, Zap } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[#fafafa]">
              Overview
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#22d3ee]/10 text-[#22d3ee] font-mono text-[11px] border border-[#22d3ee]/20">
              {isFreshMode ? 'FRESH 0 MODE' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-[#666]">
            Last sync: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        {/* Actions & Ticker tape */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFreshMode(!isFreshMode)}
            className="px-3 py-1.5 rounded bg-[#111111] border border-[#1a1a1a] hover:border-[#22d3ee] text-xs text-[#fafafa] hover:text-[#22d3ee] font-mono flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#22d3ee]" />
            {isFreshMode ? 'Switch to Demo Mode' : 'Reset All to Fresh ₹0'}
          </button>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            {tickers.map((t, i) => {
              const isPositive = t.change >= 0;
              return (
                <React.Fragment key={t.name}>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666]">{t.name}</span>
                    <span className="font-mono text-[#fafafa]">{t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`font-mono ${isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {isPositive ? '+' : ''}{t.pct}%
                    </span>
                  </div>
                  {i < tickers.length - 1 && <span className="text-[#333]">|</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main KPI Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Capital */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="card bg-[#111] border border-[#1a1a1a] hover:border-[#22d3ee] rounded-lg p-5 flex flex-col justify-between h-28 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666] group-hover:text-white transition-colors">Current capital</span>
            <Edit2 className="w-3.5 h-3.5 text-[#666] group-hover:text-[#22d3ee] transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-[#fafafa] group-hover:text-[#22d3ee] font-mono transition-colors">
              ₹{capital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-[#22d3ee] block mt-1">Click to customize capital balance</span>
          </div>
        </div>

        {/* Card: Today's PnL */}
        <div className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-5 flex flex-col justify-between h-28">
          <span className="text-sm text-[#666]">Today&apos;s PnL</span>
          <div>
            <h3 className={`text-xl font-medium font-mono ${isFreshMode ? 'text-white' : 'text-[#22c55e]'}`}>
              {isFreshMode ? '₹0.00' : '+₹24,500.00'}
            </h3>
          </div>
        </div>

        {/* Card: Weekly PnL */}
        <div className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-5 flex flex-col justify-between h-28">
          <span className="text-sm text-[#666]">Weekly PnL</span>
          <div>
            <h3 className={`text-xl font-medium font-mono ${isFreshMode ? 'text-white' : 'text-[#22c55e]'}`}>
              {isFreshMode ? '₹0.00' : '+₹89,100.00'}
            </h3>
          </div>
        </div>

        {/* Card: Max Drawdown */}
        <div className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-5 flex flex-col justify-between h-28">
          <span className="text-sm text-[#666]">Max Drawdown</span>
          <div>
            <h3 className={`text-xl font-medium font-mono ${isFreshMode ? 'text-white' : 'text-[#ef4444]'}`}>
              {isFreshMode ? '0.00%' : '-4.12%'}
            </h3>
          </div>
        </div>
      </div>

      {/* Advanced performance ratio cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Sharpe ratio', val: isFreshMode ? '0.00' : '2.84', color: 'text-[#22d3ee]' },
          { label: 'Sortino ratio', val: isFreshMode ? '0.00' : '3.12', color: 'text-[#22d3ee]' },
          { label: 'Calmar ratio', val: isFreshMode ? '0.00' : '3.45', color: 'text-[#22d3ee]' },
          { label: 'Profit factor', val: isFreshMode ? '0.00' : '1.92', color: 'text-[#22c55e]' },
          { label: 'Expectancy', val: isFreshMode ? '₹0.00' : '+₹1,420.00', color: 'text-[#22c55e]' },
          { label: 'Win rate', val: isFreshMode ? '0.0%' : '62.5%', color: 'text-[#22c55e]' },
        ].map(item => (
          <div key={item.label} className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-4 flex flex-col justify-between h-20">
            <span className="text-xs text-[#666]">{item.label}</span>
            <p className={`text-base font-medium font-mono ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics & Live Market Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Detailed stats + Allocation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Stats Block */}
          <div className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-medium text-[#fafafa]">
                Statistics
              </h2>
              {isFreshMode && (
                <span className="text-xs font-mono text-[#22d3ee]">Fresh Session Baseline</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                <div key={stat.label} className="border-b border-[#1a1a1a] pb-3">
                  <span className="text-xs text-[#666] block mb-1">{stat.label}</span>
                  <span className="text-sm font-medium text-[#fafafa] font-mono">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio allocation */}
          <div className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-base font-medium text-[#fafafa]">
                Allocation
              </h2>
              <span className="text-xs text-[#666]">Dynamic Proportional Allocation</span>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Nifty Options (Straddles)', pct: 0.45, alloc: '45%', color: 'bg-[#22d3ee]' },
                { name: 'BankNifty Momentum Buying', pct: 0.30, alloc: '30%', color: 'bg-[#818cf8]' },
                { name: 'Liquid Funds / Collateral', pct: 0.15, alloc: '15%', color: 'bg-[#22c55e]' },
                { name: 'Midcap Directional Selling', pct: 0.10, alloc: '10%', color: 'bg-[#f59e0b]' },
              ].map(asset => {
                const amount = capital * asset.pct;
                return (
                  <div key={asset.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#666]">{asset.name}</span>
                      <span className="text-[#fafafa] font-mono">
                        {asset.alloc} (₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className={`h-full ${asset.color}`} style={{ width: asset.alloc }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Live Market Panel */}
        <div className="space-y-6">
          
          {/* Live Market panel */}
          <div className="card bg-[#111] border border-[#1a1a1a] rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-[#fafafa]">
                Market
              </h2>
              <span className="text-xs text-[#22c55e] font-mono">
                LIVE
              </span>
            </div>

            {/* Advance/Decline */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#22c55e]">Advances: 34</span>
                <span className="text-[#666]">Declines: 16</span>
              </div>
              <div className="h-1.5 w-full bg-[#ef4444] rounded-full flex overflow-hidden">
                <div className="h-full bg-[#22c55e]" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#666] block mb-2.5">
                  Top Gainers
                </span>
                <div className="space-y-2">
                  {initialGainers.map(g => (
                    <div key={g.symbol} className="flex justify-between items-center text-xs">
                      <span className="text-[#fafafa]">{g.symbol}</span>
                      <span className="text-[#22c55e] font-mono">+{g.change}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-[#666] block mb-2.5">
                  Top Losers
                </span>
                <div className="space-y-2">
                  {initialLosers.map(l => (
                    <div key={l.symbol} className="flex justify-between items-center text-xs">
                      <span className="text-[#fafafa]">{l.symbol}</span>
                      <span className="text-[#ef4444] font-mono">{l.change}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sector Heatmap Preview */}
            <div className="space-y-3">
              <span className="text-xs text-[#666] block">
                Sectors
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs text-center font-mono">
                <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-2 rounded text-[#22c55e]">IT<br/>+1.45%</div>
                <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-2 rounded text-[#22c55e]">BANK<br/>+0.82%</div>
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-2 rounded text-[#ef4444]">PHARMA<br/>-0.65%</div>
                <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-2 rounded text-[#22c55e]">METAL<br/>+0.22%</div>
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-2 rounded text-[#ef4444]">AUTO<br/>-1.20%</div>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-2 rounded text-[#666]">FIN<br/>0.00%</div>
              </div>
            </div>

            {/* Market Status and Option Chain KPI */}
            <div className="pt-4 border-t border-[#1a1a1a] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#666]">Status</span>
                <span className="text-[#22c55e]">Open</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">PCR</span>
                <span className="text-[#fafafa] font-mono">1.14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Nifty ATM OI</span>
                <span className="text-[#fafafa] font-mono">1.2M / 1.4M</span>
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
