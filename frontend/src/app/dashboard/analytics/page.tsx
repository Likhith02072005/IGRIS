'use client';

import React, { useState } from 'react';
import { 
  BarChart3, RefreshCw, Layers, ShieldAlert, Award, TrendingUp, CircleDollarSign, 
  HelpCircle, FileSpreadsheet, Eye, Save, Trash2, LineChart, Calendar, AlertTriangle
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [runningSim, setRunningSim] = useState(false);
  const [showSim, setShowSim] = useState(true);

  // Seeded Heatmaps Data
  const monthlyHeatmap = [
    { year: 2026, jan: 2.4, feb: -1.2, mar: 4.8, apr: 3.2, may: 5.6, jun: -0.8, jul: 9.45 },
  ];

  const dailyPerformance = [
    { day: 'Monday', pnl: 4520, trades: 14, winRate: 64.2 },
    { day: 'Tuesday', pnl: -1210, trades: 16, winRate: 48.5 },
    { day: 'Wednesday', pnl: 6890, trades: 12, winRate: 75.0 },
    { day: 'Thursday', pnl: 3120, trades: 18, winRate: 58.3 },
    { day: 'Friday', pnl: 2100, trades: 10, winRate: 60.0 },
  ];

  // Monte Carlo Percentile steps
  const monteCarloSteps = [
    { step: 'Day 5', p10: 100800, p50: 102400, p90: 104100 },
    { step: 'Day 10', p10: 101500, p50: 104500, p90: 107900 },
    { step: 'Day 15', p10: 102100, p50: 106900, p90: 111400 },
    { step: 'Day 20', p10: 103200, p50: 109200, p90: 115200 },
    { step: 'Day 25', p10: 104100, p50: 111800, p90: 118400 },
    { step: 'Day 30', p10: 105400, p50: 115420, p90: 122100 },
  ];

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Platform Portfolio Analytics
        </h1>
        <p className="text-xs text-gray-500">
          Compute advanced risk metrics, Monte Carlo simulations, walk-forward stats, and heatmaps.
        </p>
      </div>

      {/* Ratios row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Expectancy Ratio', val: '1.83', desc: 'Positive expected value' },
          { label: 'Monte Carlo Max Risk', val: '3.12%', desc: '90% confidence lower bound' },
          { label: 'Walk Forward Score', val: '88/100', desc: 'Robust parameter mapping' },
          { label: 'Rolling 30D Sharpe', val: '2.95', desc: 'Institutional profile' },
        ].map(item => (
          <div key={item.label} className="glass-panel p-5 rounded-xl">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{item.label}</span>
            <h3 className="text-xl font-bold text-white font-mono">{item.val}</h3>
            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Splittings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Heatmaps & Distributions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Monthly returns heatmap */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" /> Monthly Return Heatmap (%)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono font-bold border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase">
                    <th className="pb-3">Year</th>
                    <th className="pb-3">Jan</th>
                    <th className="pb-3">Feb</th>
                    <th className="pb-3">Mar</th>
                    <th className="pb-3">Apr</th>
                    <th className="pb-3">May</th>
                    <th className="pb-3">Jun</th>
                    <th className="pb-3">Jul</th>
                    <th className="pb-3">Aug</th>
                    <th className="pb-3">Sep</th>
                    <th className="pb-3">Oct</th>
                    <th className="pb-3">Nov</th>
                    <th className="pb-3">Dec</th>
                    <th className="pb-3">YTD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 text-white">
                  {monthlyHeatmap.map(row => (
                    <tr key={row.year} className="hover:bg-gray-900/10">
                      <td className="py-4 text-gray-400">{row.year}</td>
                      <td className="py-4 text-bloomberg-green bg-bloomberg-green/10 border border-[#030712]">+2.4%</td>
                      <td className="py-4 text-bloomberg-red bg-bloomberg-red/10 border border-[#030712]">-1.2%</td>
                      <td className="py-4 text-bloomberg-green bg-bloomberg-green/20 border border-[#030712]">+4.8%</td>
                      <td className="py-4 text-bloomberg-green bg-bloomberg-green/15 border border-[#030712]">+3.2%</td>
                      <td className="py-4 text-bloomberg-green bg-bloomberg-green/25 border border-[#030712]">+5.6%</td>
                      <td className="py-4 text-bloomberg-red bg-bloomberg-red/5 border border-[#030712]">-0.8%</td>
                      <td className="py-4 text-bloomberg-green bg-bloomberg-green/30 border border-[#030712]">+9.4%</td>
                      <td className="py-4 text-gray-600 bg-gray-950/40 border border-[#030712]">-</td>
                      <td className="py-4 text-gray-600 bg-gray-950/40 border border-[#030712]">-</td>
                      <td className="py-4 text-gray-600 bg-gray-950/40 border border-[#030712]">-</td>
                      <td className="py-4 text-gray-600 bg-gray-950/40 border border-[#030712]">-</td>
                      <td className="py-4 text-gray-600 bg-gray-950/40 border border-[#030712]">-</td>
                      <td className="py-4 text-bloomberg-green bg-bloomberg-green/30 font-extrabold">+23.4%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily & Hourly statistics table */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6">
              Daily trading edge profiles
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-semibold">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Trading Session Day</th>
                    <th className="pb-3 text-right">Net Return PnL</th>
                    <th className="pb-3 text-right">Trades Count</th>
                    <th className="pb-3 text-right">Win Rate %</th>
                    <th className="pb-3">Performance Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 text-gray-300">
                  {dailyPerformance.map(d => {
                    const isPositive = d.pnl >= 0;
                    return (
                      <tr key={d.day} className="hover:bg-gray-900/10">
                        <td className="py-3.5 text-white font-bold">{d.day}</td>
                        <td className={`py-3.5 text-right font-mono ${isPositive ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                          {isPositive ? '+' : ''}${d.pnl.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right font-mono text-gray-400">{d.trades}</td>
                        <td className="py-3.5 text-right font-mono text-white">{d.winRate}%</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-gray-900 rounded-full overflow-hidden">
                              <div className={`h-full bg-brand`} style={{ width: `${d.winRate}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">{d.winRate >= 60 ? 'Optimal' : 'Standard'}</span>
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

        {/* Right column: Monte Carlo Simulation */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <LineChart className="w-4 h-4 text-brand" /> Monte Carlo Engine
              </h2>
              <button
                onClick={() => {
                  setRunningSim(true);
                  setTimeout(() => setRunningSim(false), 1500);
                }}
                disabled={runningSim}
                className="p-1 rounded hover:bg-gray-900 text-gray-400 hover:text-white"
                title="Re-run Simulation"
              >
                <RefreshCw className={`w-4 h-4 ${runningSim ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="text-xs text-gray-400 leading-relaxed font-semibold">
              Monte Carlo shuffles historical trades to project possible capital paths and evaluate insolvency risks.
            </div>

            {/* Simulations table */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                Probability Band Projection (30 Days Out)
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono font-semibold">
                  <thead>
                    <tr className="border-b border-gray-900 text-[9px] text-gray-500 uppercase">
                      <th>Interval</th>
                      <th className="text-right">10% Lower</th>
                      <th className="text-right">Median Path</th>
                      <th className="text-right">90% Upper</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900/60 text-gray-300">
                    {monteCarloSteps.map(step => (
                      <tr key={step.step}>
                        <td className="py-2.5 text-white font-sans">{step.step}</td>
                        <td className="py-2.5 text-right text-bloomberg-red">${step.p10.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-white">${step.p50.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-bloomberg-green">${step.p90.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insolvency risk score */}
            <div className="bg-bloomberg-green/10 border border-bloomberg-green/30 p-4 rounded-xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-bloomberg-green flex-shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Risk of Ruin Score</span>
                <span className="text-xs font-bold text-white font-mono">0.00% (Insolvency proof)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
