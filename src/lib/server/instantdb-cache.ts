import { init } from '@instantdb/admin';
import { INSTANT_APP_ID, INSTANT_ADMIN_TOKEN } from '@/lib/env';

// Admin client for server-side operations
const adminDB = INSTANT_ADMIN_TOKEN 
  ? init({ appId: INSTANT_APP_ID, adminToken: INSTANT_ADMIN_TOKEN })
  : null;

export type CacheGetResult<T> =
  | { hit: true; data: T; updatedAt: string }
  | { hit: false };

/**
 * Get a cache entry from InstantDB
 */
async function getCacheEntry<T>(
  key: string,
  scope: string
): Promise<CacheGetResult<T>> {
  if (!adminDB) {
    console.warn('⚠️ InstantDB admin not configured, cache disabled');
    return { hit: false };
  }

  try {
    const { data } = await adminDB.query({
      apiCache: {
        $: {
          where: {
            and: [
              { cacheKey: key },
              { scope: scope }
            ]
          },
          limit: 1
        }
      }
    });

    // Check if data exists and has apiCache array
    if (!data || !data.apiCache || !Array.isArray(data.apiCache)) {
      return { hit: false };
    }

    const entry = data.apiCache[0];

    if (!entry) {
      return { hit: false };
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      // Delete expired entry
      await adminDB.transact([
        adminDB.tx.apiCache[entry.id].delete()
      ]);
      return { hit: false };
    }

    // Parse payload
    const payload = JSON.parse(entry.payload);

    return {
      hit: true,
      data: payload as T,
      updatedAt: new Date(entry.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error('Error getting cache entry:', error);
    return { hit: false };
  }
}

/**
 * Set a cache entry in InstantDB
 */
async function setCacheEntry(
  key: string,
  scope: string,
  payload: unknown,
  opts?: { expiresAt?: Date; purgeOtherDailyScopes?: boolean }
): Promise<void> {
  if (!adminDB) {
    console.warn('⚠️ InstantDB admin not configured, cache disabled');
    return;
  }

  try {
    const now = Date.now();
    const payloadString = JSON.stringify(payload);
    const expiresAt = opts?.expiresAt?.getTime() || null;

    // Check if entry exists
    const { data } = await adminDB.query({
      apiCache: {
        $: {
          where: {
            and: [
              { cacheKey: key },
              { scope: scope }
            ]
          }
        }
      }
    });

    // Safely check for existing entry
    const existingEntry = data?.apiCache?.[0];

    if (existingEntry) {
      // Update existing entry
      await adminDB.transact([
        adminDB.tx.apiCache[existingEntry.id].update({
          payload: payloadString,
          expiresAt,
          updatedAt: now,
        })
      ]);
    } else {
      // Create new entry
      await adminDB.transact([
        adminDB.tx.apiCache[crypto.randomUUID()].update({
          cacheKey: key,
          scope,
          payload: payloadString,
          expiresAt,
          createdAt: now,
          updatedAt: now,
        })
      ]);
    }

    // Purge other daily scopes if requested
    if (opts?.purgeOtherDailyScopes && scope.startsWith('daily:')) {
      const { data: oldData } = await adminDB.query({
        apiCache: {
          $: {
            where: {
              and: [
                { cacheKey: key },
                // Note: InstantDB doesn't support "not equal", so we'll handle in code
              ]
            }
          }
        }
      });

      // Filter out current scope and delete others
      const toDelete = oldData?.apiCache?.filter(
        (entry: any) => entry.scope.startsWith('daily:') && entry.scope !== scope
      ) || [];

      if (toDelete.length > 0) {
        await adminDB.transact(
          toDelete.map((entry: any) => adminDB.tx.apiCache[entry.id].delete())
        );
      }
    }
  } catch (error) {
    console.error('Error setting cache entry:', error);
    throw error;
  }
}

/**
 * Get or compute a daily cache entry
 * Daily cache entries are scoped by date (e.g., "daily:2024-12-30")
 * and automatically purge previous days' entries
 */
export async function getOrComputeDailyCache<T>(params: {
  key: string;
  dateEt: string; // YYYY-MM-DD
  forceRefresh?: boolean;
  compute: () => Promise<T>;
}): Promise<{
  data: T;
  cache: { hit: boolean; scope: string; storedAt?: string };
}> {
  const scope = `daily:${params.dateEt}`;

  if (!adminDB) {
    console.warn('⚠️ InstantDB not configured, computing without cache');
    const data = await params.compute();
    return { data, cache: { hit: false, scope } };
  }

  // Try to get from cache first (unless force refresh)
  if (!params.forceRefresh) {
    const cached = await getCacheEntry<T>(params.key, scope);
    if (cached.hit) {
      return {
        data: cached.data,
        cache: { hit: true, scope, storedAt: cached.updatedAt },
      };
    }
  }

  // Compute fresh data
  const computed = await params.compute();

  // Store in cache
  await setCacheEntry(params.key, scope, computed, {
    purgeOtherDailyScopes: true,
  });

  return { data: computed, cache: { hit: false, scope } };
}

/**
 * Get or compute a TTL-based cache entry
 * Expires after the specified number of seconds
 */
export async function getOrComputeTtlCache<T>(params: {
  key: string;
  ttlSeconds: number;
  forceRefresh?: boolean;
  compute: () => Promise<T>;
}): Promise<{
  data: T;
  cache: { hit: boolean; scope: string; storedAt?: string };
}> {
  const scope = 'ttl';

  if (!adminDB) {
    console.warn('⚠️ InstantDB not configured, computing without cache');
    const data = await params.compute();
    return { data, cache: { hit: false, scope } };
  }

  // Try to get from cache first (unless force refresh)
  if (!params.forceRefresh) {
    const cached = await getCacheEntry<T>(params.key, scope);
    if (cached.hit) {
      return {
        data: cached.data,
        cache: { hit: true, scope, storedAt: cached.updatedAt },
      };
    }
  }

  // Compute fresh data
  const computed = await params.compute();

  // Store in cache with expiration
  await setCacheEntry(params.key, scope, computed, {
    expiresAt: new Date(Date.now() + params.ttlSeconds * 1000),
  });

  return { data: computed, cache: { hit: false, scope } };
}

