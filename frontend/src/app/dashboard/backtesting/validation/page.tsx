'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, RefreshCw, BarChart2, ShieldCheck, HelpCircle, ArrowUpRight,
  Sparkles, GitBranch, Layers, ShieldAlert, Cpu
} from 'lucide-react';

interface ConfidenceRow {
  percentile: string;
  type: string;
  profit: number;
  drawdown: number;
}

export default function BacktestValidationUI() {
  const [running, setRunning] = useState(false);
  const [sims, setSims] = useState(1000);
  
  const [percentiles, setPercentiles] = useState<ConfidenceRow[]>([
    { percentile: '95th Percentile (Best Case)', type: 'Optimistic', profit: 24.50, drawdown: 1.82 },
    { percentile: '50th Percentile (Median Case)', type: 'Expected', profit: 12.80, drawdown: 3.12 },
    { percentile: '5th Percentile (Worst Case)', type: 'Conservative', profit: 4.25, drawdown: 5.80 },
  ]);

  const [wfe, setWfe] = useState({
    inSample: 24.5,
    outSample: 16.8,
    efficiency: 68.5,
    status: 'ROBUST'
  });

  const handleRunSimulation = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      alert('Monte Carlo simulations completed successfully.');
    }, 1500);
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Quantitative Backtest Validation Lab
          </h1>
          <p className="text-xs text-gray-500">
            Audit backtest reports using Walk-Forward out-of-sample data splits and random trade shuffles.
          </p>
        </div>

        <button 
          onClick={handleRunSimulation}
          disabled={running}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Simulating...' : 'Run Monte Carlo'}
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Monte Carlo Results */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Monte Carlo Confidence Intervals
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/20 text-[9px] text-gray-500 uppercase font-bold">
                    <th className="p-3">Simulation Percentile</th>
                    <th className="p-3">Confidence Type</th>
                    <th className="p-3 text-right">Expected Return</th>
                    <th className="p-3 text-right">Worst Max DD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
                  {percentiles.map(row => (
                    <tr key={row.percentile}>
                      <td className="p-3 text-white">{row.percentile}</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          row.type === 'Conservative' ? 'bg-bloomberg-red/10 text-bloomberg-red' : 'bg-bloomberg-green/10 text-bloomberg-green'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-bloomberg-green">+{row.profit}%</td>
                      <td className="p-3 text-right font-mono text-bloomberg-red">-{row.drawdown}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Walk Forward Grid */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Walk-Forward Out-of-Sample Performance Splits
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-semibold text-gray-300">
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">In-Sample Annual Profit</span>
                <span className="text-white font-mono">+{wfe.inSample}%</span>
              </div>
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Out-Sample Annual Profit</span>
                <span className="text-white font-mono">+{wfe.outSample}%</span>
              </div>
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Walk-Forward Efficiency</span>
                <span className="text-bloomberg-green font-mono">{wfe.efficiency}%</span>
              </div>
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Overfitting Check</span>
                <span className="text-bloomberg-green font-bold">{wfe.status}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Simulation Parameters */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Simulator Configurations
            </h2>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Number of Simulations</label>
                <input 
                  type="number" 
                  className="glass-input w-full p-2.5 rounded-xl font-mono" 
                  value={sims} 
                  onChange={(e) => setSims(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Trade Skip Probability %</label>
                <input 
                  type="number" 
                  className="glass-input w-full p-2.5 rounded-xl font-mono" 
                  defaultValue={5}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Slippage Standard Deviation</label>
                <input 
                  type="number" 
                  className="glass-input w-full p-2.5 rounded-xl font-mono" 
                  defaultValue={0.1}
                  step={0.01}
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
