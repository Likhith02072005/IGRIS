'use client';

import React, { useState } from 'react';
import { useCapitalStore } from '../../../../store/capital';
import CapitalEditModal from '../../../../components/layout/CapitalEditModal';
import { 
  TrendingUp, TrendingDown, RefreshCw, CircleDollarSign, PieChart,
  GitPullRequest, ArrowUpRight, Award, HelpCircle, Edit2, Info
} from 'lucide-react';

interface OptimizerStats {
  strategy: string;
  weight: number;
  capitalAllocated: number;
  sharpe: number;
  volatility: number;
  riskContribution: number;
}

export default function PortfolioOptimizerUI() {
  const { capital } = useCapitalStore();
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [modelType, setModelType] = useState<'MAX_SHARPE' | 'MIN_VARIANCE'>('MAX_SHARPE');

  // Seeded optimization outputs in INR
  const [strategies, setStrategies] = useState<OptimizerStats[]>([
    { strategy: 'Nifty Martingale AI', weight: 45.0, capitalAllocated: capital * 0.45, sharpe: 2.84, volatility: 8.5, riskContribution: 38.2 },
    { strategy: 'Momentum Catcher Buying', weight: 35.0, capitalAllocated: capital * 0.35, sharpe: 2.15, volatility: 14.2, riskContribution: 45.4 },
    { strategy: 'VWAP Reversal Fade', weight: 20.0, capitalAllocated: capital * 0.20, sharpe: 1.95, volatility: 6.8, riskContribution: 16.4 },
  ]);

  const correlationMatrix = {
    'Nifty Martingale AI': { 'Nifty Martingale AI': 1.0, 'Momentum Catcher Buying': 0.12, 'VWAP Reversal Fade': -0.15 },
    'Momentum Catcher Buying': { 'Nifty Martingale AI': 0.12, 'Momentum Catcher Buying': 1.0, 'VWAP Reversal Fade': 0.05 },
    'VWAP Reversal Fade': { 'Nifty Martingale AI': -0.15, 'Momentum Catcher Buying': 0.05, 'VWAP Reversal Fade': 1.0 },
  };

  const handleModelChange = (model: 'MAX_SHARPE' | 'MIN_VARIANCE') => {
    setModelType(model);
    if (model === 'MAX_SHARPE') {
      setStrategies([
        { strategy: 'Nifty Martingale AI', weight: 45.0, capitalAllocated: capital * 0.45, sharpe: 2.84, volatility: 8.5, riskContribution: 38.2 },
        { strategy: 'Momentum Catcher Buying', weight: 35.0, capitalAllocated: capital * 0.35, sharpe: 2.15, volatility: 14.2, riskContribution: 45.4 },
        { strategy: 'VWAP Reversal Fade', weight: 20.0, capitalAllocated: capital * 0.20, sharpe: 1.95, volatility: 6.8, riskContribution: 16.4 },
      ]);
    } else {
      setStrategies([
        { strategy: 'Nifty Martingale AI', weight: 30.0, capitalAllocated: capital * 0.30, sharpe: 2.84, volatility: 8.5, riskContribution: 28.5 },
        { strategy: 'Momentum Catcher Buying', weight: 15.0, capitalAllocated: capital * 0.15, sharpe: 2.15, volatility: 14.2, riskContribution: 18.2 },
        { strategy: 'VWAP Reversal Fade', weight: 55.0, capitalAllocated: capital * 0.55, sharpe: 1.95, volatility: 6.8, riskContribution: 53.3 },
      ]);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#1a1a2e]">
            Portfolio Allocation Optimizer
          </h1>
          <p className="text-xs text-[#64748b]">
            Execute covariance matrices and solve allocation curves along the Efficient Frontier boundary for ₹{capital.toLocaleString('en-IN')}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleModelChange('MAX_SHARPE')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              modelType === 'MAX_SHARPE' ? 'bg-[#7c3aed]/10 border-[#22d3ee]/40 text-[#7c3aed]' : 'bg-white/30 border-white/30 text-[#666] hover:text-[#1a1a2e]'
            }`}
          >
            Max Sharpe Ratio
          </button>
          
          <button 
            onClick={() => handleModelChange('MIN_VARIANCE')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              modelType === 'MIN_VARIANCE' ? 'bg-[#7c3aed]/10 border-[#22d3ee]/40 text-[#7c3aed]' : 'bg-white/30 border-white/30 text-[#666] hover:text-[#1a1a2e]'
            }`}
          >
            Minimum Variance
          </button>
        </div>
      </div>

      {/* Inputs and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Allocations and Weights */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="card p-6 rounded-lg space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[#1a1a2e]">
                Optimized Strategy Weights (Capital Base: ₹{capital.toLocaleString('en-IN')})
              </h2>
              <button 
                onClick={() => setIsCapitalModalOpen(true)}
                className="text-xs text-[#7c3aed] flex items-center gap-1 hover:underline font-mono"
              >
                <Edit2 className="w-3 h-3" /> Customize Capital
              </button>
            </div>

            <div className="space-y-6">
              {strategies.map(s => {
                const currentAlloc = capital * (s.weight / 100);
                return (
                  <div key={s.strategy} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#1a1a2e]">{s.strategy}</span>
                      <span className="text-[#94a3b8] font-mono">
                        {s.weight}% (₹{currentAlloc.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                      </span>
                    </div>
                    <div className="h-2 w-full  rounded-full overflow-hidden border border-white/30">
                      <div className="h-full bg-[#7c3aed]" style={{ width: `${s.weight}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
                      <span>Volatility: {s.volatility}%</span>
                      <span>Risk Contribution: {s.riskContribution}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correlation Matrix Table */}
          <div className="card p-6 rounded-lg space-y-4">
            <h2 className="text-sm font-semibold text-[#1a1a2e]">
              Strategy Returns Correlation Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/30 text-[10px] text-[#64748b] uppercase font-bold">
                    <th className="p-3 text-left">Asset / Strategy</th>
                    {Object.keys(correlationMatrix).map(k => (
                      <th key={k} className="p-3">{k.split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] font-semibold text-gray-300">
                  {Object.entries(correlationMatrix).map(([rowName, cols]) => (
                    <tr key={rowName}>
                      <td className="p-3 text-left text-[#1a1a2e] font-sans">{rowName}</td>
                      {Object.values(cols).map((val, idx) => {
                        const isPos = val > 0 && val < 1;
                        const isNeg = val < 0;
                        return (
                          <td 
                            key={idx} 
                            className={`p-3 font-bold ${
                              val === 1.0 ? 'text-[#7c3aed]' : isPos ? 'text-[#10b981]' : isNeg ? 'text-[#ef4444]' : 'text-[#64748b]'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Optimal Curve & Metrics */}
        <div className="space-y-6">
          
          <div className="card p-6 rounded-lg space-y-6">
            <h2 className="text-sm font-semibold text-[#1a1a2e]">
              Optimization Profile
            </h2>
            <div className="space-y-4 text-xs font-semibold text-gray-300">
              <div className="border-b border-white/30 pb-3">
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-0.5">Diversification Ratio</span>
                <span className="text-[#1a1a2e] font-mono text-base">2.14</span>
              </div>
              <div className="border-b border-white/30 pb-3">
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-0.5">Expected Annual Return</span>
                <span className="text-[#10b981] font-mono text-base">+24.5%</span>
              </div>
              <div className="border-b border-white/30 pb-3">
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-0.5">Portfolio Volatility</span>
                <span className="text-[#1a1a2e] font-mono text-base">9.2%</span>
              </div>
              <div className="pb-1">
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-0.5">Sharpe Coordinate</span>
                <span className="text-[#7c3aed] font-mono text-base">2.12</span>
              </div>
            </div>
          </div>

          {/* Institutional Clean Efficient Frontier Plot */}
          <div className="card p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[#1a1a2e]">
                Efficient Frontier Curve
              </h2>
              <span className="text-[10px] text-[#64748b] font-mono">Markowitz Portfolio Theory</span>
            </div>

            <div className="bg-[#080c14] border border-white/30 rounded-lg p-4 space-y-3">
              {/* SVG Curve Container */}
              <div className="relative h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 240 130">
                  <defs>
                    <linearGradient id="frontier-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="230" y2="20" stroke="#1a1a1a" strokeDasharray="3 3" />
                  <line x1="30" y1="50" x2="230" y2="50" stroke="#1a1a1a" strokeDasharray="3 3" />
                  <line x1="30" y1="80" x2="230" y2="80" stroke="#1a1a1a" strokeDasharray="3 3" />
                  <line x1="30" y1="110" x2="230" y2="110" stroke="#1a1a1a" />

                  <line x1="30" y1="20" x2="30" y2="110" stroke="#1a1a1a" />
                  <line x1="90" y1="20" x2="90" y2="110" stroke="#1a1a1a" strokeDasharray="3 3" />
                  <line x1="150" y1="20" x2="150" y2="110" stroke="#1a1a1a" strokeDasharray="3 3" />
                  <line x1="210" y1="20" x2="210" y2="110" stroke="#1a1a1a" strokeDasharray="3 3" />

                  {/* Y-Axis Ticks (Returns %) */}
                  <text x="24" y="24" textAnchor="end" fill="#666" fontSize="7" fontFamily="monospace">30%</text>
                  <text x="24" y="54" textAnchor="end" fill="#666" fontSize="7" fontFamily="monospace">20%</text>
                  <text x="24" y="84" textAnchor="end" fill="#666" fontSize="7" fontFamily="monospace">10%</text>
                  <text x="24" y="113" textAnchor="end" fill="#666" fontSize="7" fontFamily="monospace">0%</text>

                  {/* X-Axis Ticks (Volatility %) */}
                  <text x="30" y="122" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">0%</text>
                  <text x="90" y="122" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">5%</text>
                  <text x="150" y="122" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">10%</text>
                  <text x="210" y="122" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">15%</text>

                  {/* Efficient Frontier Parabolic Path */}
                  <path
                    d="M 30 110 C 50 70, 90 35, 230 25"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                  />
                  <path
                    d="M 30 110 C 50 70, 90 35, 230 25 L 230 110 Z"
                    fill="url(#frontier-fill)"
                  />

                  {/* Portfolio Points */}
                  {/* Min Variance Point */}
                  <circle 
                    cx="70" 
                    cy="62" 
                    r={modelType === 'MIN_VARIANCE' ? "6" : "4"} 
                    fill={modelType === 'MIN_VARIANCE' ? "#22d3ee" : "#333"} 
                    stroke="#22d3ee" 
                    strokeWidth="1.5"
                  />
                  
                  {/* Max Sharpe Point */}
                  <circle 
                    cx="140" 
                    cy="35" 
                    r={modelType === 'MAX_SHARPE' ? "6" : "4"} 
                    fill={modelType === 'MAX_SHARPE' ? "#22c55e" : "#333"} 
                    stroke="#22c55e" 
                    strokeWidth="1.5"
                  />

                  {/* Annotations */}
                  <text x="145" y="28" fill="#22c55e" fontSize="7" fontWeight="bold" fontFamily="monospace">
                    Max Sharpe (2.84)
                  </text>
                  <text x="75" y="58" fill="#22d3ee" fontSize="7" fontWeight="bold" fontFamily="monospace">
                    Min Var (8.5%)
                  </text>
                </svg>
              </div>

              {/* Legend & Current Mode Banner */}
              <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/30 pt-2 text-[#666]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Max Sharpe
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#7c3aed]" /> Min Variance
                  </span>
                </div>
                <span className="text-[#1a1a2e]">
                  Active: {modelType === 'MAX_SHARPE' ? 'Max Sharpe (2.84)' : 'Min Variance'}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

      <CapitalEditModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
      />

    </div>
  );
}
