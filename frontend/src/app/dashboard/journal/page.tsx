'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Plus, ShieldCheck, Heart, Sparkles, Smile, ArrowUpRight, ArrowDownRight, 
  CircleDollarSign, HelpCircle, FileSpreadsheet, Eye, Save, Trash2, Sliders, ChevronDown
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  strategyName: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  emotion: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  greeks: { delta: number; theta: number; gamma: number };
  notes: string;
  reason: string;
  tags: string[];
}

export default function TradeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 'J_001',
      date: '2026-07-15',
      time: '10:30:00',
      strategyName: 'IGRIS',
      direction: 'SELL',
      entryPrice: 240.50,
      exitPrice: 190.50,
      pnl: 2500.00,
      emotion: 'DISCIPLINED',
      confidence: 'HIGH',
      greeks: { delta: -0.45, theta: 12.5, gamma: 0.02 },
      reason: 'Price revisited stored low on first 30min green-green candles. Pattern matched completely.',
      notes: 'Exited quickly at the 50 point target mark. Good execution velocity.',
      tags: ['IgrisPattern', 'Intraday', 'PutBuying']
    },
    {
      id: 'J_002',
      date: '2026-07-14',
      time: '11:15:00',
      strategyName: 'Momentum Catcher',
      direction: 'BUY',
      entryPrice: 180.00,
      exitPrice: 140.00,
      pnl: -2000.00,
      emotion: 'FEAR',
      confidence: 'LOW',
      greeks: { delta: 0.60, theta: -8.0, gamma: 0.04 },
      reason: 'Attempted to catch early momentum high breakout but trade reversed sharply.',
      notes: 'Should have waited for candle close confirmation. Felt rushed.',
      tags: ['BreakoutFail', 'StopLossTriggered']
    }
  ]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [strategy, setStrategy] = useState('IGRIS');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entry, setEntry] = useState('150');
  const [exit, setExit] = useState('200');
  const [pnl, setPnl] = useState('2500');
  const [delta, setDelta] = useState('0.5');
  const [theta, setTheta] = useState('-12.4');
  const [gamma, setGamma] = useState('0.02');
  const [notesText, setNotesText] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [emotion, setEmotion] = useState('DISCIPLINED');
  const [confidence, setConfidence] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [tagsInput, setTagsInput] = useState('');

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const timeNow = new Date().toTimeString().split(' ')[0];
    const dateNow = new Date().toISOString().split('T')[0];
    
    const newEntry: JournalEntry = {
      id: `J_${Math.floor(100 + Math.random() * 900)}`,
      date: dateNow,
      time: timeNow,
      strategyName: strategy,
      direction,
      entryPrice: parseFloat(entry),
      exitPrice: parseFloat(exit),
      pnl: parseFloat(pnl),
      emotion,
      confidence,
      greeks: {
        delta: parseFloat(delta),
        theta: parseFloat(theta),
        gamma: parseFloat(gamma),
      },
      reason: reasonText,
      notes: notesText,
      tags: tagsInput.split(',').map(x => x.trim()).filter(Boolean),
    };

    setEntries(prev => [newEntry, ...prev]);
    setShowAddForm(false);
    // Reset Form
    setNotesText('');
    setReasonText('');
    setTagsInput('');
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#1a1a2e]">
            Trade Journal
          </h1>
          <p className="text-xs text-[#64748b]">
            Document trade psychology, greeks statistics, confidence indexes, and notes.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-[#1a1a2e] font-bold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Journal Console' : 'Add Journal Entry'}
        </button>
      </div>

      {/* Form Section */}
      {showAddForm && (
        <form onSubmit={handleAddEntry} className="card p-6 rounded-lg space-y-6 max-w-3xl mx-auto">
          <h2 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#7c3aed]" /> Document Trade Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Strategy Name
              </label>
              <select
                className="w-full input-field p-3 rounded-xl text-xs"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
              >
                <option value="IGRIS">IGRIS</option>
                <option value="Momentum Catcher">Momentum Catcher</option>
                <option value="ORB">Opening Range Breakout</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Direction
              </label>
              <select
                className="w-full input-field p-3 rounded-xl text-xs"
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'BUY' | 'SELL')}
              >
                <option value="BUY">BUY / CE</option>
                <option value="SELL">SELL / PE</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Confidence
              </label>
              <select
                className="w-full input-field p-3 rounded-xl text-xs"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                required
                className="w-full input-field p-3 rounded-xl text-xs font-mono"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Exit Price
              </label>
              <input
                type="number"
                step="any"
                required
                className="w-full input-field p-3 rounded-xl text-xs font-mono"
                value={exit}
                onChange={(e) => setExit(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Net PnL (₹)
              </label>
              <input
                type="number"
                step="any"
                required
                className="w-full input-field p-3 rounded-xl text-xs font-mono"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
              />
            </div>
          </div>

          {/* Option Greeks */}
          <div className="border-t border-white/30 pt-4 space-y-4">
            <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
              Option Greeks Coordinates
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  className="w-full input-field p-3 rounded-xl text-xs font-mono"
                  placeholder="Delta"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  className="w-full input-field p-3 rounded-xl text-xs font-mono"
                  placeholder="Theta"
                  value={theta}
                  onChange={(e) => setTheta(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  className="w-full input-field p-3 rounded-xl text-xs font-mono"
                  placeholder="Gamma"
                  value={gamma}
                  onChange={(e) => setGamma(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Psychology & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Execution Emotion / Mindset
              </label>
              <select
                className="w-full input-field p-3 rounded-xl text-xs"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
              >
                <option value="DISCIPLINED">DISCIPLINED</option>
                <option value="PATIENT">PATIENT</option>
                <option value="FEAR">FEAR</option>
                <option value="GREED">GREED</option>
                <option value="FOMO">FOMO</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Meta Tags (comma separated)
              </label>
              <input
                type="text"
                className="w-full input-field p-3 rounded-xl text-xs font-mono"
                placeholder="IgrisPattern, Intraday"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Why was this trade entered? (Reasoning)
              </label>
              <textarea
                rows={3}
                required
                className="w-full input-field p-3 rounded-xl text-xs"
                placeholder="Details on indicators, setups, and charts alerts"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Post-execution Review & Notes
              </label>
              <textarea
                rows={3}
                className="w-full input-field p-3 rounded-xl text-xs"
                placeholder="Aura, discipline checks, improvements"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 rounded-xl  border border-white/30 hover:border-gray-700 text-xs font-bold text-gray-300 uppercase transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-[#1a1a2e] font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Save className="w-4 h-4" /> Save Journal Entry
            </button>
          </div>
        </form>
      )}

      {/* Journal entries lists */}
      <div className="space-y-4">
        {entries.map(entry => {
          const isWin = entry.pnl >= 0;
          return (
            <div key={entry.id} className="card p-6 rounded-lg space-y-4 relative overflow-hidden group hover:border-[#22d3ee]/35 transition-all">
              {/* Header metrics */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/30/60 pb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-[#1a1a2e] font-extrabold text-sm">{entry.strategyName}</h3>
                    <span className="text-[10px] text-[#64748b] font-mono mt-0.5 block">{entry.date} {entry.time}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    entry.direction === 'BUY' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                  }`}>
                    {entry.direction === 'BUY' ? 'LONG' : 'SHORT'}
                  </span>
                  
                  <span className="px-2 py-0.5 rounded text-[10px]  text-[#94a3b8] font-mono">
                    Delta: {entry.greeks.delta}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[9px] text-[#64748b] font-mono block uppercase">Net Profit</span>
                    <span className={`font-mono text-sm font-bold ${isWin ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isWin ? '+' : ''}₹{entry.pnl.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-[#64748b] font-mono block uppercase">Mindset</span>
                    <span className="text-[#1a1a2e] text-xs font-bold uppercase">{entry.emotion}</span>
                  </div>
                </div>
              </div>

              {/* Reasoning & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300">
                <div>
                  <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider block mb-1">
                    Entry Setup Reasoning
                  </span>
                  <p className="leading-relaxed font-medium">{entry.reason}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider block mb-1">
                    Post-Execution Notes
                  </span>
                  <p className="leading-relaxed font-medium text-[#94a3b8]">{entry.notes}</p>
                </div>
              </div>

              {/* Tags and labels */}
              <div className="flex flex-wrap gap-2 pt-2">
                {entry.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-[10px]  border border-gray-850 text-[#94a3b8] font-mono">
                    #{t}
                  </span>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
