'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/auth';
import { 
  FileCode2, ShieldAlert, Cpu, Layers, DollarSign, Calendar, Eye, Save, AlertCircle
} from 'lucide-react';

const CATEGORIES = ['MOMENTUM', 'MEAN_REVERSION', 'VWAP', 'ORB', 'OPTIONS', 'CUSTOM'];
const INSTRUMENTS = ['NIFTY', 'BANKNIFTY', 'SENSEX', 'FINNIFTY', 'MIDCAP', 'STOCKS'];
const TIMEFRAMES = ['1m', '3m', '5m', '10m', '15m', '30m', '1h', '1d'];

export default function StrategyBuilder() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('MOMENTUM');
  const [instrument, setInstrument] = useState('NIFTY');
  const [timeframe, setTimeframe] = useState('5m');
  const [direction, setDirection] = useState('BOTH');
  const [entryLogic, setEntryLogic] = useState('');
  const [exitLogic, setExitLogic] = useState('');
  const [target, setTarget] = useState('50');
  const [stopLoss, setStopLoss] = useState('25');
  const [trailingStop, setTrailingStop] = useState('');
  const [riskPercent, setRiskPercent] = useState('1.0');
  const [positionSize, setPositionSize] = useState('1.0');
  const [tradingWindow, setTradingWindow] = useState('09:15-15:15');
  const [maxTradesPerDay, setMaxTradesPerDay] = useState('3');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Strategy Name is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          category,
          instrument,
          timeframe,
          direction,
          entryLogic,
          exitLogic,
          target: parseFloat(target) || 0,
          stopLoss: parseFloat(stopLoss) || 0,
          trailingStop: trailingStop ? parseFloat(trailingStop) : null,
          riskPercent: parseFloat(riskPercent) || 1.0,
          positionSize: parseFloat(positionSize) || 1.0,
          tradingWindow,
          maxTradesPerDay: parseInt(maxTradesPerDay) || 3,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compile strategy.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/strategies');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Strategy creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Strategy Builder Studio
        </h1>
        <p className="text-xs text-gray-500">
          Design, compile, and configure quantitative trading models with institutional safety rules.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-bloomberg-red/10 border border-bloomberg-red/30 text-bloomberg-red text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-bloomberg-green/10 border border-bloomberg-green/30 text-bloomberg-green text-xs font-semibold">
          <Save className="w-5 h-5 flex-shrink-0" />
          <span>Strategy compiled and saved successfully! Redirecting to Workspace...</span>
        </div>
      )}

      {/* Builder Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Identity */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-brand" /> 1. Strategy Identity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Strategy Name
              </label>
              <input
                type="text"
                required
                className="w-full glass-input p-3 rounded-xl text-xs"
                placeholder="e.g. Trend Following Straddle"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Description / Concept
              </label>
              <input
                type="text"
                className="w-full glass-input p-3 rounded-xl text-xs"
                placeholder="Brief summary of the algorithm's thesis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                className="w-full glass-input p-3 rounded-xl text-xs"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Index / Instrument
              </label>
              <select
                className="w-full glass-input p-3 rounded-xl text-xs"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
              >
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Primary Timeframe
              </label>
              <select
                className="w-full glass-input p-3 rounded-xl text-xs"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Signal Logic */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-brand" /> 2. Signal Execution Logic
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Entry Signals (DSL / Python expression)
              </label>
              <textarea
                rows={4}
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                placeholder="CROSS_UP(CLOSE, EMA_9) AND RSI_14 > 50"
                value={entryLogic}
                onChange={(e) => setEntryLogic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Exit Signals (DSL / Python expression)
              </label>
              <textarea
                rows={4}
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                placeholder="CROSS_DOWN(CLOSE, EMA_9) OR TIME_1515"
                value={exitLogic}
                onChange={(e) => setExitLogic(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Execution Direction
            </label>
            <div className="flex gap-4">
              {['BOTH', 'LONG', 'SHORT'].map(dir => (
                <label key={dir} className="flex items-center text-xs text-gray-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    className="mr-2 accent-brand"
                    value={dir}
                    checked={direction === dir}
                    onChange={(e) => setDirection(e.target.value)}
                  />
                  {dir}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Target & Risk Rules */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-brand" /> 3. Risk & Sizing Controls
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Target Points
              </label>
              <input
                type="number"
                step="any"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                placeholder="50.0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Stop Loss Points
              </label>
              <input
                type="number"
                step="any"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                placeholder="25.0"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Trailing Stop Points
              </label>
              <input
                type="number"
                step="any"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                placeholder="Optional"
                value={trailingStop}
                onChange={(e) => setTrailingStop(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Risk Percent per Trade
              </label>
              <input
                type="number"
                step="any"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                placeholder="1.0"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Position Multiplier / Lots
              </label>
              <input
                type="number"
                step="any"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Active Trading Window
              </label>
              <input
                type="text"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                value={tradingWindow}
                onChange={(e) => setTradingWindow(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Max Trades Per Day
              </label>
              <input
                type="number"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                value={maxTradesPerDay}
                onChange={(e) => setMaxTradesPerDay(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Step 4: Notes */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-brand" /> 4. Operator Journal Notes
          </h2>
          <div>
            <textarea
              rows={3}
              className="w-full glass-input p-3 rounded-xl text-xs"
              placeholder="Record any comments, version changes, or market conditions for this deployment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/strategies')}
            className="px-6 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 uppercase transition-all"
          >
            Cancel Build
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Compiling Code...' : 'Compile & Save Strategy'}
          </button>
        </div>

      </form>
    </div>
  );
}
