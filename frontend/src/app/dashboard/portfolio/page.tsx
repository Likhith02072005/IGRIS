'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight, 
  BarChart2, ShieldAlert, Award, PlayCircle, CheckCircle2, ChevronRight, X, ChevronDown, ChevronUp,
  Cpu, Heart, Bot, FileText, Calendar, AlertTriangle
} from 'lucide-react';

interface StrategyPortfolioItem {
  id: string;
  name: string;
  status: 'LIVE' | 'PAUSED';
  allocated: number;
  currentValue: number;
  todayReturn: number;
  overallReturn: number;
  todayPnL: number;
  overallPnL: number;
  lots: number;
  openPositions: number;
  riskScore: number;  // 1-10
  healthScore: number; // 1-100
  aiScore: number;     // 1-100
  notes: string;
  aiAnalysis: string;
}

export default function PortfolioPage() {
  const [strategies, setStrategies] = useState<StrategyPortfolioItem[]>([
    {
      id: 'strat_1',
      name: 'IGRIS Options straddle',
      status: 'LIVE',
      allocated: 45000.00,
      currentValue: 47450.00,
      todayReturn: 2.45,
      overallReturn: 5.44,
      todayPnL: 1102.50,
      overallPnL: 2450.00,
      lots: 2,
      openPositions: 1,
      riskScore: 3,
      healthScore: 92,
      aiScore: 89,
      notes: 'Executes first 30-min candle fades. Optimized for range-bound index setups.',
      aiAnalysis: 'The strategy remains in an optimal regime. Decay indicators confirm premium erosion is matching expected theoretical theta curves. Recommend maintaining current fractional size.'
    },
    {
      id: 'strat_2',
      name: 'Momentum Catcher Buying',
      status: 'LIVE',
      allocated: 30000.00,
      currentValue: 31347.50,
      todayReturn: 1.82,
      overallReturn: 4.49,
      todayPnL: 546.00,
      overallPnL: 1347.50,
      lots: 3,
      openPositions: 0,
      riskScore: 6,
      healthScore: 85,
      aiScore: 82,
      notes: 'Captures volatility breakouts near opening range boundaries.',
      aiAnalysis: 'High volatility spikes have improved entry velocity. Standard drawdown risk is bounded. Keep dynamic slippage offsets enabled to prevent execution drag.'
    },
    {
      id: 'strat_3',
      name: 'Mean Reversion VWAP',
      status: 'PAUSED',
      allocated: 25000.00,
      currentValue: 25000.00,
      todayReturn: 0.00,
      overallReturn: 0.00,
      todayPnL: 0.00,
      overallPnL: 0.00,
      lots: 0,
      openPositions: 0,
      riskScore: 2,
      healthScore: 98,
      aiScore: 95,
      notes: 'Fades overextended moves from the intraday VWAP standard deviation bands.',
      aiAnalysis: 'Strategy paused due to range contraction. Regime detector suggests low volatility sideways consolidations are not triggering sufficient standard deviation band breaches.'
    }
  ]);

  const [expandedId, setExpandedId] = useState<string | null>('strat_1');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStrategies(prev => 
      prev.map(s => s.id === id ? { ...s, status: s.status === 'LIVE' ? 'PAUSED' : 'LIVE' } : s)
    );
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Active Portfolio Terminal
        </h1>
        <p className="text-xs text-gray-500">
          Monitor subscribed algorithms, live allocation models, risk profiles, and execution health metrics.
        </p>
      </div>

      {/* Portfolio overview blocks answering the three questions immediately */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Q1: Money Making */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-bloomberg-green">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Net Portfolio Value</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-white font-mono">$103,797.50</h3>
            <span className="text-xs font-bold text-bloomberg-green font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +3.79% overall
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-1 block">Today: +$1,648.50 (+1.64%)</span>
        </div>

        {/* Q2: Risk Level */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Portfolio Exposure Limit</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-white font-mono">75.00%</h3>
            <span className="text-xs font-bold text-indigo-400 font-semibold">Active exposure</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-1 block">Value at Risk (VaR): $3,120.00 (95% CI)</span>
        </div>

        {/* Q3: Top Performer */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-brand">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Top Performing Algorithm</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-white font-mono">IGRIS Straddle</h3>
            <span className="text-xs font-bold text-brand font-mono">Sharpe: 2.84</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-1 block">Today return: +2.45% ROI</span>
        </div>

      </div>

      {/* Expandable Strategy List */}
      <div className="space-y-4">
        {strategies.map((strat) => {
          const isExpanded = expandedId === strat.id;
          const isLive = strat.status === 'LIVE';
          const isPnlPositive = strat.todayPnL >= 0;

          return (
            <div 
              key={strat.id} 
              className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 ${
                isExpanded ? 'border-brand/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-gray-800/80 hover:border-gray-700/80'
              }`}
            >
              
              {/* Card Header (Collapsible toggle) */}
              <div 
                onClick={() => toggleExpand(strat.id)}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer select-none bg-[#050914]/50"
              >
                
                {/* Name, Status, and Controls */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-wide">{strat.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-bloomberg-green' : 'bg-gray-600'}`} />
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                        {isLive ? 'Live Deployment' : 'System Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI block inside header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Capital Allocated</span>
                    <span className="text-white font-mono font-bold">${strat.allocated.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Today Return</span>
                    <span className={`font-mono font-bold ${isPnlPositive ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                      {isPnlPositive ? '+' : ''}{strat.todayReturn}% (${strat.todayPnL.toLocaleString()})
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Overall Return</span>
                    <span className="text-white font-mono font-bold">+{strat.overallReturn}%</span>
                  </div>

                  {/* Dynamic scores */}
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Risk</span>
                      <span className="text-bloomberg-red font-mono font-bold">{strat.riskScore}/10</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Health</span>
                      <span className="text-bloomberg-green font-mono font-bold">{strat.healthScore}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">AI Score</span>
                      <span className="text-brand font-mono font-bold">{strat.aiScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Toggle & Expand controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleStatus(strat.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-colors border ${
                      isLive 
                        ? 'bg-bloomberg-red/10 border-bloomberg-red/35 text-bloomberg-red hover:bg-bloomberg-red/20' 
                        : 'bg-bloomberg-green/10 border-bloomberg-green/35 text-bloomberg-green hover:bg-bloomberg-green/20'
                    }`}
                  >
                    {isLive ? 'Pause' : 'Activate'}
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="p-6 border-t border-gray-900 bg-[#03060c] space-y-6">
                  
                  {/* Visual Sub-Grids */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Equity Progression Bar Chart Mock */}
                    <div className="glass-panel p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Capital Curve Progression
                      </span>
                      <div className="flex items-end justify-between h-24 bg-gray-950/60 rounded-lg p-2 text-[9px] font-mono text-gray-500 border border-gray-900">
                        {[1, 2, 3, 4, 5, 6].map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center flex-1">
                            <div className="w-3 bg-brand/50 rounded-t" style={{ height: `${20 + idx * 12}px` }} />
                            <span className="mt-1">W{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monthly Performance Heatmap Mock */}
                    <div className="glass-panel p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Returns Profile Heatmap
                      </span>
                      <div className="grid grid-cols-6 gap-2 text-[10px] font-mono text-center font-bold">
                        <div className="p-2 bg-bloomberg-green/25 border border-bloomberg-green/30 text-bloomberg-green rounded">Jan<br/>+1.8%</div>
                        <div className="p-2 bg-bloomberg-green/10 border border-bloomberg-green/15 text-bloomberg-green rounded">Feb<br/>+0.6%</div>
                        <div className="p-2 bg-bloomberg-red/20 border border-bloomberg-red/25 text-bloomberg-red rounded">Mar<br/>-1.2%</div>
                        <div className="p-2 bg-bloomberg-green/30 border border-bloomberg-green/45 text-bloomberg-green rounded">Apr<br/>+2.4%</div>
                        <div className="p-2 bg-gray-900 border border-gray-800 text-gray-500 rounded">May<br/>0.0%</div>
                        <div className="p-2 bg-bloomberg-green/20 border border-bloomberg-green/25 text-bloomberg-green rounded">Jun<br/>+1.5%</div>
                      </div>
                    </div>

                    {/* Distribution Profile */}
                    <div className="glass-panel p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Win / Loss Distribution
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Winning Trades</span>
                          <span className="text-bloomberg-green font-bold">18 trades (60.0%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-bloomberg-green" style={{ width: '60%' }} />
                        </div>

                        <div className="flex justify-between mt-2">
                          <span className="text-gray-400">Losing Trades</span>
                          <span className="text-bloomberg-red font-bold">12 trades (40.0%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-bloomberg-red" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Strategy Notes & AI Analysis Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div className="bg-gray-950/65 border border-gray-900 p-5 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand" /> Strategy Deployment Notes
                      </span>
                      <p className="text-gray-300 font-medium">{strat.notes}</p>
                    </div>

                    <div className="bg-brand/5 border border-brand/20 p-5 rounded-xl">
                      <span className="text-[9px] font-bold text-brand uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Bot className="w-4 h-4" /> AI Research Analysis
                      </span>
                      <p className="text-gray-300 font-medium">{strat.aiAnalysis}</p>
                    </div>
                  </div>

                  {/* Option chain charges summary */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 border-t border-gray-900/60 pt-4">
                    <span>Broker Charges Year-to-Date: $120.40</span>
                    <span className="text-brand hover:underline cursor-pointer flex items-center">
                      View Full Strategy Metrics Sheet <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
