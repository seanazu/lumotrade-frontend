/**
 * Sentiment Analysis Engine
 * Aggregates sentiment from news, social media, analysts, and insider trading
 */

export interface SentimentScore {
  score: number; // 0-100 (0 = extreme fear, 100 = extreme greed)
  label: "extreme_fear" | "fear" | "neutral" | "greed" | "extreme_greed";
  components: {
    news: { score: number; weight: number };
    analyst: { score: number; weight: number };
    insider: { score: number; weight: number };
    social: { score: number; weight: number };
  };
  interpretation: string;
  momentum: "positive" | "neutral" | "negative";
}

interface NewsArticle {
  title: string;
  sentiment?: string;
  publishedDate?: string;
  date?: string;
}

interface AnalystRating {
  gradingCompany: string;
  previousGrade?: string;
  newGrade: string;
  date: string;
}

interface InsiderTrade {
  transactionType: string;
  securitiesTransacted: number;
  price: number;
  filingDate: string;
}

/**
 * Analyze news sentiment
 */
function analyzeNewsSentiment(news: NewsArticle[]): number {
  if (!news || news.length === 0) return 50;

  const sentimentMap: Record<string, number> = {
    positive: 80,
    bullish: 85,
    neutral: 50,
    negative: 20,
    bearish: 15,
  };

  let totalScore = 0;
  let count = 0;

  for (const article of news) {
    if (article.sentiment) {
      const score = sentimentMap[article.sentiment.toLowerCase()] || 50;
      totalScore += score;
      count++;
    } else {
      // Basic keyword sentiment if no explicit sentiment
      const text = article.title.toLowerCase();
      if (
        text.includes("surge") ||
        text.includes("rally") ||
        text.includes("beat") ||
        text.includes("upgrade")
      ) {
        totalScore += 70;
        count++;
      } else if (
        text.includes("fall") ||
        text.includes("drop") ||
        text.includes("miss") ||
        text.includes("downgrade")
      ) {
        totalScore += 30;
        count++;
      } else {
        totalScore += 50;
        count++;
      }
    }
  }

  return count > 0 ? totalScore / count : 50;
}

/**
 * Analyze analyst ratings
 */
function analyzeAnalystSentiment(ratings: AnalystRating[]): number {
  if (!ratings || ratings.length === 0) return 50;

  const gradeScores: Record<string, number> = {
    "strong buy": 95,
    buy: 75,
    outperform: 70,
    "market perform": 50,
    hold: 50,
    neutral: 50,
    underperform: 30,
    sell: 25,
    "strong sell": 5,
  };

  let totalScore = 0;
  let count = 0;

  // Weight recent ratings more heavily
  for (let i = 0; i < ratings.length; i++) {
    const rating = ratings[i];
    const grade = rating.newGrade.toLowerCase();
    const score = gradeScores[grade] || 50;

    // Weight: most recent = 1.0, oldest = 0.3
    const weight = 1.0 - (i / ratings.length) * 0.7;

    totalScore += score * weight;
    count += weight;
  }

  return count > 0 ? totalScore / count : 50;
}

/**
 * Analyze insider trading activity
 */
function analyzeInsiderSentiment(trades: InsiderTrade[]): number {
  if (!trades || trades.length === 0) return 50;

  let buyValue = 0;
  let sellValue = 0;

  // Only look at last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  for (const trade of trades) {
    const tradeDate = new Date(trade.filingDate);
    if (tradeDate < ninetyDaysAgo) continue;

    const value = Math.abs(trade.securitiesTransacted * trade.price);

    if (
      trade.transactionType?.includes("P-Purchase") ||
      trade.transactionType?.toLowerCase().includes("buy")
    ) {
      buyValue += value;
    } else if (
      trade.transactionType?.includes("S-Sale") ||
      trade.transactionType?.toLowerCase().includes("sell")
    ) {
      sellValue += value;
    }
  }

  if (buyValue === 0 && sellValue === 0) return 50;

  // Convert to 0-100 score
  const buyRatio = buyValue / (buyValue + sellValue);
  return 20 + buyRatio * 60; // Range: 20-80
}

/**
 * Calculate composite sentiment score
 */
export function calculateSentiment(data: {
  news: NewsArticle[];
  analystRatings: AnalystRating[];
  insiderTrading: InsiderTrade[];
  socialMentions?: { sentiment: string; count: number }[];
}): SentimentScore {
  // Component scores
  const newsScore = analyzeNewsSentiment(data.news);
  const analystScore = analyzeAnalystSentiment(data.analystRatings);
  const insiderScore = analyzeInsiderSentiment(data.insiderTrading);
  const socialScore = analyzeSocialSentiment(data.socialMentions || []);

  // Weighted composite (analyst and insider are most reliable)
  const weights = {
    news: 0.25,
    analyst: 0.35,
    insider: 0.3,
    social: 0.1,
  };

  const compositeScore =
    newsScore * weights.news +
    analystScore * weights.analyst +
    insiderScore * weights.insider +
    socialScore * weights.social;

  // Determine label
  let label: SentimentScore["label"];
  if (compositeScore >= 80) label = "extreme_greed";
  else if (compositeScore >= 60) label = "greed";
  else if (compositeScore >= 40) label = "neutral";
  else if (compositeScore >= 20) label = "fear";
  else label = "extreme_fear";

  // Determine momentum (is sentiment improving or declining?)
  // Compare recent vs older
  const recentNews = data.news.slice(0, 5);
  const olderNews = data.news.slice(5, 10);
  const recentNewsScore = analyzeNewsSentiment(recentNews);
  const olderNewsScore = analyzeNewsSentiment(olderNews);

  let momentum: "positive" | "neutral" | "negative";
  if (recentNewsScore > olderNewsScore + 10) momentum = "positive";
  else if (recentNewsScore < olderNewsScore - 10) momentum = "negative";
  else momentum = "neutral";

  // Generate interpretation
  let interpretation = "";
  if (compositeScore >= 70) {
    interpretation =
      "Strong bullish sentiment across multiple sources. Market participants are very optimistic.";
  } else if (compositeScore >= 55) {
    interpretation =
      "Moderately positive sentiment. Analysts and insiders show confidence.";
  } else if (compositeScore >= 45) {
    interpretation =
      "Mixed sentiment. Market participants are divided on outlook.";
  } else if (compositeScore >= 30) {
    interpretation =
      "Moderately bearish sentiment. Caution among market participants.";
  } else {
    interpretation =
      "Strongly negative sentiment. Significant concerns from analysts and insiders.";
  }

  return {
    score: Math.round(compositeScore),
    label,
    components: {
      news: { score: Math.round(newsScore), weight: weights.news },
      analyst: { score: Math.round(analystScore), weight: weights.analyst },
      insider: { score: Math.round(insiderScore), weight: weights.insider },
      social: { score: Math.round(socialScore), weight: weights.social },
    },
    interpretation,
    momentum,
  };
}

/**
 * Analyze social media sentiment (simplified)
 */
function analyzeSocialSentiment(
  mentions: { sentiment: string; count: number }[]
): number {
  if (!mentions || mentions.length === 0) return 50;

  const sentimentMap: Record<string, number> = {
    positive: 75,
    bullish: 80,
    neutral: 50,
    negative: 25,
    bearish: 20,
  };

  let totalScore = 0;
  let totalCount = 0;

  for (const mention of mentions) {
    const score = sentimentMap[mention.sentiment.toLowerCase()] || 50;
    totalScore += score * mention.count;
    totalCount += mention.count;
  }

  return totalCount > 0 ? totalScore / totalCount : 50;
}
