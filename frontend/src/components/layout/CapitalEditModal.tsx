'use client';

import React, { useState, useEffect } from 'react';
import { useCapitalStore } from '../../store/capital';
import { X, Check, Edit2, RotateCcw } from 'lucide-react';

interface CapitalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { label: '₹5 Lakhs (Min)', value: 500000 },
  { label: '₹10 Lakhs', value: 1000000 },
  { label: '₹25 Lakhs', value: 2500000 },
  { label: '₹50 Lakhs', value: 5000000 },
  { label: '₹1 Crore', value: 10000000 },
  { label: '₹5 Crores', value: 50000000 },
];

export default function CapitalEditModal({ isOpen, onClose }: CapitalEditModalProps) {
  const { capital, setCapital, resetCapital } = useCapitalStore();
  const [inputValue, setInputValue] = useState(capital.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(capital.toString());
  }, [capital, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(inputValue.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive capital amount.');
      return;
    }
    setCapital(num);
    setError(null);
    onClose();
  };

  const handlePresetSelect = (val: number) => {
    setInputValue(val.toString());
    setError(null);
  };

  const handleReset = () => {
    resetCapital();
    setInputValue('500000');
    setError(null);
    onClose();
  };

  const formatLakhsCrores = (numStr: string) => {
    const num = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) return '';
    if (num >= 10000000) {
      return `(${ (num / 10000000).toFixed(2) } Crores)`;
    } else if (num >= 100000) {
      return `(${ (num / 100000).toFixed(2) } Lakhs)`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white/95 border border-white/80 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <h3 className="text-base font-bold text-[#1a1a2e] font-heading">Adjust Platform Capital</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
          Set your customized trading capital balance (Min ₹5 Lakhs). This dynamically updates across your portfolio, mission control, and paper trading simulations.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Capital Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1a2e] font-mono text-sm font-bold">
                ₹
              </span>
              <input
                type="number"
                step="10000"
                min="100000"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-[#1a1a2e] text-sm font-mono font-bold focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 transition-all"
                placeholder="500000"
              />
            </div>
            <span className="text-[11px] text-[#7c3aed] mt-1.5 block font-mono font-semibold">
              Formatted: ₹{parseFloat(inputValue || '0').toLocaleString('en-IN')} {formatLakhsCrores(inputValue)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer ${
                    parseFloat(inputValue) === preset.value
                      ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md shadow-[#7c3aed]/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Base (₹5L)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white font-bold text-xs hover:bg-[#6d28d9] shadow-md shadow-[#7c3aed]/25 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Update Capital
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
