'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Percent, ArrowUpRight, ArrowDownRight, 
  BarChart2, ShieldAlert, Award, PlayCircle, RefreshCw, BarChart4, ChevronRight
} from 'lucide-react';

interface StrikeData {
  strike: number;
  callOI: number;
  callVol: number;
  callIV: number;
  callLTP: number;
  callDelta: number;
  putOI: number;
  putVol: number;
  putIV: number;
  putLTP: number;
  putDelta: number;
}

export default function MarketDashboard() {
  const [indexPrice, setIndexPrice] = useState(24300.00);
  const [strikes, setStrikes] = useState<StrikeData[]>([]);

  // Generate option chain strikes surrounding current Nifty price
  useEffect(() => {
    const baseStrike = Math.round(indexPrice / 50) * 50;
    const items: StrikeData[] = [];
    for (let offset = -5; offset <= 5; offset++) {
      const strike = baseStrike + (offset * 50);
      const isCallITM = strike < indexPrice;
      const isPutITM = strike > indexPrice;

      items.push({
        strike,
        callOI: Math.round(10000 + Math.random() * 80000),
        callVol: Math.round(5000 + Math.random() * 40000),
        callIV: Number((12.5 + Math.random() * 3.5).toFixed(2)),
        callLTP: Number((isCallITM ? (indexPrice - strike) + 20 + Math.random() * 10 : 150 / (Math.abs(offset) + 1)).toFixed(2)),
        callDelta: Number((isCallITM ? 0.5 + (Math.abs(offset) * 0.08) : 0.5 - (Math.abs(offset) * 0.08)).toFixed(2)),
        putOI: Math.round(12000 + Math.random() * 90000),
        putVol: Math.round(6000 + Math.random() * 45000),
        putIV: Number((13.0 + Math.random() * 4.0).toFixed(2)),
        putLTP: Number((isPutITM ? (strike - indexPrice) + 20 + Math.random() * 10 : 150 / (Math.abs(offset) + 1)).toFixed(2)),
        putDelta: Number((isPutITM ? -0.5 - (Math.abs(offset) * 0.08) : -0.5 + (Math.abs(offset) * 0.08)).toFixed(2)),
      });
    }
    setStrikes(items);
  }, [indexPrice]);

  // Dynamic ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setIndexPrice(prev => {
        const delta = (Math.random() - 0.5) * 5.0;
        return Number((prev + delta).toFixed(2));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Live Market Option Chain
          </h1>
          <p className="text-xs text-gray-500">
            Real-time options greeks, open interest distributions, and sector breadths scans.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-950/80 border border-gray-900 px-4 py-2.5 rounded-xl text-xs shadow-glass-inset">
          <span className="font-mono text-gray-400 font-bold">NIFTY 50 SPOT:</span>
          <span className="font-mono text-white font-bold animate-pulse">{indexPrice.toLocaleString()}</span>
          <span className="text-[10px] text-bloomberg-green font-mono font-bold">+0.46%</span>
        </div>
      </div>

      {/* Main Grid: Option Chain (Left 2.5 cols) & Market Breadth (Right 1.5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Option Chain (Cols 1 to 3) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden flex flex-col justify-between">
          
          <div className="p-5 border-b border-gray-900 bg-[#060a16]/65 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nifty Options Strike Board</span>
            <div className="flex gap-4 text-[10px] text-gray-500 font-mono">
              <span>PCR: 1.14</span>
              <span>Expiry: 23-JUL-2026 (Weekly)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[11px] font-mono border-collapse">
              <thead>
                {/* Headers calls/puts */}
                <tr className="border-b border-gray-900 bg-gray-950/30 text-[9px] text-gray-500 uppercase tracking-wider font-bold">
                  <th colSpan={5} className="py-2 border-r border-gray-900 text-center text-brand">Calls (Bullish)</th>
                  <th className="py-2 bg-gray-950 text-center text-white">Strike</th>
                  <th colSpan={5} className="py-2 border-l border-gray-900 text-center text-indigo-400">Puts (Bearish)</th>
                </tr>
                {/* Detailed headers */}
                <tr className="border-b border-gray-800 text-[9px] text-gray-500 uppercase font-bold">
                  <th className="py-2.5">OI (contracts)</th>
                  <th className="py-2.5">Volume</th>
                  <th className="py-2.5">IV %</th>
                  <th className="py-2.5">Call LTP</th>
                  <th className="py-2.5 border-r border-gray-900">Delta</th>
                  <th className="py-2.5 bg-gray-950/50 text-white font-extrabold">Strike Price</th>
                  <th className="py-2.5 border-l border-gray-900">Delta</th>
                  <th className="py-2.5">Put LTP</th>
                  <th className="py-2.5">IV %</th>
                  <th className="py-2.5">Volume</th>
                  <th className="py-2.5">OI (contracts)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/60 text-gray-300 font-semibold">
                {strikes.map((s) => {
                  const isCallITM = s.strike < indexPrice;
                  const isPutITM = s.strike > indexPrice;

                  return (
                    <tr 
                      key={s.strike} 
                      className={`hover:bg-gray-900/20 transition-colors ${
                        Math.abs(s.strike - indexPrice) <= 25 ? 'bg-brand/5 font-extrabold border-y border-brand/20' : ''
                      }`}
                    >
                      {/* Call columns */}
                      <td className={`py-3 text-gray-400 ${isCallITM ? 'bg-bloomberg-green/5' : ''}`}>{s.callOI.toLocaleString()}</td>
                      <td className={`py-3 text-gray-500 ${isCallITM ? 'bg-bloomberg-green/5' : ''}`}>{s.callVol.toLocaleString()}</td>
                      <td className={`py-3 text-gray-500 ${isCallITM ? 'bg-bloomberg-green/5' : ''}`}>{s.callIV}%</td>
                      <td className={`py-3 text-white font-bold font-mono ${isCallITM ? 'bg-bloomberg-green/5' : ''}`}>${s.callLTP}</td>
                      <td className={`py-3 border-r border-gray-900 font-mono ${isCallITM ? 'bg-bloomberg-green/5' : ''} ${s.callDelta >= 0.7 ? 'text-bloomberg-green' : 'text-gray-400'}`}>
                        {s.callDelta}
                      </td>

                      {/* Strike Price */}
                      <td className="py-3 bg-[#060a16] text-white font-bold font-sans text-xs border-x border-gray-900 shadow-glass-inset">
                        {s.strike}
                      </td>

                      {/* Put columns */}
                      <td className={`py-3 border-l border-gray-900 font-mono ${isPutITM ? 'bg-indigo-500/5' : ''} ${Math.abs(s.putDelta) >= 0.7 ? 'text-bloomberg-red' : 'text-gray-400'}`}>
                        {s.putDelta}
                      </td>
                      <td className={`py-3 text-white font-bold font-mono ${isPutITM ? 'bg-indigo-500/5' : ''}`}>${s.putLTP}</td>
                      <td className={`py-3 text-gray-500 ${isPutITM ? 'bg-indigo-500/5' : ''}`}>{s.putIV}%</td>
                      <td className={`py-3 text-gray-500 ${isPutITM ? 'bg-indigo-500/5' : ''}`}>{s.putVol.toLocaleString()}</td>
                      <td className={`py-3 text-gray-400 ${isPutITM ? 'bg-indigo-500/5' : ''}`}>{s.putOI.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Live Metrics Sidebar (Col 4) */}
        <div className="space-y-6">
          
          {/* Market breadth & volume leaders */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" /> Market Breadth
            </h2>

            {/* Advance Decline */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-bloomberg-green">Advances: 34</span>
                <span className="text-bloomberg-red">Declines: 16</span>
              </div>
              <div className="h-2.5 w-full bg-bloomberg-red rounded-full flex overflow-hidden">
                <div className="h-full bg-bloomberg-green" style={{ width: '68%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono font-bold">
                <span>Breadth: Bullish</span>
                <span>Ratio: 2.12</span>
              </div>
            </div>

            {/* Sector performance overview */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                Top Sector performance
              </span>
              <div className="space-y-2 text-xs font-semibold text-gray-300">
                {[
                  { name: 'Nifty IT', change: '+1.45%', color: 'text-bloomberg-green' },
                  { name: 'Nifty Bank', change: '+0.82%', color: 'text-bloomberg-green' },
                  { name: 'Nifty Auto', change: '-1.20%', color: 'text-bloomberg-red' },
                  { name: 'Nifty Pharma', change: '-0.65%', color: 'text-bloomberg-red' },
                ].map(sector => (
                  <div key={sector.name} className="flex justify-between border-b border-gray-900 pb-2">
                    <span>{sector.name}</span>
                    <span className={`font-mono ${sector.color}`}>{sector.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Leaders */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                Intraday Volume Leaders
              </span>
              <div className="space-y-2 text-xs font-semibold text-gray-300">
                {[
                  { symbol: 'RELIANCE', volume: '12.4M', price: '$3,120.40' },
                  { symbol: 'HDFCBANK', volume: '8.2M', price: '$1,654.80' },
                  { symbol: 'INFY', volume: '6.9M', price: '$1,545.30' },
                ].map(leader => (
                  <div key={leader.symbol} className="flex justify-between border-b border-gray-900 pb-2">
                    <span className="text-white font-bold">{leader.symbol}</span>
                    <span className="text-gray-500 font-mono">{leader.volume} shares</span>
                    <span className="text-white font-mono">{leader.price}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
