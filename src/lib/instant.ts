import { init } from '@instantdb/react';
import { INSTANT_APP_ID, IS_DEVELOPMENT } from '@/lib/env';

// Types for our schema
type Schema = {
  // Auth-related profiles (links to InstantDB auth users)
  profiles: {
    id: string;
    email: string; // Must match auth.email
    role: 'admin' | 'user'; // Required: user role
    createdAt: number;
    displayName?: string;
    avatar?: string;
    isActive?: boolean;
    lastLogin?: number;
  };
  // Legacy users collection (keeping for backwards compatibility)
  users: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: number;
    displayName?: string;
    avatar?: string;
    isActive?: boolean;
    lastLogin?: number;
  };
  // User profiles (duplicate for clarity)
  userProfiles: {
    id: string;
    userId: string;
    displayName: string;
    bio: string;
    avatar: string;
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    joinedAt: number;
    verified: boolean;
  };
  watchlists: {
    id: string;
    userId: string;
    ticker: string;
    addedAt: number;
    notes?: string;
  };
  tradeHistory: {
    id: string;
    userId: string;
    ticker: string;
    type: 'entry' | 'exit' | 'note';
    price: number;
    timestamp: number;
    setup?: string;
    outcome?: string;
  };
  alerts: {
    id: string;
    userId: string;
    ticker: string;
    type: 'price' | 'catalyst' | 'custom';
    condition: string;
    target: number;
    isActive: boolean;
    createdAt: number;
  };
  preferences: {
    id: string;
    userId: string;
    theme: string;
    defaultTimeframe: string;
    maxRiskPerTrade: number;
  };
  selectedStrategies: {
    id: string;
    userId: string;
    symbol: string;
    strategyData: string; // JSON stringified TradingStrategy
    updatedAt: number;
    createdAt: number;
  };
};

// Initialize InstantDB
if (!INSTANT_APP_ID && IS_DEVELOPMENT) {
  console.warn('⚠️ NEXT_PUBLIC_INSTANT_APP_ID is not set in environment variables');
}

export const db = init<Schema>({ appId: INSTANT_APP_ID });

