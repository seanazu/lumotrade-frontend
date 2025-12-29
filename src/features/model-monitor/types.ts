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
  sharpe_ratio: number;
  max_drawdown: number;
}

export interface TradingStatus {
  balance: number;
  is_trading: boolean;
}

export interface Prediction {
  id: string;
  date: string;
  ticker: string;
  direction: "UP" | "DOWN";
  confidence: number;
  q50: number;
  was_correct: boolean | null;
}

export interface Trade {
  id: string;
  ticker: string;
  direction: "LONG" | "SHORT";
  entry_time: string;
  entry_price: number;
  exit_time?: string;
  exit_price?: number;
  position_size: number;
  profit_loss: number | null;
  profit_loss_pct: number | null;
  status: "OPEN" | "CLOSED";
}

export type TabId = "dashboard" | "predictions" | "trades";
