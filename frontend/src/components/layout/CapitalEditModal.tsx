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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6 w-full max-w-md shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a] mb-4">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-[#22d3ee]" />
            <h3 className="text-base font-semibold text-white">Adjust Platform Capital</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#666] mb-4">
          Set your customized trading capital balance (Min ₹5 Lakhs). This dynamically updates across your portfolio, mission control, and paper trading simulations.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs text-[#666] mb-1">
              Capital Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-mono text-sm">
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
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-md py-2.5 pl-8 pr-4 text-white text-sm font-mono focus:outline-none focus:border-[#22d3ee]"
                placeholder="500000"
              />
            </div>
            <span className="text-[11px] text-[#22d3ee] mt-1 block font-mono">
              Formatted: ₹{parseFloat(inputValue || '0').toLocaleString('en-IN')} {formatLakhsCrores(inputValue)}
            </span>
          </div>

          <div>
            <label className="block text-xs text-[#666] mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`py-1.5 px-2 rounded text-xs font-mono transition-colors border ${
                    parseFloat(inputValue) === preset.value
                      ? 'bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]'
                      : 'bg-[#0a0a0a] text-[#888] border-[#1a1a1a] hover:text-white hover:border-[#333]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a] gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Base (₹5L)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded text-xs text-[#666] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#22d3ee] text-black font-medium text-xs hover:bg-[#22d3ee]/90 transition-colors"
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
