import { Bitcoin } from "lucide-react";

export interface TickerInfo {
  name: string;
  symbol: string;
  icon: React.ReactNode;
  color: string;
}

export const TICKER_MAP: Record<string, TickerInfo> = {
  SPY: {
    name: "S&P 500",
    symbol: "SPX",
    icon: <span className="text-lg">🇺🇸</span>,
    color: "blue",
  },
  QQQ: {
    name: "Nasdaq 100",
    symbol: "QQQ",
    icon: <span className="text-lg">📈</span>,
    color: "purple",
  },
  DIA: {
    name: "Dow Jones",
    symbol: "DIA",
    icon: <span className="text-lg">📊</span>,
    color: "blue",
  },
  IWM: {
    name: "Russell 2000",
    symbol: "IWM",
    icon: <span className="text-lg">🏛️</span>,
    color: "green",
  },
  "BTC-USD": {
    name: "Bitcoin",
    symbol: "BTC",
    icon: <Bitcoin className="w-5 h-5 text-white" />,
    color: "orange",
  },
  "ETH-USD": {
    name: "Ethereum",
    symbol: "ETH",
    icon: <span className="text-lg">◆</span>,
    color: "purple",
  },
  GLD: {
    name: "Gold",
    symbol: "XAU",
    icon: <span className="text-lg">🪙</span>,
    color: "amber",
  },
  SLV: {
    name: "Silver",
    symbol: "XAG",
    icon: <span className="text-lg">⚪</span>,
    color: "gray",
  },
  USO: {
    name: "Oil",
    symbol: "WTI",
    icon: <span className="text-lg">🛢️</span>,
    color: "yellow",
  },
};

export const DEFAULT_TICKER_INFO: TickerInfo = {
  name: "Unknown",
  symbol: "N/A",
  icon: <span className="text-lg">📊</span>,
  color: "blue",
};

