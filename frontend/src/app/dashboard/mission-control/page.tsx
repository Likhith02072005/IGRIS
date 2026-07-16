'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Power, RefreshCw, Layers, TrendingUp, TrendingDown,
  Play, Pause, AlertOctagon, Activity, Network, CircleDollarSign, Zap
} from 'lucide-react';

interface RunningStrategy {
  id: string;
  name: string;
  status: 'RUNNING' | 'PAUSED' | 'SUSPENDED';
  position: string;
  capital: number;
  pnl: number;
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
  equityCurve: number[];
}

export default function MissionControl() {
  const [strategies, setStrategies] = useState<RunningStrategy[]>([
    {
      id: 'strat_1',
      name: 'IGRIS Options Straddle',
      status: 'RUNNING',
      position: '+2 Lots BANKNIFTY 52400CE',
      capital: 45000,
      pnl: 1102.50,
      todayReturn: 2.45,
      overallReturn: 12.8,
      drawdown: -2.15,
      exposure: 35,
      risk: 'Low',
      latency: 8,
      broker: 'AngelOne',
      connection: 'CONNECTED',
      health: 96,
      aiScore: 92,
      equityCurve: [40000, 41200, 40800, 42900, 43800, 45000, 46102.5]
    },
    {
      id: 'strat_2',
      name: 'Momentum Catcher Buying',
      status: 'RUNNING',
      position: 'FLAT',
      capital: 30000,
      pnl: -450.00,
      todayReturn: -1.50,
      overallReturn: 8.4,
      drawdown: -4.80,
      exposure: 0,
      risk: 'Medium',
      latency: 12,
      broker: 'Zerodha',
      connection: 'CONNECTED',
      health: 88,
      aiScore: 85,
      equityCurve: [28000, 29000, 31000, 30500, 30100, 29550]
    },
    {
      id: 'strat_3',
      name: 'Mean Reversion VWAP',
      status: 'PAUSED',
      position: 'FLAT',
      capital: 25000,
      pnl: 0.00,
      todayReturn: 0.00,
      overallReturn: 4.2,
      drawdown: -1.80,
      exposure: 0,
      risk: 'Minimal',
      latency: 15,
      broker: 'Dhan',
      connection: 'CONNECTED',
      health: 98,
      aiScore: 90,
      equityCurve: [24000, 24500, 25000, 25000, 25000]
    }
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setStrategies(prev => 
        prev.map(s => {
          if (s.status !== 'RUNNING') return s;
          const delta = (Math.random() - 0.45) * 50;
          const newPnl = Number((s.pnl + delta).toFixed(2));
          const newCurve = [...s.equityCurve.slice(-6), s.capital + newPnl];
          return {
            ...s,
            pnl: newPnl,
            todayReturn: Number(((newPnl / s.capital) * 100).toFixed(2)),
            latency: Math.max(5, s.latency + Math.floor((Math.random() - 0.5) * 3)),
            equityCurve: newCurve
          };
        })
      );
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

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Platform Mission Control
          </h1>
          <p className="text-xs text-gray-500">
            Real-time algorithmic execution supervisor deck. Enforces operational oversight.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-gray-500 font-mono">Last Update: {lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={handleMasterHalt}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-bloomberg-red hover:bg-bloomberg-red/90 text-white font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            <AlertOctagon className="w-4 h-4" /> Master Emergency Halt
          </button>
        </div>
      </div>

      {/* Overview stats answering the core questions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Algorithmic Capital', val: '$100,000.00', color: 'text-white' },
          { label: "Today's Net ROI PnL", val: `+$${strategies.reduce((a, b) => a + b.pnl, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: 'text-bloomberg-green' },
          { label: 'Max Peak Drawdown', val: '-4.80%', color: 'text-bloomberg-red' },
          { label: 'Active Execution Sockets', val: '3 Nodes Online', color: 'text-brand' },
        ].map(card => (
          <div key={card.label} className="glass-panel p-5 rounded-2xl">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{card.label}</span>
            <span className={`text-lg font-bold font-mono ${card.color}`}>{card.val}</span>
          </div>
        ))}
      </div>

      {/* Strategies list dashboard */}
      <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
        <div className="p-5 border-b border-gray-900 bg-[#060a16]/65 flex justify-between items-center text-xs font-bold text-gray-400">
          <span>Active Strategy Grid</span>
          <span>Sorting: Total Capital</span>
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
                const isPnlPositive = s.pnl >= 0;

                return (
                  <tr key={s.id} className="hover:bg-gray-900/10">
                    <td className="p-4">
                      <span className="text-white font-bold block">{s.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">ID: {s.id}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isRunning ? 'bg-bloomberg-green/10 text-bloomberg-green' : isSuspended ? 'bg-bloomberg-red/10 text-bloomberg-red' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white block font-mono">{s.position}</span>
                      <span className="text-[9px] text-gray-500 block">Exposure: {s.exposure}%</span>
                    </td>
                    <td className="p-4 text-right font-mono text-white">${s.capital.toLocaleString()}</td>
                    <td className={`p-4 text-right font-mono ${isPnlPositive ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                      {isPnlPositive ? '+' : ''}${s.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({s.todayReturn}%)
                    </td>
                    <td className="p-4 text-right font-mono text-bloomberg-red">{s.drawdown}%</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Network className="w-3.5 h-3.5 text-brand" />
                        <span>{s.broker} ({s.latency}ms)</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-bloomberg-green">H:{s.health}%</span>
                      <span className="text-gray-500 mx-1">|</span>
                      <span className="text-brand">AI:{s.aiScore}%</span>
                    </td>
                    <td className="p-4 text-center">
                      {/* Mini SVG curve path */}
                      <svg className="w-20 h-8 mx-auto" viewBox="0 0 100 30">
                        <path
                          d={`M ${s.equityCurve.map((val, idx) => `${(idx / (s.equityCurve.length - 1)) * 100} ${30 - ((val - s.capital * 0.9) / (s.capital * 0.2)) * 30}`).join(' L ')}`}
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
                            className="p-2 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                            title="Pause Strategy"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAction(s.id, 'PLAY')}
                            className="p-2 rounded bg-gray-900 border border-gray-800 text-bloomberg-green hover:text-white transition-colors"
                            title="Resume Strategy"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction(s.id, 'HALT')}
                          className="p-2 rounded bg-bloomberg-red/10 border border-bloomberg-red/35 text-bloomberg-red hover:bg-bloomberg-red/20 transition-colors"
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
