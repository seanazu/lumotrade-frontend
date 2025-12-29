/**
 * Standard Error Handler for Hooks
 * Provides consistent error handling and reporting across all data-fetching hooks
 */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Standardizes error objects from various sources
 */
export function normalizeError(error: unknown): ApiError {
  // Already normalized
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return error as ApiError;
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
    };
  }

  // HTTP error response
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "statusText" in error
  ) {
    const httpError = error as { status: number; statusText: string };
    return {
      message: httpError.statusText || "Request failed",
      status: httpError.status,
      code: `HTTP_${httpError.status}`,
    };
  }

  // String error
  if (typeof error === "string") {
    return {
      message: error,
      code: "STRING_ERROR",
    };
  }

  // Unknown error type
  return {
    message: "An unknown error occurred",
    code: "UNKNOWN_ERROR",
    details: error,
  };
}

/**
 * Logs error to console (can be extended to send to error tracking service)
 */
export function logError(
  context: string,
  error: ApiError,
  additionalInfo?: Record<string, unknown>
): void {
  console.error(`[${context}] Error:`, {
    message: error.message,
    code: error.code,
    status: error.status,
    ...additionalInfo,
  });
}

/**
 * Creates a user-friendly error message
 */
export function getUserMessage(error: ApiError): string {
  // Network errors
  if (error.code === "FETCH_ERROR" || error.code === "NETWORK_ERROR") {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Timeout
  if (error.code === "TIMEOUT_ERROR") {
    return "Request timed out. Please try again.";
  }

  // Authentication errors
  if (error.status === 401 || error.code === "UNAUTHORIZED") {
    return "Authentication required. Please log in.";
  }

  // Authorization errors
  if (error.status === 403 || error.code === "FORBIDDEN") {
    return "You don't have permission to access this resource.";
  }

  // Not found
  if (error.status === 404 || error.code === "NOT_FOUND") {
    return "The requested resource was not found.";
  }

  // Rate limiting
  if (error.status === 429 || error.code === "RATE_LIMITED") {
    return "Too many requests. Please wait a moment and try again.";
  }

  // Server errors
  if (error.status && error.status >= 500) {
    return "Server error. Please try again later.";
  }

  // Default to original message
  return error.message || "An unexpected error occurred";
}

/**
 * Complete error handler for hooks
 * Normalizes, logs, and returns user-friendly message
 */
export function handleHookError(
  hookName: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): ApiError {
  const normalized = normalizeError(error);
  logError(hookName, normalized, additionalInfo);
  return {
    ...normalized,
    message: getUserMessage(normalized),
  };
}

