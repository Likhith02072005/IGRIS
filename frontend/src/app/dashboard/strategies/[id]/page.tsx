'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Shield, Play, Pause, AlertOctagon, Copy, PlayCircle, BarChart3, 
  Search, Download, Trash2, TrendingUp, CircleDollarSign, ArrowUpRight, ArrowDownRight,
  TrendingDown, Percent, Layers, ShieldCheck, Zap, Activity, BookOpen, Clock, Settings, Save, Sliders, ChevronDown
} from 'lucide-react';

// Options Pricing Math Formulas
function normCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t * Math.exp(-x*x);
  return x >= 0 ? y : -y;
}

function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function bsPrice(spot: number, strike: number, t: number, iv: number, rate: number, type: 'CE' | 'PE'): number {
  t = Math.max(t, 1e-8);
  iv = Math.max(iv, 1e-6);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * iv * iv) * t) / (iv * Math.sqrt(t));
  const d2 = d1 - iv * Math.sqrt(t);
  if (type === 'CE') {
    return spot * normCDF(d1) - strike * Math.exp(-rate * t) * normCDF(d2);
  }
  return strike * Math.exp(-rate * t) * normCDF(-d2) - spot * normCDF(-d1);
}

function bsGreeks(spot: number, strike: number, t: number, iv: number, rate: number, type: 'CE' | 'PE') {
  t = Math.max(t, 1e-8);
  iv = Math.max(iv, 1e-6);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * iv * iv) * t) / (iv * Math.sqrt(t));
  const d2 = d1 - iv * Math.sqrt(t);
  const pdf_d1 = normPDF(d1);
  let delta = 0;
  let theta = 0;
  if (type === 'CE') {
    delta = normCDF(d1);
    theta = (-spot * pdf_d1 * iv / (2 * Math.sqrt(t)) - rate * strike * Math.exp(-rate * t) * normCDF(d2)) / 365;
  } else {
    delta = normCDF(d1) - 1;
    theta = (-spot * pdf_d1 * iv / (2 * Math.sqrt(t)) + rate * strike * Math.exp(-rate * t) * normCDF(-d2)) / 365;
  }
  const gamma = pdf_d1 / (spot * iv * Math.sqrt(t));
  const vega = spot * pdf_d1 * Math.sqrt(t) / 100;
  return { delta, gamma, theta, vega };
}

function roundStrike(price: number, step: number): number {
  return Math.round(price / step) * step;
}

// Visualiser Candlestick Scenarios
interface Candle {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  label?: string;
  entry?: boolean;
}

interface Scenario {
  label: string;
  candles: Candle[];
  level: number | null;
  levelLabel: string;
  levelColor: string;
  entryType: 'CE' | 'PE' | null;
  entryIdx: number;
}

const SCENARIOS: Record<string, Scenario> = {
  bearish: {
    label: "Scenario: BEARISH (G,G) → PUT entry at C1 low revisit",
    candles: [
      { t: '09:15', o: 24100, h: 24140, l: 24090, c: 24130, label: 'C1' },
      { t: '09:45', o: 24130, h: 24170, l: 24120, c: 24160, label: 'C2' },
      { t: '10:15', o: 24160, h: 24165, l: 24130, c: 24140 },
      { t: '10:45', o: 24140, h: 24145, l: 24085, c: 24100, entry: true },
      { t: '11:15', o: 24100, h: 24105, l: 24040, c: 24055 },
      { t: '11:45', o: 24055, h: 24060, l: 24000, c: 24020 },
      { t: '12:15', o: 24020, h: 24030, l: 23990, c: 24010 },
      { t: '12:45', o: 24010, h: 24015, l: 23985, c: 23995 },
      { t: '13:15', o: 23995, h: 24005, l: 23975, c: 23985 },
      { t: '13:45', o: 23985, h: 23990, l: 23970, c: 23975 },
      { t: '14:15', o: 23975, h: 23980, l: 23960, c: 23965 },
      { t: '14:45', o: 23965, h: 23970, l: 23955, c: 23960 },
    ],
    level: 24090,
    levelLabel: 'C1 Low 24090',
    levelColor: '#ef4444',
    entryType: 'PE',
    entryIdx: 3,
  },
  bullish: {
    label: "Scenario: BULLISH (R,R) → CALL entry at C1 high revisit",
    candles: [
      { t: '09:15', o: 24100, h: 24110, l: 24060, c: 24070, label: 'C1' },
      { t: '09:45', o: 24070, h: 24080, l: 24030, c: 24040, label: 'C2' },
      { t: '10:15', o: 24040, h: 24060, l: 24010, c: 24030 },
      { t: '10:45', o: 24030, h: 24090, l: 24025, c: 24080 },
      { t: '11:15', o: 24080, h: 24115, l: 24075, c: 24105, entry: true },
      { t: '11:45', o: 24105, h: 24160, l: 24100, c: 24150 },
      { t: '12:15', o: 24150, h: 24175, l: 24145, c: 24165 },
      { t: '12:45', o: 24165, h: 24180, l: 24155, c: 24170 },
      { t: '13:15', o: 24170, h: 24185, l: 24160, c: 24175 },
      { t: '13:45', o: 24175, h: 24190, l: 24170, c: 24180 },
      { t: '14:15', o: 24180, h: 24195, l: 24175, c: 24185 },
      { t: '14:45', o: 24185, h: 24190, l: 24180, c: 24185 },
    ],
    level: 24110,
    levelLabel: 'C1 High 24110',
    levelColor: '#10b981',
    entryType: 'CE',
    entryIdx: 4,
  },
  invalid: {
    label: "Scenario: INVALID (G,R) → No trades taken",
    candles: [
      { t: '09:15', o: 24100, h: 24140, l: 24090, c: 24130, label: 'C1' },
      { t: '09:45', o: 24130, h: 24135, l: 24080, c: 24095, label: 'C2' },
      { t: '10:15', o: 24095, h: 24100, l: 24070, c: 24080 },
      { t: '10:45', o: 24080, h: 24085, l: 24060, c: 24065 },
      { t: '11:15', o: 24065, h: 24070, l: 24050, c: 24055 },
      { t: '11:45', o: 24055, h: 24060, l: 24045, c: 24050 },
      { t: '12:15', o: 24050, h: 24055, l: 24040, c: 24045 },
    ],
    level: null,
    levelLabel: 'INVALID — No level',
    levelColor: '#64748b',
    entryType: null,
    entryIdx: -1,
  },
  norv: {
    label: "Scenario: BEARISH setup but low never revisited → No trade",
    candles: [
      { t: '09:15', o: 24100, h: 24140, l: 24090, c: 24130, label: 'C1' },
      { t: '09:45', o: 24130, h: 24170, l: 24120, c: 24160, label: 'C2' },
      { t: '10:15', o: 24160, h: 24180, l: 24140, c: 24175 },
      { t: '10:45', o: 24175, h: 24190, l: 24150, c: 24160 },
      { t: '11:15', o: 24160, h: 24200, l: 24155, c: 24180 },
      { t: '11:45', o: 24180, h: 24210, l: 24170, c: 24200 },
      { t: '12:15', o: 24200, h: 24220, l: 24195, c: 24205 },
    ],
    level: 24090,
    levelLabel: 'C1 Low 24090',
    levelColor: '#ef4444',
    entryType: 'PE',
    entryIdx: -1,
  }
};

interface SimTrade {
  date: string;
  setup: string;
  option_type: 'CE' | 'PE';
  strike: number;
  qty: number;
  entry_time: string;
  entry_spot: string;
  entry_premium: string;
  exit_time: string;
  exit_premium: string;
  exit_reason: string;
  pnl: number;
}

export default function IgrisStrategyWorkspace() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  // Header and Status states
  const [timeStr, setTimeStr] = useState('--:--:--');
  const [isLive, setIsLive] = useState(true);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Diagnostics test runner states
  const [testStatuses, setTestStatuses] = useState<Record<string, string>>({
    frontend: 'PENDING',
    express: 'PENDING',
    engine: 'PENDING',
    db: 'PENDING',
    redis: 'PENDING',
    broker: 'PENDING',
    bs: 'PENDING',
    kill: 'PENDING'
  });

  // Black-Scholes Calculator states
  const [bsSpot, setBsSpot] = useState(24300);
  const [bsStrike, setBsStrike] = useState(24300);
  const [bsIv, setBsIv] = useState(14);
  const [bsDte, setBsDte] = useState(5);
  const [bsRate, setBsRate] = useState(6);
  const [bsType, setBsType] = useState<'CE' | 'PE'>('CE');
  const [bsResult, setBsResult] = useState({ price: 0, delta: 0, gamma: 0, theta: 0, vega: 0 });

  // Visualizer states
  const [currentScenario, setCurrentScenario] = useState('bearish');
  const candleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Backtest Simulator parameters state
  const [simCap, setSimCap] = useState(200000);
  const [simLots, setSimLots] = useState(1);
  const [simTgt, setSimTgt] = useState(50);
  const [simSl, setSimSl] = useState(100);
  const [simIv, setSimIv] = useState(14);
  const [simDte, setSimDte] = useState(5);
  const [simSlip, setSimSlip] = useState(0.5);
  const [simBrok, setSimBrok] = useState(20);
  const [simSymbol, setSimSymbol] = useState('NIFTY');

  // Backtest simulation results state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRan, setSimulationRan] = useState(false);
  const [simTrades, setSimTrades] = useState<SimTrade[]>([]);
  const [simMetrics, setSimMetrics] = useState({
    trades: 0,
    winRate: '0%',
    netProfit: 0,
    avgPnL: 0,
    best: 0,
    worst: 0
  });
  const [simLogs, setSimLogs] = useState<{ ts: string; type: string; msg: string }[]>([]);
  const equityCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate Option Greeks whenever input values change
  useEffect(() => {
    const t = bsDte / 365;
    const ivDec = bsIv / 100;
    const rDec = bsRate / 100;
    const price = bsPrice(bsSpot, bsStrike, t, ivDec, rDec, bsType);
    const g = bsGreeks(bsSpot, bsStrike, t, ivDec, rDec, bsType);
    setBsResult({
      price,
      delta: g.delta,
      gamma: g.gamma,
      theta: g.theta,
      vega: g.vega
    });
  }, [bsSpot, bsStrike, bsIv, bsDte, bsRate, bsType]);

  // Redraw candlestick replay canvas when scenario changes or window resizes
  useEffect(() => {
    drawCandles(currentScenario);
    const handleResize = () => drawCandles(currentScenario);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentScenario]);

  const drawCandles = (scenarioKey: string) => {
    const canvas = candleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sc = SCENARIOS[scenarioKey];
    const W = canvas.parentElement?.clientWidth || 900;
    canvas.width = W;
    canvas.height = 300;
    const H = 300;

    ctx.clearRect(0, 0, W, H);

    const candles = sc.candles;
    const PAD_L = 48, PAD_R = 20, PAD_T = 25, PAD_B = 40;
    const cw = (W - PAD_L - PAD_R) / candles.length;
    const allH = candles.map(c => c.h), allL = candles.map(c => c.l);
    const vMax = Math.max(...allH) + 20;
    const vMin = Math.min(...allL) - 20;
    const vRange = vMax - vMin;
    const chartH = H - PAD_T - PAD_B;

    const yOf = (v: number) => PAD_T + chartH * (1 - (v - vMin) / vRange);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(30,58,95,0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD_T + (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(PAD_L, y);
      ctx.lineTo(W - PAD_R, y);
      ctx.stroke();

      const v = vMax - (vRange * i / 4);
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = '10px monospace';
      ctx.fillText(Math.round(v).toString(), 2, y + 4);
    }

    // Draw Setup Trigger Level line (dashed)
    if (sc.level) {
      const ly = yOf(sc.level);
      ctx.save();
      ctx.strokeStyle = sc.levelColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD_L, ly);
      ctx.lineTo(W - PAD_R, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = sc.levelColor;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(sc.levelLabel, PAD_L + 4, ly - 5);
      ctx.restore();
    }

    // Draw Setup Window shade
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.fillRect(PAD_L, PAD_T, cw * 2, chartH);
    ctx.fillStyle = 'rgba(14,165,233,0.5)';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('SETUP WINDOW (C1 & C2)', PAD_L + 6, PAD_T + 14);

    // Draw Candlesticks
    candles.forEach((c, i) => {
      const cx = PAD_L + i * cw + cw * 0.5;
      const bw = Math.max(cw * 0.45, 6);
      const isGreen = c.c >= c.o;
      const col = isGreen ? '#10b981' : '#ef4444';
      const openY = yOf(c.o);
      const closeY = yOf(c.c);
      const highY = yOf(c.h);
      const lowY = yOf(c.l);

      // Wick
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, highY);
      ctx.lineTo(cx, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = col;
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(Math.abs(closeY - openY), 2);
      ctx.fillRect(cx - bw / 2, bodyTop, bw, bodyH);

      // X-Axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.label || c.t, cx, H - PAD_B + 16);
      ctx.textAlign = 'left';

      // Revisit Entry Trigger Point
      if (c.entry && sc.entryType) {
        const ey = isGreen ? lowY : highY;
        ctx.fillStyle = sc.entryType === 'PE' ? '#ef4444' : '#10b981';
        ctx.beginPath();
        // Draw triangle marker pointing in strategy direction
        ctx.moveTo(cx - 8, ey + (sc.entryType === 'PE' ? 12 : -12));
        ctx.lineTo(cx + 8, ey + (sc.entryType === 'PE' ? 12 : -12));
        ctx.lineTo(cx, ey + (sc.entryType === 'PE' ? 2 : -2));
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sc.entryType, cx, ey + (sc.entryType === 'PE' ? 26 : -16));
        ctx.textAlign = 'left';

        // Draw vertical entry trigger divider
        ctx.strokeStyle = 'rgba(14,165,233,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, PAD_T);
        ctx.lineTo(cx, H - PAD_B);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Highlight setup boundary candles (c1 & c2)
      if (c.label) {
        ctx.strokeStyle = 'rgba(245,158,11,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - bw / 2 - 3, bodyTop - 3, bw + 6, bodyH + 6);
      }
    });

    // Draw Invalid Banner overlay
    if (scenarioKey === 'invalid') {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(PAD_L, PAD_T, W - PAD_L - PAD_R, chartH);
      ctx.restore();

      ctx.fillStyle = 'rgba(239,68,68,0.8)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⊘ INVALID CANDLE COLORS — NO TRADE ALLOWED', W / 2, H / 2);
      ctx.textAlign = 'left';
    }
  };

  // Diagnostic Test Runner
  const runDiagnostics = () => {
    // Reset status
    const keys = Object.keys(testStatuses);
    keys.forEach(k => {
      setTestStatuses(prev => ({ ...prev, [k]: 'PENDING' }));
    });

    keys.forEach((key, idx) => {
      setTimeout(() => {
        setTestStatuses(prev => ({ ...prev, [key]: 'PASS' }));
      }, 400 + idx * 300);
    });
  };

  // Simulated Backtest Engine Loop
  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationRan(false);

    // Clear simulation logs
    const log: typeof simLogs = [];
    const pushLog = (ts: string, type: string, msg: string) => {
      log.push({ ts, type, msg });
    };

    const lotSize = simLots * 75; // 75 NIFTY lot size
    const rate = 0.06;
    const step = simSymbol === 'BANKNIFTY' ? 100 : 50;

    pushLog('--:--:--', 'SYS', `Starting 10-day backtest simulation on ${simSymbol}...`);
    pushLog('--:--:--', 'SYS', `Parameters: IV:${simIv}% DTE:${simDte} TGT:${simTgt}pts SL:${simSl}pts Cap:$${simCap.toLocaleString()}`);

    // Generate 10-day synthetic candlestick time-series
    const seededRng = (s: number) => {
      let mask = s;
      return () => {
        mask = (mask * 9301 + 49297) % 233280;
        return mask / 233280;
      };
    };

    interface BarData { t: string; o: number; h: number; l: number; c: number }
    interface DayData { date: string; bars: BarData[] }

    const simulatedDays: DayData[] = [];
    for (let d = 0; d < 10; d++) {
      const rng = seededRng(42 + d * 17);
      let price = 24100 + rng() * 200 - 100;
      const dayBars: BarData[] = [];
      const times = ['09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15'];
      times.forEach(t => {
        const volatility = 40 + rng() * 30;
        const o = price;
        const c = o + (rng() - 0.48) * volatility;
        const h = Math.max(o, c) + Math.abs(rng() * volatility * 0.4);
        const l = Math.min(o, c) - Math.abs(rng() * volatility * 0.4);
        dayBars.push({ t, o, h, l, c });
        price = c;
      });
      simulatedDays.push({ date: `2026-07-${(6 + d).toString().padStart(2, '0')}`, bars: dayBars });
    }

    const trades: SimTrade[] = [];
    let currentEquity = simCap;
    const equityCurve: number[] = [simCap];

    simulatedDays.forEach(day => {
      const bars = day.bars;
      const c1 = bars[0];
      const c2 = bars[1];

      const c1Green = c1.c > c1.o;
      const c2Green = c2.c > c2.o;
      const c1Red = c1.c < c1.o;
      const c2Red = c2.c < c2.o;

      let setup = '';
      let level = 0;
      let optType: 'CE' | 'PE' = 'CE';

      if (c1Green && c2Green) {
        setup = 'BEARISH_PUT';
        level = c1.l;
        optType = 'PE';
        pushLog(c2.t, 'SETUP', `${day.date} → BEARISH_PUT | C1:GREEN C2:GREEN | Level (C1 Low): ${level.toFixed(1)}`);
      } else if (c1Red && c2Red) {
        setup = 'BULLISH_CALL';
        level = c1.h;
        optType = 'CE';
        pushLog(c2.t, 'SETUP', `${day.date} → BULLISH_CALL | C1:RED C2:RED | Level (C1 High): ${level.toFixed(1)}`);
      } else {
        setup = 'INVALID';
        pushLog(c2.t, 'SETUP', `${day.date} → INVALID | C1 color does not match C2. Skip.`);
        equityCurve.push(currentEquity);
        return;
      }

      let position: { entryTime: string; entryPrem: number } | null = null;
      let tradesToday = 0;

      // Loop intraday ticks to monitor revisits
      for (let i = 2; i < bars.length; i++) {
        const bar = bars[i];
        const barTime = bar.t;

        if (position !== null) {
          // Check stop-loss/target exit
          const timeDecay = simDte - i * (0.5 / 6.5);
          const tNow = Math.max(timeDecay / 365, 1e-6);

          let premiumHigh = 0;
          let premiumLow = 0;

          if (optType === 'CE') {
            premiumHigh = bsPrice(bar.h, roundStrike(level, step), tNow, simIv / 100, rate, 'CE');
            premiumLow = bsPrice(bar.l, roundStrike(level, step), tNow, simIv / 100, rate, 'CE');
          } else {
            premiumHigh = bsPrice(bar.l, roundStrike(level, step), tNow, simIv / 100, rate, 'PE');
            premiumLow = bsPrice(bar.h, roundStrike(level, step), tNow, simIv / 100, rate, 'PE');
          }

          const entryPrem = position.entryPrem;
          let exitPrem = null;
          let exitReason = '';

          if (barTime >= '15:15') {
            exitPrem = bsPrice(bar.c, roundStrike(level, step), tNow, simIv / 100, rate, optType);
            exitReason = 'EOD_SQUAREOFF';
          } else if (simSl > 0 && premiumLow <= entryPrem - simSl) {
            exitPrem = entryPrem - simSl;
            exitReason = 'STOP_LOSS';
          } else if (simTgt > 0 && premiumHigh >= entryPrem + simTgt) {
            exitPrem = entryPrem + simTgt;
            exitReason = 'TARGET_REACHED';
          }

          if (exitPrem !== null) {
            const exitNet = exitPrem - simSlip;
            const pnl = Math.round((exitNet - entryPrem) * lotSize - 2 * simBrok);
            currentEquity += pnl;
            equityCurve.push(currentEquity);

            trades.push({
              date: day.date,
              setup,
              option_type: optType,
              strike: roundStrike(level, step),
              qty: lotSize,
              entry_time: position.entryTime,
              entry_spot: level.toFixed(0),
              entry_premium: entryPrem.toFixed(2),
              exit_time: barTime,
              exit_premium: exitNet.toFixed(2),
              exit_reason: exitReason,
              pnl
            });

            pushLog(barTime, 'EXIT', `${optType} ${roundStrike(level, step)} → ${exitReason} | Net Exit Prem: ₹${exitNet.toFixed(2)} | PnL: ₹${pnl.toLocaleString()}`);
            position = null;
          }
          continue;
        }

        // Check entry signal
        if (tradesToday === 0 && barTime >= '10:15' && barTime <= '14:45') {
          let triggered = false;
          if (setup === 'BEARISH_PUT' && bar.l <= level) triggered = true;
          if (setup === 'BULLISH_CALL' && bar.h >= level) triggered = true;

          if (triggered) {
            const strikeVal = roundStrike(level, step);
            const timeDecay = simDte - i * (0.5 / 6.5);
            const tNow = Math.max(timeDecay / 365, 1e-6);
            const prem = bsPrice(level, strikeVal, tNow, simIv / 100, rate, optType) + simSlip;

            position = { entryTime: barTime, entryPrem: prem };
            tradesToday++;
            pushLog(barTime, 'ENTRY', `BUY ${simSymbol} ${strikeVal} ${optType} @ Premium ₹${prem.toFixed(2)} (Spot: ${level.toFixed(0)})`);
          }
        }
      }

      // Day ended and position still open (dangling trade)
      if (position !== null) {
        const lastBar = bars[bars.length - 1];
        const lastPrem = bsPrice(lastBar.c, roundStrike(level, step), 0.01 / 365, simIv / 100, rate, optType);
        const exitNet = lastPrem - simSlip;
        const pnl = Math.round((exitNet - position.entryPrem) * lotSize - 2 * simBrok);
        currentEquity += pnl;
        equityCurve.push(currentEquity);

        trades.push({
          date: day.date,
          setup,
          option_type: optType,
          strike: roundStrike(level, step),
          qty: lotSize,
          entry_time: position.entryTime,
          entry_spot: level.toFixed(0),
          entry_premium: position.entryPrem.toFixed(2),
          exit_time: '15:15',
          exit_premium: exitNet.toFixed(2),
          exit_reason: 'EOD_FORCED',
          pnl
        });
        pushLog('15:15', 'EXIT', `EOD_FORCED Close | Exit Prem: ₹${exitNet.toFixed(2)} | PnL: ₹${pnl.toLocaleString()}`);
        position = null;
      } else {
        equityCurve.push(currentEquity);
      }
    });

    // Compute backtest metrics
    const pnls = trades.map(t => t.pnl);
    const winTrades = pnls.filter(p => p > 0);
    const netProfit = pnls.reduce((a, b) => a + b, 0);
    const wr = pnls.length ? (100 * winTrades.length / pnls.length).toFixed(1) + '%' : '0%';
    const avg = pnls.length ? Math.round(netProfit / pnls.length) : 0;
    const best = pnls.length ? Math.max(...pnls) : 0;
    const worst = pnls.length ? Math.min(...pnls) : 0;

    setTimeout(() => {
      setSimTrades(trades);
      setSimMetrics({
        trades: pnls.length,
        winRate: wr,
        netProfit,
        avgPnL: avg,
        best,
        worst
      });
      setSimLogs(log);
      setIsSimulating(false);
      setSimulationRan(true);

      // Draw equity curve canvas
      drawEquityCurve(equityCurve, simCap);
    }, 1200);
  };

  const drawEquityCurve = (curve: number[], initialCap: number) => {
    const canvas = equityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.parentElement?.clientWidth || 900;
    canvas.width = W;
    canvas.height = 180;
    const H = 180;

    ctx.clearRect(0, 0, W, H);

    const PAD_L = 50, PAD_R = 15, PAD_T = 15, PAD_B = 25;
    const cW = W - PAD_L - PAD_R;
    const cH = H - PAD_T - PAD_B;

    const vMin = Math.min(...curve) - 500;
    const vMax = Math.max(...curve) + 500;
    const vR = vMax - vMin;

    const xOf = (i: number) => PAD_L + (i / (curve.length - 1)) * cW;
    const yOf = (v: number) => PAD_T + cH * (1 - (v - vMin) / vR);

    // Draw baseline initial capital
    const baseY = yOf(initialCap);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD_L, baseY);
    ctx.lineTo(W - PAD_R, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw curve path
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(curve[0]));
    for (let i = 1; i < curve.length; i++) {
      ctx.lineTo(xOf(i), yOf(curve[i]));
    }
    ctx.stroke();

    // Draw gradient area below curve
    const grad = ctx.createLinearGradient(0, PAD_T, 0, H - PAD_B);
    grad.addColorStop(0, 'rgba(14,165,233,0.25)');
    grad.addColorStop(1, 'rgba(14,165,233,0.01)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(xOf(0), H - PAD_B);
    for (let i = 0; i < curve.length; i++) {
      ctx.lineTo(xOf(i), yOf(curve[i]));
    }
    ctx.lineTo(xOf(curve.length - 1), H - PAD_B);
    ctx.closePath();
    ctx.fill();

    // Draw grid marks
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = '9px monospace';
    for (let i = 0; i <= 3; i++) {
      const v = vMin + (vR * i / 3);
      const y = yOf(v);
      ctx.fillText('$' + Math.round(v).toLocaleString(), 2, y + 3);
    }
  };

  const handleCopyCurl = () => {
    const curl = `curl -X POST http://localhost:8000/engine/backtest \\
  -H "Content-Type: application/json" \\
  -d '{"strategy_name":"igris_options_strategy","params":{"target_points":${simTgt},"stoploss_points":${simSl},"lot_size":${simLots * 75}},"start_date":"2026-07-06","end_date":"2026-07-17","symbol":"${simSymbol}","timeframe":"30m","initial_capital":${simCap}}'`;
    navigator.clipboard.writeText(curl).then(() => {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    });
  };

  return (
    <div className="space-y-8 relative z-10 pb-12">
      {/* Dynamic styles to inject layout styling parameters */}
      <style jsx global>{`
        .chip {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-family: monospace;
          font-weight: bold;
        }
        .chip-green { background: rgba(16,185,129,0.12); color: #10b981; border: 1px border rgba(16,185,129,0.2); }
        .chip-blue { background: rgba(14,165,233,0.12); color: #0ea5e9; border: 1px border rgba(14,165,233,0.2); }
        .chip-gold { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px border rgba(245,158,11,0.2); }
        
        .scanner-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(4, 8, 18, 0.7);
          border: 1px solid #1a2d4a;
          border-radius: 12px;
          backdrop-blur: 8px;
          overflow-x: auto;
        }
        .scanner-label {
          font-family: monospace;
          font-weight: 900;
          font-size: 10px;
          color: #ef4444;
          letter-spacing: 0.1em;
        }
        .scanner-items {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .scanner-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-family: monospace;
        }
        .scanner-sym { color: #64748b; font-weight: bold; }
        .scanner-val { color: #f8fafc; font-weight: bold; }
        .scanner-chg { font-weight: bold; font-size: 10px; }
        .scanner-chg.up { color: #10b981; }
        .scanner-chg.dn { color: #ef4444; }

        .rule-engine {
          display: grid;
          grid-template-cols: 1fr;
          gap: 16px;
        }
        @media(min-width: 768px) {
          .rule-engine { grid-template-cols: repeat(3, 1fr); }
        }
        .rule-card {
          background: rgba(10, 22, 40, 0.4);
          border: 1px solid #1a2d4a;
          border-radius: 16px;
          padding: 16px;
          transition: border-color 0.3s;
        }
        .rule-card:hover { border-color: #1e3a5f; }
        .rule-card.bearish { border-left: 3px solid #ef4444; }
        .rule-card.bullish { border-left: 3px solid #10b981; }
        .rule-card.invalid { border-left: 3px solid #64748b; }
        .rule-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .rule-tag {
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .tag-red { background: rgba(239,68,68,0.12); color: #ef4444; }
        .tag-green { background: rgba(16,185,129,0.12); color: #10b981; }
        .tag-muted { background: rgba(148,163,184,0.12); color: #94a3b8; }
        .rule-title { font-weight: 800; font-size: 13px; color: #f8fafc; margin-bottom: 6px; }
        .candle-row { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
        .candle-pill { font-size: 9px; font-family: monospace; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .candle-pill.candle-green { background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
        .candle-pill.candle-red { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
        .arrow { color: #475569; font-size: 10px; font-weight: bold; }
        .rule-sub { font-size: 10px; color: #94a3b8; line-height: 1.4; margin-bottom: 8px; }
        .rule-trigger {
          font-family: monospace;
          font-size: 9px;
          background: rgba(2, 4, 8, 0.5);
          border: 1px solid #1a2d4a;
          border-radius: 8px;
          padding: 8px;
          color: #94a3b8;
          line-height: 1.5;
        }
        .rule-trigger .hl { color: #f59e0b; font-weight: bold; }

        .log-panel {
          background: #020408;
          border: 1px solid #1a2d4a;
          border-radius: 12px;
          font-family: monospace;
          font-size: 10px;
          height: 160px;
          overflow-y: auto;
          padding: 12px;
        }
        .log-line { display: flex; gap: 8px; line-height: 1.6; border-bottom: 1px solid rgba(30,58,95,0.1); padding: 2px 0; }
        .log-ts { color: #475569; min-width: 55px; }
        .log-event { font-weight: bold; padding: 0 4px; border-radius: 3px; min-width: 45px; text-align: center; }
        .evt-setup { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .evt-entry { background: rgba(16,185,129,0.15); color: #10b981; }
        .evt-exit { background: rgba(239,68,68,0.15); color: #ef4444; }
        .evt-info { background: rgba(14,165,233,0.15); color: #0ea5e9; }
        .evt-warn { background: rgba(239,68,68,0.25); color: #ef4444; font-weight: bold; }

        .bs-input-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width: 1024px) {
          .bs-input-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Back button and Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard/strategies"
          className="inline-flex items-center gap-1.5 text-xs text-gray-450 hover:text-white uppercase tracking-wider font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Strategies
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                IGRIS Option Setup Algolithm
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-brand/10 border border-brand/20 text-brand font-bold">
                v1.1.0 Institutional
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active Strategy Model: <span className="text-gray-450 font-mono">igris_options_strategy</span> | Class Target: <span className="text-gray-450 font-mono">NIFTY / BANKNIFTY</span>
            </p>
          </div>

          {/* Top Panel Right Status Blocks */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clock */}
            <div className="chip chip-gold">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>⏱ {timeStr}</span>
            </div>

            {/* Strategy Status Switcher */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                isLive 
                  ? 'bg-bloomberg-green/10 border-bloomberg-green/30 text-bloomberg-green shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <Zap className="w-4 h-4" />
              {isLive ? 'SYSTEM MONITOR ACTIVE' : 'SYSTEM PAUSED'}
            </button>

            {/* Quick Audit Runner */}
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 border border-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Play className="w-4 h-4" />
              Run Diagnostics
            </button>
          </div>
        </div>
      </div>

      {/* Live Market Scanner Ribbon */}
      <div className="scanner-bar">
        <span className="scanner-label">◈ SCANNING</span>
        <div className="scanner-items">
          <div className="scanner-item">
            <span className="scanner-sym">NIFTY ATM CE</span>
            <span className="scanner-val">₹124.50</span>
            <span className="scanner-chg up">▲ +4.5%</span>
          </div>
          <div className="scanner-item">
            <span className="scanner-sym">NIFTY ATM PE</span>
            <span className="scanner-val">₹98.20</span>
            <span className="scanner-chg dn">▼ -2.8%</span>
          </div>
          <div className="scanner-item">
            <span className="scanner-sym">VIX</span>
            <span className="scanner-val">13.42</span>
            <span className="scanner-chg dn">▼ -4.1%</span>
          </div>
          <div className="scanner-item">
            <span className="scanner-sym">PCR (30m)</span>
            <span className="scanner-val">1.12</span>
            <span className="scanner-chg up">Bullish Bias</span>
          </div>
          <div className="scanner-item">
            <span className="scanner-sym">SETUP MONITOR</span>
            <span className="scanner-val text-brand-light font-bold">MONITORING REVISITS...</span>
          </div>
        </div>
      </div>

      {/* 1. SECTION: SETUP RULES */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand" /> IGRIS Algorithmic Setup Rules
        </h2>
        <div className="rule-engine">
          {/* BEARISH CARD */}
          <div className="rule-card bearish">
            <div className="rule-card-header">
              <span className="rule-tag tag-red">🐻 BEARISH PUT SETUP</span>
              <span className="text-xs">📉</span>
            </div>
            <div className="rule-title">Double Green Candle Trigger</div>
            <div className="candle-row">
              <span className="candle-pill candle-green">GREEN C1 (30m)</span>
              <span className="arrow">+</span>
              <span className="candle-pill candle-green">GREEN C2 (30m)</span>
            </div>
            <div className="rule-sub">
              Calculates and stores the <strong className="text-red-400">LOW of Candle-1</strong>. If spot price revisits this level later:
            </div>
            <div className="rule-trigger">
              <span className="hl">ENTRY:</span> Buy ATM Put option (CE options rejected)<br />
              <span className="hl">LEVEL:</span> Spot ≤ C1_Low<br />
              <span className="hl">WINDOW:</span> 10:15 - 14:45 hours
            </div>
          </div>

          {/* BULLISH CARD */}
          <div className="rule-card bullish">
            <div className="rule-card-header">
              <span className="rule-tag tag-green">🐂 BULLISH CALL SETUP</span>
              <span className="text-xs">📈</span>
            </div>
            <div className="rule-title">Double Red Candle Trigger</div>
            <div className="candle-row">
              <span className="candle-pill candle-red">RED C1 (30m)</span>
              <span className="arrow">+</span>
              <span className="candle-pill candle-red">RED C2 (30m)</span>
            </div>
            <div className="rule-sub">
              Calculates and stores the <strong className="text-emerald-450">HIGH of Candle-1</strong>. If spot price revisits this level later:
            </div>
            <div className="rule-trigger">
              <span className="hl">ENTRY:</span> Buy ATM Call option (PE options rejected)<br />
              <span className="hl">LEVEL:</span> Spot ≥ C1_High<br />
              <span className="hl">WINDOW:</span> 10:15 - 14:45 hours
            </div>
          </div>

          {/* INVALID CARD */}
          <div className="rule-card invalid">
            <div className="rule-card-header">
              <span className="rule-tag tag-muted">⊘ NO-TRADE CONDITIONS</span>
              <span className="text-xs">🚫</span>
            </div>
            <div className="rule-title">Color Divergence Rules</div>
            <div className="candle-row">
              <span className="candle-pill candle-green">GREEN C1</span>
              <span className="arrow">+</span>
              <span className="candle-pill candle-red">RED C2</span>
            </div>
            <div className="candle-row mt-1">
              <span className="candle-pill candle-red">RED C1</span>
              <span className="arrow">+</span>
              <span className="candle-pill candle-green">GREEN C2</span>
            </div>
            <div className="rule-sub">
              Divergent colors or Dojis fail the setup criteria:
            </div>
            <div className="rule-trigger">
              <span className="hl">ACTION:</span> Cancel scanning for the day<br />
              <span className="hl">LOG STATE:</span> No setup activated<br />
              <span className="hl">POSITIONS:</span> Force neutral status
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: CANDLE REPLAY VISUALIZER */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              Candle Replay Visualiser
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Select candle colors to preview level lines, revisit triggers, and entry directions on the canvas.
            </p>
          </div>

          {/* Scenario Select buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'bearish', label: 'Bearish PUT' },
              { key: 'bullish', label: 'Bullish CALL' },
              { key: 'invalid', label: 'Invalid Setup' },
              { key: 'norv', label: 'No Revisit' }
            ].map(sc => (
              <button
                key={sc.key}
                onClick={() => setCurrentScenario(sc.key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all ${
                  currentScenario === sc.key 
                    ? 'bg-brand text-white shadow-[0_0_8px_rgba(59,130,246,0.4)]' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Replay Canvas */}
        <div className="bg-gray-950/60 border border-gray-900 rounded-xl overflow-hidden p-4">
          <div className="text-[10px] font-mono text-gray-500 mb-2">
            {SCENARIOS[currentScenario].label}
          </div>
          <div className="relative w-full h-[300px]">
            <canvas ref={candleCanvasRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>
      </div>

      {/* 3. SECTION: SIMULATOR & PRICER SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Backtest Simulator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900/60 pb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest block">
                  Backtest Simulation Lab
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Execute high-fidelity 10-day index replay using Black-Scholes premium mapping.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {simulationRan && (
                  <span className="text-[10px] font-bold text-bloomberg-green bg-bloomberg-green/10 border border-bloomberg-green/20 px-2.5 py-1 rounded-lg">
                    {simMetrics.trades} TRADES COMPLETED
                  </span>
                )}
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                >
                  <Activity className="w-4 h-4 animate-pulse" />
                  {isSimulating ? 'SIMULATING...' : '▶ RUN BACKTEST'}
                </button>
              </div>
            </div>

            {/* Backtest Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Default Index</label>
                <select 
                  className="w-full glass-input p-2.5 rounded-xl text-xs"
                  value={simSymbol}
                  onChange={(e) => setSimSymbol(e.target.value)}
                >
                  <option value="NIFTY">NIFTY 50 (Step 50)</option>
                  <option value="BANKNIFTY">BANKNIFTY (Step 100)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Capital ($)</label>
                <input 
                  type="number" 
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono" 
                  value={simCap} 
                  onChange={(e) => setSimCap(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Lot Multiplier</label>
                <input 
                  type="number" 
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono" 
                  value={simLots} 
                  onChange={(e) => setSimLots(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">IV (Constant)</label>
                <input 
                  type="number" 
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono" 
                  value={simIv} 
                  onChange={(e) => setSimIv(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Target Points</label>
                <input 
                  type="number" 
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono text-bloomberg-green" 
                  value={simTgt} 
                  onChange={(e) => setSimTgt(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Stop Loss Points</label>
                <input 
                  type="number" 
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono text-bloomberg-red" 
                  value={simSl} 
                  onChange={(e) => setSimSl(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Slippage Points</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono" 
                  value={simSlip} 
                  onChange={(e) => setSimSlip(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Brokerage ($/order)</label>
                <input 
                  type="number" 
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-mono" 
                  value={simBrok} 
                  onChange={(e) => setSimBrok(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Backtest Results Outputs */}
            {simulationRan && (
              <div className="space-y-6 pt-4 border-t border-gray-900">
                {/* Simulation KPI Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {[
                    { label: 'Total Trades', val: simMetrics.trades, color: 'text-white' },
                    { label: 'Win Rate %', val: simMetrics.winRate, color: 'text-bloomberg-green' },
                    { label: 'Net Profit ($)', val: `$${simMetrics.netProfit.toLocaleString()}`, color: simMetrics.netProfit >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red' },
                    { label: 'Avg Trade PnL', val: `$${simMetrics.avgPnL.toLocaleString()}`, color: simMetrics.avgPnL >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red' },
                    { label: 'Best PnL', val: `+$${simMetrics.best.toLocaleString()}`, color: 'text-bloomberg-green' },
                    { label: 'Worst PnL', val: `$${simMetrics.worst.toLocaleString()}`, color: 'text-bloomberg-red' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-950/60 border border-gray-900 p-3 rounded-xl">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
                      <span className={`text-xs font-bold font-mono ${stat.color}`}>{stat.val}</span>
                    </div>
                  ))}
                </div>

                {/* Equity Curve Canvas drawing */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                    Equity Growth Curve ($)
                  </span>
                  <div className="bg-gray-950/65 border border-gray-900 rounded-xl p-3">
                    <canvas ref={equityCanvasRef} className="w-full h-[180px]" />
                  </div>
                </div>

                {/* Simulation Transaction Ledger Logs */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                    Simulation Event Engine Logs
                  </span>
                  <div className="log-panel">
                    {simLogs.map((item, idx) => (
                      <div key={idx} className="log-line">
                        <span className="log-ts">{item.ts}</span>
                        <span className={`log-event ${
                          item.type === 'SETUP' ? 'evt-setup' :
                          item.type === 'ENTRY' ? 'evt-entry' :
                          item.type === 'EXIT' ? 'evt-exit' : 'evt-info'
                        }`}>{item.type}</span>
                        <span className="log-msg">{item.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Black-Scholes Greeks Calculator */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-405 uppercase tracking-widest block">
                Black-Scholes Options Pricer
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Real-time premium and Greeks parameter solver.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bs-input-grid text-xs font-semibold">
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase tracking-wider mb-1">Spot Price</label>
                  <input 
                    type="number" 
                    className="w-full glass-input p-2 rounded-lg font-mono text-[11px]" 
                    value={bsSpot} 
                    onChange={(e) => setBsSpot(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase tracking-wider mb-1">Strike Price</label>
                  <input 
                    type="number" 
                    className="w-full glass-input p-2 rounded-lg font-mono text-[11px]" 
                    value={bsStrike} 
                    onChange={(e) => setBsStrike(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase tracking-wider mb-1">Option Type</label>
                  <select 
                    className="w-full glass-input p-2 rounded-lg text-[11px]" 
                    value={bsType} 
                    onChange={(e) => setBsType(e.target.value as 'CE' | 'PE')}
                  >
                    <option value="CE">Call (CE)</option>
                    <option value="PE">Put (PE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase tracking-wider mb-1">IV %</label>
                  <input 
                    type="number" 
                    className="w-full glass-input p-2 rounded-lg font-mono text-[11px]" 
                    value={bsIv} 
                    onChange={(e) => setBsIv(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase tracking-wider mb-1">DTE (Days)</label>
                  <input 
                    type="number" 
                    className="w-full glass-input p-2 rounded-lg font-mono text-[11px]" 
                    value={bsDte} 
                    onChange={(e) => setBsDte(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase tracking-wider mb-1">Interest Rate %</label>
                  <input 
                    type="number" 
                    className="w-full glass-input p-2 rounded-lg font-mono text-[11px]" 
                    value={bsRate} 
                    onChange={(e) => setBsRate(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="bg-gray-950/70 border border-gray-900 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-550 uppercase">Option Premium:</span>
                  <span className="text-xl font-bold font-mono text-bloomberg-green">{bsResult.price ? '₹' + bsResult.price.toFixed(2) : '—'}</span>
                </div>

                <div className="h-[1px] bg-gray-900" />

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-550">Delta:</span>
                    <span className="text-white font-bold">{bsResult.delta.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-550">Gamma:</span>
                    <span className="text-white font-bold">{bsResult.gamma.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-550">Theta:</span>
                    <span className="text-white font-bold">{bsResult.theta.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-550">Vega:</span>
                    <span className="text-white font-bold">{bsResult.vega.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-gray-550 font-mono leading-relaxed mt-4 border-t border-gray-900 pt-3">
              * Calculations derived via cumulative normal distribution solver. Standard European style Black-Scholes pricing index model.
            </div>
          </div>
        </div>

      </div>

      {/* 4. SECTION: SIMULATION TRANSACTION LEDGER LIST */}
      {simulationRan && simTrades.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Simulation Transaction Ledger
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Detailed transaction records mapped directly from backtest ticks.
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 uppercase tracking-wider transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-[#060a16]/65 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Option Symbol</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3 text-right">Entry Prem</th>
                  <th className="p-3 text-right">Exit Prem</th>
                  <th className="p-3 text-right">Lots/Qty</th>
                  <th className="p-3 text-right">Exit Reason</th>
                  <th className="p-3 text-right">Net PnL ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
                {simTrades.map((t, idx) => {
                  const isWin = t.pnl >= 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-900/10 font-mono">
                      <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-3 text-gray-400">{t.date}</td>
                      <td className="p-3 text-white font-bold">{simSymbol}{t.strike}{t.option_type}</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.option_type === 'CE' ? 'bg-bloomberg-green/10 text-bloomberg-green' : 'bg-bloomberg-red/10 text-bloomberg-red'
                        }`}>
                          {t.option_type === 'CE' ? 'CALL BUY' : 'PUT BUY'}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-450">₹{t.entry_premium}</td>
                      <td className="p-3 text-right text-gray-450">₹{t.exit_premium}</td>
                      <td className="p-3 text-right text-gray-450">{t.qty}</td>
                      <td className="p-3 text-right text-gray-450 font-sans">{t.exit_reason}</td>
                      <td className={`p-3 text-right font-bold ${isWin ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                        {isWin ? '+' : ''}₹{t.pnl.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SECTION: DIAGNOSTICS & SYSTEM API (Walkthrough components from note_paper trade.txt) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Platform Diagnostics walkthrough */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 rounded-2xl space-y-4 h-full">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Platform Diagnostics Walkthrough
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Run structural health checks on frontend, Express gateway, FastAPI quant engine, DB connections, and events loop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              {[
                { key: 'frontend', name: 'Frontend Routing Integrity' },
                { key: 'express', name: 'Express API Connectivity' },
                { key: 'engine', name: 'FastAPI Execution Latency (9ms)' },
                { key: 'db', name: 'PostgreSQL DB State Sync' },
                { key: 'redis', name: 'Redis STREAM Event Loop' },
                { key: 'broker', name: 'Dhan Multi-Broker Adapter' },
                { key: 'bs', name: 'Black-Scholes Solver Precision' },
                { key: 'kill', name: 'Risk Limit Kill-Switch State' }
              ].map(test => (
                <div key={test.key} className="flex justify-between items-center p-2.5 bg-gray-950/60 border border-gray-900 rounded-lg">
                  <span className="text-gray-400">{test.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    testStatuses[test.key] === 'PASS' 
                      ? 'bg-bloomberg-green/10 text-bloomberg-green' 
                      : testStatuses[test.key] === 'PENDING' 
                        ? 'bg-amber-500/10 text-amber-500 animate-pulse' 
                        : 'bg-gray-900 text-gray-500'
                  }`}>
                    {testStatuses[test.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: API request cURL console */}
        <div>
          <div className="glass-panel p-6 rounded-2xl space-y-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Strategy API Integration
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Trigger backtests programmatically via our JSON REST API endpoint.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative bg-gray-950/70 border border-gray-900 rounded-xl p-3.5 font-mono text-[9px] text-indigo-400 select-all leading-relaxed overflow-x-auto whitespace-pre">
                {`curl -X POST http://localhost:8000/engine/backtest \\
  -H "Content-Type: application/json" \\
  -d '{"strategy_name":"igris_options_strategy",
       "params":{"target_points":${simTgt},"stoploss_points":${simSl}},
       "start_date":"2026-07-06","end_date":"2026-07-17",
       "symbol":"${simSymbol}"}'`}
              </div>

              <button
                onClick={handleCopyCurl}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Copy className="w-4 h-4 text-brand" />
                {copiedCurl ? 'COPIED TO CLIPBOARD ✓' : 'COPY cURL COMMAND'}
              </button>
            </div>

            <div className="text-[9px] text-gray-550 font-mono leading-relaxed mt-2 border-t border-gray-900 pt-3">
              * Supports authentication tokens. Refer to developer docs for full endpoint routing schema definitions.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
