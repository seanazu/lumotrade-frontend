import crypto from "crypto";
import type { Pool } from "pg";
import { getPgPool } from "@/lib/server/pg";

type CacheGetResult<T> =
  | { hit: true; data: T; updatedAt: string }
  | { hit: false };

declare global {
  // eslint-disable-next-line no-var
  var __lumoApiCacheTableReady: boolean | undefined;
}

async function ensureTable(pool: Pool): Promise<void> {
  if (globalThis.__lumoApiCacheTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_cache_entries (
      cache_key TEXT NOT NULL,
      scope TEXT NOT NULL,
      payload JSONB NOT NULL,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (cache_key, scope)
    );

    CREATE INDEX IF NOT EXISTS idx_api_cache_entries_expires_at
      ON api_cache_entries(expires_at);
  `);

  globalThis.__lumoApiCacheTableReady = true;
}

function advisoryLockId(input: string): string {
  // Take first 8 bytes of sha256 as unsigned bigint, then coerce into signed bigint range.
  const hex = crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .slice(0, 16);
  const asBigInt = BigInt(`0x${hex}`);
  // Postgres bigint is signed; mod into signed range.
  const maxSigned = (BigInt(1) << BigInt(63)) - BigInt(1);
  const signed = asBigInt % maxSigned;
  return signed.toString(10);
}

async function withAdvisoryLock<T>(
  pool: Pool,
  lockKey: string,
  fn: () => Promise<T>
): Promise<T> {
  const lockId = advisoryLockId(lockKey);
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [lockId]);
    try {
      return await fn();
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [lockId]);
    }
  } finally {
    client.release();
  }
}

async function getCacheEntry<T>(
  pool: Pool,
  key: string,
  scope: string
): Promise<CacheGetResult<T>> {
  await ensureTable(pool);

  const res = await pool.query(
    `
      SELECT payload, expires_at, updated_at
      FROM api_cache_entries
      WHERE cache_key = $1 AND scope = $2
      LIMIT 1
    `,
    [key, scope]
  );

  const row = res.rows[0] as
    | { payload: unknown; expires_at: string | null; updated_at: string }
    | undefined;

  if (!row) return { hit: false };

  if (row.expires_at) {
    const expiresAt = new Date(row.expires_at).getTime();
    if (Date.now() > expiresAt) {
      // best-effort cleanup
      await pool.query(
        "DELETE FROM api_cache_entries WHERE cache_key = $1 AND scope = $2",
        [key, scope]
      );
      return { hit: false };
    }
  }

  return {
    hit: true,
    data: row.payload as unknown as T,
    updatedAt: row.updated_at,
  };
}

async function setCacheEntry(
  pool: Pool,
  key: string,
  scope: string,
  payload: unknown,
  opts?: { expiresAt?: Date; purgeOtherDailyScopes?: boolean }
): Promise<void> {
  await ensureTable(pool);

  const expiresAt = opts?.expiresAt ? opts.expiresAt.toISOString() : null;

  await pool.query(
    `
      INSERT INTO api_cache_entries (cache_key, scope, payload, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (cache_key, scope)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `,
    [key, scope, payload, expiresAt]
  );

  if (opts?.purgeOtherDailyScopes && scope.startsWith("daily:")) {
    await pool.query(
      `
        DELETE FROM api_cache_entries
        WHERE cache_key = $1
          AND scope LIKE 'daily:%'
          AND scope <> $2
      `,
      [key, scope]
    );
  }
}

export async function getOrComputeDailyCache<T>(params: {
  key: string;
  dateEt: string; // YYYY-MM-DD
  forceRefresh?: boolean;
  compute: () => Promise<T>;
}): Promise<{
  data: T;
  cache: { hit: boolean; scope: string; storedAt?: string };
}> {
  const pool = getPgPool();
  const scope = `daily:${params.dateEt}`;

  if (!pool) {
    const data = await params.compute();
    return { data, cache: { hit: false, scope } };
  }

  if (!params.forceRefresh) {
    try {
      const cached = await getCacheEntry<T>(pool, params.key, scope);
      if (cached.hit) {
        return {
          data: cached.data,
          cache: { hit: true, scope, storedAt: cached.updatedAt },
        };
      }
    } catch {
      // If DB is misconfigured/unreachable, fall back to compute.
      const data = await params.compute();
      return { data, cache: { hit: false, scope } };
    }
  }

  // Prevent thundering herd across users/requests
  return await withAdvisoryLock(pool, `${params.key}:${scope}`, async () => {
    if (!params.forceRefresh) {
      const cached = await getCacheEntry<T>(pool, params.key, scope);
      if (cached.hit) {
        return {
          data: cached.data,
          cache: { hit: true, scope, storedAt: cached.updatedAt },
        };
      }
    }

    const computed = await params.compute();
    await setCacheEntry(pool, params.key, scope, computed, {
      purgeOtherDailyScopes: true,
    });

    return { data: computed, cache: { hit: false, scope } };
  });
}

export async function getOrComputeTtlCache<T>(params: {
  key: string;
  ttlSeconds: number;
  forceRefresh?: boolean;
  compute: () => Promise<T>;
}): Promise<{
  data: T;
  cache: { hit: boolean; scope: string; storedAt?: string };
}> {
  const pool = getPgPool();
  const scope = "ttl";

  if (!pool) {
    const data = await params.compute();
    return { data, cache: { hit: false, scope } };
  }

  if (!params.forceRefresh) {
    try {
      const cached = await getCacheEntry<T>(pool, params.key, scope);
      if (cached.hit) {
        return {
          data: cached.data,
          cache: { hit: true, scope, storedAt: cached.updatedAt },
        };
      }
    } catch {
      const data = await params.compute();
      return { data, cache: { hit: false, scope } };
    }
  }

  return await withAdvisoryLock(pool, `${params.key}:${scope}`, async () => {
    if (!params.forceRefresh) {
      const cached = await getCacheEntry<T>(pool, params.key, scope);
      if (cached.hit) {
        return {
          data: cached.data,
          cache: { hit: true, scope, storedAt: cached.updatedAt },
        };
      }
    }

    const computed = await params.compute();
    await setCacheEntry(pool, params.key, scope, computed, {
      expiresAt: new Date(Date.now() + params.ttlSeconds * 1000),
    });

    return { data: computed, cache: { hit: false, scope } };
  });
}

export function stableHash(input: unknown): string {
  const json = JSON.stringify(input);
  return crypto.createHash("sha256").update(json).digest("hex");
}

