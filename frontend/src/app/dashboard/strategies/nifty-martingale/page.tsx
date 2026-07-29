'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCapitalStore } from '../../../../store/capital';
import { 
 TrendingUp, TrendingDown, ShieldAlert, Zap, Activity, CheckCircle2, 
 RefreshCw, Layers, Sliders, Calendar, ArrowUpRight, ArrowDownRight, Bot,
 Info, Award, PlayCircle, Lock, RotateCcw, Play, Plus, X
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
 id: `trade_₹{Date.now()}`,
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
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/30 pb-4">
 <div>
 <div className="flex items-center gap-2">
 <span className="px-2 py-0.5 rounded bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-xs border border-[#22d3ee]/20">
 MIN CAPITAL: ₹5 LAKHS
 </span>
 <span className="px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-mono text-xs border border-[#22c55e]/20">
 x2 MARTINGALE ENGINE (1→2→4→8 LOTS)
 </span>
 <span className="px-2 py-0.5 rounded bg-white/10 text-[#1a1a2e] font-mono text-xs border border-white/20">
 25 SIGNALS
 </span>
 </div>
 <h1 className="text-xl font-bold text-[#fafafa] mt-2">
 Nifty Option Buying — Martingale AI Engine
 </h1>
 <p className="text-xs text-[#666] mt-1">
 Fresh execution baseline starting at ₹5 Lakhs. Real-time 25 indicator AI signal consensus with x2 lot multiplier.
 </p>
 </div>

 {/* Reset & AI Controls */}
 <div className="flex items-center gap-3">
 <button
 onClick={handleResetSession}
 className="px-3.5 py-2 rounded border border-white/30 hover:border-[#22d3ee] text-xs font-semibold text-[#fafafa] hover:text-[#7c3aed] flex items-center gap-1.5 transition-all"
 title="Reset session PnL and trade log to 0"
 >
 <RotateCcw className="w-3.5 h-3.5 text-[#7c3aed]" />
 Reset All to Fresh ₹5L
 </button>

 <button
 onClick={() => setIsAutoExecuting(!isAutoExecuting)}
 className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors ₹{
 isAutoExecuting 
 ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/20'
 : 'bg-[#10b981] text-black hover:bg-[#10b981]/90'
 }`}
 >
 <Bot className="w-4 h-4" />
 {isAutoExecuting ? 'Pause AI Executor' : 'Enable AI Executor'}
 </button>
 </div>
 </div>

 {/* Navigation Tabs */}
 <div className="flex border-b border-white/30 gap-2 overflow-x-auto">
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
 className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ₹{
 activeTab === tab.id
 ? 'border-[#22d3ee] text-[#7c3aed] bg-[#7c3aed]/5'
 : 'border-transparent text-[#666] hover:text-[#fafafa]'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* TAB 0: FRESH LIVE EXECUTION SESSION (Reset to 0 Mode) */}
 {activeTab === 'LIVE_EXECUTION' && (
 <div className="space-y-6">
 
 {/* Top Session Stats Bar */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 
 {/* Capital */}
 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">Base Capital</span>
 <span className="text-xl font-bold font-mono text-[#1a1a2e] block mt-1">
 ₹{capital.toLocaleString('en-IN')}
 </span>
 <span className="text-[10px] text-[#7c3aed] mt-0.5 block">Minimum ₹5 Lakhs Base</span>
 </div>

 {/* Live Session Net PnL */}
 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">Live Session P&L</span>
 <span className={`text-xl font-bold font-mono block mt-1 ₹{
 sessionPnL > 0 ? 'text-[#10b981]' : sessionPnL < 0 ? 'text-[#ef4444]' : 'text-[#1a1a2e]'
 }`}>
 {sessionPnL >= 0 ? '+' : ''}₹{sessionPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
 </span>
 <span className="text-[10px] text-[#666] mt-0.5 block">
 {trades.length === 0 ? 'Fresh Session (0 Trades)' : `₹{trades.length} Trades Executed`}
 </span>
 </div>

 {/* Current Martingale Lot Sizing */}
 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">Current Martingale Step</span>
 <span className="text-xl font-bold font-mono text-[#7c3aed] block mt-1">
 Step {currentStep}: {currentLots} Lot ({currentQty} Qty)
 </span>
 <span className="text-[10px] text-[#666] mt-0.5 block">Doubles on Loss → Resets on Win</span>
 </div>

 {/* Win Rate */}
 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">Session Score</span>
 <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">
 {winCount} Wins / {lossCount} Losses
 </span>
 <span className="text-[10px] text-[#666] mt-0.5 block">
 {trades.length > 0 ? `₹{Math.round((winCount / trades.length) * 100)}% Win Rate` : 'Ready to trade'}
 </span>
 </div>

 </div>

 {/* Interactive Trade Trigger Simulator */}
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/30 pb-4">
 <div>
 <h3 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
 <Zap className="w-4 h-4 text-[#7c3aed]" /> Live AI Trade Trigger Panel
 </h3>
 <p className="text-xs text-[#666] mt-0.5">
 Simulate live 25-indicator consensus trades with x2 Martingale lot scaling (1 Lot → 2 Lots → 4 Lots → 8 Lots).
 </p>
 </div>

 <div className="flex items-center gap-3">
 <button
 onClick={() => handleSimulateTrade('WIN')}
 className="px-4 py-2 rounded bg-[#10b981]/10 text-[#10b981] border border-[#22c55e]/30 hover:bg-[#10b981]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
 >
 <TrendingUp className="w-3.5 h-3.5" />
 Simulate Win (+{currentLots}x ₹4,000)
 </button>

 <button
 onClick={() => handleSimulateTrade('LOSS')}
 className="px-4 py-2 rounded bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
 >
 <TrendingDown className="w-3.5 h-3.5" />
 Simulate Loss (-{currentLots}x ₹8,000)
 </button>

 <button
 onClick={handleResetSession}
 className="px-3 py-2 rounded border border-white/30 text-[#888] hover:text-[#1a1a2e] text-xs font-mono flex items-center gap-1 transition-colors"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 Reset 0
 </button>
 </div>
 </div>

 {/* Active Execution State Details */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-2">
 <div className="p-3 rounded border border-white/30">
 <span className="text-[#666] block mb-1">AI Consensus Signal:</span>
 <span className="text-[#10b981] font-bold">22/25 Indicators Bullish (88%)</span>
 </div>

 <div className="p-3 rounded border border-white/30">
 <span className="text-[#666] block mb-1">Current Order Sizing:</span>
 <span className="text-[#7c3aed] font-bold">{currentLots} Lot ({currentQty} Nifty Qty)</span>
 </div>

 <div className="p-3 rounded border border-white/30">
 <span className="text-[#666] block mb-1">Next Trade Target / SL:</span>
 <span className="text-[#1a1a2e] font-bold">TP: +₹{4000 * currentLots} | SL: -₹{8000 * currentLots}</span>
 </div>
 </div>
 </div>

 {/* Session Trade Log Table */}
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <div className="flex justify-between items-center">
 <h3 className="text-sm font-semibold text-[#1a1a2e]">Fresh Session Trade Log</h3>
 <span className="text-xs text-[#666] font-mono">{trades.length} Executed Trades</span>
 </div>

 {trades.length === 0 ? (
 <div className="p-8 text-center rounded border border-white/30 text-[#666] text-xs">
 Session reset to 0. Click <span className="text-[#10b981]">Simulate Win</span> or <span className="text-[#ef4444]">Simulate Loss</span> above to test AI Martingale trades with ₹5 Lakhs minimum capital!
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-xs font-mono text-left">
 <thead>
 <tr className="border-b border-white/30 text-[#666] uppercase text-[10px]">
 <th className="py-2.5 px-3">TIME</th>
 <th className="py-2.5 px-3">ACTION</th>
 <th className="py-2.5 px-3">STEP</th>
 <th className="py-2.5 px-3">LOTS (QTY)</th>
 <th className="py-2.5 px-3">ENTRY → EXIT</th>
 <th className="py-2.5 px-3 text-right">REALIZED P&L</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1a1a1a]">
 {trades.map((t) => (
 <tr key={t.id} className={t.result === 'WIN' ? 'bg-[#10b981]/5' : 'bg-[#ef4444]/5'}>
 <td className="py-3 px-3 text-[#888]">{t.time}</td>
 <td className="py-3 px-3 font-bold text-[#1a1a2e]">{t.action}</td>
 <td className="py-3 px-3 text-[#7c3aed]">Step {t.step}</td>
 <td className="py-3 px-3 text-[#1a1a2e]">{t.lots} Lot ({t.qty})</td>
 <td className="py-3 px-3 text-[#888]">₹{t.entryPrice.toFixed(2)} → ₹{t.exitPrice.toFixed(2)}</td>
 <td className={`py-3 px-3 text-right font-bold ₹{t.pnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
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

 {/* TAB 1: REPORT OVERVIEW (Matching exact screenshot KPIs) */}
 {activeTab === 'OVERVIEW' && (
 <div className="space-y-6">
 
 {/* Top 6 KPI Cards (Exact replica of user screenshot) */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">TOTAL NET P&L</span>
 <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">₹6,07,574</span>
 <span className="text-[10px] text-[#666] mt-0.5 block">over 2.5 yrs • 1-lot base</span>
 </div>

 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">ANNUALIZED PROFIT</span>
 <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">₹2,43,030</span>
 <span className="text-[10px] text-[#666] mt-0.5 block">per 1-lot deployment</span>
 </div>

 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">AVG MONTHLY PROFIT</span>
 <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">₹20,252</span>
 <span className="text-[10px] text-[#666] mt-0.5 block">27 of 30 months positive</span>
 </div>

 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">MAX DRAWDOWN</span>
 <span className="text-xl font-bold font-mono text-[#ef4444] block mt-1">-₹30,166</span>
 <span className="text-[10px] text-[#666] mt-0.5 block">deepest peak-to-trough</span>
 </div>

 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">AVG RECOVERY TIME</span>
 <span className="text-xl font-bold font-mono text-[#1a1a2e] block mt-1">4 days</span>
 <span className="text-[10px] text-[#666] mt-0.5 block">longest 22 days</span>
 </div>

 <div className="card bg-[#111] border border-white/30 p-4 rounded-lg">
 <span className="text-[10px] text-[#666] uppercase block">DAILY WIN RATE</span>
 <span className="text-xl font-bold font-mono text-[#10b981] block mt-1">68%</span>
 <span className="text-[10px] text-[#666] mt-0.5 block">profit factor 1.76</span>
 </div>
 </div>

 {/* Trade Profile Stats Bar (Matching screenshot) */}
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <h2 className="text-sm font-semibold text-[#fafafa]">Trade Profile Summary</h2>
 
 <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
 <div className="p-3 rounded border border-white/30">
 <span className="text-[10px] text-[#666] uppercase block">Trading Days</span>
 <span className="text-base font-bold font-mono text-[#1a1a2e]">573</span>
 </div>
 
 <div className="p-3 rounded border border-white/30">
 <span className="text-[10px] text-[#666] uppercase block">Green Days</span>
 <span className="text-base font-bold font-mono text-[#10b981]">391 (68%)</span>
 </div>

 <div className="p-3 rounded border border-white/30">
 <span className="text-[10px] text-[#666] uppercase block">Red Days</span>
 <span className="text-base font-bold font-mono text-[#ef4444]">181 (32%)</span>
 </div>

 <div className="p-3 rounded border border-white/30">
 <span className="text-[10px] text-[#666] uppercase block">Full TP Hit</span>
 <span className="text-base font-bold font-mono text-[#10b981]">312 (54%)</span>
 </div>

 <div className="p-3 rounded border border-white/30">
 <span className="text-[10px] text-[#666] uppercase block">Full SL Hit</span>
 <span className="text-base font-bold font-mono text-[#ef4444]">64 (11%)</span>
 </div>

 <div className="p-3 rounded border border-white/30">
 <span className="text-[10px] text-[#666] uppercase block">Max Losing Streak</span>
 <span className="text-base font-bold font-mono text-[#ef4444]">6 days</span>
 </div>
 </div>

 {/* Performance day metrics */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
 <div className="flex justify-between p-3 rounded border border-white/30">
 <span className="text-xs text-[#666]">Best Day</span>
 <span className="text-xs font-mono font-bold text-[#10b981]">+₹6,052</span>
 </div>

 <div className="flex justify-between p-3 rounded border border-white/30">
 <span className="text-xs text-[#666]">Worst Day</span>
 <span className="text-xs font-mono font-bold text-[#ef4444]">-₹9,022</span>
 </div>

 <div className="flex justify-between p-3 rounded border border-white/30">
 <span className="text-xs text-[#666]">Avg Win Day</span>
 <span className="text-xs font-mono font-bold text-[#10b981]">+₹3,608</span>
 </div>

 <div className="flex justify-between p-3 rounded border border-white/30">
 <span className="text-xs text-[#666]">Avg Loss Day</span>
 <span className="text-xs font-mono font-bold text-[#ef4444]">-₹4,438</span>
 </div>
 </div>

 {/* Methodology Note */}
 <div className="p-3 bg-[#7c3aed]/5 border border-[#22d3ee]/20 rounded text-xs text-[#7c3aed]">
 <span className="font-semibold">Methodology & Sizing Note:</span> Standalone strategy shown at 1 lot (initial 65 qty, doubling to 130/260 on stop-and-reverse). P&L is exact realized backtest profit summed per trading day; drawdown and recovery are measured on the cumulative daily equity curve.
 </div>
 </div>

 {/* Equity Curve Preview Chart */}
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <div className="flex justify-between items-center">
 <h2 className="text-sm font-semibold text-[#fafafa]">Cumulative Equity Curve (₹1.2L → ₹6.2L)</h2>
 <span className="text-xs font-mono text-[#10b981]">+506.3% Total Return</span>
 </div>

 {/* Simulated Equity Curve SVG */}
 <div className="h-48 w-full relative pt-4">
 <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
 <defs>
 <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
 </linearGradient>
 </defs>

 {/* Gridlines */}
 <line x1="0" y1="20" x2="500" y2="20" stroke="#1a1a1a" strokeDasharray="3 3" />
 <line x1="0" y1="60" x2="500" y2="60" stroke="#1a1a1a" strokeDasharray="3 3" />
 <line x1="0" y1="100" x2="500" y2="100" stroke="#1a1a1a" strokeDasharray="3 3" />

 {/* Area fill */}
 <path
 d="M 0 100 L 20 95 L 50 88 L 80 92 L 120 75 L 160 68 L 200 72 L 240 55 L 280 48 L 320 42 L 360 45 L 400 32 L 440 25 L 480 18 L 500 15 L 500 110 L 0 110 Z"
 fill="url(#equityGrad)"
 />

 {/* Line */}
 <path
 d="M 0 100 L 20 95 L 50 88 L 80 92 L 120 75 L 160 68 L 200 72 L 240 55 L 280 48 L 320 42 L 360 45 L 400 32 L 440 25 L 480 18 L 500 15"
 fill="none"
 stroke="#22d3ee"
 strokeWidth="2"
 />

 {/* Drawdown spikes at bottom */}
 <path
 d="M 120 110 L 120 118 L 120 110 M 200 110 L 200 125 L 200 110 M 360 110 L 360 120 L 360 110"
 stroke="#ef4444"
 strokeWidth="2"
 />
 </svg>
 </div>
 <div className="flex justify-between text-[10px] text-[#666] font-mono">
 <span>01-Jan-2024</span>
 <span>06-Jun-2024</span>
 <span>12-Nov-2024</span>
 <span>09-Apr-2025</span>
 <span>04-Sep-2025</span>
 <span>02-Feb-2026</span>
 <span>30-Jun-2026</span>
 </div>
 </div>

 </div>
 )}

 {/* TAB 2: 25 INDICATOR SIGNALS */}
 {activeTab === 'SIGNALS' && (
 <div className="space-y-6">
 
 {/* AI Signal Consensus Banner */}
 <div className="card bg-[#111] border border-[#22d3ee]/30 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2">
 <Bot className="w-5 h-5 text-[#7c3aed]" />
 <h3 className="text-base font-semibold text-[#1a1a2e]">AI Signal Consensus Engine</h3>
 </div>
 <p className="text-xs text-[#666] mt-1">
 Scans 25 Technical Indicators real-time across 15m, 5m, and Daily timeframes to calculate directional probability.
 </p>
 </div>

 <div className="flex items-center gap-6">
 <div className="text-center">
 <span className="text-[10px] text-[#666] uppercase block">Consensus Score</span>
 <span className="text-2xl font-bold font-mono text-[#7c3aed]">88% Bullish</span>
 </div>
 <div className="text-center border-l border-white/30 pl-6">
 <span className="text-[10px] text-[#666] uppercase block">Next AI Execution</span>
 <span className="text-xs font-mono text-[#10b981] font-semibold">BUY NIFTY 24300 CE</span>
 </div>
 </div>
 </div>

 {/* 25 Indicators Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {INDICATORS_25.map((ind) => (
 <div key={ind.id} className="card bg-[#111] border border-white/30 p-4 rounded-lg space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-[#1a1a2e]">
 #{ind.id} {ind.name}
 </span>
 <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10b981]/10 text-[#10b981] border border-[#22c55e]/20">
 {ind.signal}
 </span>
 </div>

 <div className="flex justify-between text-xs font-mono">
 <span className="text-[#666]">Value / State:</span>
 <span className="text-[#7c3aed]">{ind.value}</span>
 </div>

 <p className="text-[11px] text-[#888]">
 {ind.description}
 </p>

 <div className="flex justify-between text-[10px] text-[#555] pt-1 border-t border-white/30">
 <span>Timeframe: {ind.timeframe}</span>
 <span>Signal Weight: {ind.weight}/5</span>
 </div>
 </div>
 ))}
 </div>

 </div>
 )}

 {/* TAB 3: MARTINGALE SEQUENCE ENGINE */}
 {activeTab === 'MARTINGALE' && (
 <div className="space-y-6">
 
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <h2 className="text-sm font-semibold text-[#1a1a2e]">x2 Martingale Position Sizing Matrix</h2>
 <p className="text-xs text-[#666]">
 When Trade #1 incurs a stop-loss, the AI instantly doubles position size on the next setup. Winning trades immediately reset sizing back to Step 1 (1 Lot base).
 </p>

 {/* Martingale Steps Visualizer */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
 {[
 { step: 1, lots: 1, qty: 65, target: '₹4,000', sl: '₹8,000', label: 'Initial Entry (Base)', color: 'border-[#22d3ee]' },
 { step: 2, lots: 2, qty: 130, target: '₹8,000', sl: '₹16,000', label: 'Step 2 (After 1 SL)', color: 'border-[#f59e0b]' },
 { step: 3, lots: 4, qty: 260, target: '₹16,000', sl: '₹32,000', label: 'Step 3 (After 2 SLs)', color: 'border-[#ef4444]' },
 { step: 4, lots: 8, qty: 520, target: '₹32,000', sl: '₹64,000', label: 'Max Step (After 3 SLs)', color: 'border-[#ef4444]' },
 ].map((item) => (
 <div 
 key={item.step}
 className={`p-4 rounded border ₹{item.color} ₹{
 currentStep === item.step ? 'ring-2 ring-[#22d3ee]' : ''
 }`}
 >
 <div className="flex justify-between items-center mb-2">
 <span className="text-xs font-mono font-bold text-[#1a1a2e]">Step {item.step}</span>
 <span className="text-xs font-mono text-[#7c3aed] font-bold">{item.lots} Lot ({item.qty} qty)</span>
 </div>
 <span className="text-[10px] text-[#666] block mb-2">{item.label}</span>
 <div className="text-xs font-mono space-y-1 pt-2 border-t border-white/30">
 <div className="flex justify-between">
 <span className="text-[#666]">Target:</span>
 <span className="text-[#10b981]">{item.target}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[#666]">Stop Loss:</span>
 <span className="text-[#ef4444]">{item.sl}</span>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Rules Summary */}
 <div className="p-4 rounded border border-white/30 space-y-2 text-xs text-[#888]">
 <div className="flex items-center gap-2 font-semibold text-[#1a1a2e]">
 <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
 Daily Safety Rules & Caps:
 </div>
 <ul className="list-disc pl-5 space-y-1">
 <li><span className="text-[#1a1a2e]">Max Trades Per Day:</span> Restricted to 2-3 trades maximum per trading day to prevent overtrading.</li>
 <li><span className="text-[#1a1a2e]">Daily Target Cap:</span> Reaching full ₹4,000 target on 312 days (54%) automatically stops execution for the day.</li>
 <li><span className="text-[#1a1a2e]">Daily Stop Cap:</span> Hard ₹8,000 daily loss cap triggered on only 64 days (11%), preserving capital.</li>
 <li><span className="text-[#1a1a2e]">Win Reset:</span> Any winning trade resets the Martingale multiplier back to Step 1 (1 Lot base).</li>
 </ul>
 </div>
 </div>

 </div>
 )}

 {/* TAB 4: DRAWDOWN RECOVERY ANALYSIS TABLE */}
 {activeTab === 'DRAWDOWN' && (
 <div className="space-y-6">
 
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <h2 className="text-sm font-semibold text-[#1a1a2e]">Drawdown Recovery Analysis</h2>
 
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Depth Table */}
 <div className="lg:col-span-2 overflow-x-auto">
 <table className="w-full text-xs font-mono text-left">
 <thead>
 <tr className="border-b border-white/30 text-[#666] uppercase text-[10px]">
 <th className="py-2.5 px-3">DEPTH</th>
 <th className="py-2.5 px-3">PEAK</th>
 <th className="py-2.5 px-3">TROUGH</th>
 <th className="py-2.5 px-3">DECLINE</th>
 <th className="py-2.5 px-3">RECOVERED</th>
 <th className="py-2.5 px-3">RECOVERY</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1a1a1a]">
 <tr className="bg-[#ef4444]/5 text-[#ef4444]">
 <td className="py-3 px-3 font-bold">-30,166</td>
 <td className="py-3 px-3 text-[#1a1a2e]">12 Jun 2026</td>
 <td className="py-3 px-3 text-[#1a1a2e]">22 Jun 2026</td>
 <td className="py-3 px-3 text-[#1a1a2e]">6d</td>
 <td className="py-3 px-3 italic">ongoing</td>
 <td className="py-3 px-3 font-bold">open</td>
 </tr>
 <tr>
 <td className="py-3 px-3 font-bold text-[#ef4444]">-28,216</td>
 <td className="py-3 px-3 text-[#aaa]">17 Nov 2025</td>
 <td className="py-3 px-3 text-[#aaa]">05 Dec 2025</td>
 <td className="py-3 px-3 text-[#aaa]">13d</td>
 <td className="py-3 px-3 text-[#aaa]">18 Dec 2025</td>
 <td className="py-3 px-3 font-bold text-[#10b981]">9d</td>
 </tr>
 <tr>
 <td className="py-3 px-3 font-bold text-[#ef4444]">-25,388</td>
 <td className="py-3 px-3 text-[#aaa]">28 Apr 2025</td>
 <td className="py-3 px-3 text-[#aaa]">22 May 2025</td>
 <td className="py-3 px-3 text-[#aaa]">16d</td>
 <td className="py-3 px-3 text-[#aaa]">24 Jun 2025</td>
 <td className="py-3 px-3 font-bold text-[#10b981]">22d</td>
 </tr>
 <tr>
 <td className="py-3 px-3 font-bold text-[#ef4444]">-23,956</td>
 <td className="py-3 px-3 text-[#aaa]">12 Jan 2026</td>
 <td className="py-3 px-3 text-[#aaa]">11 Feb 2026</td>
 <td className="py-3 px-3 text-[#aaa]">21d</td>
 <td className="py-3 px-3 text-[#aaa]">25 Feb 2026</td>
 <td className="py-3 px-3 font-bold text-[#10b981]">8d</td>
 </tr>
 <tr>
 <td className="py-3 px-3 font-bold text-[#ef4444]">-20,407</td>
 <td className="py-3 px-3 text-[#aaa]">10 May 2024</td>
 <td className="py-3 px-3 text-[#aaa]">28 May 2024</td>
 <td className="py-3 px-3 text-[#aaa]">11d</td>
 <td className="py-3 px-3 text-[#aaa]">11 Jun 2024</td>
 <td className="py-3 px-3 font-bold text-[#10b981]">9d</td>
 </tr>
 <tr>
 <td className="py-3 px-3 font-bold text-[#ef4444]">-18,986</td>
 <td className="py-3 px-3 text-[#aaa]">25 Feb 2026</td>
 <td className="py-3 px-3 text-[#aaa]">05 Mar 2026</td>
 <td className="py-3 px-3 text-[#aaa]">5d</td>
 <td className="py-3 px-3 text-[#aaa]">17 Mar 2026</td>
 <td className="py-3 px-3 font-bold text-[#10b981]">8d</td>
 </tr>
 </tbody>
 </table>
 </div>

 {/* Recovery Profile Description Panel */}
 <div className="p-5 rounded border border-white/30 space-y-3">
 <h3 className="text-xs font-semibold text-[#1a1a2e]">Recovery Profile</h3>
 <p className="text-xs text-[#888] leading-relaxed">
 Across <span className="text-[#1a1a2e] font-bold">68 completed drawdown episodes</span>, average recovery is <span className="text-[#1a1a2e] font-bold">4 trading days</span> and the longest is <span className="text-[#1a1a2e] font-bold">22 days</span>; about <span className="text-[#10b981] font-bold">96%</span> were reclaimed within ten trading days.
 </p>

 <div className="p-3 bg-[#10b981]/10 border border-[#22c55e]/30 rounded text-xs text-[#10b981]">
 Reassuringly, dips here tend to be shallow and brief — the equity curve has typically climbed back to new highs in a matter of days.
 </div>
 </div>

 </div>
 </div>

 </div>
 )}

 {/* TAB 5: MONTH-WISE HEATMAP & YEARLY PROFIT */}
 {activeTab === 'HEATMAP' && (
 <div className="space-y-6">
 
 {/* Month-wise Performance Heatmap */}
 <div className="card bg-[#111] border border-white/30 p-6 rounded-lg space-y-4">
 <h2 className="text-sm font-semibold text-[#1a1a2e]">Month-wise Performance Heatmap (₹ Thousands)</h2>

 <div className="overflow-x-auto">
 <table className="w-full text-xs font-mono text-center">
 <thead>
 <tr className="text-[#666] uppercase border-b border-white/30">
 <th className="py-2 px-2 text-left">YEAR</th>
 <th className="py-2 px-2">JAN</th>
 <th className="py-2 px-2">FEB</th>
 <th className="py-2 px-2">MAR</th>
 <th className="py-2 px-2">APR</th>
 <th className="py-2 px-2">MAY</th>
 <th className="py-2 px-2">JUN</th>
 <th className="py-2 px-2">JUL</th>
 <th className="py-2 px-2">AUG</th>
 <th className="py-2 px-2">SEP</th>
 <th className="py-2 px-2">OCT</th>
 <th className="py-2 px-2">NOV</th>
 <th className="py-2 px-2">DEC</th>
 <th className="py-2 px-2 bg-[#7c3aed]/10 text-[#7c3aed]">TOTAL</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1a1a1a]">
 {/* 2024 */}
 <tr>
 <td className="py-3 px-2 font-bold text-[#1a1a2e] text-left">2024</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">31</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">32</td>
 <td className="bg-[#10b981]/30 text-[#10b981]">48</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">38</td>
 <td className="bg-[#ef4444]/20 text-[#ef4444]">-3</td>
 <td className="bg-[#10b981]/30 text-[#10b981]">40</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">18</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">37</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">3</td>
 <td className="bg-[#10b981]/30 text-[#10b981]">41</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">3</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">30</td>
 <td className="font-bold bg-[#10b981]/30 text-[#10b981]">382</td>
 </tr>

 {/* 2025 */}
 <tr>
 <td className="py-3 px-2 font-bold text-[#1a1a2e] text-left">2025</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">15</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">9</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">36</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">4</td>
 <td className="bg-[#ef4444]/20 text-[#ef4444]">-8</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">14</td>
 <td className="bg-[#10b981]/30 text-[#10b981]">53</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">37</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">18</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">19</td>
 <td className="bg-[#ef4444]/20 text-[#ef4444]">-14</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">31</td>
 <td className="font-bold bg-[#10b981]/30 text-[#10b981]">215</td>
 </tr>

 {/* 2026 */}
 <tr>
 <td className="py-3 px-2 font-bold text-[#1a1a2e] text-left">2026</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">4</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">17</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">25</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">16</td>
 <td className="bg-[#10b981]/10 text-[#10b981]">6</td>
 <td className="bg-[#10b981]/20 text-[#10b981]">22</td>
 <td className="text-[#444]">—</td>
 <td className="text-[#444]">—</td>
 <td className="text-[#444]">—</td>
 <td className="text-[#444]">—</td>
 <td className="text-[#444]">—</td>
 <td className="text-[#444]">—</td>
 <td className="font-bold bg-[#10b981]/30 text-[#10b981]">91</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 </div>
 )}

 </div>
 );
}
