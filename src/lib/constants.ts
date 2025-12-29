/**
 * Application Constants
 * Centralized constants to avoid hardcoded values throughout the app
 */

// UI Constants
export const UI_CONSTANTS = {
  TIMEFRAMES: {
    ONE_MONTH: "1M",
    THREE_MONTHS: "3M",
    SIX_MONTHS: "6M",
    ONE_YEAR: "1Y",
    FIVE_YEARS: "5Y",
  },
  DEFAULT_TIMEFRAME: "1M",
  DEFAULT_SYMBOLS: ["NVDA", "AAPL", "TSLA", "MSFT"],
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    PREDICTIONS_PAGE_SIZE: 50,
    TRADES_PAGE_SIZE: 50,
  },
} as const;

// Chart Constants
export const CHART_CONSTANTS = {
  DEFAULT_HEIGHT: 600,
  PRICE_LINE_COLORS: {
    RESISTANCE: "#ef4444",
    SUPPORT: "#22c55e",
    PATTERN_TARGET: "#a855f7",
    ENTRY: "#3b82f6",
    TARGET: "#10b981",
    STOP_LOSS: "#f59e0b",
  },
  SMA_PERIODS: {
    SHORT: 20,
    LONG: 50,
  },
  SMA_COLORS: {
    SHORT: "#60a5fa",
    LONG: "#f59e0b",
  },
  VISIBLE_RANGE_DAYS: {
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
    "5Y": 1825,
  },
} as const;

// Strategy Zone Colors
export const STRATEGY_COLORS = {
  ENTRY: "#6366f1", // Indigo
  TARGET: "#10b981", // Emerald
  STOP: "#f59e0b", // Amber
} as const;

// Sentiment Colors
export const SENTIMENT_COLORS = {
  BULLISH: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500",
  },
  BEARISH: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500",
  },
  NEUTRAL: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500",
  },
} as const;

// API Endpoints (relative paths)
export const API_ENDPOINTS = {
  SETTINGS: {
    SAVE: "/api/settings/save",
  },
  TRADING: {
    STATUS: "/api/trading/status",
    PREDICTIONS: "/api/predictions/history",
    TRADES: "/api/trades",
  },
  ANALYSIS: {
    STOCK: "/api/analysis/stock",
    CHART: "/api/analysis/chart",
    THESIS: "/api/analysis/thesis",
  },
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  PAYWALL_HINT_DURATION: 3500, // ms
  NEWS_UPDATE_INTERVAL: 15, // minutes
  MODEL_REFRESH_INTERVAL: 24, // hours
} as const;

// Model Training Constants
export const MODEL_CONSTANTS = {
  DEFAULT_LOOKBACK_DAYS: 730,
  DEFAULT_VALIDATION_SPLIT: 0.1,
  DEFAULT_CONFIDENCE_THRESHOLD: 0.7,
  DEFAULT_KELLY_FRACTION: 0.25,
} as const;

// Notification Constants
export const NOTIFICATION_CONSTANTS = {
  DEFAULT_EMAIL_ENABLED: false,
  DEFAULT_NOTIFICATIONS_ENABLED: true,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  LAST_VIEWED_SYMBOL: "lastViewedSymbol",
  SELECTED_STRATEGY: "selectedStrategy",
  USER_PREFERENCES: "userPreferences",
} as const;

// File Size Limits (lines of code)
export const FILE_SIZE_LIMITS = {
  COMPONENT_MAX: 300,
  HOOK_MAX: 150,
  UTIL_MAX: 200,
} as const;

