'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Terminal, Database, Shield, Network, HardDrive, Cpu, 
  RefreshCw, CircleDollarSign, ShieldAlert, CpuIcon
} from 'lucide-react';

interface MetricsSummary {
  cpu: number;
  memory: number;
  redisQueue: number;
  dbPool: number;
}

export default function ObservabilityUI() {
  const [metrics, setMetrics] = useState<MetricsSummary>({
    cpu: 18.5,
    memory: 42.4,
    redisQueue: 2,
    dbPool: 12
  });

  const [logs, setLogs] = useState<string[]>([
    "[13:20:00] [INFO] EventBus stream listener parsed tick BANKNIFTY26JUL52400CE LTP: $112.50",
    "[13:20:04] [INFO] RiskEngine checked order limits: APPROVED (daily drawdown under threshold)",
    "[13:20:08] [INFO] Broker execution adapter Dhan HQ dispatched LIMIT BUY order ID: dh_order_8492"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Number((10 + Math.random() * 25).toFixed(1)),
        memory: Number((41.5 + Math.random() * 2.0).toFixed(1)),
        redisQueue: Math.max(0, prev.redisQueue + Math.floor((Math.random() - 0.45) * 3)),
        dbPool: prev.dbPool
      }));

      // Append new logs dynamically
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [INFO] Tick broadcasted to Redis Streams. Latency: ${Math.floor(5 + Math.random() * 15)}ms`,
        ...prev.slice(0, 10)
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 relative z-10">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          System Observability & Monitoring
        </h1>
        <p className="text-xs text-gray-500">
          Track quantitative service health metrics, system performance, memory usages, and stream latencies.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'CPU Utilization', val: `${metrics.cpu}%`, icon: Cpu, progress: metrics.cpu, color: 'bg-brand' },
          { label: 'Memory Allocation', val: `${metrics.memory}%`, icon: HardDrive, progress: metrics.memory, color: 'bg-indigo-500' },
          { label: 'Redis Queue Backlog', val: `${metrics.redisQueue} items`, icon: Activity, progress: Math.min(100, (metrics.redisQueue / 20) * 100), color: 'bg-bloomberg-green' },
          { label: 'DB Connection Pool', val: `${metrics.dbPool} open`, icon: Database, progress: 30, color: 'bg-emerald-500' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                <Icon className="w-4.5 h-4.5 text-gray-500" />
              </div>
              <span className="text-2xl font-bold font-mono text-white block">{item.val}</span>
              <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Socket Latency chart (Left 2 cols) & Log Streamer (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency Plot */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            WebSocket Latency Profiler (ms)
          </span>
          <div className="flex items-end justify-between h-48 bg-gray-950/60 border border-gray-900 rounded-xl p-4 font-mono text-[9px] text-gray-500">
            {[8, 12, 10, 15, 9, 11, 7, 13, 8].map((v, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="mb-2 text-bloomberg-green font-bold">{v}ms</span>
                <div className="w-4.5 bg-bloomberg-green/45 rounded-t" style={{ height: `${v * 8}px` }} />
                <span className="mt-2">Node {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time System Log Console */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-[272px]">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-900 pb-2">
            <Terminal className="w-4 h-4 text-brand" /> System Logger Output
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-2.5 leading-relaxed scrollbar-none">
            {logs.map((log, idx) => (
              <div key={idx} className="border-l-2 border-brand/40 pl-2">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
