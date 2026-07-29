'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, ShieldCheck, Power, RefreshCw, Layers, TrendingUp, TrendingDown,
  Play, Pause, AlertOctagon, Activity, Network, CircleDollarSign, Zap, RotateCcw, ChevronRight,
  ArrowRight, CheckCircle2, Cpu, Server, Database, Radio
} from 'lucide-react';

import { useCapitalStore } from '../../../store/capital';

interface RunningStrategy {
  id: string;
  name: string;
  href: string;
  status: 'RUNNING' | 'PAUSED' | 'SUSPENDED';
  position: string;
  allocPct: number;
  todayReturn: number;
  overallReturn: number;
  drawdown: number;
  exposure: number;
  risk: string;
  latency: number;
  broker: string;
  connection: 'CONNECTED' | 'DISCONNECTED';
  health: number;
  aiScore: number;
}

const flowSteps = [
  {
    id: 'step1',
    step: '01',
    title: 'Market Tick Feed',
    subtitle: 'NSE L2 Websocket Sockets',
    icon: Radio,
    color: 'from-blue-500 to-cyan-500',
    detail: 'Streaming 100ms real-time Nifty 50 tick price data, order book depth, and live PCR options chain volume.',
    latency: '3ms',
    status: 'ACTIVE',
  },
  {
    id: 'step2',
    step: '02',
    title: '25-Indicator AI Engine',
    subtitle: 'Consensus Signal Scoring',
    icon: Cpu,
    color: 'from-[#7c3aed] to-indigo-600',
    detail: 'Aggregates 25 quantitative technical signals (Supertrend, VWAP, EMA, RSI, MACD, Order Flow). Requires 20/25 (80%) consensus to trigger order.',
    latency: '2ms',
    status: '22/25 BULLISH',
  },
  {
    id: 'step3',
    step: '03',
    title: 'Martingale Lot Scaler',
    subtitle: 'Dynamic Lot Multiplier',
    icon: Activity,
    color: 'from-purple-500 to-pink-500',
    detail: 'Calculates position size: 1 Lot (65 Qty) on Win → Scales x2 (2 Lots → 4 Lots → 8 Lots) after loss to guarantee net recovery.',
    latency: '1ms',
    status: '1 LOT (READY)',
  },
  {
    id: 'step4',
    step: '04',
    title: 'Risk Oversight Gate',
    subtitle: 'TP & SL Hard Stops',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
    detail: 'Enforces strictly TP +₹4,000 / SL -₹8,000 per lot. Hard stops automatically lock capital base from unexpected slippage.',
    latency: '1ms',
    status: 'PROTECTED',
  },
  {
    id: 'step5',
    step: '05',
    title: 'FIX Broker Routing',
    subtitle: 'AngelOne / Zerodha FIX',
    icon: Server,
    color: 'from-amber-500 to-orange-500',
    detail: 'Dispatches sub-10ms DMA order to broker terminal. Monitors fill state, trail stops, and post-trade journal logging.',
    latency: '8ms',
    status: 'CONNECTED',
  },
];

export default function MissionControl() {
  const { capital } = useCapitalStore();
  const [isFreshMode, setIsFreshMode] = useState(true);
  const [activeStep, setActiveStep] = useState<string>('step2');

  const [strategies, setStrategies] = useState<RunningStrategy[]>([
    {
      id: 'strat_1',
      name: 'Nifty Martingale AI (25 Indicators)',
      href: '/dashboard/strategies/nifty-martingale',
      status: 'RUNNING',
      position: 'FLAT (Ready)',
      allocPct: 0.45,
      todayReturn: 0.00,
      overallReturn: 0.00,
      drawdown: 0.00,
      exposure: 0,
      risk: 'Low',
      latency: 8,
      broker: 'AngelOne',
      connection: 'CONNECTED',
      health: 98,
      aiScore: 95,
    },
    {
      id: 'strat_2',
      name: 'BankNifty Momentum Catcher',
      href: '/dashboard/strategies/2',
      status: 'RUNNING',
      position: 'FLAT',
      allocPct: 0.30,
      todayReturn: 0.00,
      overallReturn: 0.00,
      drawdown: 0.00,
      exposure: 0,
      risk: 'Medium',
      latency: 12,
      broker: 'Zerodha',
      connection: 'CONNECTED',
      health: 90,
      aiScore: 88,
    },
    {
      id: 'strat_3',
      name: 'Mean Reversion VWAP',
      href: '/dashboard/strategies/5',
      status: 'PAUSED',
      position: 'FLAT',
      allocPct: 0.25,
      todayReturn: 0.00,
      overallReturn: 0.00,
      drawdown: 0.00,
      exposure: 0,
      risk: 'Minimal',
      latency: 15,
      broker: 'Dhan',
      connection: 'CONNECTED',
      health: 98,
      aiScore: 92,
    }
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (id: string, action: 'PLAY' | 'PAUSE' | 'HALT') => {
    setStrategies(prev => 
      prev.map(s => {
        if (s.id !== id) return s;
        if (action === 'PLAY') return { ...s, status: 'RUNNING' };
        if (action === 'PAUSE') return { ...s, status: 'PAUSED', position: 'FLAT' };
        return { ...s, status: 'SUSPENDED', position: 'FLAT' };
      })
    );
  };

  const handleMasterHalt = () => {
    const confirm = window.confirm('EMERGENCY INSTANT PURGE: Halt all active algo strategy routines across all brokers?');
    if (confirm) {
      setStrategies(prev => prev.map(s => ({ ...s, status: 'SUSPENDED', position: 'FLAT' })));
    }
  };

  const totalTodayPnL = isFreshMode ? 0 : 4500;
  const maxDrawdownPct = isFreshMode ? '0.00%' : '-2.15%';

  const currentStepData = flowSteps.find(s => s.id === activeStep) || flowSteps[1];

  return (
    <div className="space-y-6 sm:space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold uppercase tracking-wider text-[#1a1a2e] font-heading">
              Platform Mission Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-xs font-semibold border border-[#7c3aed]/20">
              {isFreshMode ? 'FRESH 0 BASELINE' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1 font-medium">
            Real-time algorithmic execution supervisor deck. Enforces operational oversight for ₹{capital.toLocaleString('en-IN')} capital base.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => setIsFreshMode(!isFreshMode)}
            className="px-3.5 py-2 rounded-xl border border-white/60 bg-white/50 hover:bg-white text-xs text-[#1a1a2e] hover:text-[#7c3aed] font-mono flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7c3aed]" />
            {isFreshMode ? 'Switch to Demo Mode' : 'Reset All to Fresh ₹0'}
          </button>

          <span className="text-[#64748b] font-mono hidden sm:inline">Last Update: {lastUpdated.toLocaleTimeString()}</span>
          
          <button 
            onClick={handleMasterHalt}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#ef4444]/20 cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" /> Master Halt
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-1">Total Algorithmic Capital</span>
          <span className="text-xl font-bold font-mono text-[#1a1a2e]">
            ₹{capital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-1">Today&apos;s Net ROI PnL</span>
          <span className={`text-xl font-bold font-mono ${totalTodayPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {totalTodayPnL >= 0 ? '+' : ''}₹{totalTodayPnL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-1">Max Peak Drawdown</span>
          <span className={`text-xl font-bold font-mono ${isFreshMode ? 'text-[#1a1a2e]' : 'text-[#ef4444]'}`}>
            {maxDrawdownPct}
          </span>
        </div>

        <div className="card p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-1">Active Execution Sockets</span>
          <span className="text-xl font-bold font-mono text-[#7c3aed]">
            3 Nodes Online
          </span>
        </div>
      </div>

      {/* NEW: Interactive Execution Flow Diagram Component */}
      <div className="card p-6 rounded-2xl border border-white/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#7c3aed]" />
              <h2 className="text-base font-bold text-[#1a1a2e] font-heading">
                Interactive Algorithmic Execution Flow
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage in the flow pipeline below to inspect live signal data & latency metrics.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono text-xs font-bold self-start sm:self-auto">
            15ms End-to-End Latency
          </span>
        </div>

        {/* 5-Step Horizontal Flow Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === step.id;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between h-36 ${
                  isSelected
                    ? 'bg-white shadow-md border-[#7c3aed] ring-2 ring-[#7c3aed]/20 scale-102'
                    : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-slate-400">STAGE {step.step}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-600 font-mono">
                    {step.latency}
                  </span>
                </div>

                <div className="my-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} text-white flex items-center justify-center mb-2 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#1a1a2e] truncate">{step.title}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{step.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-[#10b981] font-mono">{step.status}</span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#7c3aed]' : 'text-slate-300'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Step Expanded Detail Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#7c3aed]/5 to-[#0ea5e9]/5 border border-[#7c3aed]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#7c3aed] text-white font-mono text-[10px] font-bold">
                STAGE {currentStepData.step}
              </span>
              <h3 className="text-sm font-bold text-[#1a1a2e] font-heading">{currentStepData.title} ({currentStepData.subtitle})</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {currentStepData.detail}
            </p>
          </div>

          <Link
            href="/dashboard/strategies/nifty-martingale"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#7c3aed]/20 transition-all cursor-pointer"
          >
            Inspect Strategy Engine <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Strategies list dashboard */}
      <div className="card rounded-2xl border border-white/60 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-[#64748b]">
          <span className="font-heading text-sm text-[#1a1a2e]">Active Strategy Grid</span>
          <span className="font-mono">Capital Base: ₹{capital.toLocaleString('en-IN')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white/40 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                <th className="p-4">Strategy</th>
                <th className="p-4">Status</th>
                <th className="p-4">Exposure / Position</th>
                <th className="p-4 text-right">Capital</th>
                <th className="p-4 text-right">Today PnL</th>
                <th className="p-4 text-right">Drawdown</th>
                <th className="p-4">Link Node</th>
                <th className="p-4">Health/AI</th>
                <th className="p-4 text-center w-28">Equity Curve</th>
                <th className="p-4 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-[#1a1a2e]">
              {strategies.map(s => {
                const isRunning = s.status === 'RUNNING';
                const isSuspended = s.status === 'SUSPENDED';
                const allocatedCap = capital * s.allocPct;
                const stratPnL = isFreshMode ? 0 : (s.id === 'strat_1' ? 4500 : 0);
                const stratReturnPct = isFreshMode ? 0 : (s.id === 'strat_1' ? 2.0 : 0);
                const isPnlPositive = stratPnL >= 0;

                return (
                  <tr key={s.id} className="hover:bg-[#7c3aed]/5 transition-colors">
                    <td className="p-4">
                      <Link 
                        href={s.href}
                        className="text-[#1a1a2e] font-bold text-sm hover:text-[#7c3aed] hover:underline flex items-center gap-1.5 transition-colors"
                      >
                        {s.name}
                        <ChevronRight className="w-3.5 h-3.5 text-[#7c3aed]" />
                      </Link>
                      <span className="text-[10px] text-[#94a3b8] font-mono block mt-0.5">ID: {s.id}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isRunning ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : isSuspended ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20' : 'bg-slate-100 text-[#64748b]'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[#1a1a2e] block font-mono">{s.position}</span>
                      <span className="text-[9px] text-[#64748b] block">Exposure: {s.exposure}%</span>
                    </td>
                    <td className="p-4 text-right font-mono text-[#1a1a2e]">₹{allocatedCap.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className={`p-4 text-right font-mono ${isPnlPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isPnlPositive ? '+' : ''}₹{stratPnL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({stratReturnPct}%)
                    </td>
                    <td className="p-4 text-right font-mono text-[#64748b]">{isFreshMode ? '0.00%' : `${s.drawdown}%`}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                        <Network className="w-3.5 h-3.5 text-[#7c3aed]" />
                        <span>{s.broker} ({s.latency}ms)</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <span className="text-[#10b981] font-bold">H:{s.health}%</span>
                      <span className="text-[#94a3b8] mx-1">|</span>
                      <span className="text-[#7c3aed] font-bold">AI:{s.aiScore}%</span>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-20 h-6 mx-auto overflow-visible" viewBox="0 0 80 20">
                        <path
                          d={isFreshMode ? "M 0 15 L 80 15" : "M 0 18 L 25 15 L 50 16 L 80 5"}
                          fill="none"
                          stroke={isPnlPositive ? '#10b981' : '#ef4444'}
                          strokeWidth="2"
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isRunning ? (
                          <button 
                            onClick={() => handleAction(s.id, 'PAUSE')}
                            className="p-2 rounded-xl border border-slate-200 text-[#64748b] hover:text-[#1a1a2e] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Pause Strategy"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAction(s.id, 'PLAY')}
                            className="p-2 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 transition-colors cursor-pointer"
                            title="Resume Strategy"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction(s.id, 'HALT')}
                          className="p-2 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors cursor-pointer"
                          title="Halt & Liquidate"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
