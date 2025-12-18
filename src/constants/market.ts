export const MAJOR_INDEXES = [
  {
    symbol: "SPY",
    name: "S&P 500",
    icon: "📊",
  },
  {
    symbol: "QQQ",
    name: "Nasdaq 100",
    icon: "📈",
  },
  {
    symbol: "DIA",
    name: "Dow Jones",
    icon: "🏛️",
  },
  {
    symbol: "IWM",
    name: "Russell 2000",
    icon: "🏢",
  },
] as const;

export const MARKET_STATUS_INDICATORS = {
  OPEN: {
    label: "Markets Open",
    color: "emerald",
  },
  CLOSED: {
    label: "Markets Closed",
    color: "red",
  },
  PRE_MARKET: {
    label: "Pre-Market",
    color: "amber",
  },
  AFTER_HOURS: {
    label: "After Hours",
    color: "amber",
  },
} as const;

