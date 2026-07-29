'use client';

import React, { useState } from 'react';
import { useCapitalStore } from '../../../store/capital';
import CapitalEditModal from '../../../components/layout/CapitalEditModal';
import { 
  TrendingUp, TrendingDown, Activity, Percent, ArrowUpRight, ArrowDownRight, 
  BarChart2, ShieldAlert, Award, PlayCircle, CheckCircle2, ChevronRight, X, ChevronDown, ChevronUp,
  Cpu, Heart, Bot, FileText, Calendar, AlertTriangle, RotateCcw, Edit2
} from 'lucide-react';

interface StrategyPortfolioItem {
  id: string;
  name: string;
  status: 'LIVE' | 'PAUSED';
  allocPct: number;
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
  const { capital } = useCapitalStore();
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isFreshMode, setIsFreshMode] = useState(true); // Default to Fresh 0 Baseline

  const [strategies, setStrategies] = useState<StrategyPortfolioItem[]>([
    {
      id: 'strat_1',
      name: 'IGRIS Options Straddle (Nifty Martingale)',
      status: 'LIVE',
      allocPct: 0.45,
      todayReturn: 0.00,
      overallReturn: 0.00,
      todayPnL: 0.00,
      overallPnL: 0.00,
      lots: 1,
      openPositions: 0,
      riskScore: 3,
      healthScore: 94,
      aiScore: 92,
      notes: 'Executes 25-indicator consensus option buying with x2 Martingale lot scaling.',
      aiAnalysis: 'The strategy is actively monitoring 25 technical indicators. Live signal engine ready.'
    },
    {
      id: 'strat_2',
      name: 'Momentum Catcher Buying',
      status: 'LIVE',
      allocPct: 0.30,
      todayReturn: 0.00,
      overallReturn: 0.00,
      todayPnL: 0.00,
      overallPnL: 0.00,
      lots: 2,
      openPositions: 0,
      riskScore: 6,
      healthScore: 88,
      aiScore: 85,
      notes: 'Captures volatility breakouts near opening range boundaries.',
      aiAnalysis: 'Opening range breakout scanner standby. Dynamic slippage offsets enabled.'
    },
    {
      id: 'strat_3',
      name: 'Mean Reversion VWAP',
      status: 'PAUSED',
      allocPct: 0.25,
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
      aiAnalysis: 'Strategy paused due to low volatility consolidation regime.'
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

  // Demo toggle stats
  const netPortfolioValue = isFreshMode ? capital : capital + 18450;
  const todayReturnAmount = isFreshMode ? 0 : 1648.50;
  const todayReturnPct = isFreshMode ? 0 : 0.33;
  const varAmount = capital * 0.03; // 3% VaR

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Active Portfolio Terminal
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#22d3ee]/10 text-[#22d3ee] font-mono text-xs border border-[#22d3ee]/20">
              {isFreshMode ? 'FRESH 0 BASELINE' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Monitor subscribed algorithms, live allocation models, risk profiles, and execution health metrics in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFreshMode(!isFreshMode)}
            className="px-3 py-2 rounded bg-[#111111] border border-[#1a1a1a] hover:border-[#22d3ee] text-xs text-white hover:text-[#22d3ee] font-mono flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#22d3ee]" />
            {isFreshMode ? 'Switch to Demo Mode' : 'Reset All to Fresh ₹0'}
          </button>
        </div>
      </div>

      {/* Portfolio overview blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Net Portfolio Value */}
        <div 
          onClick={() => setIsCapitalModalOpen(true)}
          className="card p-5 rounded-lg border-l-4 border-[#22c55e] cursor-pointer hover:border-r hover:border-r-[#22d3ee] transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Net Portfolio Value</span>
            <Edit2 className="w-3 h-3 text-gray-500 group-hover:text-[#22d3ee]" />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-white font-mono group-hover:text-[#22d3ee] transition-colors">
              ₹{netPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${todayReturnPct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              <TrendingUp className="w-3.5 h-3.5" /> {isFreshMode ? '0.00%' : '+3.69% overall'}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-1 block">
            Today: {todayReturnAmount >= 0 ? '+' : ''}₹{todayReturnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({todayReturnPct}%)
          </span>
        </div>

        {/* Portfolio Exposure Limit */}
        <div className="card p-5 rounded-lg border-l-4 border-indigo-500">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Portfolio Exposure Limit</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-white font-mono">75.00%</h3>
            <span className="text-xs font-bold text-indigo-400">Active exposure</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-1 block">
            Value at Risk (VaR): ₹{varAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (95% CI)
          </span>
        </div>

        {/* Top Performer */}
        <div className="card p-5 rounded-lg border-l-4 border-[#22d3ee]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Top Performing Algorithm</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-white font-mono">Nifty Martingale AI</h3>
            <span className="text-xs font-bold text-[#22d3ee] font-mono">Sharpe: 2.84</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-1 block">
            {isFreshMode ? 'Today return: ₹0.00 (Ready)' : 'Today return: +2.45% ROI'}
          </span>
        </div>

      </div>

      {/* Expandable Strategy List */}
      <div className="space-y-4">
        {strategies.map((strat) => {
          const isExpanded = expandedId === strat.id;
          const isLive = strat.status === 'LIVE';
          const allocatedAmount = capital * strat.allocPct;
          const todayPnL = isFreshMode ? 0 : (strat.id === 'strat_1' ? 1102.50 : strat.id === 'strat_2' ? 546.00 : 0);
          const todayReturn = isFreshMode ? 0 : (strat.id === 'strat_1' ? 2.45 : strat.id === 'strat_2' ? 1.82 : 0);
          const overallReturn = isFreshMode ? 0 : (strat.id === 'strat_1' ? 5.44 : strat.id === 'strat_2' ? 4.49 : 0);

          return (
            <div 
              key={strat.id} 
              className={`card rounded-lg overflow-hidden border transition-all duration-300 ${
                isExpanded ? 'border-[#22d3ee]/40' : 'border-gray-800/80 hover:border-gray-700/80'
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
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#22c55e]' : 'bg-gray-600'}`} />
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
                    <span className="text-white font-mono font-bold">₹{allocatedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Today Return</span>
                    <span className={`font-mono font-bold ${todayPnL >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {todayPnL >= 0 ? '+' : ''}{todayReturn}% (₹{todayPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Overall Return</span>
                    <span className="text-white font-mono font-bold">+{overallReturn}%</span>
                  </div>

                  {/* Dynamic scores */}
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Risk</span>
                      <span className="text-[#ef4444] font-mono font-bold">{strat.riskScore}/10</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Health</span>
                      <span className="text-[#22c55e] font-mono font-bold">{strat.healthScore}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">AI Score</span>
                      <span className="text-[#22d3ee] font-mono font-bold">{strat.aiScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Toggle & Expand controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleStatus(strat.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-colors border ${
                      isLive 
                        ? 'bg-[#ef4444]/10 border-[#ef4444]/35 text-[#ef4444] hover:bg-[#ef4444]/20' 
                        : 'bg-[#22c55e]/10 border-[#22c55e]/35 text-[#22c55e] hover:bg-[#22c55e]/20'
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
                    
                    {/* Real SVG Equity Progression Line Chart */}
                    <div className="card p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Capital Curve Progression
                      </span>
                      <div className="h-28 bg-[#070b14] rounded-lg p-3 border border-gray-900 flex flex-col justify-between">
                        <div className="flex justify-between text-[10px] font-mono text-gray-400">
                          <span>Base: ₹{allocatedAmount.toLocaleString()}</span>
                          <span className="text-[#22c55e]">{isFreshMode ? '₹0.00 PnL' : '+₹2,450.00'}</span>
                        </div>
                        
                        {/* Dynamic SVG Line */}
                        <div className="h-16 w-full relative">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
                            <path 
                              d={isFreshMode ? "M 0 45 L 40 45 L 80 45 L 120 45 L 160 45 L 200 45" : "M 0 45 L 40 38 L 80 42 L 120 28 L 160 22 L 200 12"}
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="2"
                            />
                            {/* Area fill */}
                            <path 
                              d={isFreshMode ? "M 0 45 L 200 45 L 200 50 L 0 50 Z" : "M 0 45 L 40 38 L 80 42 L 120 28 L 160 22 L 200 12 L 200 50 L 0 50 Z"}
                              fill="url(#gradient-cyan)"
                              opacity="0.15"
                            />
                            <defs>
                              <linearGradient id="gradient-cyan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Week 1</span>
                          <span>Week 2</span>
                          <span>Week 3</span>
                          <span>Week 4</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Performance Heatmap */}
                    <div className="card p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Returns Profile Heatmap
                      </span>
                      <div className="grid grid-cols-6 gap-2 text-[10px] font-mono text-center font-bold">
                        <div className="p-2 bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] rounded">Jan<br/>{isFreshMode ? '0.0%' : '+1.8%'}</div>
                        <div className="p-2 bg-[#22c55e]/15 border border-[#22c55e]/25 text-[#22c55e] rounded">Feb<br/>{isFreshMode ? '0.0%' : '+0.6%'}</div>
                        <div className="p-2 bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] rounded">Mar<br/>{isFreshMode ? '0.0%' : '-1.2%'}</div>
                        <div className="p-2 bg-[#22c55e]/25 border border-[#22c55e]/35 text-[#22c55e] rounded">Apr<br/>{isFreshMode ? '0.0%' : '+2.4%'}</div>
                        <div className="p-2 bg-gray-900 border border-gray-800 text-gray-500 rounded">May<br/>0.0%</div>
                        <div className="p-2 bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] rounded">Jun<br/>{isFreshMode ? '0.0%' : '+1.5%'}</div>
                      </div>
                    </div>

                    {/* Win / Loss Distribution */}
                    <div className="card p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                        Win / Loss Distribution
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Winning Trades</span>
                          <span className="text-[#22c55e] font-bold font-mono">
                            {isFreshMode ? '0 trades (0.0%)' : '18 trades (60.0%)'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[#22c55e]" style={{ width: isFreshMode ? '0%' : '60%' }} />
                        </div>

                        <div className="flex justify-between mt-2">
                          <span className="text-gray-400">Losing Trades</span>
                          <span className="text-[#ef4444] font-bold font-mono">
                            {isFreshMode ? '0 trades (0.0%)' : '12 trades (40.0%)'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ef4444]" style={{ width: isFreshMode ? '0%' : '40%' }} />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Strategy Notes & AI Analysis Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div className="bg-gray-950/65 border border-gray-900 p-5 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#22d3ee]" /> Strategy Deployment Notes
                      </span>
                      <p className="text-gray-300 font-medium">{strat.notes}</p>
                    </div>

                    <div className="bg-[#22d3ee]/5 border border-[#22d3ee]/20 p-5 rounded-xl">
                      <span className="text-[9px] font-bold text-[#22d3ee] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Bot className="w-4 h-4" /> AI Research Analysis
                      </span>
                      <p className="text-gray-300 font-medium">{strat.aiAnalysis}</p>
                    </div>
                  </div>

                  {/* Option chain charges summary */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 border-t border-gray-900/60 pt-4">
                    <span>Broker Charges Year-to-Date: {isFreshMode ? '₹0.00' : '₹1,240.00'}</span>
                    <span className="text-[#22d3ee] hover:underline cursor-pointer flex items-center">
                      View Full Strategy Metrics Sheet <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

      <CapitalEditModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
      />

    </div>
  );
}
