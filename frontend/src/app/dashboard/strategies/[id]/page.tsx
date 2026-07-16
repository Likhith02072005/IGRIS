'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Shield, Play, Pause, AlertOctagon, Copy, PlayCircle, BarChart3, 
  Search, Download, Trash2, TrendingUp, CircleDollarSign, ArrowUpRight, ArrowDownRight,
  TrendingDown, Percent, Layers, ShieldCheck, Zap
} from 'lucide-react';

interface TradeRecord {
  num: number;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  exit: number;
  entryPrem: number;
  exitPrem: number;
  lots: number;
  qty: number;
  pnl: number;
  pnlPct: number;
  duration: string;
  reason: string;
  charges: number;
}

export default function StrategyDetails() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  // Live status
  const [isLive, setIsLive] = useState(true);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // Seeded Trade History
  const [trades, setTrades] = useState<TradeRecord[]>([
    { num: 1, symbol: 'BANKNIFTY26JUL52400CE', direction: 'BUY', entry: 52400, exit: 52450, entryPrem: 110.5, exitPrem: 160.5, lots: 2, qty: 30, pnl: 1500.00, pnlPct: 45.2, duration: '42m', reason: 'ASTRA High Revisit', charges: 40.0 },
    { num: 2, symbol: 'BANKNIFTY26JUL52400PE', direction: 'SELL', entry: 52410, exit: 52430, entryPrem: 240.2, exitPrem: 260.2, lots: 2, qty: 30, pnl: -600.00, pnlPct: -8.3, duration: '20m', reason: 'Stop Loss Trigger', charges: 40.0 },
    { num: 3, symbol: 'BANKNIFTY26JUL52400CE', direction: 'BUY', entry: 52380, exit: 52430, entryPrem: 130.0, exitPrem: 180.0, lots: 2, qty: 30, pnl: 1500.00, pnlPct: 38.4, duration: '1h 12m', reason: 'ASTRA Low Revisit', charges: 40.0 },
  ]);

  const handleEmergencyExit = () => {
    const confirm = window.confirm('EMERGENCY INSTRUCTION: This will instantly liquidate all open positions and place market limit exits. Proceed?');
    if (confirm) {
      alert('ALL POSITIONS LIQUIDATED. Strategy suspended.');
      setIsLive(false);
    }
  };

  const handleClone = () => {
    alert('Strategy cloned successfully. Created: ASTRA copy_1');
  };

  const filteredTrades = trades.filter(t => {
    const matchSearch = t.symbol.toLowerCase().includes(search.toLowerCase()) || t.reason.toLowerCase().includes(search.toLowerCase());
    const matchDir = directionFilter === 'ALL' || t.direction === directionFilter;
    return matchSearch && matchDir;
  });

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Back button and Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => router.push('/dashboard/strategies')}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white uppercase tracking-wider font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Strategies
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                ASTRA Options Algorithm
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-brand/10 border border-brand/20 text-brand font-bold">
                v1.2.0
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Created by: <span className="text-gray-400 font-mono">System Default Admin</span> | Target Asset: <span className="text-gray-400 font-mono">BANKNIFTY</span>
            </p>
          </div>

          {/* Action Control Panel */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Toggle */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
                isLive 
                  ? 'bg-bloomberg-green/10 border-bloomberg-green/30 text-bloomberg-green' 
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <Zap className="w-4 h-4" />
              {isLive ? 'Live Deployment' : 'Paused'}
            </button>

            {/* Emergency Exit */}
            <button
              onClick={handleEmergencyExit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bloomberg-red/10 border border-bloomberg-red/30 text-bloomberg-red hover:bg-bloomberg-red/20 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <AlertOctagon className="w-4 h-4" />
              Emergency Abort
            </button>

            {/* Clone Strategy */}
            <button
              onClick={handleClone}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Clone Strategy Model"
            >
              <Copy className="w-4.5 h-4.5" />
            </button>

            {/* Backtest & Paper links */}
            <button
              onClick={() => router.push(`/dashboard/backtesting?strategyId=ASTRA`)}
              className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 border border-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Backtest
            </button>
            
            <button
              onClick={() => router.push('/dashboard/paper-trading')}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Paper Trade
            </button>
          </div>
        </div>
      </div>

      {/* Performance KPIs answering the three questions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Allocated Capital', val: '$45,000.00', color: 'text-white' },
          { label: 'Net Profit PnL', val: '+$2,450.00', color: 'text-bloomberg-green' },
          { label: 'Max Drawdown', val: '-3.12%', color: 'text-bloomberg-red' },
          { label: 'Sharpe Ratio', val: '2.84', color: 'text-brand' },
          { label: 'Sortino Ratio', val: '3.12', color: 'text-brand' },
          { label: 'Calmar Ratio', val: '3.45', color: 'text-brand' },
        ].map(item => (
          <div key={item.label} className="glass-panel p-4 rounded-xl">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{item.label}</span>
            <span className={`text-base font-bold font-mono ${item.color}`}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Additional Stats Details Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          Institutional Performance Coordinates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-semibold text-gray-300">
          {[
            { label: 'Win Rate %', val: '62.5%' },
            { label: 'Profit Factor', val: '1.92' },
            { label: 'Average Risk Reward', val: '1.83:1' },
            { label: 'Expectancy Value', val: '+$142.00' },
            { label: 'Recovery Factor', val: '4.85' },
            { label: 'Longest Win Streak', val: '6 wins' },
            { label: 'Longest Loss Streak', val: '3 losses' },
            { label: 'Capital Required', val: '$15,000.00' },
          ].map(stat => (
            <div key={stat.label} className="border-b border-gray-900 pb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-white font-mono">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve bar map */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            Algorithm Equity Curve Growth
          </span>
          <div className="flex items-end justify-between h-44 bg-gray-950/60 border border-gray-900 rounded-xl p-4 font-mono text-[9px] text-gray-500">
            {[100, 102.5, 101.8, 104.5, 106.8, 107.4].map((v, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-4 bg-brand/50 rounded-t" style={{ height: `${(v - 100) * 15 + 15}px` }} />
                <span className="mt-2 text-white font-bold">${(v * 1000).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drawdown Curve bar map */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-bloomberg-red">
            Algorithm Drawdown Progression
          </span>
          <div className="flex items-start justify-between h-44 bg-gray-950/60 border border-gray-900 rounded-xl p-4 font-mono text-[9px] text-gray-500">
            {[0.0, -1.2, -0.4, -2.5, -0.8, -3.12].map((v, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="mb-2 text-bloomberg-red font-bold">{v}%</span>
                <div className="w-4 bg-bloomberg-red/40 rounded-b" style={{ height: `${Math.abs(v) * 20 + 10}px` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trades History Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Historical Trade Records Ledger
          </h2>

          {/* Filters controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                className="glass-input pl-9 pr-4 py-2 rounded-xl text-xs"
                placeholder="Search symbol/reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Direction Filter */}
            <select
              className="glass-input px-3 py-2 rounded-xl text-xs"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as 'ALL' | 'BUY' | 'SELL')}
            >
              <option value="ALL">All Directions</option>
              <option value="BUY">BUY / Long</option>
              <option value="SELL">SELL / Short</option>
            </select>

            {/* CSV export */}
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 uppercase tracking-wider transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-[#060a16]/65 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Direction</th>
                <th className="p-3 text-right">Entry Index</th>
                <th className="p-3 text-right">Exit Index</th>
                <th className="p-3 text-right">Premium (Entry/Exit)</th>
                <th className="p-3 text-right">Lots/Qty</th>
                <th className="p-3 text-right">Net PnL ($)</th>
                <th className="p-3 text-right">PnL %</th>
                <th className="p-3">Exit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
              {filteredTrades.map(t => {
                const isWin = t.pnl >= 0;
                return (
                  <tr key={t.num} className="hover:bg-gray-900/10">
                    <td className="p-3 text-center text-gray-500 font-mono">{t.num}</td>
                    <td className="p-3 text-white font-bold">{t.symbol}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.direction === 'BUY' ? 'bg-bloomberg-green/10 text-bloomberg-green' : 'bg-bloomberg-red/10 text-bloomberg-red'
                      }`}>
                        {t.direction === 'BUY' ? 'LONG' : 'SHORT'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-gray-400">{t.entry}</td>
                    <td className="p-3 text-right font-mono text-gray-400">{t.exit}</td>
                    <td className="p-3 text-right font-mono text-gray-400">${t.entryPrem} / ${t.exitPrem}</td>
                    <td className="p-3 text-right font-mono text-gray-400">{t.lots} lots / {t.qty}</td>
                    <td className={`p-3 text-right font-mono ${isWin ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                      {isWin ? '+' : ''}${t.pnl}
                    </td>
                    <td className={`p-3 text-right font-mono ${isWin ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                      {isWin ? '+' : ''}{t.pnlPct}%
                    </td>
                    <td className="p-3 text-gray-400 font-sans">{t.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
