import { PrismaClient } from '@prisma/client';
import { mockPrisma } from './mockDb';
import dotenv from 'dotenv';

dotenv.config();

let useMock = false;

// If DATABASE_URL is not set or is local in production, default to mock immediately
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost:5432") || process.env.DATABASE_URL.includes("127.0.0.1:5432")) {
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_LOCAL_RUN) {
    useMock = true;
    console.warn("WARNING: Production environment detected with local/missing DATABASE_URL. Switching to in-memory Mock Database client!");
  }
}

const realPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/astra_quant?schema=public",
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

const handler = {
  get(target: any, prop: string, receiver: any) {
    if (useMock) {
      return (mockPrisma as any)[prop];
    }
    
    // For connection wrapper
    if (prop === '$connect') {
      return async function (...args: any[]) {
        try {
          return await target.$connect(...args);
        } catch (err: any) {
          console.warn("WARNING: $connect failed. Using mock client.", err.message);
          useMock = true;
          return;
        }
      };
    }

    const value = target[prop];
    if (typeof value === 'function') {
      return value.bind(target);
    }
    
    // Intercept model calls to catch connection failures dynamically
    if (value && typeof value === 'object') {
      return new Proxy(value, {
        get(modelTarget, modelProp) {
          const modelValue = modelTarget[modelProp];
          if (typeof modelValue === 'function') {
            return async function (...args: any[]) {
              try {
                if (useMock) {
                  const mockModel = (mockPrisma as any)[prop];
                  return await mockModel[modelProp].apply(mockModel, args);
                }
                return await modelValue.apply(modelTarget, args);
              } catch (err: any) {
                const errMsg = err.message || '';
                const isConnectionErr = 
                  errMsg.includes("Can't reach database") ||
                  errMsg.includes("connect ECONNREFUSED") ||
                  errMsg.includes("P1001") ||
                  errMsg.includes("P1012") ||
                  err.code === 'P1001' || 
                  err.code === 'P1012';
                
                if (isConnectionErr) {
                  console.warn("WARNING: Database query failed. Falling back to in-memory Mock Database client!", errMsg);
                  useMock = true;
                  const mockModel = (mockPrisma as any)[prop];
                  const mockFunc = mockModel[modelProp];
                  return await mockFunc.apply(mockModel, args);
                }
                throw err;
              }
            };
          }
          return modelValue;
        }
      });
    }
    return value;
  }
};

const prisma = new Proxy(realPrisma, handler);

export default prisma;
export { prisma };
