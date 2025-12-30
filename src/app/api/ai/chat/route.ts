import { NextRequest, NextResponse } from "next/server";
import { OPENAI_API_KEY } from "@/lib/env";
import OpenAI from "openai";
import { getOrComputeDailyCache } from "@/lib/server/file-cache";
import { getEtDateString } from "@/lib/server/time";
import { MarketAnalyzer } from "@/lib/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Fetch comprehensive market context for AI
 */
async function getSystemContext(currentSymbol?: string, currentPage?: string) {
  try {
    const dateEt = getEtDateString(new Date());

    // Get trading opportunities (Lumo's Picks)
    const tradingOpportunities = await getOrComputeDailyCache({
      key: "trading:opportunities:v1",
      dateEt,
      compute: async () => {
        const marketContext = await MarketAnalyzer.getMarketContext();
        const enrichedCandidates = await MarketAnalyzer.getAdvancedStockScreener().findOpportunities(
          marketContext,
          10
        );
        const { openaiClient } = await import("@/lib/api/clients/openai-client");
        const aiOpportunities = await openaiClient.analyzeTradingOpportunities(
          enrichedCandidates,
          marketContext
        );
        return { opportunities: aiOpportunities, marketContext };
      },
    });

    // Get ML predictions if available
    let mlPredictions: any = null;
    try {
      const mlResponse = await fetch(`${process.env.ML_BACKEND_URL}/api/predictions/today`, {
        headers: { "X-API-Key": process.env.ML_API_KEY || "" },
      });
      if (mlResponse.ok) {
        mlPredictions = await mlResponse.json();
      }
    } catch (error) {
      console.log("ML predictions not available:", error);
    }

    // Get market news
    let marketNews: any = null;
    try {
      const { marketauxClient } = await import("@/lib/api/clients/marketaux-client");
      if (marketauxClient.isConfigured()) {
        marketNews = await marketauxClient.getMarketNews({ limit: 5 });
      }
    } catch (error) {
      console.log("Market news not available:", error);
    }

    // Get stock-specific data if symbol is provided
    let stockData: any = null;
    if (currentSymbol) {
      try {
        // Get technical analysis
        const { polygonClient } = await import("@/lib/api/clients/polygon-client");
        if (polygonClient.isConfigured()) {
          const [technicals, aggregates] = await Promise.all([
            polygonClient.getTechnicalIndicators(currentSymbol, "day"),
            polygonClient.getAggregates(currentSymbol, "day"),
          ]);
          stockData = { ...stockData, technicals, aggregates };
        }

        // Get fundamentals
        const { fmpClient } = await import("@/lib/api/clients/fmp-client");
        if (fmpClient.isConfigured()) {
          const [profile, quote] = await Promise.all([
            fmpClient.getCompanyProfile(currentSymbol),
            fmpClient.getQuote(currentSymbol),
          ]);
          stockData = { ...stockData, profile, quote };
        }

        // Get options data
        const { oratsClient } = await import("@/lib/api/clients/orats-client");
        if (oratsClient.isConfigured()) {
          const optionsFlow = await oratsClient.getOptionsFlow(currentSymbol);
          stockData = { ...stockData, optionsFlow };
        }
      } catch (error) {
        console.log(`Stock data not fully available for ${currentSymbol}:`, error);
      }
    }

    return {
      tradingOpportunities: tradingOpportunities.data,
      mlPredictions,
      marketNews,
      stockData,
      currentSymbol,
      currentPage,
    };
  } catch (error) {
    console.error("Error fetching system context:", error);
    return null;
  }
}

/**
 * Build comprehensive system prompt with all available context
 */
function buildSystemPrompt(context: any) {
  const { tradingOpportunities, mlPredictions, marketNews, stockData, currentSymbol, currentPage } = context || {};

  let prompt = `You are Lumo AI, an expert financial analyst and trading advisor integrated into LumoTrade - a professional AI-powered trading platform.

## YOUR CAPABILITIES

You have REAL-TIME access to:
1. **Market Analysis**: Live market regime, sentiment, SPY performance, VIX levels, sector rotation
2. **Trading Opportunities**: AI-screened setups with entry/exit/stop levels, risk/reward, catalysts
3. **Technical Analysis**: RSI, MACD, moving averages, volume, price action across all timeframes
4. **Fundamental Data**: Company profiles, earnings, revenue, analyst ratings, insider trading
5. **Options Flow**: Unusual activity, put/call ratios, IV rank, institutional positioning
6. **ML Predictions**: Machine learning model forecasts with accuracy metrics and confidence scores
7. **Market News**: Real-time news with sentiment analysis from multiple sources
8. **Multi-source Data**: Integration of Polygon, FMP, Finnhub, Marketaux, and ORATS APIs

## CURRENT SYSTEM STATE

`;

  // Add market context
  if (tradingOpportunities?.marketContext) {
    const mc = tradingOpportunities.marketContext;
    prompt += `### Market Context (Live)
- **Regime**: ${mc.regime} (${mc.regimeStrength}/10 conviction)
- **Sentiment**: ${mc.sentiment}
- **SPY Performance**: ${mc.spyChange > 0 ? '+' : ''}${mc.spyChange?.toFixed(2)}%
- **VIX**: ${mc.vix?.toFixed(2)}
- **Leading Sectors**: ${mc.leadingSectors?.join(", ") || "N/A"}

`;
  }

  // Add Lumo's Picks
  if (tradingOpportunities?.opportunities && tradingOpportunities.opportunities.length > 0) {
    prompt += `### Lumo's Picks (AI-Selected Trading Opportunities)
${tradingOpportunities.opportunities
  .map(
    (opp: any, i: number) => `
**${i + 1}. ${opp.symbol}** - ${opp.setupType}
- Entry: $${opp.entry} | Target: $${opp.target} | Stop: $${opp.stopLoss}
- Risk/Reward: ${opp.riskRewardRatio}:1 | Win Rate: ${opp.winRate}%
- Catalyst: ${opp.catalyst}
- Rationale: ${opp.rationale}
`
  )
  .join("\n")}

`;
  }

  // Add ML Predictions
  if (mlPredictions && Array.isArray(mlPredictions) && mlPredictions.length > 0) {
    prompt += `### ML Model Predictions
${mlPredictions
  .map(
    (pred: any) => `
- **${pred.symbol}**: ${pred.direction} (${pred.confidence}% confidence)
  Model: ${pred.model_name} | Accuracy: ${pred.accuracy}%
`
  )
  .join("\n")}

`;
  }

  // Add market news
  if (marketNews?.articles && marketNews.articles.length > 0) {
    prompt += `### Latest Market News
${marketNews.articles
  .slice(0, 5)
  .map(
    (article: any) => `
- **${article.title}**
  Sentiment: ${article.sentiment || "Neutral"} | Source: ${article.source}
`
  )
  .join("\n")}

`;
  }

  // Add stock-specific data if available
  if (stockData && currentSymbol) {
    prompt += `### Current Stock Analysis: ${currentSymbol}

`;
    if (stockData.quote) {
      prompt += `**Quote**:
- Price: $${stockData.quote.price} (${stockData.quote.changesPercentage > 0 ? '+' : ''}${stockData.quote.changesPercentage?.toFixed(2)}%)
- Day Range: $${stockData.quote.dayLow} - $${stockData.quote.dayHigh}
- Volume: ${stockData.quote.volume?.toLocaleString()}

`;
    }
    if (stockData.profile) {
      prompt += `**Company**: ${stockData.profile.companyName}
- Sector: ${stockData.profile.sector} | Industry: ${stockData.profile.industry}
- Market Cap: $${(stockData.profile.mktCap / 1e9)?.toFixed(2)}B
- Description: ${stockData.profile.description?.substring(0, 200)}...

`;
    }
    if (stockData.technicals) {
      prompt += `**Technicals**:
- RSI: ${stockData.technicals.rsi?.toFixed(2)}
- MACD: ${stockData.technicals.macd?.toFixed(2)}
- Signal: ${stockData.technicals.signal?.toFixed(2)}

`;
    }
    if (stockData.optionsFlow) {
      prompt += `**Options Flow**:
- Put/Call Ratio: ${stockData.optionsFlow.putCallRatio?.toFixed(2)}
- IV Rank: ${stockData.optionsFlow.ivRank}%
- Unusual Activity: ${stockData.optionsFlow.hasUnusualActivity ? "YES" : "No"}

`;
    }
  }

  // Add context about current page
  if (currentPage) {
    prompt += `### User Context
- Current Page: ${currentPage}
${currentSymbol ? `- Viewing Symbol: ${currentSymbol}` : ""}

`;
  }

  prompt += `## YOUR RESPONSE GUIDELINES

1. **Be Data-Driven**: Always reference specific metrics, prices, and indicators from the real-time data above
2. **Be Actionable**: Provide clear insights users can act on (but always include risk disclaimers)
3. **Be Contextual**: Reference the current page and symbol if relevant
4. **Be Concise**: Get to the point quickly - traders value efficiency
5. **Be Professional**: Use trading terminology appropriately
6. **Be Honest**: If you don't have specific data, say so and offer what you do have

## IMPORTANT REMINDERS

- All data above is REAL and CURRENT - use it!
- You're analyzing live market conditions, not historical examples
- Always include risk warnings for trade recommendations
- Past performance doesn't guarantee future results
- Users should do their own due diligence

Now, respond to the user's question using the comprehensive real-time data provided above.`;

  return prompt;
}

/**
 * AI Chat API Route
 * Provides conversational AI with full system context
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, currentSymbol, currentPage } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Fetch comprehensive system context
    console.log("Fetching system context for AI chat...");
    const context = await getSystemContext(currentSymbol, currentPage);

    // Build system prompt with all context
    const systemPrompt = buildSystemPrompt(context);

    // Call OpenAI with GPT-5.2
    console.log("Calling OpenAI gpt-5.2 with comprehensive context...");
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      // Note: gpt-5.2 doesn't support max_tokens parameter
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    console.log("AI chat response generated successfully");
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error.message,
        response:
          "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
