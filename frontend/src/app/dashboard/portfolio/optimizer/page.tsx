'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, CircleDollarSign, PieChart,
  GitPullRequest, ArrowUpRight, Award, HelpCircle
} from 'lucide-react';

interface OptimizerStats {
  strategy: string;
  weight: number;
  capital: number;
  sharpe: number;
  volatility: number;
  riskContribution: number;
}

export default function PortfolioOptimizerUI() {
  const [capital, setCapital] = useState(100000);
  const [modelType, setModelType] = useState<'MAX_SHARPE' | 'MIN_VARIANCE'>('MAX_SHARPE');

  // Seeded optimization outputs
  const [strategies, setStrategies] = useState<OptimizerStats[]>([
    { strategy: 'IGRIS Options Straddle', weight: 45.0, capital: 45000, sharpe: 2.84, volatility: 8.5, riskContribution: 38.2 },
    { strategy: 'Momentum Catcher Buying', weight: 35.0, capital: 35000, sharpe: 2.15, volatility: 14.2, riskContribution: 45.4 },
    { strategy: 'VWAP Reversal Fade', weight: 20.0, capital: 20000, sharpe: 1.95, volatility: 6.8, riskContribution: 16.4 },
  ]);

  const correlationMatrix = {
    'IGRIS Options Straddle': { 'IGRIS Options Straddle': 1.0, 'Momentum Catcher Buying': 0.12, 'VWAP Reversal Fade': -0.15 },
    'Momentum Catcher Buying': { 'IGRIS Options Straddle': 0.12, 'Momentum Catcher Buying': 1.0, 'VWAP Reversal Fade': 0.05 },
    'VWAP Reversal Fade': { 'IGRIS Options Straddle': -0.15, 'Momentum Catcher Buying': 0.05, 'VWAP Reversal Fade': 1.0 },
  };

  const handleModelChange = (model: 'MAX_SHARPE' | 'MIN_VARIANCE') => {
    setModelType(model);
    if (model === 'MAX_SHARPE') {
      setStrategies([
        { strategy: 'IGRIS Options Straddle', weight: 45.0, capital: capital * 0.45, sharpe: 2.84, volatility: 8.5, riskContribution: 38.2 },
        { strategy: 'Momentum Catcher Buying', weight: 35.0, capital: capital * 0.35, sharpe: 2.15, volatility: 14.2, riskContribution: 45.4 },
        { strategy: 'VWAP Reversal Fade', weight: 20.0, capital: capital * 0.20, sharpe: 1.95, volatility: 6.8, riskContribution: 16.4 },
      ]);
    } else {
      // Minimum Variance allocates more to low vol asset (VWAP Reversal Fade)
      setStrategies([
        { strategy: 'IGRIS Options Straddle', weight: 30.0, capital: capital * 0.30, sharpe: 2.84, volatility: 8.5, riskContribution: 28.5 },
        { strategy: 'Momentum Catcher Buying', weight: 15.0, capital: capital * 0.15, sharpe: 2.15, volatility: 14.2, riskContribution: 18.2 },
        { strategy: 'VWAP Reversal Fade', weight: 55.0, capital: capital * 0.55, sharpe: 1.95, volatility: 6.8, riskContribution: 53.3 },
      ]);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Portfolio Allocation Optimizer
          </h1>
          <p className="text-xs text-gray-500">
            Execute covariance matrices and solve allocation curves along the Efficient Frontier boundary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleModelChange('MAX_SHARPE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
              modelType === 'MAX_SHARPE' ? 'bg-brand/10 border-brand/35 text-brand' : 'bg-gray-900 border-gray-800 text-gray-400'
            }`}
          >
            Max Sharpe Ratio
          </button>
          
          <button 
            onClick={() => handleModelChange('MIN_VARIANCE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
              modelType === 'MIN_VARIANCE' ? 'bg-brand/10 border-brand/35 text-brand' : 'bg-gray-900 border-gray-800 text-gray-400'
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
          
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Optimized Strategy Weights
            </h2>

            <div className="space-y-6">
              {strategies.map(s => (
                <div key={s.strategy} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white">{s.strategy}</span>
                    <span className="text-gray-400 font-mono">
                      {s.weight}% (${s.capital.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${s.weight}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>Volatility: {s.volatility}%</span>
                    <span>Risk Contribution: {s.riskContribution}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Matrix Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Strategy Returns Correlation Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/20 text-[9px] text-gray-500 uppercase font-bold">
                    <th className="p-3 text-left">Asset / Strategy</th>
                    {Object.keys(correlationMatrix).map(k => (
                      <th key={k} className="p-3">{k.split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
                  {Object.entries(correlationMatrix).map(([rowName, cols]) => (
                    <tr key={rowName}>
                      <td className="p-3 text-left text-white">{rowName}</td>
                      {Object.values(cols).map((val, idx) => {
                        const isPos = val > 0 && val < 1;
                        const isNeg = val < 0;
                        return (
                          <td 
                            key={idx} 
                            className={`p-3 font-bold ${
                              val === 1.0 ? 'text-brand' : isPos ? 'text-bloomberg-green' : isNeg ? 'text-bloomberg-red' : 'text-gray-500'
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
          
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Optimization Profile
            </h2>
            <div className="space-y-4 text-xs font-semibold text-gray-300">
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Diversification Ratio</span>
                <span className="text-white font-mono text-base">2.14</span>
              </div>
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Expected Annual Return</span>
                <span className="text-bloomberg-green font-mono text-base">+24.5%</span>
              </div>
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Portfolio Volatility</span>
                <span className="text-white font-mono text-base">9.2%</span>
              </div>
              <div className="pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Sharpe Coordinate</span>
                <span className="text-brand font-mono text-base">2.12</span>
              </div>
            </div>
          </div>

          {/* Efficient Frontier Plot SVG */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              Efficient Frontier Plot
            </span>
            <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-4 flex items-center justify-center h-44 relative">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                {/* Curve plotting */}
                <path
                  d="M 20 80 Q 80 20 180 15"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                {/* Max Sharpe dot */}
                <circle cx={modelType === 'MAX_SHARPE' ? 120 : 60} cy={modelType === 'MAX_SHARPE' ? 32 : 55} r="5" fill="#10b981" className="animate-ping" />
                <circle cx={modelType === 'MAX_SHARPE' ? 120 : 60} cy={modelType === 'MAX_SHARPE' ? 32 : 55} r="4.5" fill="#10b981" />
              </svg>
              <span className="absolute bottom-2 right-4 text-[8px] font-mono text-gray-500">Volatility (Risk) →</span>
              <span className="absolute left-2 top-2 text-[8px] font-mono text-gray-500 rotate-90 origin-left">Returns →</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
