import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AlpacaCredentials {
  userId: string;
  apiKey: string;
  secretKey: string;
  isPaper: boolean;
}

export interface AlpacaAccount {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  daytradeCount: number;
  pattern_day_trader: boolean;
  account_number: string;
  status: string;
  last_equity: number;
}

export interface AlpacaPosition {
  symbol: string;
  qty: number;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  current_price: number;
  side: string;
}

export interface AlpacaOrder {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: string;
  qty: number;
  filled_qty: number;
  status: string;
  submitted_at: string;
  filled_at: string | null;
  filled_avg_price: number | null;
}

export interface BrokerStatus {
  connected: boolean;
  broker?: string;
  is_paper?: boolean;
  account_id?: string;
}

export interface BrokerAccountResponse {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  daytradeCount: number;
  pattern_day_trader: boolean;
  account_number: string;
  status: string;
  last_equity: number;
  positions: AlpacaPosition[];
  recent_orders: AlpacaOrder[];
}

// API functions
async function connectBroker(credentials: AlpacaCredentials) {
  const res = await fetch("/api/broker/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to connect broker");
  }
  return res.json();
}

async function disconnectBroker(userId: string) {
  const res = await fetch(
    `/api/broker/disconnect?userId=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to disconnect broker");
  }
  return res.json();
}

async function fetchBrokerStatus(userId: string): Promise<BrokerStatus> {
  if (!userId) return { connected: false };
  const res = await fetch(
    `/api/broker/status?userId=${encodeURIComponent(userId)}`
  );
  if (!res.ok) return { connected: false };
  return res.json();
}

async function fetchAccount(userId: string): Promise<BrokerAccountResponse> {
  if (!userId) throw new Error("User ID required");
  const res = await fetch(`/api/broker/account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to fetch account");
  return res.json();
}

// Hook
export function useAlpaca(userId: string) {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["alpaca", "status", userId],
    queryFn: () => fetchBrokerStatus(userId),
    enabled: !!userId,
  });

  const accountQuery = useQuery({
    queryKey: ["alpaca", "account", userId],
    queryFn: () => fetchAccount(userId),
    enabled: !!userId && statusQuery.data?.connected,
    refetchInterval: 10000, // Real-time update every 10s
  });

  const connectMutation = useMutation({
    mutationFn: connectBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alpaca", "status", userId] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectBroker(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alpaca", "status", userId] });
      queryClient.removeQueries({ queryKey: ["alpaca", "account", userId] });
    },
  });

  return {
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,
    accountData: accountQuery.data,
    account: accountQuery.data
      ? {
          equity: accountQuery.data.equity,
          cash: accountQuery.data.cash,
          buyingPower: accountQuery.data.buyingPower,
          portfolioValue: accountQuery.data.portfolioValue,
          daytradeCount: accountQuery.data.daytradeCount,
          pattern_day_trader: accountQuery.data.pattern_day_trader,
          account_number: accountQuery.data.account_number,
          status: accountQuery.data.status,
          last_equity: accountQuery.data.last_equity,
        }
      : undefined,
    isLoadingAccount: accountQuery.isLoading,
    positions: accountQuery.data?.positions || [],
    isLoadingPositions: accountQuery.isLoading,
    orders: accountQuery.data?.recent_orders || [],
    isLoadingOrders: accountQuery.isLoading,
    connect: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
}
