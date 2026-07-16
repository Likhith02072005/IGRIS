import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const preloadedStrategies = [
  {
    name: "ASTRA",
    description: "Wait first 30 minute candle. If green/green setup, buy Put on Low revisit. If red/red setup, buy Call on High revisit. Target 50 pts, SL 100 pts. Exit 3:15 PM.",
    category: "OPTIONS",
    instrument: "BANKNIFTY",
    timeframe: "30m",
    direction: "BOTH",
    entryLogic: "C1_GREEN & C2_GREEN -> STORE_LOW -> REVISIT_LOW -> BUY_PUT | C1_RED & C2_RED -> STORE_HIGH -> REVISIT_HIGH -> BUY_CALL",
    exitLogic: "TARGET_50 | STOP_100 | TIME_1515",
    target: 50.0,
    stopLoss: 100.0,
    trailingStop: null,
    riskPercent: 1.5,
    positionSize: 1.0,
    tradingWindow: "09:15-15:15",
    maxTradesPerDay: 1,
    filters: { first_two_matching: true },
    riskRules: { daily_loss_limit: 5000 },
    notes: "Astra Quant institutional grade mean reversion-fade hybrid strategy.",
  },
  {
    name: "Momentum Catcher",
    description: "Early momentum breakout. Buy first ATM option breaking opening range high/low. Target 40 pts, SL 40 pts. Exit 12:00 PM.",
    category: "MOMENTUM",
    instrument: "NIFTY",
    timeframe: "5m",
    direction: "BOTH",
    entryLogic: "BREAK_OUT_OPEN_RANGE_HIGH -> BUY_CE | BREAK_OUT_OPEN_RANGE_LOW -> BUY_PE",
    exitLogic: "TARGET_40 | STOP_40 | TIME_1200",
    target: 40.0,
    stopLoss: 40.0,
    trailingStop: null,
    riskPercent: 1.0,
    positionSize: 1.0,
    tradingWindow: "09:15-12:00",
    maxTradesPerDay: 2,
    filters: {},
    riskRules: {},
    notes: "Captures early index breakout impulses.",
  },
  {
    name: "Opening Range Breakout",
    description: "Standard 30-minute Opening Range Breakout (ORB). Long CE on range high break, Long PE on range low break.",
    category: "MOMENTUM",
    instrument: "NIFTY",
    timeframe: "30m",
    direction: "BOTH",
    entryLogic: "CROSS_UP(CLOSE, ORB_HIGH) -> BUY_CE | CROSS_DOWN(CLOSE, ORB_LOW) -> BUY_PE",
    exitLogic: "TARGET_80 | STOP_40",
    target: 80.0,
    stopLoss: 40.0,
    trailingStop: 15.0,
    riskPercent: 1.0,
    positionSize: 1.0,
    tradingWindow: "09:45-15:00",
    maxTradesPerDay: 2,
  },
  {
    name: "Opening Range Fade",
    description: "Fade first breakout. Trade reversal when price breaks opening range limit but gets rejected back inside.",
    category: "MEAN_REVERSION",
    instrument: "BANKNIFTY",
    timeframe: "15m",
    direction: "BOTH",
    entryLogic: "CROSS_UP(HIGH, ORB_HIGH) & CLOSE < ORB_HIGH -> SELL_CE | CROSS_DOWN(LOW, ORB_LOW) & CLOSE > ORB_LOW -> BUY_PE",
    exitLogic: "TARGET_60 | STOP_30",
    target: 60.0,
    stopLoss: 30.0,
    trailingStop: null,
    riskPercent: 1.0,
    positionSize: 1.0,
    tradingWindow: "09:30-14:30",
    maxTradesPerDay: 2,
  },
  {
    name: "VWAP Reversal",
    description: "Mean reversion strategy off the Volume Weighted Average Price (VWAP) band boundaries.",
    category: "MEAN_REVERSION",
    instrument: "STOCKS",
    timeframe: "5m",
    direction: "BOTH",
    entryLogic: "CROSS_UP(LOW, VWAP_LOWER_BAND) -> BUY | CROSS_DOWN(HIGH, VWAP_UPPER_BAND) -> SELL",
    exitLogic: "TARGET_20 | STOP_10",
    target: 20.0,
    stopLoss: 10.0,
    trailingStop: 5.0,
    riskPercent: 0.5,
    positionSize: 1.0,
    tradingWindow: "09:15-15:15",
    maxTradesPerDay: 4,
  },
  {
    name: "EMA Pullback",
    description: "Trend following entry on pullback to standard exponential moving averages (e.g. 9 or 20 EMA).",
    category: "MOMENTUM",
    instrument: "NIFTY",
    timeframe: "15m",
    direction: "BOTH",
    entryLogic: "TREND_UP & TOUCH(LOW, EMA_20) -> BUY | TREND_DOWN & TOUCH(HIGH, EMA_20) -> SELL",
    exitLogic: "TARGET_50 | STOP_25",
    target: 50.0,
    stopLoss: 25.0,
    trailingStop: 10.0,
    riskPercent: 1.0,
    positionSize: 1.0,
    tradingWindow: "09:30-15:00",
    maxTradesPerDay: 3,
  },
  {
    name: "2 Candle Breakout",
    description: "Breakout of high/low limits established by the first two trading candles of the session.",
    category: "MOMENTUM",
    instrument: "BANKNIFTY",
    timeframe: "15m",
    direction: "BOTH",
    entryLogic: "CROSS_UP(CLOSE, TWO_CANDLE_HIGH) -> BUY | CROSS_DOWN(CLOSE, TWO_CANDLE_LOW) -> SELL",
    exitLogic: "TARGET_100 | STOP_50",
    target: 100.0,
    stopLoss: 50.0,
    trailingStop: 20.0,
    riskPercent: 1.0,
    positionSize: 1.0,
    tradingWindow: "09:45-15:00",
    maxTradesPerDay: 2,
  },
  {
    name: "Supertrend Trend Following",
    description: "Trend following system using Supertrend (7, 3) indicator switches on multiple timeframes.",
    category: "MOMENTUM",
    instrument: "NIFTY",
    timeframe: "15m",
    direction: "BOTH",
    entryLogic: "SUPERTREND_BUY -> BUY | SUPERTREND_SELL -> SELL",
    exitLogic: "SUPERTREND_REVERSE | TARGET_150 | STOP_50",
    target: 150.0,
    stopLoss: 50.0,
    trailingStop: 30.0,
    riskPercent: 2.0,
    positionSize: 1.0,
    tradingWindow: "09:15-15:15",
    maxTradesPerDay: 2,
  },
  {
    name: "Expiry 0DTE",
    description: "Intraday zero-days-to-expiry option decay harvesting utilizing delta-neutral iron condor rules.",
    category: "OPTIONS",
    instrument: "NIFTY",
    timeframe: "5m",
    direction: "BOTH",
    entryLogic: "EXPIRY_DAY & SELL_OTM_CE & SELL_OTM_PE (DELTA 0.15)",
    exitLogic: "THETA_DECAY_80_PCT | STOP_SL_30_PCT_PREMIUM",
    target: 20.0,
    stopLoss: 15.0,
    trailingStop: null,
    riskPercent: 1.5,
    positionSize: 1.0,
    tradingWindow: "09:20-15:10",
    maxTradesPerDay: 1,
  },
  {
    name: "Theta Decay STBT",
    description: "Sell Today Buy Tomorrow options theta premium decay capturing strategy executed near closing bells.",
    category: "OPTIONS",
    instrument: "BANKNIFTY",
    timeframe: "30m",
    direction: "BOTH",
    entryLogic: "TIME_1515 & SELL_ATM_CE & SELL_ATM_PE (STRADDLE)",
    exitLogic: "TIME_0920_NEXT_DAY | STOP_20_PCT_COMBINED_PREMIUM",
    target: 30.0,
    stopLoss: 20.0,
    trailingStop: null,
    riskPercent: 2.0,
    positionSize: 1.0,
    tradingWindow: "15:15-15:30",
    maxTradesPerDay: 1,
  }
];

async function main() {
  console.log('Seeding strategy templates...');

  // Create or retrieve system default operator
  const dummyPassword = Math.random().toString(36).substring(2, 15);
  const hashedPassword = await bcrypt.hash(dummyPassword, 10);
  
  const systemUser = await prisma.user.upsert({
    where: { email: 'operator@astraquant.com' },
    update: {},
    create: {
      email: 'operator@astraquant.com',
      name: 'System Default Operator',
      password: hashedPassword,
    },
  });

  console.log(`System user found/created: ${systemUser.id}`);

  for (const strat of preloadedStrategies) {
    const data = {
      ...strat,
      userId: systemUser.id,
      filters: strat.filters || {},
      riskRules: strat.riskRules || {},
    };

    const existing = await prisma.strategy.findFirst({
      where: { name: strat.name, userId: systemUser.id },
    });

    if (existing) {
      await prisma.strategy.update({
        where: { id: existing.id },
        data,
      });
      console.log(`Updated strategy template: ${strat.name}`);
    } else {
      await prisma.strategy.create({
        data,
      });
      console.log(`Created strategy template: ${strat.name}`);
    }
  }

  console.log('Seeding complete successfully.');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
