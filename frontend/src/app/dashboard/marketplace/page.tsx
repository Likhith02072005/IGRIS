'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
 ShoppingBag, Cpu, Shield, Network, BarChart3, DownloadCloud,
 CheckCircle2, AlertCircle, RefreshCw, Layers, Search, ArrowRight,
 Zap, Settings, Activity, ExternalLink, X, Info
} from 'lucide-react';

interface PluginCard {
 id: string;
 name: string;
 category: 'STRATEGY' | 'INDICATOR' | 'RISK' | 'BROKER';
 version: string;
 author: string;
 description: string;
 installed: boolean;
 link?: string;
 params?: string[];
}

const ALL_PLUGINS: PluginCard[] = [
 // Strategies
 {
 id: 'plugin_nifty_martingale',
 name: 'Nifty Martingale AI (25 Indicators)',
 category: 'STRATEGY',
 version: '2.5.0',
 author: 'IGRIS Core Quant',
 description: '25 technical indicator consensus engine with x2 Martingale lot scaling (1 -> 2 -> 4 -> 8 lots) and 2.5-yr backtested drawdown recovery.',
 installed: true,
 link: '/dashboard/strategies/nifty-martingale',
 params: ['Supertrend', 'EMA Crossover', 'RSI', 'MACD', 'VWAP', 'Bollinger', 'ATR', 'Martingale x2']
 },
 {
 id: 'plugin_straddle',
 name: 'IGRIS Options Straddle',
 category: 'STRATEGY',
 version: '1.2.0',
 author: 'IGRIS Core Dev',
 description: 'Dynamic option buying straddle with standard volatility fading rules for range-bound index setups.',
 installed: true,
 link: '/dashboard/strategies',
 params: ['Theta Decay', 'IV Rank', '30-min Candle Fade']
 },
 {
 id: 'plugin_momentum',
 name: 'BankNifty Momentum Catcher',
 category: 'STRATEGY',
 version: '1.4.0',
 author: 'IGRIS Quant Lab',
 description: 'Captures volatility breakouts near opening range boundaries with dynamic stop-loss trailing.',
 installed: true,
 link: '/dashboard/strategies',
 params: ['Opening Range', 'ADX > 25', 'Volume Spike']
 },
 {
 id: 'plugin_vwap_reversion',
 name: 'VWAP Mean Reversion Fade',
 category: 'STRATEGY',
 version: '1.1.0',
 author: 'TradingView Community',
 description: 'Fades overextended moves from the intraday VWAP standard deviation bands.',
 installed: false,
 link: '/dashboard/strategies',
 params: ['VWAP 2-Std', 'RSI Divergence', 'Volume Fade']
 },

 // Indicators
 {
 id: 'ind_supertrend',
 name: 'Supertrend Multi-Timeframe (3x)',
 category: 'INDICATOR',
 version: '3.1.0',
 author: 'IGRIS Analytics',
 description: 'Triple timeframe Supertrend (5m, 15m, 1h) directional consensus indicator with trailing ATR stops.',
 installed: true,
 params: ['ATR Period: 10', 'Multiplier: 3.0', 'TF: 5m/15m/1h']
 },
 {
 id: 'ind_vwap_bands',
 name: 'VWAP Standard Deviation Bands',
 category: 'INDICATOR',
 version: '2.0.1',
 author: 'TradingView Community',
 description: 'Calculates rolling volume weighted average price grids and upper/lower 1st, 2nd, and 3rd std-dev bands.',
 installed: true,
 params: ['Anchor: Session', 'StdDev 1: 1.0', 'StdDev 2: 2.0']
 },
 {
 id: 'ind_cpr_pivots',
 name: 'Central Pivot Range (CPR) & PDH/PDL',
 category: 'INDICATOR',
 version: '1.5.0',
 author: 'Indian Market Quants',
 description: 'Plots Pivot, TC, BC levels alongside Previous Day High/Low for intraday breakout detection.',
 installed: true,
 params: ['Calculation: Traditional', 'Narrow CPR Alert: True']
 },
 {
 id: 'ind_macd_rsi',
 name: 'RSI Momentum & MACD Signal Cross',
 category: 'INDICATOR',
 version: '2.2.0',
 author: 'IGRIS Core Dev',
 description: 'Dual momentum oscillator scanning 14-period RSI divergence and MACD 12/26/9 histogram crosses.',
 installed: true,
 params: ['RSI Period: 14', 'MACD Fast: 12', 'MACD Slow: 26']
 },

 // Risk Models
 {
 id: 'risk_martingale',
 name: 'x2 Martingale Position Scaling Engine',
 category: 'RISK',
 version: '2.0.0',
 author: 'IGRIS Risk Lab',
 description: 'Automatic position doubling sequence on consecutive stop-loss hits (1 Lot -> 2 Lots -> 4 Lots -> 8 Lots) with immediate 1 Lot win reset.',
 installed: true,
 params: ['Base Lot: 1 (65 Qty)', 'Multiplier: x2', 'Max Cap: 8 Lots', 'Win Reset: True']
 },
 {
 id: 'risk_kelly',
 name: 'Kelly Criterion Optimal Allocator',
 category: 'RISK',
 version: '1.1.0',
 author: 'Risk Lab Corp',
 description: 'Custom fractional Kelly risk module dynamically adapting positions based on rolling 50-trade win-rate odds.',
 installed: true,
 params: ['Fractional Kelly: 0.25', 'Max Capital Risk: 2.0%']
 },
 {
 id: 'risk_killswitch',
 name: 'Master Emergency Kill Switch Guard',
 category: 'RISK',
 version: '1.0.0',
 author: 'IGRIS Security',
 description: 'Instant platform-wide circuit breaker liquidating all open positions and canceling pending limit orders on max daily loss breach.',
 installed: true,
 params: ['Daily Loss Limit: ₹8,000', 'Auto-Purge Orders: True']
 },

 // Broker Adapters
 {
 id: 'broker_angelone',
 name: 'AngelOne SmartAPI Connector',
 category: 'BROKER',
 version: '1.0.0',
 author: 'AngelOne SmartAPI Team',
 description: 'Low-latency WebSocket connector streaming live Nifty option depth sheets, LTP ticks, and order execution API.',
 installed: true,
 params: ['Websocket Latency: ~8ms', 'API Version: v2', 'Auto-Reconnect: True']
 },
 {
 id: 'broker_zerodha',
 name: 'Zerodha KiteConnect Feed Adapter',
 category: 'BROKER',
 version: '3.0.0',
 author: 'KiteConnect Dev',
 description: 'Official KiteConnect REST & Ticker WebSocket integration for live Nifty/BankNifty index options trading.',
 installed: true,
 params: ['Websocket Latency: ~10ms', 'GTT Orders: Enabled']
 },
 {
 id: 'broker_dhan',
 name: 'Dhan HQ Direct API Adapter',
 category: 'BROKER',
 version: '1.2.0',
 author: 'Dhan HQ Engineering',
 description: 'Direct zero-latency execution engine for Dhan trading accounts with superfast option buying order routes.',
 installed: true,
 params: ['Websocket Latency: ~12ms', 'Superfast Orders: Enabled']
 }
];

export default function PluginMarketplace() {
 const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'STRATEGY' | 'INDICATOR' | 'RISK' | 'BROKER'>('ALL');
 const [searchQuery, setSearchQuery] = useState('');
 const [plugins, setPlugins] = useState<PluginCard[]>(ALL_PLUGINS);
 const [installingId, setInstallingId] = useState<string | null>(null);
 const [activeModalPlugin, setActiveModalPlugin] = useState<PluginCard | null>(null);

 const handleInstall = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 setInstallingId(id);
 setTimeout(() => {
 setPlugins(prev => 
 prev.map(p => p.id === id ? { ...p, installed: !p.installed } : p)
 );
 setInstallingId(null);
 }, 800);
 };

 const filteredPlugins = plugins.filter(p => {
 const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
 const matchesSearch = searchQuery === '' || 
 p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 p.description.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesCat && matchesSearch;
 });

 const categoryCounts = {
 ALL: plugins.length,
 STRATEGY: plugins.filter(p => p.category === 'STRATEGY').length,
 INDICATOR: plugins.filter(p => p.category === 'INDICATOR').length,
 RISK: plugins.filter(p => p.category === 'RISK').length,
 BROKER: plugins.filter(p => p.category === 'BROKER').length,
 };

 return (
 <div className="space-y-8 relative z-10">
 
 {/* Title */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-bold uppercase tracking-wider text-[#1a1a2e]">
 Plugin & Strategy Marketplace
 </h1>
 <p className="text-xs text-[#64748b] mt-1">
 Discover, deploy, and inspect active analytical modules, 25 technical indicators, strategy algorithms, and broker adapters.
 </p>
 </div>

 {/* Search Bar */}
 <div className="relative min-w-[260px]">
 <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 placeholder="Search strategies, indicators..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full input-field pl-9 pr-4 py-2 rounded-lg text-xs font-mono"
 />
 </div>
 </div>

 {/* Interactive Pushable Category Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { key: 'STRATEGY', label: 'Strategies', count: categoryCounts.STRATEGY, icon: Cpu, desc: 'Nifty Martingale, Straddles, Momentum' },
 { key: 'INDICATOR', label: 'Indicators', count: categoryCounts.INDICATOR, icon: Layers, desc: '25 Signal Grid, VWAP, Supertrend, CPR' },
 { key: 'RISK', label: 'Risk Models', count: categoryCounts.RISK, icon: Shield, desc: 'Martingale x2, Kelly, Kill Switch' },
 { key: 'BROKER', label: 'Broker Adapters', count: categoryCounts.BROKER, icon: Network, desc: 'AngelOne, Zerodha, Dhan, Fyers' },
 ].map(cat => {
 const Icon = cat.icon;
 const isSelected = selectedCategory === cat.key;
 return (
 <button 
 key={cat.key} 
 onClick={() => setSelectedCategory(cat.key as any)}
 className={`card p-5 rounded-lg flex items-center gap-4 text-left transition-all group border ${
 isSelected 
 ? 'border-[#22d3ee] bg-[#7c3aed]/5 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
 : 'hover:border-gray-700/80 cursor-pointer'
 }`}
 >
 <div className={`p-3 rounded-xl border transition-colors ${
 isSelected 
 ? 'bg-[#7c3aed] text-black border-[#22d3ee]' 
 : 'bg-[#7c3aed]/10 border-[#22d3ee]/20 text-[#7c3aed] group-hover:bg-[#7c3aed]/20'
 }`}>
 <Icon className="w-5 h-5" />
 </div>
 <div>
 <span className={`text-xs font-bold block ${isSelected ? 'text-[#7c3aed]' : 'text-[#1a1a2e]'}`}>
 {cat.label}
 </span>
 <span className="text-[10px] text-[#64748b] font-mono block mt-0.5">
 {cat.count} Module{cat.count !== 1 ? 's' : ''} Pushable
 </span>
 </div>
 </button>
 );
 })}
 </div>

 {/* Filter Tabs Bar */}
 <div className="flex items-center gap-2 border-b border-white/30 pb-3 text-xs overflow-x-auto">
 <span className="text-[#64748b] font-mono text-[10px] mr-2">FILTER BY:</span>
 {[
 { key: 'ALL', label: 'All Modules' },
 { key: 'STRATEGY', label: 'Strategies (Nifty AI)' },
 { key: 'INDICATOR', label: '25 Indicators' },
 { key: 'RISK', label: 'Risk Models' },
 { key: 'BROKER', label: 'Broker Adapters' },
 ].map(tab => (
 <button
 key={tab.key}
 onClick={() => setSelectedCategory(tab.key as any)}
 className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
 selectedCategory === tab.key
 ? 'bg-[#7c3aed] text-black border-[#22d3ee]'
 : 'bg-[#111] border-white/30 text-[#94a3b8] hover:text-[#1a1a2e] hover:border-gray-700'
 }`}
 >
 {tab.label} ({categoryCounts[tab.key as keyof typeof categoryCounts]})
 </button>
 ))}
 </div>

 {/* Main plugins card layout */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {filteredPlugins.map(plugin => {
 const isInstalled = plugin.installed;
 const isInstalling = installingId === plugin.id;

 return (
 <div 
 key={plugin.id} 
 onClick={() => setActiveModalPlugin(plugin)}
 className={`card p-6 rounded-lg border flex flex-col justify-between gap-6 transition-all cursor-pointer group hover:border-[#22d3ee]/60 ${
 isInstalled ? 'border-white/30' : 'border-white/30 '
 }`}
 >
 
 <div className="space-y-3">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-[9px] font-bold text-[#7c3aed] uppercase tracking-widest block font-mono">
 {plugin.category}
 </span>
 <h3 className="text-sm font-extrabold text-[#1a1a2e] tracking-wide mt-1 group-hover:text-[#7c3aed] transition-colors flex items-center gap-2">
 {plugin.name}
 {plugin.link && <ExternalLink className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#7c3aed]" />}
 </h3>
 </div>
 <span className="text-[10px] text-[#64748b] font-mono">v{plugin.version}</span>
 </div>
 <p className="text-xs text-[#94a3b8] leading-relaxed font-medium">{plugin.description}</p>
 
 {/* Parameters Tag pills */}
 {plugin.params && (
 <div className="flex flex-wrap gap-1.5 pt-1">
 {plugin.params.map(p => (
 <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/30 text-[#94a3b8]">
 {p}
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Pushable Action Footer */}
 <div className="flex justify-between items-center border-t border-white/30 pt-4 text-[10px] font-mono text-[#64748b]">
 <span>By: {plugin.author}</span>
 
 <div className="flex items-center gap-2">
 {plugin.link ? (
 <Link
 href={plugin.link}
 onClick={(e) => e.stopPropagation()}
 className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#22d3ee]/30 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-black font-bold uppercase tracking-wider text-[9px] transition-all"
 >
 <Zap className="w-3 h-3" /> Open Strategy <ArrowRight className="w-3 h-3" />
 </Link>
 ) : (
 <button
 onClick={(e) => handleInstall(plugin.id, e)}
 disabled={isInstalling}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
 isInstalled
 ? 'bg-[#10b981]/10 border-[#22c55e]/30 text-[#10b981] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/30 hover:text-[#ef4444]'
 : 'bg-[#7c3aed] text-black border-[#22d3ee] hover:bg-[#7c3aed]/90'
 }`}
 >
 {isInstalled ? (
 <>
 <CheckCircle2 className="w-3.5 h-3.5" /> Installed & Active
 </>
 ) : (
 <>
 <DownloadCloud className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
 {isInstalling ? 'Activating...' : 'Enable Module'}
 </>
 )}
 </button>
 )}
 </div>
 </div>

 </div>
 );
 })}
 </div>

 {/* Plugin Details Pushable Modal */}
 {activeModalPlugin && (
 <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm backdrop-blur-sm flex items-center justify-center p-4">
 <div className="card border border-white/30 rounded-xl max-w-lg w-full p-6 space-y-6 relative">
 <button 
 onClick={() => setActiveModalPlugin(null)}
 className="absolute top-4 right-4 p-1 text-[#64748b] hover:text-[#1a1a2e] rounded-lg hover:"
 >
 <X className="w-5 h-5" />
 </button>

 <div>
 <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest font-mono">
 {activeModalPlugin.category} MODULE
 </span>
 <h2 className="text-lg font-bold text-[#1a1a2e] tracking-wide mt-1">
 {activeModalPlugin.name}
 </h2>
 <p className="text-xs text-[#64748b] font-mono mt-0.5">
 Version {activeModalPlugin.version} • Maintained by {activeModalPlugin.author}
 </p>
 </div>

 <div className="space-y-3 border border-white/30 p-4 rounded-lg">
 <span className="text-xs font-semibold text-[#1a1a2e] block">Description & Function</span>
 <p className="text-xs text-[#94a3b8] leading-relaxed">
 {activeModalPlugin.description}
 </p>
 </div>

 {activeModalPlugin.params && (
 <div className="space-y-2">
 <span className="text-xs font-semibold text-[#1a1a2e] block">Configured Parameters</span>
 <div className="grid grid-cols-2 gap-2">
 {activeModalPlugin.params.map(p => (
 <div key={p} className="p-2 border border-white/30 rounded text-xs font-mono text-gray-300">
 • {p}
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="flex justify-end gap-3 pt-4 border-t border-white/30">
 <button
 onClick={() => setActiveModalPlugin(null)}
 className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-300 text-xs font-mono hover:text-[#1a1a2e]"
 >
 Close
 </button>

 {activeModalPlugin.link ? (
 <Link
 href={activeModalPlugin.link}
 className="px-4 py-2 rounded-lg bg-[#7c3aed] text-black text-xs font-bold font-mono hover:bg-[#7c3aed]/90 flex items-center gap-1.5"
 >
 <Zap className="w-4 h-4" /> Open Strategy Page
 </Link>
 ) : (
 <button
 onClick={(e) => {
 handleInstall(activeModalPlugin.id, e);
 setActiveModalPlugin(null);
 }}
 className="px-4 py-2 rounded-lg bg-[#7c3aed] text-black text-xs font-bold font-mono hover:bg-[#7c3aed]/90"
 >
 {activeModalPlugin.installed ? 'Deactivate Module' : 'Enable & Deploy'}
 </button>
 )}
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
