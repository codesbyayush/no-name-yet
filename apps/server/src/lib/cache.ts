import { RedisClient } from 'bun';
import type { AppEnv } from './env';

/**
 * Cache interface for key-value storage
 * Abstracts over different cache implementations (KV, Redis)
 */
export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Cache implementation using Cloudflare Workers KV
 */
export class KVStoreCache implements Cache {
  private kv: KVNamespace;

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
  }

  async get(key: string): Promise<string | null> {
    return await this.kv.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.kv.put(key, value, { expirationTtl: ttlSeconds });
    } else {
      await this.kv.put(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

/**
 * Cache implementation using Redis
 */
export class RedisCache implements Cache {
  private redis: RedisClient;

  constructor(redisClient: RedisClient) {
    this.redis = redisClient;
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

/**
 * Factory function to get the appropriate cache implementation based on environment
 */
export function getCache(env: AppEnv): Cache {
  if (env.NODE_ENV === 'development' && env.REDIS_URL) {
    const redisClient = new RedisClient(env.REDIS_URL);
    return new RedisCache(redisClient);
  }

  if (env.OF_STORE) {
    return new KVStoreCache(env.OF_STORE);
  }

  throw new Error(
    'No cache configured. KV namespace (OF_STORE) should be available from wrangler.toml, or provide REDIS_URL in development.',
  );
}
