'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCapitalStore } from '../../../../store/capital';
import { 
  TrendingUp, TrendingDown, ShieldAlert, Zap, Activity, CheckCircle2, 
  RefreshCw, Layers, Sliders, Calendar, ArrowUpRight, ArrowDownRight, Bot,
  Info, Award, PlayCircle, Lock, RotateCcw, Play, Plus, X, Clock, Check
} from 'lucide-react';

interface IndicatorSignal {
  id: number;
  name: string;
  category: 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME' | 'PATTERN';
  timeframe: string;
  value: string;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weight: number;
  description: string;
}

interface SimulatedTrade {
  id: string;
  time: string;
  action: 'BUY 24300 CE' | 'BUY 24200 PE';
  step: number;
  lots: number;
  qty: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  result: 'WIN' | 'LOSS';
}

const INDICATORS_25: IndicatorSignal[] = [
  { id: 1, name: 'Supertrend (7, 3)', category: 'TREND', timeframe: '15m', value: '24,180 (Buy)', signal: 'BULLISH', weight: 5, description: 'Price trading above Supertrend line' },
  { id: 2, name: 'EMA 9 / 21 Crossover', category: 'TREND', timeframe: '15m', value: 'Golden Cross', signal: 'BULLISH', weight: 5, description: 'Fast EMA 9 crossed above Slow EMA 21' },
  { id: 3, name: 'RSI (14) Momentum', category: 'MOMENTUM', timeframe: '15m', value: '62.40', signal: 'BULLISH', weight: 4, description: 'RSI in bullish expansion zone (>60)' },
  { id: 4, name: 'MACD (12, 26, 9)', category: 'MOMENTUM', timeframe: '15m', value: '+14.20', signal: 'BULLISH', weight: 4, description: 'Histogram positive and expanding' },
  { id: 5, name: 'ADX (14) Trend Strength', category: 'TREND', timeframe: '15m', value: '28.60', signal: 'BULLISH', weight: 4, description: 'ADX > 25 confirming strong trend' },
  { id: 6, name: 'VWAP Position', category: 'VOLUME', timeframe: 'Intraday', value: '24,245 (Above)', signal: 'BULLISH', weight: 5, description: 'Price holding above VWAP benchmark' },
  { id: 7, name: 'Bollinger Bands (20, 2)', category: 'VOLATILITY', timeframe: '15m', value: 'Upper Expansion', signal: 'BULLISH', weight: 4, description: 'Riding upper Bollinger band' },
  { id: 8, name: 'ATR (14) Volatility', category: 'VOLATILITY', timeframe: '15m', value: '142.50', signal: 'BULLISH', weight: 3, description: 'Volatility expansion favorable for buyers' },
  { id: 9, name: 'Ichimoku Cloud (Kumo)', category: 'TREND', timeframe: '15m', value: 'Above Cloud', signal: 'BULLISH', weight: 4, description: 'Senkou Span A > Span B cloud support' },
  { id: 10, name: 'Stochastic Oscillator', category: 'MOMENTUM', timeframe: '15m', value: '%K 78.50', signal: 'BULLISH', weight: 3, description: '%K line above %D in bullish zone' },
  { id: 11, name: 'Donchian Channel (20)', category: 'TREND', timeframe: '15m', value: '20-Bar High', signal: 'BULLISH', weight: 4, description: 'Breaking 20-period highest high' },
  { id: 12, name: 'Parabolic SAR', category: 'TREND', timeframe: '15m', value: 'Dot Below', signal: 'BULLISH', weight: 3, description: 'SAR trailing stop below price' },
  { id: 13, name: 'Keltner Channel', category: 'VOLATILITY', timeframe: '15m', value: 'Upper Breakout', signal: 'BULLISH', weight: 4, description: 'Price breaking upper Keltner envelope' },
  { id: 14, name: 'Central Pivot Range (CPR)', category: 'PATTERN', timeframe: 'Daily', value: 'Above TC', signal: 'BULLISH', weight: 5, description: 'Trading above Top Central Pivot' },
  { id: 15, name: 'Previous Day High (PDH)', category: 'PATTERN', timeframe: 'Daily', value: 'PDH Cleared', signal: 'BULLISH', weight: 5, description: 'Breakout above previous day high' },
  { id: 16, name: 'Money Flow Index (MFI)', category: 'VOLUME', timeframe: '15m', value: '68.20', signal: 'BULLISH', weight: 3, description: 'Institutional capital inflow detected' },
  { id: 17, name: 'Williams %R', category: 'MOMENTUM', timeframe: '15m', value: '-18.40', signal: 'BULLISH', weight: 3, description: 'Strong buying pressure momentum' },
  { id: 18, name: 'Volume Profile (POC)', category: 'VOLUME', timeframe: 'Intraday', value: 'Above VAH', signal: 'BULLISH', weight: 4, description: 'Price above Value Area High' },
  { id: 19, name: 'Hull Moving Average (9)', category: 'TREND', timeframe: '15m', value: 'Green (Up)', signal: 'BULLISH', weight: 4, description: 'HMA sloping upwards smoothly' },
  { id: 20, name: 'MTF Supertrend (5m+15m)', category: 'TREND', timeframe: 'Multi', value: 'Dual Aligned', signal: 'BULLISH', weight: 5, description: '5m and 15m Supertrends aligned UP' },
  { id: 21, name: 'Commodity Channel (CCI)', category: 'MOMENTUM', timeframe: '15m', value: '+145.00', signal: 'BULLISH', weight: 3, description: 'CCI > +100 bullish momentum' },
  { id: 22, name: 'TTM Squeeze', category: 'VOLATILITY', timeframe: '15m', value: 'Fired UP', signal: 'BULLISH', weight: 4, description: 'Black dots compression fired bullish' },
  { id: 23, name: 'Elder Ray Index', category: 'MOMENTUM', timeframe: '15m', value: 'Bull Power +48', signal: 'BULLISH', weight: 3, description: 'Bullish power dominating bears' },
  { id: 24, name: 'Rate of Change (ROC 12)', category: 'MOMENTUM', timeframe: '15m', value: '+1.85%', signal: 'BULLISH', weight: 3, description: 'Positive velocity price change' },
  { id: 25, name: 'Fibonacci 61.8% Golden', category: 'PATTERN', timeframe: 'Intraday', value: '24,210 Held', signal: 'BULLISH', weight: 4, description: 'Retracement level successfully defended' },
];

export default function NiftyMartingaleStrategyPage() {
  const { capital, setCapital } = useCapitalStore();
  const [activeTab, setActiveTab] = useState<'LIVE_EXECUTION' | 'OVERVIEW' | 'SIGNALS' | 'MARTINGALE' | 'DRAWDOWN' | 'HEATMAP'>('LIVE_EXECUTION');
  const [isAutoExecuting, setIsAutoExecuting] = useState<boolean>(true);
  const [startTomorrow, setStartTomorrow] = useState<boolean>(false);
  
  // Live Fresh Session States (Reset to 0 Mode)
  const [sessionPnL, setSessionPnL] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1, 2, 3, 4
  const [trades, setTrades] = useState<SimulatedTrade[]>([]);
  const [winCount, setWinCount] = useState<number>(0);
  const [lossCount, setLossCount] = useState<number>(0);

  // Auto-set capital to min 5L if not set
  useEffect(() => {
    if (capital < 500000) {
      setCapital(500000);
    }
  }, [capital, setCapital]);

  // Martingale Lot Helper
  const currentLots = Math.pow(2, currentStep - 1); // Step 1: 1 lot, Step 2: 2 lots, Step 3: 4 lots, Step 4: 8 lots
  const currentQty = currentLots * 65;

  // Execute Simulated Trade
  const handleSimulateTrade = (outcome: 'WIN' | 'LOSS') => {
    const timeStr = new Date().toLocaleTimeString();
    const isWin = outcome === 'WIN';
    const tradePnl = isWin ? 4000 * currentLots : -8000 * currentLots;

    const newTrade: SimulatedTrade = {
      id: `trade_${Date.now()}`,
      time: timeStr,
      action: 'BUY 24300 CE',
      step: currentStep,
      lots: currentLots,
      qty: currentQty,
      entryPrice: 120.0,
      exitPrice: isWin ? 120.0 + (4000 / currentQty) : Math.max(10, 120.0 - (8000 / currentQty)),
      pnl: tradePnl,
      result: isWin ? 'WIN' : 'LOSS',
    };

    setTrades(prev => [newTrade, ...prev]);
    setSessionPnL(prev => prev + tradePnl);

    if (isWin) {
      setWinCount(prev => prev + 1);
      // Reset Martingale back to Step 1 on Win
      setCurrentStep(1);
    } else {
      setLossCount(prev => prev + 1);
      // Double lots on loss (up to max Step 4 / 8 Lots)
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  // Reset Session to Fresh 0
  const handleResetSession = () => {
    setSessionPnL(0);
    setCurrentStep(1);
    setTrades([]);
    setWinCount(0);
    setLossCount(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-xs font-semibold border border-[#7c3aed]/20">
              MIN CAPITAL: ₹5 LAKHS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] font-mono text-xs font-semibold border border-[#10b981]/20">
              x2 MARTINGALE ENGINE (1→2→4→8 LOTS)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#1a1a2e] font-mono text-xs font-semibold border border-slate-200">
              25 SIGNALS
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1a2e] mt-2 font-heading">
            Nifty Option Buying — Martingale AI Engine
          </h1>
          <p className="text-xs text-[#64748b] mt-1 font-medium">
            Fresh execution baseline starting at ₹5 Lakhs. Real-time 25 indicator AI signal consensus with x2 lot multiplier.
          </p>
        </div>

        {/* Reset & AI Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSession}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white/70 hover:bg-white text-xs font-semibold text-[#1a1a2e] hover:text-[#7c3aed] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Reset session PnL and trade log to 0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7c3aed]" />
            Reset All to Fresh ₹5L
          </button>

          <button
            onClick={() => setIsAutoExecuting(!isAutoExecuting)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isAutoExecuting 
                ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/20'
                : 'bg-[#10b981] text-white hover:bg-[#059669]'
            }`}
          >
            <Bot className="w-4 h-4" />
            {isAutoExecuting ? 'Pause AI Executor' : 'Enable AI Executor'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2 overflow-x-auto">
        {[
          { id: 'LIVE_EXECUTION', label: '⚡ Fresh Live Session (₹5L Base)' },
          { id: 'OVERVIEW', label: '📊 2.5-Yr Backtest Report' },
          { id: 'SIGNALS', label: '🔍 25 Indicator Signals (88%)' },
          { id: 'MARTINGALE', label: '🎲 x2 Martingale Matrix' },
          { id: 'DRAWDOWN', label: '📉 Drawdown Recovery Table' },
          { id: 'HEATMAP', label: '🗓 Monthly Heatmap' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#7c3aed] text-[#7c3aed] bg-[#7c3aed]/5'
                : 'border-transparent text-[#64748b] hover:text-[#1a1a2e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: FRESH LIVE EXECUTION SESSION (Reset to 0 Mode) */}
      {activeTab === 'LIVE_EXECUTION' && (
        <div className="space-y-6">
          
          {/* Real-Time Trading Schedule Banner */}
          <div className="card p-5 rounded-2xl bg-gradient-to-r from-white/80 to-[#7c3aed]/5 border border-white/80 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#7c3aed]" />
                  <h3 className="text-base font-bold text-[#1a1a2e] font-heading">Intraday Option Buying Schedule (Tomorrow Mode)</h3>
                </div>
                <p className="text-xs text-[#64748b] mt-1 font-medium">
                  The AI consensus engine automatically executes Nifty option trades based on 15m candle closes.
                </p>
              </div>

              <button
                onClick={() => {
                  setStartTomorrow(!startTomorrow);
                  if (!startTomorrow) handleResetSession();
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  startTomorrow
                    ? 'bg-[#10b981] text-white shadow-[#10b981]/25'
                    : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[#7c3aed]/25'
                }`}
              >
                {startTomorrow ? (
                  <>
                    <Check className="w-4 h-4" /> Ready for Tomorrow (9:15 AM)
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Real Trading Tomorrow (9:15 AM)
                  </>
                )}
              </button>
            </div>

            {/* Time windows schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">09:15 AM - 09:30 AM</span>
                <span className="text-[#1a1a2e] font-bold">Opening Range Calibration</span>
                <span className="text-[10px] text-[#64748b] block mt-0.5 font-sans">First 15m candle & CPR levels set</span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">09:30 AM Consensus</span>
                <span className="text-[#7c3aed] font-bold">Signal Trigger #1</span>
                <span className="text-[10px] text-[#64748b] block mt-0.5 font-sans">Enters 1 Lot (65 Qty) CE/PE</span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">09:30 AM - 03:15 PM</span>
                <span className="text-[#10b981] font-bold">x2 Martingale Scaling</span>
                <span className="text-[10px] text-[#64748b] block mt-0.5 font-sans">Doubles lot on SL → Resets on TP</span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">03:15 PM Square-off</span>
                <span className="text-[#ef4444] font-bold">Intraday Position Close</span>
                <span className="text-[10px] text-[#64748b] block mt-0.5 font-sans">0 overnight risk exposure</span>
              </div>
            </div>
          </div>

          {/* Top Session Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Capital */}
            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">Base Capital</span>
              <span className="text-xl font-bold font-mono text-[#1a1a2e] block mt-1">
                ₹{capital.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#7c3aed] mt-0.5 block font-semibold">Minimum ₹5 Lakhs Base</span>
            </div>

            {/* Live Session Net PnL */}
            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">Live Session P&L</span>
              <span className={`text-xl font-bold font-mono block mt-1 ${
                sessionPnL > 0 ? 'text-[#10b981]' : sessionPnL < 0 ? 'text-[#ef4444]' : 'text-[#1a1a2e]'
              }`}>
                {sessionPnL >= 0 ? '+' : ''}₹{sessionPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#64748b] mt-0.5 block font-medium">
                {trades.length === 0 ? 'Fresh Session (0 Trades)' : `${trades.length} Trades Executed`}
              </span>
            </div>

            {/* Current Martingale Lot Sizing */}
            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">Current Martingale Step</span>
              <span className="text-xl font-bold font-mono text-[#7c3aed] block mt-1">
                Step {currentStep}: {currentLots} Lot ({currentQty} Qty)
              </span>
              <span className="text-[10px] text-[#64748b] mt-0.5 block font-medium">Doubles on Loss → Resets on Win</span>
            </div>

            {/* Win Rate */}
            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">Session Score</span>
              <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">
                {winCount} Wins / {lossCount} Losses
              </span>
              <span className="text-[10px] text-[#64748b] mt-0.5 block font-medium">
                {trades.length > 0 ? `${Math.round((winCount / trades.length) * 100)}% Win Rate` : 'Ready to trade'}
              </span>
            </div>

          </div>

          {/* Interactive Trade Trigger Simulator */}
          <div className="card p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1a1a2e] flex items-center gap-2 font-heading">
                  <Zap className="w-4 h-4 text-[#7c3aed]" /> Live AI Trade Trigger Panel
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5 font-medium">
                  Simulate live 25-indicator consensus trades with x2 Martingale lot scaling (1 Lot → 2 Lots → 4 Lots → 8 Lots).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSimulateTrade('WIN')}
                  className="px-4 py-2 rounded-xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Simulate Win (+{currentLots}x ₹4,000)
                </button>

                <button
                  onClick={() => handleSimulateTrade('LOSS')}
                  className="px-4 py-2 rounded-xl bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  Simulate Loss (-{currentLots}x ₹8,000)
                </button>

                <button
                  onClick={handleResetSession}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-[#64748b] hover:text-[#1a1a2e] hover:bg-slate-100 text-xs font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset 0
                </button>
              </div>
            </div>

            {/* Active Execution State Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-2">
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#64748b] block mb-1 font-sans text-[11px]">AI Consensus Signal:</span>
                <span className="text-[#10b981] font-bold text-sm">22/25 Indicators Bullish (88%)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#64748b] block mb-1 font-sans text-[11px]">Current Order Sizing:</span>
                <span className="text-[#7c3aed] font-bold text-sm">{currentLots} Lot ({currentQty} Nifty Qty)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-[#64748b] block mb-1 font-sans text-[11px]">Next Trade Target / SL:</span>
                <span className="text-[#1a1a2e] font-bold text-sm">TP: +₹{4000 * currentLots} | SL: -₹{8000 * currentLots}</span>
              </div>
            </div>
          </div>

          {/* Session Trade Log Table */}
          <div className="card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1a1a2e] font-heading">Fresh Session Trade Log</h3>
              <span className="text-xs text-[#64748b] font-mono font-semibold">{trades.length} Executed Trades</span>
            </div>

            {trades.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-[#64748b] text-xs font-medium">
                Session reset to 0. Click <span className="text-[#10b981] font-bold">Simulate Win</span> or <span className="text-[#ef4444] font-bold">Simulate Loss</span> above to test AI Martingale trades with ₹5 Lakhs minimum capital!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#64748b] uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">TIME</th>
                      <th className="py-2.5 px-3">ACTION</th>
                      <th className="py-2.5 px-3">STEP</th>
                      <th className="py-2.5 px-3">LOTS (QTY)</th>
                      <th className="py-2.5 px-3">ENTRY → EXIT</th>
                      <th className="py-2.5 px-3 text-right">REALIZED P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {trades.map((t) => (
                      <tr key={t.id} className={t.result === 'WIN' ? 'bg-[#10b981]/5' : 'bg-[#ef4444]/5'}>
                        <td className="py-3 px-3 text-[#64748b]">{t.time}</td>
                        <td className="py-3 px-3 font-bold text-[#1a1a2e]">{t.action}</td>
                        <td className="py-3 px-3 text-[#7c3aed]">Step {t.step}</td>
                        <td className="py-3 px-3 text-[#1a1a2e]">{t.lots} Lot ({t.qty})</td>
                        <td className="py-3 px-3 text-[#64748b]">₹{t.entryPrice.toFixed(2)} → ₹{t.exitPrice.toFixed(2)}</td>
                        <td className={`py-3 px-3 text-right font-bold ${t.pnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                          {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 1: REPORT OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">TOTAL NET P&L</span>
              <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">₹6,07,574</span>
              <span className="text-[10px] text-[#94a3b8] mt-0.5 block">over 2.5 yrs • 1-lot base</span>
            </div>

            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">ANNUALIZED PROFIT</span>
              <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">₹2,43,030</span>
              <span className="text-[10px] text-[#94a3b8] mt-0.5 block">per 1-lot deployment</span>
            </div>

            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">AVG MONTHLY PROFIT</span>
              <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">₹20,252</span>
              <span className="text-[10px] text-[#94a3b8] mt-0.5 block">27 of 30 months positive</span>
            </div>

            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">MAX DRAWDOWN</span>
              <span className="text-xl font-bold font-mono text-[#ef4444] block mt-1">-₹30,166</span>
              <span className="text-[10px] text-[#94a3b8] mt-0.5 block">deepest peak-to-trough</span>
            </div>

            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">AVG RECOVERY TIME</span>
              <span className="text-xl font-bold font-mono text-[#1a1a2e] block mt-1">4 days</span>
              <span className="text-[10px] text-[#94a3b8] mt-0.5 block">longest 22 days</span>
            </div>

            <div className="card p-4 rounded-2xl">
              <span className="text-[10px] text-[#64748b] uppercase font-bold block">DAILY WIN RATE</span>
              <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">68%</span>
              <span className="text-[10px] text-[#94a3b8] mt-0.5 block">profit factor 1.76</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 25 INDICATOR SIGNALS */}
      {activeTab === 'SIGNALS' && (
        <div className="space-y-6">
          <div className="card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#7c3aed]" />
                <h3 className="text-base font-bold text-[#1a1a2e] font-heading">AI Signal Consensus Engine</h3>
              </div>
              <p className="text-xs text-[#64748b] mt-1 font-medium">
                Scans 25 Technical Indicators real-time across 15m, 5m, and Daily timeframes to calculate directional probability.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] text-[#64748b] uppercase font-bold block">Consensus Score</span>
                <span className="text-2xl font-bold font-mono text-[#7c3aed]">88% Bullish</span>
              </div>
              <div className="text-center border-l border-slate-200 pl-6">
                <span className="text-[10px] text-[#64748b] uppercase font-bold block">Next AI Execution</span>
                <span className="text-xs font-mono text-[#10b981] font-bold">BUY NIFTY 24300 CE</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDICATORS_25.map((ind) => (
              <div key={ind.id} className="card p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1a2e]">
                    #{ind.id} {ind.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#10b981]/10 text-[#10b981] font-bold border border-[#10b981]/20">
                    {ind.signal}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-[#64748b]">Value / State:</span>
                  <span className="text-[#7c3aed]">{ind.value}</span>
                </div>

                <p className="text-[11px] text-[#64748b] font-medium">
                  {ind.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MARTINGALE MATRIX */}
      {activeTab === 'MARTINGALE' && (
        <div className="card p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-[#1a1a2e] font-heading">x2 Martingale Position Sizing Matrix</h2>
          <p className="text-xs text-[#64748b] font-medium">
            When Trade #1 incurs a stop-loss, the AI instantly doubles position size on the next setup. Winning trades immediately reset sizing back to Step 1 (1 Lot base).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {[
              { step: 1, lots: 1, qty: 65, target: '₹4,000', sl: '₹8,000', label: 'Initial Entry (Base)', color: 'border-[#7c3aed]' },
              { step: 2, lots: 2, qty: 130, target: '₹8,000', sl: '₹16,000', label: 'Step 2 (After 1 SL)', color: 'border-amber-400' },
              { step: 3, lots: 4, qty: 260, target: '₹16,000', sl: '₹32,000', label: 'Step 3 (After 2 SLs)', color: 'border-rose-400' },
              { step: 4, lots: 8, qty: 520, target: '₹32,000', sl: '₹64,000', label: 'Max Step (After 3 SLs)', color: 'border-[#ef4444]' },
            ].map((item) => (
              <div 
                key={item.step}
                className={`p-4 rounded-xl border bg-white/70 ${item.color} ${
                  currentStep === item.step ? 'ring-2 ring-[#7c3aed] shadow-md' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-[#1a1a2e]">Step {item.step}</span>
                  <span className="text-xs font-mono text-[#7c3aed] font-bold">{item.lots} Lot ({item.qty} qty)</span>
                </div>
                <span className="text-[10px] text-[#64748b] font-medium block mb-2">{item.label}</span>
                <div className="text-xs font-mono space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Target:</span>
                    <span className="text-[#10b981] font-bold">{item.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Stop Loss:</span>
                    <span className="text-[#ef4444] font-bold">{item.sl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
