export interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export interface PaginationData {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface AccuracyStats {
  accuracy: number;
  total_predictions: number;
  avg_confidence: number;
  last_updated: string;
}

export interface TradingStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  roi: number;
  avg_win: number;
  avg_loss: number;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
}

export interface TradingStatus {
  balance: number;
  open_positions: number;
  daily_pnl: number;
}

export interface Prediction {
  id?: string | number;
  date: string;
  ticker: string;
  direction: "UP" | "DOWN" | "HOLD";
  confidence?: number;
  q50?: number;
  actual_return?: number | null;
  was_correct?: boolean | null;
}

export interface Trade {
  id: number | string;
  ticker: string;
  direction: "LONG" | "SHORT";
  entry_time: string;
  entry_price: number;
  exit_time?: string | null;
  exit_price?: number | null;
  position_size: number;
  profit_loss: number | null;
  profit_loss_pct: number | null;
  status: "OPEN" | "CLOSED" | "PENDING";
}

export type TabId = "dashboard" | "predictions" | "trades" | "alpaca";
