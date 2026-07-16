'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle, Activity, 
  CircleDollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Power
} from 'lucide-react';

export default function RiskDashboard() {
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [dailyLossLimit, setDailyLossLimit] = useState(5000);
  const [currentLoss, setCurrentLoss] = useState(850); // Intraday loss/drawdown approx

  const handleKillSwitch = () => {
    if (killSwitchActive) {
      const confirm = window.confirm('RE-ACTIVATE PLATFORM: This will re-enable strategy deployments and order routers. Proceed?');
      if (confirm) {
        setKillSwitchActive(false);
      }
    } else {
      const confirm = window.confirm('MASTER EMERGENCY SHUTDOWN: This will instantly cancel all pending limit orders, liquidate open positions, and lock Strategy routers. Proceed?');
      if (confirm) {
        setKillSwitchActive(true);
        alert('MASTER SYSTEM DEACTIVATION: All strategies suspended, orders purged.');
      }
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          System Risk Control
        </h1>
        <p className="text-xs text-gray-500">
          Enforce institutional trading boundaries, portfolio exposure limits, and monitor margins safety.
        </p>
      </div>

      {/* Main Alert Banner when Kill Switch is Active */}
      {killSwitchActive && (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-bloomberg-red/10 border-2 border-bloomberg-red/45 text-bloomberg-red shadow-[0_0_30px_rgba(255,51,51,0.15)] animate-pulse">
          <ShieldAlert className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-extrabold uppercase text-sm tracking-wide text-white">Master Kill Switch Active</h3>
            <p className="text-xs mt-1 text-gray-400">
              All quantitative pipelines are suspended. Active execution threads blocked. Open orders purged from the exchange.
            </p>
          </div>
        </div>
      )}

      {/* Risk Metrics Overview answering the questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily loss limit progress */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Intraday Loss Limit</span>
            <span className="text-xs font-mono font-bold text-white">${currentLoss} / ${dailyLossLimit}</span>
          </div>
          <div className="h-2.5 w-full bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand" 
              style={{ width: `${(currentLoss / dailyLossLimit) * 100}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>Progress: {((currentLoss / dailyLossLimit) * 100).toFixed(1)}%</span>
            <span>Limit Left: ${dailyLossLimit - currentLoss}</span>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Maximum Drawdown Gauge</span>
            <span className="text-xs font-mono font-bold text-bloomberg-red">-3.12% / -10.00%</span>
          </div>
          <div className="h-2.5 w-full bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-bloomberg-red" 
              style={{ width: '31.2%' }} 
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>Buffer Remaining: 6.88%</span>
            <span>Regime: Safe</span>
          </div>
        </div>

        {/* Value at Risk (VaR) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Value at Risk (95% VaR)</span>
            <span className="text-xs font-mono font-bold text-white">$3,120.00</span>
          </div>
          <div className="h-2.5 w-full bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500" 
              style={{ width: '15.6%' }} 
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>Percent of Capital: 3.12%</span>
            <span>Historical model mapping</span>
          </div>
        </div>

      </div>

      {/* Grid splits: Exposure levels (Left 2 cols) & Emergency Switch (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Margin levels & Position Risk */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Capital Exposure details */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Platform Exposures and Margin Assets
            </h2>
            <div className="grid grid-cols-2 gap-6 text-xs font-semibold text-gray-300">
              <div className="border-b border-gray-900 pb-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Current Exposure</span>
                <span className="text-white font-mono font-bold">$75,000.00</span>
              </div>
              <div className="border-b border-gray-900 pb-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Margin Assets Used</span>
                <span className="text-white font-mono font-bold">$5,790.00</span>
              </div>
              <div className="border-b border-gray-900 pb-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Portfolio Heat</span>
                <span className="text-white font-mono font-bold">45.0% (Moderate)</span>
              </div>
              <div className="border-b border-gray-900 pb-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Exchange Margins Available</span>
                <span className="text-bloomberg-green font-mono font-bold">$94,210.00</span>
              </div>
            </div>
          </div>

          {/* Active exposure limits list */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Strategy Position Risk Indices
            </h2>
            <div className="space-y-4">
              {[
                { name: 'IGRIS Options Straddle', risk: 'Low', pct: 25, color: 'bg-bloomberg-green' },
                { name: 'Momentum Catcher Buying', risk: 'Medium', pct: 50, color: 'bg-brand' },
                { name: 'VWAP Reversal Fade', risk: 'Minimal', pct: 10, color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.name} className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white">Exposure: {item.pct}% ({item.risk} Risk)</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Emergency Kill Switch Box */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl text-center space-y-6 relative overflow-hidden border border-bloomberg-red/20">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-bloomberg-red" />
            
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-bloomberg-red/10 border border-bloomberg-red/25 text-bloomberg-red mb-3 animate-pulse">
              <Power className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Master Platform Kill Switch
              </h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Emergency override instruction. Triggers instant market closes for all positions across Zerodha, Dhan, and OpenAlgo nodes.
              </p>
            </div>

            <button
              onClick={handleKillSwitch}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white hover:shadow-[0_0_20px_rgba(255,51,51,0.3)] ${
                killSwitchActive 
                  ? 'bg-bloomberg-green hover:bg-bloomberg-green/90' 
                  : 'bg-bloomberg-red hover:bg-bloomberg-red/90'
              }`}
            >
              {killSwitchActive ? 'Deactivate Kill Override' : 'ACTIVATE OVERRIDE ABORT'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
