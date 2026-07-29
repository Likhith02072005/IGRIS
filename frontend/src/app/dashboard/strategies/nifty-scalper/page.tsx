'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, TrendingUp, TrendingDown, RefreshCw, AlertOctagon, ArrowLeft, CheckCircle2, Play, Pause,
  ShieldCheck, Activity, BarChart2, DollarSign, Clock, Layers, Flame
} from 'lucide-react';

import { useCapitalStore } from '../../../../store/capital';

interface ScalpTrade {
  id: string;
  timestamp: string;
  type: 'CALL' | 'PUT';
  strike: string;
  entryPrice: number;
  exitPrice: number;
  lots: number;
  qty: number;
  target: number;
  stopLoss: number;
  pnl: number;
  durationSec: number;
  status: 'CLOSED_WIN' | 'CLOSED_LOSS' | 'ACTIVE';
}

export default function NiftyScalperConsole() {
  const { capital } = useCapitalStore();
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'TRADES' | 'INDICATORS'>('CONSOLE');
  
  // Ticker states
  const [niftySpot, setNiftySpot] = useState(24305.40);
  const [orderDelta, setOrderDelta] = useState({ calls: 2450, puts: 890, ratio: 2.75 });
  const [vwapPrice, setVwapPrice] = useState(24298.20);
  
  // Scalper state
  const [isEngineActive, setIsEngineActive] = useState(true);
  const [currentLots, setCurrentLots] = useState(2); // Default 2 Lots for scalping
  const [sessionPnL, setSessionPnL] = useState(4850);
  const [tradesCount, setTradesCount] = useState(8);
  const [winCount, setWinCount] = useState(6);

  const [trades, setTrades] = useState<ScalpTrade[]>([
    {
      id: 'sclp_8',
      timestamp: '09:42:15 AM',
      type: 'CALL',
      strike: '24300 CE',
      entryPrice: 112.50,
      exitPrice: 118.80,
      lots: 2,
      qty: 130,
      target: 1500,
      stopLoss: 750,
      pnl: 819.00,
      durationSec: 42,
      status: 'CLOSED_WIN'
    },
    {
      id: 'sclp_7',
      timestamp: '09:38:04 AM',
      type: 'PUT',
      strike: '24300 PE',
      entryPrice: 98.20,
      exitPrice: 94.10,
      lots: 2,
      qty: 130,
      target: 1500,
      stopLoss: 750,
      pnl: -533.00,
      durationSec: 28,
      status: 'CLOSED_LOSS'
    },
    {
      id: 'sclp_6',
      timestamp: '09:33:50 AM',
      type: 'CALL',
      strike: '24250 CE',
      entryPrice: 134.00,
      exitPrice: 142.50,
      lots: 2,
      qty: 130,
      target: 1500,
      stopLoss: 750,
      pnl: 1105.00,
      durationSec: 55,
      status: 'CLOSED_WIN'
    }
  ]);

  // Tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 3.5;
      setNiftySpot(prev => Number((prev + delta).toFixed(2)));
      setOrderDelta(prev => {
        const c = Math.max(500, prev.calls + Math.floor((Math.random() - 0.45) * 150));
        const p = Math.max(300, prev.puts + Math.floor((Math.random() - 0.5) * 100));
        return { calls: c, puts: p, ratio: Number((c / p).toFixed(2)) };
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // 1-Tap Trigger Scalp Handlers
  const handleTriggerScalp = (type: 'CALL' | 'PUT') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const isWin = Math.random() > 0.3; // 70% win probability simulation
    const entry = type === 'CALL' ? 115.00 : 95.00;
    const diff = isWin ? 6.5 : -3.5;
    const exit = Number((entry + diff).toFixed(2));
    const tradePnl = Math.round(diff * 65 * currentLots);

    const newTrade: ScalpTrade = {
      id: `sclp_${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      type,
      strike: `${Math.round(niftySpot / 50) * 50} ${type === 'CALL' ? 'CE' : 'PE'}`,
      entryPrice: entry,
      exitPrice: exit,
      lots: currentLots,
      qty: currentLots * 65,
      target: 1500 * currentLots,
      stopLoss: 750 * currentLots,
      pnl: tradePnl,
      durationSec: Math.floor(Math.random() * 30) + 15,
      status: isWin ? 'CLOSED_WIN' : 'CLOSED_LOSS',
    };

    setTrades(prev => [newTrade, ...prev]);
    setSessionPnL(prev => prev + tradePnl);
    setTradesCount(prev => prev + 1);
    if (isWin) setWinCount(prev => prev + 1);
  };

  const handleFlattenAll = () => {
    alert('INSTANT 0ms FLATTEN: Closed all active scalping orders across NSE DMA socket.');
  };

  const winRate = tradesCount > 0 ? ((winCount / tradesCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 sm:space-y-8 relative z-10 animate-fade-in">
      
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/strategies"
              className="p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-[#7c3aed] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1a1a2e] font-heading flex items-center gap-2">
                  High-Frequency Nifty 1m Scalper <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono text-[10px] font-bold border border-[#10b981]/30">
                  SUB-SECOND DMA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Ultra-fast 1-minute candle option scalping engine. Targets +6 Nifty pts (+₹1,500/lot) with tight -3 pts (-₹750/lot) risk lock.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEngineActive(!isEngineActive)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isEngineActive
                ? 'bg-[#10b981] text-white hover:bg-[#059669]'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isEngineActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isEngineActive ? 'Scalper Engine Active' : 'Engine Paused'}
          </button>

          <button
            onClick={handleFlattenAll}
            className="px-4 py-2 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#ef4444]/20 cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" /> Flatten All (0ms)
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="card p-4 rounded-2xl border-l-4 border-l-[#7c3aed]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Nifty Spot</span>
          <span className="text-xl font-bold font-mono text-[#1a1a2e] block mt-0.5">
            {niftySpot.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">VWAP: ₹{vwapPrice.toFixed(2)}</span>
        </div>

        <div className="card p-4 rounded-2xl border-l-4 border-l-[#10b981]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scalping Session PnL</span>
          <span className={`text-xl font-bold font-mono block mt-0.5 ${sessionPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {sessionPnL >= 0 ? '+' : ''}₹{sessionPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#10b981] font-bold block mt-1">Win Rate: {winRate}% ({winCount}/{tradesCount})</span>
        </div>

        <div className="card p-4 rounded-2xl border-l-4 border-l-indigo-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Flow Delta</span>
          <span className="text-xl font-bold font-mono text-indigo-600 block mt-0.5">
            {orderDelta.ratio}x Call Heavy
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">+{orderDelta.calls} Call / -{orderDelta.puts} Put Vol</span>
        </div>

        <div className="card p-4 rounded-2xl border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Position Lot Size</span>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setCurrentLots(prev => Math.max(1, prev - 1))}
              className="w-6 h-6 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer"
            >
              -
            </button>
            <span className="text-xl font-bold font-mono text-[#1a1a2e]">{currentLots} Lots</span>
            <button
              onClick={() => setCurrentLots(prev => Math.min(10, prev + 1))}
              className="w-6 h-6 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">{currentLots * 65} Nifty Qty</span>
        </div>

        <div className="card p-4 rounded-2xl border-l-4 border-l-teal-500 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target / Stop Loss Lock</span>
          <span className="text-sm font-bold font-mono text-[#10b981] block mt-1">
            TP: +₹{(1500 * currentLots).toLocaleString()}
          </span>
          <span className="text-xs font-bold font-mono text-[#ef4444] block">
            SL: -₹{(750 * currentLots).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main 1-Tap Fast Scalper Triggers Panel */}
      <div className="card p-6 rounded-2xl border border-white/60 space-y-6 bg-gradient-to-br from-white/90 to-purple-50/40">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] font-heading flex items-center gap-2">
              ⚡ 1-Tap Instant DMA Scalp Triggers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clicking a trigger below fires a sub-10ms market order with pre-attached +6pt TP & -3pt SL bracket orders.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-xs font-bold">
            Latency: 4ms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instant CALL Scalp Button */}
          <button
            onClick={() => handleTriggerScalp('CALL')}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#10b981] to-emerald-600 hover:from-[#059669] hover:to-emerald-700 text-white shadow-lg shadow-[#10b981]/25 transition-all cursor-pointer group text-left relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 font-mono">BULLISH MOMENTUM</span>
              <TrendingUp className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold font-heading">BUY CALL SCALP</h3>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              Target: +₹{(1500 * currentLots).toLocaleString()} (+6 Pts) | SL: -₹{(750 * currentLots).toLocaleString()} (-3 Pts)
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs font-mono font-bold">
              <span>{currentLots} Lots ({currentLots * 65} Qty)</span>
              <span className="underline">Trigger Instant Order →</span>
            </div>
          </button>

          {/* Instant PUT Scalp Button */}
          <button
            onClick={() => handleTriggerScalp('PUT')}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#ef4444] to-rose-600 hover:from-[#dc2626] hover:to-rose-700 text-white shadow-lg shadow-[#ef4444]/25 transition-all cursor-pointer group text-left relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100 font-mono">BEARISH MOMENTUM</span>
              <TrendingDown className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold font-heading">BUY PUT SCALP</h3>
            <p className="text-xs text-rose-100 mt-1 font-medium">
              Target: +₹{(1500 * currentLots).toLocaleString()} (+6 Pts) | SL: -₹{(750 * currentLots).toLocaleString()} (-3 Pts)
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs font-mono font-bold">
              <span>{currentLots} Lots ({currentLots * 65} Qty)</span>
              <span className="underline">Trigger Instant Order →</span>
            </div>
          </button>
        </div>
      </div>

      {/* Live Scalp Order Log Table */}
      <div className="card rounded-2xl border border-white/60 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
          <span className="font-heading text-sm text-[#1a1a2e] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7c3aed]" /> Live Scalper Execution Log
          </span>
          <span className="font-mono text-[#7c3aed]">{trades.length} Scalp Executions Today</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Time</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Type & Strike</th>
                <th className="p-4">Lots / Qty</th>
                <th className="p-4 text-right">Entry → Exit</th>
                <th className="p-4 text-right">Duration</th>
                <th className="p-4 text-right">Net PnL</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-[#1a1a2e]">
              {trades.map(t => {
                const isWin = t.status === 'CLOSED_WIN';
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-500 text-[11px]">{t.timestamp}</td>
                    <td className="p-4 font-mono text-[#7c3aed] text-[11px] font-bold">{t.id}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        t.type === 'CALL' ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                      }`}>
                        {t.type} · {t.strike}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-700">{t.lots} Lots ({t.qty} Qty)</td>
                    <td className="p-4 text-right font-mono text-slate-700">₹{t.entryPrice.toFixed(2)} → ₹{t.exitPrice.toFixed(2)}</td>
                    <td className="p-4 text-right font-mono text-slate-500">{t.durationSec}s</td>
                    <td className={`p-4 text-right font-mono font-bold ${isWin ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isWin ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isWin ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                      }`}>
                        {isWin ? 'PROFIT +6 PTS' : 'LOSS -3 PTS'}
                      </span>
                    </td>
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
