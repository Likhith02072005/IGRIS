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
            <h1 className="text-xl font-bold uppercase tracking-wider text-[#1a1a2e] font-heading">
              Active Portfolio Terminal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-mono text-xs font-semibold border border-[#7c3aed]/20">
              {isFreshMode ? 'FRESH 0 BASELINE' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1 font-medium">
            Monitor subscribed algorithms, live allocation models, risk profiles, and execution health metrics in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFreshMode(!isFreshMode)}
            className="px-3.5 py-2 rounded-xl border border-white/60 bg-white/50 hover:bg-white text-xs text-[#1a1a2e] hover:text-[#7c3aed] font-mono flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7c3aed]" />
            {isFreshMode ? 'Switch to Demo Mode' : 'Reset All to Fresh ₹0'}
          </button>
        </div>
      </div>

      {/* Portfolio overview blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Net Portfolio Value */}
        <div 
          onClick={() => setIsCapitalModalOpen(true)}
          className="card p-5 rounded-2xl border-l-4 border-[#10b981] cursor-pointer hover:border-r hover:border-r-[#7c3aed] transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">Net Portfolio Value</span>
            <Edit2 className="w-3 h-3 text-[#64748b] group-hover:text-[#7c3aed]" />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-[#1a1a2e] font-mono group-hover:text-[#7c3aed] transition-colors">
              ₹{netPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${todayReturnPct >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              <TrendingUp className="w-3.5 h-3.5" /> {isFreshMode ? '0.00%' : '+3.69% overall'}
            </span>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono mt-1 block font-medium">
            Today: {todayReturnAmount >= 0 ? '+' : ''}₹{todayReturnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({todayReturnPct}%)
          </span>
        </div>

        {/* Portfolio Exposure Limit */}
        <div className="card p-5 rounded-2xl border-l-4 border-indigo-500">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-2">Portfolio Exposure Limit</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-[#1a1a2e] font-mono">75.00%</h3>
            <span className="text-xs font-bold text-indigo-500">Active exposure</span>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono mt-1 block font-medium">
            Value at Risk (VaR): ₹{varAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (95% CI)
          </span>
        </div>

        {/* Top Performer */}
        <div className="card p-5 rounded-2xl border-l-4 border-[#7c3aed]">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-2">Top Performing Algorithm</span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-[#1a1a2e] font-mono">Nifty Martingale AI</h3>
            <span className="text-xs font-bold text-[#7c3aed] font-mono">Sharpe: 2.84</span>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono mt-1 block font-medium">
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
              className={`card rounded-2xl overflow-hidden border transition-all duration-300 ${
                isExpanded ? 'border-[#7c3aed]/40 shadow-xl' : 'border-white/60 hover:border-slate-300'
              }`}
            >
              
              {/* Card Header (Collapsible toggle) */}
              <div 
                onClick={() => toggleExpand(strat.id)}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer select-none bg-white/40"
              >
                
                {/* Name, Status, and Controls */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1a2e] tracking-wide font-heading">{strat.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#10b981]' : 'bg-slate-400'}`} />
                      <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider font-semibold">
                        {isLive ? 'Live Deployment' : 'System Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI block inside header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 text-xs">
                  <div>
                    <span className="text-[9px] text-[#64748b] uppercase block tracking-wider font-bold">Capital Allocated</span>
                    <span className="text-[#1a1a2e] font-mono font-bold">₹{allocatedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#64748b] uppercase block tracking-wider font-bold">Today Return</span>
                    <span className={`font-mono font-bold ${todayPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {todayPnL >= 0 ? '+' : ''}{todayReturn}% (₹{todayPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#64748b] uppercase block tracking-wider font-bold">Overall Return</span>
                    <span className="text-[#1a1a2e] font-mono font-bold">+{overallReturn}%</span>
                  </div>

                  {/* Dynamic scores */}
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[9px] text-[#64748b] uppercase block tracking-wider font-bold">Risk</span>
                      <span className="text-[#ef4444] font-mono font-bold">{strat.riskScore}/10</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748b] uppercase block tracking-wider font-bold">Health</span>
                      <span className="text-[#10b981] font-mono font-bold">{strat.healthScore}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748b] uppercase block tracking-wider font-bold">AI Score</span>
                      <span className="text-[#7c3aed] font-mono font-bold">{strat.aiScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Toggle & Expand controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleStatus(strat.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                      isLive 
                        ? 'bg-[#ef4444]/10 border-[#ef4444]/35 text-[#ef4444] hover:bg-[#ef4444]/20' 
                        : 'bg-[#10b981]/10 border-[#10b981]/35 text-[#10b981] hover:bg-[#10b981]/20'
                    }`}
                  >
                    {isLive ? 'Pause' : 'Activate'}
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-[#64748b]" /> : <ChevronDown className="w-5 h-5 text-[#64748b]" />}
                </div>

              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-100 bg-white/70 space-y-6">
                  
                  {/* Visual Sub-Grids */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Real SVG Equity Progression Line Chart */}
                    <div className="card p-5 rounded-2xl space-y-3 bg-white/90">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">
                        Capital Curve Progression
                      </span>
                      <div className="h-28 bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
                        <div className="flex justify-between text-[10px] font-mono text-[#64748b] font-semibold">
                          <span>Base: ₹{allocatedAmount.toLocaleString()}</span>
                          <span className="text-[#10b981]">{isFreshMode ? '₹0.00 PnL' : '+₹2,450.00'}</span>
                        </div>
                        
                        {/* Dynamic SVG Line */}
                        <div className="h-16 w-full relative">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
                            <path 
                              d={isFreshMode ? "M 0 45 L 40 45 L 80 45 L 120 45 L 160 45 L 200 45" : "M 0 45 L 40 38 L 80 42 L 120 28 L 160 22 L 200 12"}
                              fill="none"
                              stroke="#7c3aed"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-[#94a3b8]">
                          <span>Week 1</span>
                          <span>Week 2</span>
                          <span>Week 3</span>
                          <span>Week 4</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Performance Heatmap */}
                    <div className="card p-5 rounded-2xl space-y-3 bg-white/90">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">
                        Returns Profile Heatmap
                      </span>
                      <div className="grid grid-cols-6 gap-2 text-[10px] font-mono text-center font-bold">
                        <div className="p-2 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] rounded-xl">Jan<br/>{isFreshMode ? '0.0%' : '+1.8%'}</div>
                        <div className="p-2 bg-[#10b981]/15 border border-[#10b981]/25 text-[#10b981] rounded-xl">Feb<br/>{isFreshMode ? '0.0%' : '+0.6%'}</div>
                        <div className="p-2 bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] rounded-xl">Mar<br/>{isFreshMode ? '0.0%' : '-1.2%'}</div>
                        <div className="p-2 bg-[#10b981]/25 border border-[#10b981]/35 text-[#10b981] rounded-xl">Apr<br/>{isFreshMode ? '0.0%' : '+2.4%'}</div>
                        <div className="p-2 bg-slate-100 border border-slate-200 text-[#64748b] rounded-xl">May<br/>0.0%</div>
                        <div className="p-2 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] rounded-xl">Jun<br/>{isFreshMode ? '0.0%' : '+1.5%'}</div>
                      </div>
                    </div>

                    {/* Win / Loss Distribution */}
                    <div className="card p-5 rounded-2xl space-y-3 bg-white/90">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">
                        Win / Loss Distribution
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#64748b] font-medium">Winning Trades</span>
                          <span className="text-[#10b981] font-bold font-mono">
                            {isFreshMode ? '0 trades (0.0%)' : '18 trades (60.0%)'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#10b981]" style={{ width: isFreshMode ? '0%' : '60%' }} />
                        </div>

                        <div className="flex justify-between mt-2">
                          <span className="text-[#64748b] font-medium">Losing Trades</span>
                          <span className="text-[#ef4444] font-bold font-mono">
                            {isFreshMode ? '0 trades (0.0%)' : '12 trades (40.0%)'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ef4444]" style={{ width: isFreshMode ? '0%' : '40%' }} />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Strategy Notes & AI Analysis Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div className="card p-5 rounded-2xl bg-white/90 border border-slate-200">
                      <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block mb-2 flex items-center gap-1.5 font-heading">
                        <FileText className="w-3.5 h-3.5 text-[#7c3aed]" /> Strategy Deployment Notes
                      </span>
                      <p className="text-[#1a1a2e] font-medium">{strat.notes}</p>
                    </div>

                    <div className="card p-5 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/20">
                      <span className="text-[9px] font-bold text-[#7c3aed] uppercase tracking-wider block mb-2 flex items-center gap-1.5 font-heading">
                        <Bot className="w-4 h-4" /> AI Research Analysis
                      </span>
                      <p className="text-[#1a1a2e] font-medium">{strat.aiAnalysis}</p>
                    </div>
                  </div>

                  {/* Option chain charges summary */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#64748b] border-t border-slate-100 pt-4 font-semibold">
                    <span>Broker Charges Year-to-Date: {isFreshMode ? '₹0.00' : '₹1,240.00'}</span>
                    <span className="text-[#7c3aed] hover:underline cursor-pointer flex items-center">
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
