function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const defaultUserId = "75185753-53f1-477e-978c-1e3ccc6ca8e5";

export interface MockStrategy {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  instrument: string;
  timeframe: string;
  direction: string;
  entryLogic: string;
  exitLogic: string;
  target: number;
  stopLoss: number;
  trailingStop: number | null;
  riskPercent: number;
  positionSize: number;
  tradingWindow: string;
  maxTradesPerDay: number;
  filters: any;
  riskRules: any;
  notes: string | null;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class MockDbStore {
  users: MockUser[] = [
    {
      id: defaultUserId,
      email: 'operator@igrisquant.com',
      password: 'mock_password_hash_since_db_fallback_active',
      name: 'System Default Operator',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  strategies: MockStrategy[] = [
    {
      id: "igris-options-id-1",
      userId: defaultUserId,
      name: "IGRIS",
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
      notes: "IGRIS institutional grade mean reversion-fade hybrid strategy.",
      version: 1,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "momentum-catcher-id-2",
      userId: defaultUserId,
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
      version: 1,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "orb-id-3",
      userId: defaultUserId,
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
      filters: {},
      riskRules: {},
      notes: null,
      version: 1,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  liveTrades = [
    { id: '1', status: 'CLOSED' },
    { id: '2', status: 'CLOSED' },
    { id: '3', status: 'OPEN' },
    { id: '4', status: 'OPEN' }
  ];
}

const store = new MockDbStore();

export const mockPrisma = {
  $connect: async () => {
    console.log("Mock database connected successfully.");
  },
  $disconnect: async () => {},
  
  user: {
    findUnique: async (args: { where: { email?: string; id?: string } }) => {
      if (args.where.email) {
        return store.users.find(u => u.email === args.where.email) || null;
      }
      if (args.where.id) {
        return store.users.find(u => u.id === args.where.id) || null;
      }
      return null;
    },
    create: async (args: { data: any }) => {
      const newUser: MockUser = {
        id: uuidv4(),
        email: args.data.email,
        password: args.data.password,
        name: args.data.name || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      store.users.push(newUser);
      return newUser;
    }
  },
  
  strategy: {
    count: async () => store.strategies.length,
    findMany: async (args?: { where?: { userId?: string } }) => {
      return store.strategies;
    },
    findFirst: async (args: { where: { id?: string; name?: string; userId?: string } }) => {
      if (args.where.id) {
        return store.strategies.find(s => s.id === args.where.id) || null;
      }
      if (args.where.name) {
        return store.strategies.find(s => s.name === args.where.name) || null;
      }
      return null;
    },
    create: async (args: { data: any }) => {
      const newStrat: MockStrategy = {
        id: uuidv4(),
        userId: args.data.userId || defaultUserId,
        name: args.data.name,
        description: args.data.description || null,
        category: args.data.category,
        instrument: args.data.instrument,
        timeframe: args.data.timeframe,
        direction: args.data.direction,
        entryLogic: args.data.entryLogic || '',
        exitLogic: args.data.exitLogic || '',
        target: args.data.target,
        stopLoss: args.data.stopLoss,
        trailingStop: args.data.trailingStop || null,
        riskPercent: args.data.riskPercent || 1.0,
        positionSize: args.data.positionSize || 1.0,
        tradingWindow: args.data.tradingWindow || '09:15-15:30',
        maxTradesPerDay: args.data.maxTradesPerDay || 3,
        filters: args.data.filters || {},
        riskRules: args.data.riskRules || {},
        notes: args.data.notes || null,
        version: 1,
        status: args.data.status || 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      store.strategies.push(newStrat);
      return newStrat;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const idx = store.strategies.findIndex(s => s.id === args.where.id);
      if (idx !== -1) {
        store.strategies[idx] = {
          ...store.strategies[idx],
          ...args.data,
          updatedAt: new Date()
        };
        return store.strategies[idx];
      }
      throw new Error(`Strategy with id ${args.where.id} not found.`);
    }
  },
  
  liveTrade: {
    count: async (args?: { where?: { status?: string } }) => {
      if (args?.where?.status) {
        return store.liveTrades.filter(t => t.status === args.where!.status).length;
      }
      return store.liveTrades.length;
    }
  }
};
