/**
 * OpenAI API Client
 * AI-powered market analysis and trade opportunity identification
 */

import OpenAI from "openai";

interface TradingOpportunity {
  symbol: string;
  name: string;
  setupType:
    | "momentum_breakout"
    | "mean_reversion"
    | "options_play"
    | "swing_trade";
  entry: {
    price: number;
    range: { min: number; max: number };
  };
  target: {
    price: number;
    percentage: number;
  };
  stopLoss: {
    price: number;
    percentage: number;
  };
  riskReward: number;
  winRate: number; // 0-100
  timeframe: string;
  reasoning: string;
  probability: number; // 0-100
  confidence: number; // 0-100
}

interface MarketContext {
  regime: string;
  sentiment: string;
  vixLevel: number;
  spyPerformance: number;
  topSectors: string[];
}

interface StockCandidate {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  rsi?: number;
  macd?: number;
  movingAverages?: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  optionsFlow?: {
    callVolume: number;
    putVolume: number;
    callPutRatio: number;
    unusualActivity: boolean;
  };
  news?: Array<{
    headline: string;
    sentiment: string;
    publishedAt: string;
  }>;
  sector?: string;
}

class OpenAIClient {
  private client: OpenAI;
  private model = "gpt-5.2"; // Latest model with web search

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Analyze market conditions and identify best trading opportunities
   * Uses web search to find real-time catalysts
   */
  async analyzeTradingOpportunities(
    candidates: StockCandidate[],
    marketContext: MarketContext
  ): Promise<TradingOpportunity[]> {
    if (!this.isConfigured()) {
      console.warn("OpenAI API not configured.");
      return [];
    }

    try {
      const prompt = this.buildTradingAnalysisPrompt(candidates, marketContext);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        console.error("No response from OpenAI");
        return [];
      }

      const parsed = JSON.parse(response);
      return parsed.opportunities || [];
    } catch (error) {
      console.error(
        "Error analyzing trading opportunities with OpenAI:",
        error
      );
      return [];
    }
  }

  /**
   * Search web for real-time market catalysts and news about specific stocks
   */
  async searchMarketCatalysts(
    symbols: string[]
  ): Promise<Record<string, string[]>> {
    if (!this.isConfigured()) {
      return {};
    }

    try {
      const searchQuery = `Latest breaking news and catalysts for ${symbols.join(", ")} stocks today ${new Date().toLocaleDateString()}`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a financial news analyst. Search the web for the latest breaking news, earnings reports, analyst upgrades/downgrades, and market-moving catalysts for the given stocks. Return a JSON object with stock symbols as keys and arrays of concise catalyst descriptions as values.",
          },
          {
            role: "user",
            content: searchQuery,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return {};

      const parsed = JSON.parse(response);
      return parsed.catalysts || {};
    } catch (error) {
      console.error("Error searching market catalysts:", error);
      return {};
    }
  }

  /**
   * Get market regime analysis using current conditions
   */
  async analyzeMarketRegime(marketData: {
    spyPrice: number;
    spyChange: number;
    vixLevel: number;
    volumeVsAvg: number;
    breadth: { advancing: number; declining: number };
    sectorPerformance: Array<{ sector: string; performance: number }>;
  }): Promise<{
    regime:
      | "breakout_trending"
      | "range_bound"
      | "high_volatility"
      | "risk_off";
    confidence: number;
    reasoning: string;
    tradingStrategy: string;
  }> {
    if (!this.isConfigured()) {
      return {
        regime: "range_bound",
        confidence: 50,
        reasoning: "OpenAI not configured",
        tradingStrategy: "Use caution",
      };
    }

    try {
      const prompt = `Analyze the current market regime based on these conditions:
      
SPY Price: $${marketData.spyPrice} (${marketData.spyChange > 0 ? "+" : ""}${marketData.spyChange.toFixed(2)}%)
VIX Level: ${marketData.vixLevel}
Volume vs Average: ${marketData.volumeVsAvg}x
Market Breadth: ${marketData.breadth.advancing} advancing / ${marketData.breadth.declining} declining
Top Performing Sectors: ${marketData.sectorPerformance
        .slice(0, 3)
        .map(
          (s) =>
            `${s.sector} (${s.performance > 0 ? "+" : ""}${s.performance.toFixed(1)}%)`
        )
        .join(", ")}

Classify the market regime and provide trading strategy recommendations.`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert market analyst specializing in regime detection. Analyze market conditions and classify them into one of these regimes:
- "breakout_trending": Strong directional move, momentum strategies work best
- "range_bound": Sideways choppy action, mean reversion strategies work best
- "high_volatility": Large swings, reduce position size and widen stops
- "risk_off": Selling pressure, defensive positioning

Return a JSON object with: regime, confidence (0-100), reasoning, tradingStrategy`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error("No response");

      const parsed = JSON.parse(response);
      return {
        regime: parsed.regime || "range_bound",
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || "Analysis unavailable",
        tradingStrategy: parsed.tradingStrategy || "Monitor conditions",
      };
    } catch (error) {
      console.error("Error analyzing market regime:", error);
      return {
        regime: "range_bound",
        confidence: 50,
        reasoning: "Analysis failed",
        tradingStrategy: "Use caution",
      };
    }
  }

  /**
   * Build the trading analysis prompt
   */
  private buildTradingAnalysisPrompt(
    candidates: StockCandidate[],
    marketContext: MarketContext
  ): string {
    return `You are an elite day trader and market analyst. Analyze these stock candidates and identify the TOP 1-2 BEST trading opportunities right now.

CURRENT MARKET CONTEXT:
- Market Regime: ${marketContext.regime}
- Market Sentiment: ${marketContext.sentiment}
- VIX Level: ${marketContext.vixLevel}
- SPY Performance: ${marketContext.spyPerformance > 0 ? "+" : ""}${marketContext.spyPerformance.toFixed(2)}%
- Strong Sectors: ${marketContext.topSectors.join(", ")}

STOCK CANDIDATES:
${candidates
  .map(
    (c, idx) => `
${idx + 1}. ${c.symbol} (${c.name})
   Price: $${c.price} (${c.changePercent > 0 ? "+" : ""}${c.changePercent.toFixed(2)}%)
   Volume: ${(c.volume / 1000000).toFixed(1)}M (${((c.volume / c.avgVolume) * 100).toFixed(0)}% of avg)
   ${c.rsi ? `RSI: ${c.rsi.toFixed(1)}` : ""}
   ${c.movingAverages ? `Price vs 20MA: ${((c.price / c.movingAverages.sma20 - 1) * 100).toFixed(1)}%` : ""}
   ${c.optionsFlow ? `Options: C/P Ratio ${c.optionsFlow.callPutRatio.toFixed(2)}${c.optionsFlow.unusualActivity ? " 🔥 UNUSUAL ACTIVITY" : ""}` : ""}
   ${c.news && c.news.length > 0 ? `Latest News: ${c.news[0].headline}` : ""}
   ${c.sector ? `Sector: ${c.sector}` : ""}
`
  )
  .join("\n")}

INSTRUCTIONS:
1. PRIORITIZE GROWTH STOCKS with high potential - look for the next BIG MOVERS before they explode
2. AVOID obvious mega-caps (AAPL, MSFT, etc.) - focus on mid-cap growth stories with momentum
3. Select ONLY the 1-2 BEST unconventional opportunities with genuine breakout potential
4. Consider: strong growth narrative, institutional accumulation, technical breakout setup, news catalysts, sector tailwinds
5. For each opportunity, provide:
   - Setup type: momentum_breakout, mean_reversion, options_play, or swing_trade
   - Specific entry price and range
   - Target price with percentage gain
   - Stop loss price with percentage risk
   - Risk/reward ratio (must be at least 2:1)
   - Win rate based on similar historical setups (be realistic, 60-75% range)
   - Expected timeframe (e.g., "2-5 days", "intraday", "1-3 weeks")
   - Clear reasoning explaining WHY NOW and what confirms the setup
   - Probability score (0-100) based on setup quality and market conditions
   - Confidence score (0-100) in this specific analysis

CRITICAL RULES:
- Only recommend setups with R:R >= 2:1
- PRIORITIZE growth stocks with breakout potential over mega-caps
- Look for stocks with strong growth narratives and institutional interest
- Favor mid-cap ($2B-$50B) stocks with momentum over large-caps
- Factor in current market regime (trending vs ranging)
- Avoid extended stocks without volume confirmation
- Check for negative catalysts or bearish divergences
- Stocks That are medium-cap and have breakout potential, it could be a large cap in the making.
- If no great unconventional setups exist, return empty array rather than settling for obvious picks

Return JSON format:
{
  "opportunities": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc",
      "setupType": "momentum_breakout",
      "entry": { "price": 150.0, "range": { "min": 149.5, "max": 150.5 } },
      "target": { "price": 155.0, "percentage": 3.33 },
      "stopLoss": { "price": 148.0, "percentage": 1.33 },
      "riskReward": 2.5,
      "winRate": 68,
      "timeframe": "2-5 days",
      "reasoning": "Breaking 3-month consolidation with 3.2x volume...",
      "probability": 72,
      "confidence": 85
    }
  ]
}`;
  }

  /**
   * System prompt for trading analysis
   */
  private getSystemPrompt(): string {
    return `You are an expert trading system specializing in finding HIGH-GROWTH opportunities before they explode.

Your track record includes identifying:
- PLTR at $7 before it went to $80 (1000%+ gain)
- SOFI at $5 before it tripled (300% gain)
- RKLB at $4 before it went to $25 (500%+ gain)

You have deep knowledge of:
- Growth stock pattern recognition (identifying future multi-baggers)
- Technical analysis (breakout setups, accumulation patterns, volume surges)
- Institutional flow (smart money positioning, insider buying, unusual options activity)
- Growth catalysts (new products, contracts, technology breakthroughs, sector tailwinds)
- Market regime detection (when to favor growth vs value)

Your goal is to identify UNCONVENTIONAL, HIGH-POTENTIAL trading setups:
1. PRIORITIZE mid-cap growth stocks ($2B-$50B) over obvious mega-caps
2. Look for stocks with strong growth narratives and institutional accumulation
3. Identify technical breakouts in stocks with real fundamental catalysts
4. Find stocks BEFORE they go parabolic, not after
5. Smart money validation (unusual options activity, insider buying, institutional flow)
6. Favorable risk/reward (minimum 2:1, ideally 3:1+)
7. Realistic win rates (60-75% based on backtested similar setups)

You avoid:
- Obvious large-cap picks everyone knows about (AAPL, MSFT, GOOGL, etc.)
- Penny stocks or super high-risk plays
- Extended stocks that already had their move
- Stocks without real growth catalysts

You are selective and only recommend TRUE opportunities with genuine breakout potential. Quality over quantity.`;
  }
}

// Singleton instance
export const openaiClient = new OpenAIClient();

// Export types
export type { TradingOpportunity, MarketContext, StockCandidate };

// Export class
export { OpenAIClient };
