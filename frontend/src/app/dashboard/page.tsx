'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight, 
  BarChart2, ShieldAlert, Award, Clock, Coins, Flame, ChevronRight, RefreshCw, BarChart4
} from 'lucide-react';

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
    <div className="space-y-8 relative z-10">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-500">
            Real-time terminal workspace. Last sync: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        {/* Ticker tape */}
        <div className="flex flex-wrap items-center gap-4">
          {tickers.map(t => {
            const isPositive = t.change >= 0;
            return (
              <div 
                key={t.name} 
                className="px-3 py-1.5 rounded-lg bg-gray-950/60 border border-gray-900 flex items-center gap-3 text-xs shadow-glass-inset"
              >
                <span className="font-mono text-gray-400 font-bold">{t.name}</span>
                <span className="font-mono font-semibold text-white">{t.price.toLocaleString()}</span>
                <span className={`font-mono text-[10px] flex items-center ${isPositive ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                  {isPositive ? '+' : ''}{t.pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main KPI Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Capital */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-brand/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Capital</span>
            <DollarSign className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white font-mono">$100,000.00</h3>
            <span className="text-[10px] text-bloomberg-green font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +15.4% Max Allowed
            </span>
          </div>
        </div>

        {/* Card: Today's PnL */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-bloomberg-green/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Today&apos;s PnL</span>
            <Activity className="w-4 h-4 text-bloomberg-green" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-bloomberg-green font-mono">+$2,450.00</h3>
            <span className="text-[10px] text-bloomberg-green font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +2.45% intraday
            </span>
          </div>
        </div>

        {/* Card: Weekly PnL */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-bloomberg-green/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Weekly PnL</span>
            <Activity className="w-4 h-4 text-bloomberg-green" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-bloomberg-green font-mono">+$8,910.00</h3>
            <span className="text-[10px] text-bloomberg-green font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +8.91% week-to-date
            </span>
          </div>
        </div>

        {/* Card: Max Drawdown */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-bloomberg-red/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Max Drawdown</span>
            <ShieldAlert className="w-4 h-4 text-bloomberg-red" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-bloomberg-red font-mono">-4.12%</h3>
            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 mt-1">
              Limit: 10.00%
            </span>
          </div>
        </div>
      </div>

      {/* Advanced performance ratio cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Sharpe Ratio', val: '2.84', color: 'text-brand', status: 'Institutional' },
          { label: 'Sortino Ratio', val: '3.12', color: 'text-brand', status: 'Excellent' },
          { label: 'Calmar Ratio', val: '3.45', color: 'text-brand', status: 'Low Risk' },
          { label: 'Profit Factor', val: '1.92', color: 'text-bloomberg-green', status: 'Healthy' },
          { label: 'Expectancy', val: '+$142.00', color: 'text-bloomberg-green', status: 'Positive' },
          { label: 'Win Rate %', val: '62.5%', color: 'text-bloomberg-green', status: 'Avg 52 Trades' },
        ].map(item => (
          <div key={item.label} className="glass-panel p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
            <div>
              <p className={`text-base font-bold font-mono ${item.color}`}>{item.val}</p>
              <span className="text-[9px] text-gray-500 block mt-0.5">{item.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics & Live Market Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: More analytics stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Stats Block */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <BarChart4 className="w-4 h-4 text-brand" /> Detailed System Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Open Trades', val: '2' },
                { label: 'Closed Trades', val: '142' },
                { label: 'Loss %', val: '37.5%' },
                { label: 'Net Profit', val: '+$15,420.00' },
                { label: 'Largest Win', val: '+$4,500.00' },
                { label: 'Largest Loss', val: '-$1,800.00' },
                { label: 'Avg Win', val: '+$940.00' },
                { label: 'Avg Loss', val: '-$512.00' },
                { label: 'Avg Hold Time', val: '42 mins' },
                { label: 'Daily Return', val: '+0.42%' },
                { label: 'Monthly Return', val: '+9.45%' },
                { label: 'Expectancy Ratio', val: '1.83' },
              ].map(stat => (
                <div key={stat.label} className="border-b border-gray-900 pb-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">{stat.label}</span>
                  <span className="text-sm font-bold text-white font-mono">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio allocation preview container */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-brand" /> Asset Allocation
              </h2>
              <span className="text-xs text-brand font-semibold cursor-pointer flex items-center hover:underline">
                Manage Allocation <ChevronRight className="w-4 h-4" />
              </span>
            </div>
            
            {/* Visual allocation gauge */}
            <div className="space-y-4">
              {[
                { name: 'Nifty Options (Straddles)', alloc: '45%', amount: '$45,000.00', color: 'bg-brand' },
                { name: 'BankNifty Momentum Buying', alloc: '30%', amount: '$30,000.00', color: 'bg-indigo-500' },
                { name: 'Liquid Funds / Collateral', alloc: '15%', amount: '$15,000.00', color: 'bg-emerald-500' },
                { name: 'Midcap Directional Selling', alloc: '10%', amount: '$10,000.00', color: 'bg-amber-500' },
              ].map(asset => (
                <div key={asset.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">{asset.name}</span>
                    <span className="text-white font-mono">{asset.alloc} ({asset.amount})</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className={`h-full ${asset.color}`} style={{ width: asset.alloc }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Live Market Panel */}
        <div className="space-y-6">
          
          {/* Live Market panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-bloomberg-green" /> Live Market Panel
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono text-bloomberg-green px-2 py-0.5 rounded bg-bloomberg-green/10 border border-bloomberg-green/20">
                LIVE FEED
              </span>
            </div>

            {/* Advance/Decline */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-bloomberg-green">Advances: 34</span>
                <span className="text-gray-400">Declines: 16</span>
              </div>
              {/* Advance decline visual bar */}
              <div className="h-2 w-full bg-bloomberg-red rounded-full flex overflow-hidden">
                <div className="h-full bg-bloomberg-green" style={{ width: '68%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>Breadth: Bullish</span>
                <span>Ratio: 2.12</span>
              </div>
            </div>

            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2.5">
                  Top Gainers
                </span>
                <div className="space-y-2">
                  {initialGainers.map(g => (
                    <div key={g.symbol} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{g.symbol}</span>
                      <span className="text-bloomberg-green font-mono">+{g.change}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2.5">
                  Top Losers
                </span>
                <div className="space-y-2">
                  {initialLosers.map(l => (
                    <div key={l.symbol} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{l.symbol}</span>
                      <span className="text-bloomberg-red font-mono">{l.change}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sector Heatmap Preview */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                Sector Heatmap
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                <div className="bg-bloomberg-green/30 border border-bloomberg-green/40 p-2.5 rounded text-bloomberg-green">IT<br/>+1.45%</div>
                <div className="bg-bloomberg-green/20 border border-bloomberg-green/30 p-2.5 rounded text-bloomberg-green">BANK<br/>+0.82%</div>
                <div className="bg-bloomberg-red/20 border border-bloomberg-red/30 p-2.5 rounded text-bloomberg-red">PHARMA<br/>-0.65%</div>
                <div className="bg-bloomberg-green/10 border border-bloomberg-green/20 p-2.5 rounded text-bloomberg-green">METAL<br/>+0.22%</div>
                <div className="bg-bloomberg-red/30 border border-bloomberg-red/40 p-2.5 rounded text-bloomberg-red">AUTO<br/>-1.20%</div>
                <div className="bg-gray-900 border border-gray-800 p-2.5 rounded text-gray-400">FIN<br/>0.00%</div>
              </div>
            </div>

            {/* Market Status and Option Chain KPI */}
            <div className="pt-4 border-t border-gray-900 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Market Status</span>
                <span className="text-bloomberg-green font-bold uppercase">Open</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PCR (Put Call Ratio)</span>
                <span className="text-white font-mono font-bold">1.14 (Bullish)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nifty ATM OI (CE/PE)</span>
                <span className="text-white font-mono">1.2M / 1.4M</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
