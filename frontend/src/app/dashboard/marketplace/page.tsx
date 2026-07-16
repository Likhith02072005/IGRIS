'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, Cpu, Shield, Network, BarChart3, DownloadCloud,
  CheckCircle2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

interface PluginCard {
  id: string;
  name: string;
  category: 'STRATEGY' | 'INDICATOR' | 'RISK' | 'BROKER';
  version: string;
  author: string;
  description: string;
  installed: boolean;
}

export default function PluginMarketplace() {
  const [plugins, setPlugins] = useState<PluginCard[]>([
    {
      id: 'plugin_1',
      name: 'IGRIS Options Straddle',
      category: 'STRATEGY',
      version: '1.2.0',
      author: 'Igris Core Dev',
      description: 'Dynamic option buying straddle with standard volatility fading rules.',
      installed: true
    },
    {
      id: 'plugin_2',
      name: 'AngelOne Adapter Feed',
      category: 'BROKER',
      version: '1.0.0',
      author: 'AngelOne SmartAPI Team',
      description: 'Websocket connector streaming option depth sheets and greeks.',
      installed: false
    },
    {
      id: 'plugin_3',
      name: 'Kelly Criterion Allocator',
      category: 'RISK',
      version: '1.1.0',
      author: 'Risk Lab Corp',
      description: 'Custom risk module dynamically adapting positions based on win-rate odds.',
      installed: false
    },
    {
      id: 'plugin_4',
      name: 'VWAP Standard Deviation Bands',
      category: 'INDICATOR',
      version: '2.0.1',
      author: 'TradingView Community',
      description: 'Calculates rolling volume weighted average price grids and triggers alerts.',
      installed: true
    }
  ]);

  const [installingId, setInstallingId] = useState<string | null>(null);

  const handleInstall = (id: string) => {
    setInstallingId(id);
    setTimeout(() => {
      setPlugins(prev => 
        prev.map(p => p.id === id ? { ...p, installed: true } : p)
      );
      setInstallingId(null);
      alert('Plugin installed successfully!');
    }, 1500);
  };

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Plugin Marketplace
        </h1>
        <p className="text-xs text-gray-500">
          Discover, deploy, and swap analytical modules, indicators, strategy sandboxes, and broker feeds.
        </p>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Strategies', count: 12, icon: Cpu },
          { label: 'Indicators', count: 24, icon: Layers },
          { label: 'Risk Models', count: 6, icon: Shield },
          { label: 'Broker Adapters', count: 11, icon: Network },
        ].map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-gray-700/80 transition-all cursor-pointer">
              <div className="p-3 bg-brand/10 border border-brand/20 text-brand rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{cat.label}</span>
                <span className="text-[10px] text-gray-500 font-mono">{cat.count} files available</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main plugins card layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plugins.map(plugin => {
          const isInstalled = plugin.installed;
          const isInstalling = installingId === plugin.id;

          return (
            <div 
              key={plugin.id} 
              className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between gap-6 transition-all ${
                isInstalled ? 'border-brand/25' : 'border-gray-800'
              }`}
            >
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">
                      {plugin.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-white tracking-wide mt-1">{plugin.name}</h3>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">v{plugin.version}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">{plugin.description}</p>
              </div>

              <div className="flex justify-between items-center border-t border-gray-900 pt-4 text-[10px] font-mono text-gray-500">
                <span>By: {plugin.author}</span>
                {isInstalled ? (
                  <span className="flex items-center gap-1 text-bloomberg-green font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" /> Installed
                  </span>
                ) : (
                  <button
                    onClick={() => handleInstall(plugin.id)}
                    disabled={isInstalling}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider text-[9px] transition-colors"
                  >
                    <DownloadCloud className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
                    {isInstalling ? 'Installing...' : 'Deploy Plugin'}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
