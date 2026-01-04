import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    equity_curve: [],
    trades: [],
    metrics: {
        total_return: 0,
        total_return_pct: 0,
        sharpe_ratio: 0,
        max_drawdown: 0,
        win_rate: 0,
        num_trades: 0,
        avg_win: 0,
        avg_loss: 0,
        profit_factor: 0
    }
  });
}

