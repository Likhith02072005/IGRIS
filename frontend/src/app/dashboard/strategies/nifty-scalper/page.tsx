'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, TrendingUp, TrendingDown, RefreshCw, AlertOctagon, ArrowLeft, CheckCircle2, Play, Pause,
  ShieldCheck, Activity, BarChart2, DollarSign, Clock, Layers, Flame, Shield, Lock, Sliders,
  ChevronDown, CreditCard, Percent, Sparkles
} from 'lucide-react';

import { useCapitalStore } from '../../../../store/capital';

interface ScalpTrade {
  id: string;
  timestamp: string;
  type: 'CALL' | 'PUT';
  isHedged: boolean;
  strike: string;
  hedgeLegStrike?: string;
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

const LOT_OPTIONS = [
  { lots: 1, qty: 65, label: '1 Lot (65 Nifty Qty)' },
  { lots: 2, qty: 130, label: '2 Lots (130 Nifty Qty)' },
  { lots: 3, qty: 195, label: '3 Lots (195 Nifty Qty)' },
  { lots: 4, qty: 260, label: '4 Lots (260 Nifty Qty)' },
  { lots: 5, qty: 325, label: '5 Lots (325 Nifty Qty)' },
  { lots: 8, qty: 520, label: '8 Lots (520 Nifty Qty)' },
  { lots: 10, qty: 650, label: '10 Lots (650 Nifty Qty)' },
  { lots: 20, qty: 1300, label: '20 Lots (1,300 Nifty Qty)' },
];

export default function NiftyScalperConsole() {
  const { capital } = useCapitalStore();
  
  // Ticker states
  const [niftySpot, setNiftySpot] = useState(24305.40);
  const [orderDelta, setOrderDelta] = useState({ calls: 2450, puts: 890, ratio: 2.75 });
  const [vwapPrice, setVwapPrice] = useState(24298.20);
  
  // Scalper state
  const [isEngineActive, setIsEngineActive] = useState(true);
  const [isHedgedMode, setIsHedgedMode] = useState(true); // Default Delta-Hedged mode ENABLED
  const [currentLots, setCurrentLots] = useState(2); // Selected lots from dropdown
  const [sessionPnL, setSessionPnL] = useState(6250);
  const [tradesCount, setTradesCount] = useState(10);
  const [winCount, setWinCount] = useState(8);

  // Margin math
  const qty = currentLots * 65;
  const atmPremium = 115.00;
  const otmHedgePremium = 12.50;
  
  const nakedOutflow = Math.round(qty * atmPremium);
  const hedgedOutflow = Math.round(qty * (atmPremium + otmHedgePremium));
  const activeOutflow = isHedgedMode ? hedgedOutflow : nakedOutflow;
  
  const nakedSpanMargin = Math.round(qty * atmPremium);
  const hedgedSpanMargin = Math.round(qty * (atmPremium + otmHedgePremium));
  const spanMarginBenefit = Math.round(qty * 125); // ₹125/qty margin credit benefit on spread

  const [trades, setTrades] = useState<ScalpTrade[]>([
    {
      id: 'sclp_10',
      timestamp: '09:44:12 AM',
      type: 'CALL',
      isHedged: true,
      strike: '24300 CE (ATM)',
      hedgeLegStrike: '24450 CE (OTM Hedge)',
      entryPrice: 112.50,
      exitPrice: 119.20,
      lots: 2,
      qty: 130,
      target: 1200,
      stopLoss: 450,
      pnl: 871.00,
      durationSec: 38,
      status: 'CLOSED_WIN'
    },
    {
      id: 'sclp_9',
      timestamp: '09:41:05 AM',
      type: 'PUT',
      isHedged: true,
      strike: '24300 PE (ATM)',
      hedgeLegStrike: '24150 PE (OTM Hedge)',
      entryPrice: 98.20,
      exitPrice: 95.10,
      lots: 2,
      qty: 130,
      target: 1200,
      stopLoss: 450,
      pnl: -403.00,
      durationSec: 25,
      status: 'CLOSED_LOSS'
    },
    {
      id: 'sclp_8',
      timestamp: '09:38:15 AM',
      type: 'CALL',
      isHedged: false,
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

  // 1-Tap Trigger Scalp Handlers (Hedged or Naked)
  const handleTriggerScalp = (type: 'CALL' | 'PUT') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const isWin = Math.random() > 0.25; // 75% win rate when hedged
    const entry = type === 'CALL' ? 115.00 : 95.00;
    
    const diff = isHedgedMode
      ? (isWin ? 5.2 : -2.2)  // Hedged: Smaller risk, capped loss
      : (isWin ? 6.5 : -3.5); // Naked: Standard risk

    const exit = Number((entry + diff).toFixed(2));
    const tradePnl = Math.round(diff * 65 * currentLots);
    const atmStrike = Math.round(niftySpot / 50) * 50;

    const newTrade: ScalpTrade = {
      id: `sclp_${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      type,
      isHedged: isHedgedMode,
      strike: `${atmStrike} ${type === 'CALL' ? 'CE (ATM)' : 'PE (ATM)'}`,
      hedgeLegStrike: isHedgedMode
        ? `${type === 'CALL' ? atmStrike + 150 : atmStrike - 150} ${type === 'CALL' ? 'CE (OTM Hedge)' : 'PE (OTM Hedge)'}`
        : undefined,
      entryPrice: entry,
      exitPrice: exit,
      lots: currentLots,
      qty: currentLots * 65,
      target: (isHedgedMode ? 1200 : 1500) * currentLots,
      stopLoss: (isHedgedMode ? 450 : 750) * currentLots,
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
    alert('INSTANT 0ms FLATTEN: Closed all main & hedge leg positions simultaneously across NSE DMA socket.');
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
              className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-[#7c3aed] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#1a1a2e] font-heading flex items-center gap-2">
                  High-Frequency Nifty Scalper + Risk Hedge Engine <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" /> DELTA HEDGE READY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Sub-second option scalping with optional OTM Wing Delta Hedging. Locks drawdown to a strict rupee cap.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Hedging Mode Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-200/60 border border-slate-300/60">
            <button
              onClick={() => setIsHedgedMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isHedgedMode ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Naked Scalp
            </button>
            <button
              onClick={() => setIsHedgedMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isHedgedMode ? 'bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/25' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Hedged Scalp
            </button>
          </div>

          <button
            onClick={() => setIsEngineActive(!isEngineActive)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isEngineActive
                ? 'bg-[#10b981] text-white hover:bg-[#059669]'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isEngineActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isEngineActive ? 'Engine Active' : 'Paused'}
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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delta Neutral Shield</span>
          <span className="text-xl font-bold font-mono text-indigo-600 block mt-0.5">
            {isHedgedMode ? 'Δ ±0.12 (Hedged)' : 'Δ ±0.52 (Naked)'}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">OTM Protection Leg Paired</span>
        </div>

        {/* Dynamic Dropdown Lot Size Selector */}
        <div className="card p-4 rounded-2xl border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Position Lot Quantity</span>
          <div className="relative mt-1">
            <select
              value={currentLots}
              onChange={(e) => setCurrentLots(Number(e.target.value))}
              className="w-full bg-white/90 border border-slate-300 font-bold text-[#1a1a2e] text-xs py-1.5 px-2.5 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-[#7c3aed]"
            >
              {LOT_OPTIONS.map(opt => (
                <option key={opt.lots} value={opt.lots}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2 pointer-events-none" />
          </div>
          <span className="text-[10px] text-amber-600 font-bold block mt-1.5">{qty} Nifty Quantity</span>
        </div>

        {/* Live Margin Required Calculator */}
        <div className="card p-4 rounded-2xl border-l-4 border-l-teal-500 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margin Required (SPAN)</span>
          <span className="text-base font-bold font-mono text-[#7c3aed] block mt-0.5">
            ₹{activeOutflow.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> ₹{spanMarginBenefit.toLocaleString()} Margin Offset
          </span>
        </div>
      </div>

      {/* Margin Required & Hedging Breakdown Bar */}
      <div className="card p-4 sm:p-5 rounded-2xl border border-white/60 bg-gradient-to-r from-purple-50/60 to-indigo-50/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Required Capital / Outflow</span>
            <span className="text-sm font-bold font-mono text-[#1a1a2e]">₹{activeOutflow.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Hedge Protection Leg</span>
            <span className="text-xs font-bold text-indigo-700">
              {isHedgedMode ? `+ ${currentLots} Lots OTM Wing Leg` : 'Naked Directional (No Hedge)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Exchange Margin Offset</span>
            <span className="text-xs font-bold text-emerald-600">
              {isHedgedMode ? `Save ₹${spanMarginBenefit.toLocaleString()} Span Credit` : 'Standard Premium Outflow'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 1-Tap Fast Scalper Triggers Panel */}
      <div className="card p-6 rounded-2xl border border-white/60 space-y-6 bg-gradient-to-br from-white/90 to-purple-50/40">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] font-heading flex items-center gap-2">
              ⚡ 1-Tap Instant DMA Scalp & Hedge Triggers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fires simultaneous market orders for main scalp and OTM protection leg with sub-10ms execution.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-xs font-bold">
            Selected: {currentLots} Lots ({qty} Qty)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CALL Trigger */}
          <button
            onClick={() => handleTriggerScalp('CALL')}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#10b981] to-emerald-600 hover:from-[#059669] hover:to-emerald-700 text-white shadow-lg shadow-[#10b981]/25 transition-all cursor-pointer group text-left relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 font-mono">
                {isHedgedMode ? 'HEDGED BULL SPREAD' : 'BULLISH MOMENTUM'}
              </span>
              <TrendingUp className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold font-heading">
              {isHedgedMode ? 'BUY HEDGED CALL SPREAD' : 'BUY CALL SCALP'}
            </h3>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              Target: +₹{((isHedgedMode ? 1200 : 1500) * currentLots).toLocaleString()} | Max Risk: -₹{((isHedgedMode ? 450 : 750) * currentLots).toLocaleString()}
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs font-mono font-bold">
              <span>{currentLots} Lots ({qty} Qty) · Margin: ₹{activeOutflow.toLocaleString()}</span>
              <span className="underline">Trigger {isHedgedMode ? 'Hedged Order' : 'Instant Order'} →</span>
            </div>
          </button>

          {/* PUT Trigger */}
          <button
            onClick={() => handleTriggerScalp('PUT')}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#ef4444] to-rose-600 hover:from-[#dc2626] hover:to-rose-700 text-white shadow-lg shadow-[#ef4444]/25 transition-all cursor-pointer group text-left relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100 font-mono">
                {isHedgedMode ? 'HEDGED BEAR SPREAD' : 'BEARISH MOMENTUM'}
              </span>
              <TrendingDown className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold font-heading">
              {isHedgedMode ? 'BUY HEDGED PUT SPREAD' : 'BUY PUT SCALP'}
            </h3>
            <p className="text-xs text-rose-100 mt-1 font-medium">
              Target: +₹{((isHedgedMode ? 1200 : 1500) * currentLots).toLocaleString()} | Max Risk: -₹{((isHedgedMode ? 450 : 750) * currentLots).toLocaleString()}
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs font-mono font-bold">
              <span>{currentLots} Lots ({qty} Qty) · Margin: ₹{activeOutflow.toLocaleString()}</span>
              <span className="underline">Trigger {isHedgedMode ? 'Hedged Order' : 'Instant Order'} →</span>
            </div>
          </button>
        </div>
      </div>

      {/* Live Scalp & Hedge Order Log Table */}
      <div className="card rounded-2xl border border-white/60 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
          <span className="font-heading text-sm text-[#1a1a2e] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7c3aed]" /> Live Scalper & Hedging Execution Log
          </span>
          <span className="font-mono text-[#7c3aed]">{trades.length} Executions Today</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Time</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Strategy Mode</th>
                <th className="p-4">Primary Strike & Hedge Leg</th>
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.isHedged ? 'bg-indigo-500/15 text-indigo-700 border border-indigo-500/30' : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                      }`}>
                        {t.isHedged ? 'DELTA HEDGED' : 'NAKED SCALP'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[#1a1a2e] block">{t.strike}</span>
                      {t.hedgeLegStrike && (
                        <span className="text-[10px] text-indigo-600 font-mono block mt-0.5">
                          + Leg: {t.hedgeLegStrike}
                        </span>
                      )}
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
                        {isWin ? 'PROFIT' : 'CAPPED LOSS'}
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
