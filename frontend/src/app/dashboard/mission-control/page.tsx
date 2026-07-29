'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Power, RefreshCw, Layers, TrendingUp, TrendingDown,
  Play, Pause, AlertOctagon, Activity, Network, CircleDollarSign, Zap, RotateCcw
} from 'lucide-react';

import { useCapitalStore } from '../../../store/capital';

interface RunningStrategy {
  id: string;
  name: string;
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

export default function MissionControl() {
  const { capital } = useCapitalStore();
  const [isFreshMode, setIsFreshMode] = useState(true); // Default to Fresh 0 Baseline

  const [strategies, setStrategies] = useState<RunningStrategy[]>([
    {
      id: 'strat_1',
      name: 'Nifty Martingale AI (25 Indicators)',
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
    const confirm = window.confirm('EMERGENCY INSTANT Purge: Halt all active algo strategy routines?');
    if (confirm) {
      setStrategies(prev => prev.map(s => ({ ...s, status: 'SUSPENDED', position: 'FLAT' })));
    }
  };

  const totalTodayPnL = isFreshMode ? 0 : 4500;
  const maxDrawdownPct = isFreshMode ? '0.00%' : '-2.15%';

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Platform Mission Control
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#22d3ee]/10 text-[#22d3ee] font-mono text-xs border border-[#22d3ee]/20">
              {isFreshMode ? 'FRESH 0 BASELINE' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time algorithmic execution supervisor deck. Enforces operational oversight for ₹{capital.toLocaleString('en-IN')} capital base.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => setIsFreshMode(!isFreshMode)}
            className="px-3 py-2 rounded bg-[#111111] border border-[#1a1a1a] hover:border-[#22d3ee] text-xs text-white hover:text-[#22d3ee] font-mono flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#22d3ee]" />
            {isFreshMode ? 'Switch to Demo Mode' : 'Reset All to Fresh ₹0'}
          </button>

          <span className="text-gray-500 font-mono hidden sm:inline">Last Update: {lastUpdated.toLocaleTimeString()}</span>
          
          <button 
            onClick={handleMasterHalt}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            <AlertOctagon className="w-4 h-4" /> Master Halt
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Algorithmic Capital', val: `₹${capital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-white' },
          { label: "Today's Net ROI PnL", val: `${totalTodayPnL >= 0 ? '+' : ''}₹${totalTodayPnL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: totalTodayPnL >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]' },
          { label: 'Max Peak Drawdown', val: maxDrawdownPct, color: isFreshMode ? 'text-white' : 'text-[#ef4444]' },
          { label: 'Active Execution Sockets', val: '3 Nodes Online', color: 'text-[#22d3ee]' },
        ].map(card => (
          <div key={card.label} className="card p-5 rounded-lg">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{card.label}</span>
            <span className={`text-lg font-bold font-mono ${card.color}`}>{card.val}</span>
          </div>
        ))}
      </div>

      {/* Strategies list dashboard */}
      <div className="card rounded-lg border border-gray-800/80 overflow-hidden">
        <div className="p-5 border-b border-gray-900 bg-[#060a16]/65 flex justify-between items-center text-xs font-bold text-gray-400">
          <span>Active Strategy Grid</span>
          <span className="font-mono">Capital Base: ₹{capital.toLocaleString('en-IN')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-900 bg-gray-950/20 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
              {strategies.map(s => {
                const isRunning = s.status === 'RUNNING';
                const isSuspended = s.status === 'SUSPENDED';
                const allocatedCap = capital * s.allocPct;
                const stratPnL = isFreshMode ? 0 : (s.id === 'strat_1' ? 4500 : 0);
                const stratReturnPct = isFreshMode ? 0 : (s.id === 'strat_1' ? 2.0 : 0);
                const isPnlPositive = stratPnL >= 0;

                return (
                  <tr key={s.id} className="hover:bg-gray-900/10">
                    <td className="p-4">
                      <span className="text-white font-bold block">{s.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">ID: {s.id}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isRunning ? 'bg-[#22c55e]/10 text-[#22c55e]' : isSuspended ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white block font-mono">{s.position}</span>
                      <span className="text-[9px] text-gray-500 block">Exposure: {s.exposure}%</span>
                    </td>
                    <td className="p-4 text-right font-mono text-white">₹{allocatedCap.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className={`p-4 text-right font-mono ${isPnlPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {isPnlPositive ? '+' : ''}₹{stratPnL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({stratReturnPct}%)
                    </td>
                    <td className="p-4 text-right font-mono text-gray-400">{isFreshMode ? '0.00%' : `${s.drawdown}%`}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Network className="w-3.5 h-3.5 text-[#22d3ee]" />
                        <span>{s.broker} ({s.latency}ms)</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[#22c55e]">H:{s.health}%</span>
                      <span className="text-gray-500 mx-1">|</span>
                      <span className="text-[#22d3ee]">AI:{s.aiScore}%</span>
                    </td>
                    <td className="p-4 text-center">
                      {/* Clean SVG curve path */}
                      <svg className="w-20 h-6 mx-auto overflow-visible" viewBox="0 0 80 20">
                        <path
                          d={isFreshMode ? "M 0 15 L 80 15" : "M 0 18 L 25 15 L 50 16 L 80 5"}
                          fill="none"
                          stroke={isPnlPositive ? '#22c55e' : '#ef4444'}
                          strokeWidth="2"
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isRunning ? (
                          <button 
                            onClick={() => handleAction(s.id, 'PAUSE')}
                            className="p-2 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                            title="Pause Strategy"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAction(s.id, 'PLAY')}
                            className="p-2 rounded bg-gray-900 border border-gray-800 text-[#22c55e] hover:text-white transition-colors"
                            title="Resume Strategy"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction(s.id, 'HALT')}
                          className="p-2 rounded bg-[#ef4444]/10 border border-[#ef4444]/35 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
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
