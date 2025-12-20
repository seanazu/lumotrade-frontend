/**
 * Financial Data Types
 * Comprehensive types for fundamental analysis data
 */

export interface IncomeStatement {
  date: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  weightedAverageShsOut: number;
  ebitda: number;
  ebitdaratio: number;
}

export interface BalanceSheet {
  date: string;
  totalAssets: number;
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalStockholdersEquity: number;
  cashAndCashEquivalents: number;
  inventory: number;
  totalDebt: number;
  netDebt: number;
}

export interface CashFlowStatement {
  date: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  freeCashFlow: number;
  capitalExpenditure: number;
  dividendsPaid: number;
  netChangeInCash: number;
}

export interface FinancialRatios {
  // Profitability
  returnOnEquity: number;
  returnOnAssets: number;
  returnOnCapitalEmployed: number;
  netProfitMargin: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;

  // Liquidity
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;

  // Efficiency
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesTurnover: number;

  // Leverage
  debtToEquity: number;
  debtToAssets: number;
  interestCoverage: number;

  // Growth (YoY)
  revenueGrowth: number;
  epsGrowth: number;
  netIncomeGrowth: number;
}

export interface ValuationMetrics {
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  pegRatio: number;
  evToEbitda: number;
  evToSales: number;
  priceToFreeCashFlow: number;
  dividendYield: number;
}

export interface EarningsSurprise {
  date: string;
  actualEPS: number;
  estimatedEPS: number;
  surprise: number;
  surprisePercentage: number;
}

export interface PeerComparison {
  symbol: string;
  name: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  revenueGrowth: number;
  netProfitMargin: number;
}

export interface ComprehensiveFinancials {
  symbol: string;
  companyName: string;

  // Statements
  incomeStatements: {
    annual: IncomeStatement[];
    quarterly: IncomeStatement[];
  };
  balanceSheets: {
    annual: BalanceSheet[];
    quarterly: BalanceSheet[];
  };
  cashFlowStatements: {
    annual: CashFlowStatement[];
    quarterly: CashFlowStatement[];
  };

  // Analysis
  ratios: FinancialRatios;
  valuation: ValuationMetrics;
  earningsSurprises: EarningsSurprise[];
  peers: PeerComparison[];

  // Scores
  fundamentalScore: number; // 0-100
  financialHealthScore: number; // 0-100
  growthScore: number; // 0-100
  valuationScore: number; // 0-100 (100 = undervalued)
}
