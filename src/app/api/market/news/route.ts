/**
 * Market News API Route
 * GET /api/market/news?limit=10
 * Returns MACRO market-moving news with sentiment analysis
 * Filters for news that affects the broader market, not individual stocks
 */

import { NextRequest, NextResponse } from "next/server";
import { fmpClient, FMPClient } from "@/lib/api/clients/fmp-client";
import { FMPNewsArticle } from "@/lib/api/types";
import { MarketStory } from "@/resources/mock-data/indexes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Keywords that indicate macro/market-moving news
const MACRO_KEYWORDS = [
  // Federal Reserve & Monetary Policy
  "fed", "federal reserve", "fomc", "powell", "interest rate", "rate cut", "rate hike",
  "monetary policy", "quantitative", "tapering", "dovish", "hawkish",
  // Economic Indicators
  "inflation", "cpi", "ppi", "gdp", "employment", "jobs report", "unemployment",
  "nonfarm payroll", "retail sales", "consumer spending", "economic growth",
  "recession", "soft landing", "hard landing",
  // Market-wide
  "s&p 500", "dow jones", "nasdaq", "russell", "market rally", "market selloff",
  "bull market", "bear market", "correction", "volatility", "vix",
  "stock market", "wall street", "trading day",
  // Treasury & Bonds
  "treasury", "yield", "bond", "10-year", "2-year", "yield curve", "inversion",
  // Sectors & Broad Impact
  "tech sector", "energy sector", "financial sector", "earnings season",
  "mega cap", "large cap", "sector rotation",
  // Geopolitical & Commodities
  "oil prices", "crude oil", "opec", "gold", "commodity",
  "trade war", "tariff", "sanctions", "geopolitical",
  // Central Banks & Global
  "ecb", "bank of japan", "china economy", "global markets",
  "emerging markets", "currency", "dollar index",
];

// Keywords that indicate company-specific news (to deprioritize)
const COMPANY_SPECIFIC_KEYWORDS = [
  "earnings beat", "earnings miss", "quarterly results", "revenue grew",
  "ceo said", "cfo said", "product launch", "acquisition of",
  "layoffs at", "hired", "appointed", "partnership with",
  "lawsuit", "sec investigation", "recall", "upgrade", "downgrade",
];

/**
 * Calculate macro relevance score for an article
 * Higher score = more market-moving / macro relevant
 */
function calculateMacroScore(article: FMPNewsArticle): number {
  const title = (article.title || "").toLowerCase();
  const text = (article.text || article.content || "").toLowerCase();
  const combined = `${title} ${text}`;

  let score = 0;

  // Boost for macro keywords (title matches worth more)
  for (const keyword of MACRO_KEYWORDS) {
    if (title.includes(keyword)) score += 10;
    else if (combined.includes(keyword)) score += 3;
  }

  // Penalty for company-specific news
  for (const keyword of COMPANY_SPECIFIC_KEYWORDS) {
    if (combined.includes(keyword)) score -= 5;
  }

  // Boost for mentions of multiple indices/markets
  const indexMentions = ["s&p", "dow", "nasdaq", "russell", "market"].filter(
    (idx) => combined.includes(idx)
  ).length;
  score += indexMentions * 5;

  // Boost for economic data releases
  if (combined.includes("report") && combined.includes("data")) score += 8;
  if (combined.includes("breaking") || combined.includes("just in")) score += 5;

  // Slight penalty if it mentions a specific stock ticker prominently
  const tickerPattern = /\b[A-Z]{1,5}\b/g;
  const tickerMatches = title.match(tickerPattern) || [];
  if (tickerMatches.length > 2) score -= 3;

  return score;
}

/**
 * Check if article is macro-relevant
 */
function isMacroRelevant(article: FMPNewsArticle): boolean {
  return calculateMacroScore(article) > 0;
}

/**
 * Check if article was published within the last 24 hours
 */
function isWithinLast24Hours(article: FMPNewsArticle): boolean {
  const publishedDate = article.publishedDate || article.date;
  if (!publishedDate) return false;
  
  try {
    const published = new Date(publishedDate);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return published >= twentyFourHoursAgo;
  } catch {
    return false;
  }
}

/**
 * Strip HTML tags and clean up text
 */
function stripHtml(html: string): string {
  if (!html) return "";
  
  return html
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Decode common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "...")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    // Decode numeric HTML entities
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();
}

// Default placeholder images for articles without images
const DEFAULT_ARTICLE_IMAGES = [
  "/images/news/market-default-1.svg",
  "/images/news/market-default-2.svg",
  "/images/news/market-default-3.svg",
];

/**
 * Get a consistent default image based on article title (for visual variety)
 */
function getDefaultImage(title: string): string {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_ARTICLE_IMAGES[hash % DEFAULT_ARTICLE_IMAGES.length];
}

/**
 * Transform FMP article to MarketStory format
 */
function transformToMarketStory(article: FMPNewsArticle): MarketStory & { macroScore: number } {
  const publishedDate = article.publishedDate || article.date;
  const macroScore = calculateMacroScore(article);

  // Clean HTML from title and summary
  const cleanTitle = stripHtml(article.title || "Untitled");
  const cleanSummary = stripHtml(article.text || article.content || "");

  // Use article image or fall back to default
  const image = article.image && article.image.trim() 
    ? article.image 
    : getDefaultImage(cleanTitle);

  return {
    title: cleanTitle,
    summary: cleanSummary,
    sentiment: FMPClient.mapSentiment(article.sentiment || ""),
    importance: macroScore > 20 ? "high" : macroScore > 10 ? "medium" : "low",
    time: formatTimeAgo(publishedDate),
    source: article.site || article.author || "Financial News",
    url: article.url || article.link,
    image,
    macroScore,
  };
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp: string): string {
  try {
    const now = new Date();
    const published = new Date(timestamp);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  } catch {
    return "Recently";
  }
}

/**
 * Generate market-focused summary
 */
function generateMarketSummary(stories: MarketStory[]): string {
  if (stories.length === 0) return "";

  const bullishCount = stories.filter((s) => s.sentiment === "bullish").length;
  const bearishCount = stories.filter((s) => s.sentiment === "bearish").length;
  const highPriorityCount = stories.filter((s) => s.importance === "high").length;

  let sentiment = "mixed";
  if (bullishCount > bearishCount * 2) sentiment = "predominantly bullish";
  else if (bearishCount > bullishCount * 2) sentiment = "predominantly bearish";
  else if (bullishCount > bearishCount) sentiment = "leaning bullish";
  else if (bearishCount > bullishCount) sentiment = "leaning bearish";

  const topStories = stories.slice(0, 3);
  const mainThemes: string[] = [];

  // Extract main themes from top stories
  for (const story of topStories) {
    const title = story.title.toLowerCase();
    if (title.includes("fed") || title.includes("rate")) mainThemes.push("Fed policy");
    else if (title.includes("inflation") || title.includes("cpi")) mainThemes.push("inflation data");
    else if (title.includes("jobs") || title.includes("employment")) mainThemes.push("employment");
    else if (title.includes("market") || title.includes("stocks")) mainThemes.push("market movement");
    else if (title.includes("oil") || title.includes("energy")) mainThemes.push("energy prices");
    else if (title.includes("yield") || title.includes("treasury")) mainThemes.push("bond yields");
  }

  const uniqueThemes = [...new Set(mainThemes)].slice(0, 3);
  const themesText = uniqueThemes.length > 0 
    ? `Key focus: ${uniqueThemes.join(", ")}. ` 
    : "";

  return `Today's market news is ${sentiment}. ${themesText}${highPriorityCount} major story${highPriorityCount !== 1 ? "s" : ""} could impact trading.`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!fmpClient.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "FMP API is not configured. Add FMP_API_KEY to .env.local",
          timestamp: Date.now(),
        },
        { status: 503 }
      );
    }

    // Fetch more articles than needed to have enough after filtering
    const fetchLimit = Math.min(limit * 3, 60);

    // Get general financial news (more macro-focused than stock-specific news)
    let articles = await fmpClient.getGeneralNews(fetchLimit);

    // Also get stock news for major ETFs that track broader market
    const etfNews = await fmpClient.getStockNews(
      ["SPY", "QQQ", "DIA", "IWM", "VTI"],
      fetchLimit
    );

    // Combine and deduplicate by title
    const allArticles = [...articles, ...etfNews];
    const seenTitles = new Set<string>();
    const uniqueArticles = allArticles.filter((article) => {
      const title = article.title?.toLowerCase().trim() || "";
      if (seenTitles.has(title)) return false;
      seenTitles.add(title);
      return true;
    });

    // Filter for:
    // 1. Articles from last 24 hours only
    // 2. Macro-relevant news
    const macroStories = uniqueArticles
      .filter(isWithinLast24Hours) // Only last 24 hours
      .filter(isMacroRelevant)
      .map(transformToMarketStory)
      .sort((a, b) => b.macroScore - a.macroScore) // Sort by macro relevance
      .slice(0, limit)
      .map(({ macroScore, ...story }) => story); // Remove internal score

    // If we don't have enough macro news, include some general news from last 24h
    if (macroStories.length < limit) {
      const generalStories = uniqueArticles
        .filter(isWithinLast24Hours) // Still only last 24 hours
        .filter((a) => !isMacroRelevant(a))
        .slice(0, limit - macroStories.length)
        .map((article) => {
          const story = transformToMarketStory(article);
          const { macroScore, ...rest } = story;
          return rest;
        });
      macroStories.push(...generalStories);
    }

    const summary = generateMarketSummary(macroStories);

    return NextResponse.json({
      success: true,
      data: macroStories,
      summary,
      cached: false,
      source: "fmp",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in /api/market/news:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
