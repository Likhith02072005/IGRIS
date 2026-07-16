'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, FastForward, RotateCcw, Plus, Activity, BookOpen, AlertTriangle, 
  TrendingUp, CircleDollarSign, Check, X, ShieldCheck
} from 'lucide-react';

interface Order {
  id: string;
  time: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  qty: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}

interface Position {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  qty: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

export default function PaperTrading() {
  // Replay states
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5 | 10>(1);
  const [candleCount, setCandleCount] = useState(42);
  const [lastTickPrice, setLastTickPrice] = useState(24300.50);

  // Trade States
  const [symbol, setSymbol] = useState('NIFTY26JUL24300CE');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState(50);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('120');

  // Ledger States
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD_001', time: '09:20:15', symbol: 'NIFTY26JUL24300CE', action: 'BUY', type: 'MARKET', qty: 50, price: 118.50, status: 'EXECUTED' },
    { id: 'ORD_002', time: '10:05:42', symbol: 'BANKNIFTY26JUL52400PE', action: 'BUY', type: 'LIMIT', qty: 30, price: 210.00, status: 'EXECUTED' },
  ]);
  const [positions, setPositions] = useState<Position[]>([
    { id: 'POS_001', symbol: 'NIFTY26JUL24300CE', action: 'BUY', qty: 50, entryPrice: 118.50, currentPrice: 124.30, pnl: 290.00 },
    { id: 'POS_002', symbol: 'BANKNIFTY26JUL52400PE', action: 'BUY', qty: 30, entryPrice: 210.00, currentPrice: 224.50, pnl: 435.00 },
  ]);

  const [floatingPnL, setFloatingPnL] = useState(725.00);

  // Replay ticker effect
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 3000 / speed;
    const interval = setInterval(() => {
      // Simulate price ticks
      setCandleCount(c => c + 1);
      setLastTickPrice(p => {
        const delta = (Math.random() - 0.5) * 6;
        const newPrice = Number((p + delta).toFixed(2));
        
        // Update positions prices and PnL
        setPositions(prev => 
          prev.map(pos => {
            const tickDelta = (Math.random() - 0.48) * 2;
            const newPosPrice = Number((pos.currentPrice + tickDelta).toFixed(2));
            const multiplier = pos.action === 'BUY' ? 1 : -1;
            const newPnl = Number(((newPosPrice - pos.entryPrice) * pos.qty * multiplier).toFixed(2));
            return { ...pos, currentPrice: newPosPrice, pnl: newPnl };
          })
        );
        return newPrice;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Update total floating PnL
  useEffect(() => {
    const total = positions.reduce((acc, pos) => acc + pos.pnl, 0);
    setFloatingPnL(Number(total.toFixed(2)));
  }, [positions]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const timeNow = new Date().toTimeString().split(' ')[0];
    const fillPrice = orderType === 'MARKET' ? lastTickPrice : parseFloat(limitPrice);
    const orderId = `ORD_${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: orderId,
      time: timeNow,
      symbol,
      action,
      type: orderType,
      qty,
      price: fillPrice,
      status: 'EXECUTED',
    };

    setOrders(prev => [newOrder, ...prev]);

    // Check if position exists to aggregate, else create new
    setPositions(prev => {
      const existingIdx = prev.findIndex(x => x.symbol === symbol && x.action === action);
      if (existingIdx > -1) {
        const existing = prev[existingIdx];
        const newQty = existing.qty + qty;
        const newEntry = Number(((existing.entryPrice * existing.qty + fillPrice * qty) / newQty).toFixed(2));
        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          qty: newQty,
          entryPrice: newEntry,
          currentPrice: fillPrice,
          pnl: 0,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `POS_${Math.floor(100 + Math.random() * 900)}`,
          symbol,
          action,
          qty,
          entryPrice: fillPrice,
          currentPrice: fillPrice,
          pnl: 0,
        }
      ];
    });
  };

  const handleClosePosition = (posId: string) => {
    const pos = positions.find(x => x.id === posId);
    if (!pos) return;
    
    // Create exit order
    const timeNow = new Date().toTimeString().split(' ')[0];
    const newOrder: Order = {
      id: `ORD_${Math.floor(100 + Math.random() * 900)}`,
      time: timeNow,
      symbol: pos.symbol,
      action: pos.action === 'BUY' ? 'SELL' : 'BUY',
      type: 'MARKET',
      qty: pos.qty,
      price: pos.currentPrice,
      status: 'EXECUTED',
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setPositions(prev => prev.filter(x => x.id !== posId));
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            High-Fidelity Paper Replay
          </h1>
          <p className="text-xs text-gray-500">
            Replay candle metrics and match mock orders against ticks in real-time.
          </p>
        </div>

        {/* Replay Controls panel */}
        <div className="flex items-center gap-3 bg-gray-950/80 border border-gray-900 px-4 py-2 rounded-xl shadow-glass-inset">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-all ${
              isPlaying ? 'bg-bloomberg-red/10 text-bloomberg-red' : 'bg-bloomberg-green/10 text-bloomberg-green'
            }`}
            title={isPlaying ? 'Pause Replay' : 'Play Replay'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          
          <div className="h-6 w-[1px] bg-gray-800" />
          
          <div className="flex gap-1.5">
            {([1, 2, 5, 10] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                  speed === s ? 'bg-brand text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-gray-800" />

          <div className="text-xs font-mono text-gray-400">
            Candle: <span className="text-white font-bold">{candleCount}</span>
          </div>
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main interactive trading deck (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Virtual Chart screen placeholder */}
          <div className="glass-panel p-6 rounded-2xl h-[340px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Replay Stream Index</span>
              <span className="text-xs font-mono text-bloomberg-green font-bold">Nifty 50: {lastTickPrice.toLocaleString()}</span>
            </div>
            
            {/* Visual simulation elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[80%] h-[60%] border-b border-l border-gray-800 flex items-end">
                <div className="w-full flex items-end justify-around h-full px-4">
                  {[40, 60, 45, 70, 50, 80, 65, 85, 75, 90].map((h, i) => (
                    <div key={i} className="w-6 bg-brand/40 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center z-10">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">TradingView Chart Feed Mock</p>
              <p className="text-[10px] text-gray-500 mt-1">Replay matches historical candles data correctly at {speed}x speed.</p>
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-gray-500 border-t border-gray-900 pt-3 z-10">
              <span>09:15:00</span>
              <span>10:30:00</span>
              <span>12:00:00</span>
              <span>13:30:00</span>
              <span>15:30:00</span>
            </div>
          </div>

          {/* Ledger - Trade Book & Positions */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand" /> Active Replay Positions
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono uppercase">Floating PnL</span>
                <span className={`text-sm font-bold font-mono ${floatingPnL >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                  {floatingPnL >= 0 ? '+' : ''}${floatingPnL.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Positions Table */}
            {positions.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-xs font-mono uppercase">
                No active positions. Place order to enter market.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      <th className="pb-3">Symbol</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Avg Entry</th>
                      <th className="pb-3 text-right">Last Price</th>
                      <th className="pb-3 text-right">Unrealized PnL</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
                    {positions.map(pos => {
                      const isLong = pos.action === 'BUY';
                      return (
                        <tr key={pos.id} className="hover:bg-gray-900/20">
                          <td className="py-3 text-white font-bold">{pos.symbol}</td>
                          <td className="py-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isLong ? 'bg-bloomberg-green/10 text-bloomberg-green' : 'bg-bloomberg-red/10 text-bloomberg-red'
                            }`}>
                              {isLong ? 'LONG' : 'SHORT'}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono">{pos.qty}</td>
                          <td className="py-3 text-right font-mono">${pos.entryPrice}</td>
                          <td className="py-3 text-right font-mono">${pos.currentPrice}</td>
                          <td className={`py-3 text-right font-mono ${pos.pnl >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              className="px-2.5 py-1 rounded bg-bloomberg-red/10 hover:bg-bloomberg-red/20 text-bloomberg-red text-[10px] font-bold uppercase transition-all"
                            >
                              Exit Position
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Book Log */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Replay Transaction Audit Book
            </h2>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Qty</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 font-mono text-gray-400">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-900/10">
                      <td className="py-2.5">{o.time}</td>
                      <td className="py-2.5 text-gray-500">{o.id}</td>
                      <td className="py-2.5 text-white font-semibold font-sans">{o.symbol}</td>
                      <td className="py-2.5">
                        <span className={o.action === 'BUY' ? 'text-bloomberg-green' : 'text-bloomberg-red'}>
                          {o.action}
                        </span>
                      </td>
                      <td className="py-2.5">{o.type}</td>
                      <td className="py-2.5 text-right">${o.price}</td>
                      <td className="py-2.5 text-right">{o.qty}</td>
                      <td className="py-2.5 text-center">
                        <span className="text-[10px] font-bold text-bloomberg-green uppercase">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Col: Order Panel */}
        <div className="space-y-6">
          
          {/* Order placement panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Instant Order Entry
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Symbol selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  required
                  className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
              </div>

              {/* Action tabs BUY/SELL */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('BUY')}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    action === 'BUY' 
                      ? 'bg-bloomberg-green text-white shadow-[0_0_12px_rgba(0,255,102,0.3)]' 
                      : 'bg-gray-900 text-gray-400'
                  }`}
                >
                  Buy / CE
                </button>
                <button
                  type="button"
                  onClick={() => setAction('SELL')}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    action === 'SELL' 
                      ? 'bg-bloomberg-red text-white shadow-[0_0_12px_rgba(255,51,51,0.3)]' 
                      : 'bg-gray-900 text-gray-400'
                  }`}
                >
                  Sell / PE
                </button>
              </div>

              {/* Type MARKET/LIMIT */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MARKET', 'LIMIT'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase transition-all ${
                        orderType === t 
                          ? 'bg-brand text-white border border-brand/20 shadow-glass-inset' 
                          : 'bg-gray-900 text-gray-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Limit Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    disabled={orderType === 'MARKET'}
                    className="w-full glass-input p-3 rounded-xl text-xs font-mono disabled:opacity-40"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Status information */}
              <div className="bg-gray-950/60 border border-gray-900 p-3.5 rounded-xl space-y-2 text-[10px] font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Ticker Last Traded</span>
                  <span className="text-white">${lastTickPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Margin</span>
                  <span className="text-brand font-bold">${(qty * (orderType === 'MARKET' ? lastTickPrice : parseFloat(limitPrice)) * 0.05).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white flex items-center justify-center gap-2 ${
                  action === 'BUY' 
                    ? 'bg-bloomberg-green hover:bg-bloomberg-green/90 hover:shadow-[0_0_15px_rgba(0,255,102,0.4)]' 
                    : 'bg-bloomberg-red hover:bg-bloomberg-red/90 hover:shadow-[0_0_15px_rgba(255,51,51,0.4)]'
                }`}
              >
                Place Simulated {action} Order
              </button>
            </form>
          </div>

          {/* Replay state metrics card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-brand" /> Replay Account Balances
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-gray-900 pb-2">
                <span className="text-gray-500">Virtual Opening Bal.</span>
                <span className="text-white font-bold">$100,000.00</span>
              </div>
              <div className="flex justify-between border-b border-gray-900 pb-2">
                <span className="text-gray-500">Available Margins</span>
                <span className="text-white font-bold">$94,210.00</span>
              </div>
              <div className="flex justify-between border-b border-gray-900 pb-2">
                <span className="text-gray-500">Utilized Margins</span>
                <span className="text-white font-bold">$5,790.00</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
