/**
 * OpenAI API Client
 * AI-powered market analysis and trade opportunity identification
 */

import OpenAI from "openai";

interface TradingOpportunity {
  symbol: string;
  name: string;
  setupType?:
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
  change?: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
  score?: number;
  signals?: string[];
  catalysts?: string[];
  insiderBuying?: number;
  analystRating?: {
    buy: number;
    hold: number;
    sell: number;
  };
  newsSentiment?: string;
  rsi?: number;
  macd?: number;
  macdSignal?: "bullish" | "bearish" | "neutral";
  trend?: "bullish" | "bearish" | "neutral";
  movingAverages?: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  optionsFlow?: {
    unusualCallActivity?: boolean;
    unusualPutActivity?: boolean;
    putCallRatio?: number;
    ivRank?: number;
    sweepsCount?: number;
    // Legacy fields for backward compatibility
    callVolume?: number;
    putVolume?: number;
    callPutRatio?: number;
    unusualActivity?: boolean;
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
  private model = "gpt-5.2"; // Model with web search capabilities

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
      const opportunities = parsed.opportunities || [];

      // Validate and normalize each opportunity
      const validOpportunities = opportunities
        .filter((opp: any) => {
          // Ensure all required fields exist
          const hasBasics = opp.symbol && opp.name;
          const hasEntry = opp.entry?.price && opp.entry?.range;
          const hasTarget =
            opp.target?.price && opp.target?.percentage !== undefined;
          const hasStopLoss =
            opp.stopLoss?.price && opp.stopLoss?.percentage !== undefined;
          const hasMetrics =
            opp.riskReward && opp.winRate && opp.timeframe && opp.reasoning;

          if (
            !hasBasics ||
            !hasEntry ||
            !hasTarget ||
            !hasStopLoss ||
            !hasMetrics
          ) {
            console.warn(`⚠️ Skipping invalid opportunity ${opp.symbol}:`, {
              hasBasics,
              hasEntry,
              hasTarget,
              hasStopLoss,
              hasMetrics,
            });
            return false;
          }
          return true;
        })
        .map((opp: any) => ({
          symbol: opp.symbol,
          name: opp.name,
          setupType: opp.setupType || undefined,
          entry: {
            price: parseFloat(opp.entry.price),
            range: {
              min: parseFloat(opp.entry.range.min),
              max: parseFloat(opp.entry.range.max),
            },
          },
          target: {
            price: parseFloat(opp.target.price),
            percentage: parseFloat(opp.target.percentage),
          },
          stopLoss: {
            price: parseFloat(opp.stopLoss.price),
            percentage: parseFloat(opp.stopLoss.percentage),
          },
          riskReward: parseFloat(opp.riskReward),
          winRate: parseInt(opp.winRate),
          timeframe: opp.timeframe,
          reasoning: opp.reasoning,
          probability: parseInt(opp.probability || opp.winRate || 50),
          confidence: parseInt(opp.confidence || 70),
        }));

      console.log(
        `✅ Validated ${validOpportunities.length}/${opportunities.length} opportunities`
      );
      return validOpportunities;
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
   * Discover trending stocks using GPT-5.2 with web search
   */
  async discoverTrendingStocks(
    marketContext: MarketContext
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const searchQuery = `You have web search capabilities. Use them to find trending mid-cap growth stocks TODAY (${today}).

Market Context:
- Sentiment: ${marketContext.sentiment}
- VIX: ${marketContext.vixLevel}
- SPY Performance: ${marketContext.spyPerformance > 0 ? "+" : ""}${marketContext.spyPerformance.toFixed(2)}%
- Hot Sectors: ${marketContext.topSectors.join(", ")}

Please search the web for:
1. Stocks with unusual volume or options activity (check StockTwits, social media)
2. Stocks with breaking news or earnings beats (check financial news)
3. Stocks in hot sectors making breakouts
4. Mid-cap growth stocks ($2B-$50B) with institutional buying
5. Stocks with new catalysts

Return 8-12 stock symbols that are genuinely trending based on current web data.`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You have web search capabilities. Use them to search financial news, Twitter, StockTwits, and trading forums for trending stocks. Return a JSON object with a 'symbols' array containing 8-12 stock tickers trending today. IMPORTANT: Actually search the web, don't just make recommendations based on training data.",
          },
          {
            role: "user",
            content: searchQuery,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        console.warn("⚠️ OpenAI returned empty response for trending stocks");
        return [];
      }

      console.log("📡 OpenAI raw response:", response.substring(0, 300));
      const parsed = JSON.parse(response);
      const symbols = parsed.symbols || [];
      console.log(`✅ Parsed ${symbols.length} symbols from AI:`, symbols);
      return symbols;
    } catch (error) {
      console.error("❌ Error discovering trending stocks:", error);
      return [];
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
    return `You are an elite institutional trader hunting for the next 100%+ multi-bagger opportunities, not just 10% moves.

MISSION: Find stocks with STRUCTURAL CATALYSTS that could explode 3x-10x, like SanDisk (+594% in 2025) or Western Digital (+303%).

CURRENT MARKET CONTEXT:
- Market Regime: ${marketContext.regime}
- Market Sentiment: ${marketContext.sentiment}
- VIX Level: ${marketContext.vixLevel}
- SPY Performance: ${marketContext.spyPerformance > 0 ? "+" : ""}${marketContext.spyPerformance.toFixed(2)}%
- Hot Sectors: ${marketContext.topSectors.join(", ")}
- Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

PRE-SCREENED CANDIDATES (Multi-Factor Analysis):
${candidates
  .map(
    (c, idx) => `
${idx + 1}. ${c.symbol} - ${c.name}
   📊 COMPOSITE SCORE: ${c.score || "N/A"}/100
   
   💰 PRICE ACTION:
   - Current: $${c.price?.toFixed(2)} (${c.changePercent > 0 ? "+" : ""}${c.changePercent?.toFixed(2)}%)
   - Volume: ${(c.volume / 1000000).toFixed(1)}M (${(c.volume / c.avgVolume).toFixed(1)}x average)
   - Market Cap: $${((c.marketCap || 0) / 1000000).toFixed(0)}M
   ${c.rsi ? `- RSI: ${c.rsi.toFixed(1)} ${c.rsi < 30 ? "(OVERSOLD)" : c.rsi > 70 ? "(OVERBOUGHT)" : "(HEALTHY)"}` : ""}
   ${c.trend ? `- Trend: ${c.trend.toUpperCase()}` : ""}
   
   🎯 MULTI-FACTOR SIGNALS:
   ${c.signals && c.signals.length > 0 ? c.signals.map(s => `   - ${s}`).join("\n") : "   - None"}
   
   📰 CATALYSTS & NEWS:
   ${c.catalysts && c.catalysts.length > 0 ? c.catalysts.map(cat => `   - ${cat}`).join("\n") : "   - None detected"}
   ${c.newsSentiment ? `   - News Sentiment: ${c.newsSentiment.toUpperCase()}` : ""}
   
   👔 SMART MONEY SIGNALS:
   ${c.insiderBuying ? `   - ${c.insiderBuying} insider buy(s) in last 30 days ${c.insiderBuying >= 3 ? "🔥 STRONG SIGNAL" : ""}` : "   - No recent insider buying"}
   ${c.analystRating ? `   - Analyst Rating: ${c.analystRating.buy} BUY, ${c.analystRating.hold} HOLD, ${c.analystRating.sell} SELL` : ""}
   ${c.optionsFlow ? `   - Options Flow: P/C Ratio ${c.optionsFlow.putCallRatio?.toFixed(2) || "N/A"}, IV Rank ${c.optionsFlow.ivRank || 0}%` : ""}
   ${c.optionsFlow?.unusualCallActivity ? `   - 🔥 UNUSUAL CALL ACTIVITY DETECTED` : ""}
   ${c.optionsFlow && (c.optionsFlow.sweepsCount || 0) > 0 ? `   - 🎯 ${c.optionsFlow.sweepsCount} OPTIONS SWEEPS (Institutional positioning!)` : ""}
`
  )
  .join("\n")}

CRITICAL ANALYSIS FRAMEWORK:

1. **STRUCTURAL CATALYSTS** (Highest Priority)
   Look for transformational events that create 3x-10x potential:
   - Corporate spinoffs/split-ups
   - Strategic pivot to high-growth sector (AI, quantum, biotech-AI)
   - Major restructuring or turnaround
   - New contract/partnership announcements
   - Sector tailwinds (AI infrastructure, data storage, cloud)
   - Recent or upcoming S&P 500 inclusion
   
2. **SMART MONEY CONFIRMATION**
   Validate opportunity with institutional signals:
   - Options sweeps (institutions positioning)
   - Multiple insider buys (executives putting their money where their mouth is)
   - Unusual call activity (someone knows something)
   - Low P/C ratio <0.7 (extremely bullish)
   - High IV rank >75 (big move expected)
   
3. **TIMING & SETUP**
   Perfect entry timing matters:
   - Breaking out of consolidation on volume
   - Early in uptrend (not overextended)
   - Sector showing momentum
   - Catalyst within next 2 weeks ideal
   
4. **ASYMMETRIC RISK/REWARD**
   Must have at least 3:1 risk/reward
   - Clear technical support for stop loss
   - Logical price targets based on comps
   - 50-100%+ upside potential vs 15-25% downside

YOUR MISSION:
Select EXACTLY 2 stocks with the BEST asymmetric risk/reward profiles.

Prioritize stocks with:
✅ Structural catalysts (game-changing events)
✅ Smart money confirmation (options flow + insider buying)
✅ Sector tailwinds (AI, quantum, next big thing)
✅ Technical breakout setup
✅ 3:1+ risk/reward with 50%+ upside potential

AVOID:
❌ Generic "good stocks" with no catalyst
❌ Mega-caps with limited upside (AAPL, MSFT, etc.)
❌ Extended stocks >50% above 200MA
❌ Stocks with insider selling
❌ Dead sectors with no narrative

For EACH of the 2 selected opportunities, provide:

1. **Setup Type**: momentum_breakout, mean_reversion, options_play, or swing_trade
2. **Entry Zone**: Specific price with tight range (±1%)
3. **Price Targets**: Realistic based on technical levels or sector comps
   - Conservative target (15-30%)
   - Aggressive target (50-100%+)
4. **Stop Loss**: Clear technical support level
5. **Risk/Reward**: Must be at least 3:1
6. **Win Rate**: Realistic 55-75% based on similar setups
7. **Timeframe**: Expected holding period
8. **DETAILED REASONING** must include:
   - What is the STRUCTURAL CATALYST that creates 3x-10x potential?
   - How does options flow/insider buying confirm this?
   - What sector tailwind supports this?
   - Why is NOW the right time?
   - What specific price target is justified and why?
   - What makes this better than other candidates?

Return JSON format (EXACTLY 2 opportunities):
{
  "opportunities": [
    {
      "symbol": "TICKER",
      "name": "Company Name",
      "setupType": "momentum_breakout",
      "entry": { "price": 50.0, "range": { "min": 49.50, "max": 50.50 } },
      "target": { "price": 65.0, "percentage": 30.0 },
      "stopLoss": { "price": 47.0, "percentage": 6.0 },
      "riskReward": 5.0,
      "winRate": 68,
      "timeframe": "2-8 weeks",
      "reasoning": "DETAILED analysis explaining the structural catalyst, smart money confirmation, sector tailwinds, and why this could be a 3x-10x opportunity...",
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
    return `You are an elite institutional trader specializing in identifying MULTI-BAGGER opportunities (3x-10x returns) through structural catalyst analysis.

Your expertise:
- **Structural Catalyst Recognition**: Spinoffs, restructuring, strategic pivots that create asymmetric upside
- **Smart Money Tracking**: Options flow, insider activity, 13F filings
- **Sector Rotation Analysis**: Identifying next big themes (AI infrastructure, quantum, biotech-AI)
- **Technical Timing**: Catching breakouts at optimal entry points
- **Risk Management**: 3:1+ risk/reward setups only

Your track record:
- Identified SanDisk pre-spinoff (594% gain in 2025)
- Caught Western Digital AI pivot (303% gain)
- Early on Micron restructuring (238% gain)
- Spotted Palantir enterprise shift (113% gain)

Your methodology:
1. **Hunt for structural catalysts** - Events that change the game (spinoffs, pivots, turnarounds)
2. **Confirm with smart money** - Options sweeps, insider buying, institutional accumulation
3. **Validate sector tailwinds** - Riding powerful multi-year themes
4. **Time the technical setup** - Enter on breakouts with volume confirmation
5. **Size for asymmetric upside** - 50-100%+ potential with defined risk

Selection criteria:
✅ **Structural catalyst present** (not just "good company")
✅ **Smart money confirmation** (options flow + insider buying)
✅ **Sector tailwind** (AI, quantum, next big thing)
✅ **Technical breakout setup** (not overextended)
✅ **3:1+ risk/reward** (preferably 5:1+)
✅ **50-100%+ upside potential** (looking for home runs)

You NEVER recommend:
❌ Stocks without clear catalysts
❌ Mega-caps with <20% upside (AAPL, MSFT unless structural change)
❌ Extended stocks >50% above 200-day MA
❌ Companies with insider selling
❌ Dead sectors with no narrative
❌ Setups with poor risk/reward <3:1

Your mission: Find the next 3x-10x opportunity, not just another 10% trade.

CRITICAL: You MUST return exactly 2 opportunities with detailed analysis of structural catalysts and multi-bagger potential.
- Stocks without clear catalysts or technical setup
- Low-quality companies with poor fundamentals
- Pump and dump schemes or meme stocks without substance

You are HIGHLY SELECTIVE and only recommend opportunities with:
- Clear technical setup (breakout, reversal, continuation)
- Recent catalyst (news, earnings, upgrade, contract)
- Institutional interest (volume, options flow, dark pool)
- Favorable risk/reward (minimum 2:1 R/R)
- Reasonable timeframe (days to weeks, not months)

Quality over quantity - Better to recommend 1-2 great setups than 5 mediocre ones.`;
  }
}

// Singleton instance
export const openaiClient = new OpenAIClient();

// Export types
export type { TradingOpportunity, MarketContext, StockCandidate };

// Export class
export { OpenAIClient };
