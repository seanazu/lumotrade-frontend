"use client";

import { Bot, ExternalLink, Info } from "lucide-react";

interface MLModelTrainingPromptProps {
  symbol: string;
}

/**
 * ML Model Training Prompt Component
 *
 * Informs users that the ML backend currently predicts indexes (SPY, QQQ, IWM)
 * and provides guidance on extending it to predict individual stocks.
 */
export function MLModelTrainingPrompt({ symbol }: MLModelTrainingPromptProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">ML Stock Prediction Model</h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs font-bold uppercase">
                Coming Soon
              </span>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your ML backend currently predicts{" "}
                <strong className="text-foreground">market indexes</strong>{" "}
                (SPY, QQQ, IWM, GLD, HYG, TLT, XLF, XLK) with{" "}
                <strong className="text-emerald-500">78.9% accuracy</strong>.
              </p>

              <p>
                Want to predict individual stocks like{" "}
                <strong className="text-foreground">{symbol}</strong>? You can
                extend the ML pipeline to train stock-specific models using the
                same proven architecture.
              </p>

              <div className="p-4 rounded-lg bg-muted/50 border border-border mt-4">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs space-y-2">
                    <p className="font-semibold text-foreground">
                      What you'll need:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        Historical OHLC data for {symbol} (at least 2 years)
                      </li>
                      <li>
                        Options data from ORATS API (IV surface, skew, etc.)
                      </li>
                      <li>Same feature engineering pipeline as indexes</li>
                      <li>
                        Minimum 500 training samples for reliable predictions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Learn How to Train a Model
                </button>
                <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2">
                  View Documentation
                </button>
              </div>

              <p className="text-xs mt-4 text-muted-foreground">
                📚 Check out{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                  lumotrade-ml-backend/docs/MODEL_GUIDE.md
                </code>{" "}
                for detailed instructions on training custom models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
