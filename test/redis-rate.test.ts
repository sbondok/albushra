import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next-auth/middleware', () => ({ withAuth: () => (req: any) => undefined }));

vi.mock('../../src/lib/redis', () => {
  const store = new Map();
  return {
    hasRedis: () => true,
    getRedisClient: () => ({
      async incr(key: string) {
        const now = Date.now();
        const entry = store.get(key) || { count: 0, expire: now + 60000 };
        entry.count += 1;
        store.set(key, entry);
        return entry.count;
      },
      async pexpire(key: string, ms: number) { const e = store.get(key); if (e) e.expire = Date.now() + ms; },
      async pttl(key: string) { const e = store.get(key); return e ? Math.max(0, e.expire - Date.now()) : -1; }
    })
  };
});

import middleware from '../src/middleware';

describe('redis rate limiter', () => {
  it('blocks after limit', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RATE_LIMIT_PER_MIN = '2';
    const req = { nextUrl: { pathname: '/api/test' }, headers: { get: (k: string) => '1.2.3.4' } } as any;
    const first = await middleware(req);
    expect(first.status).not.toBe(429);
    const second = await middleware(req);
    expect(second.status).not.toBe(429);
    const third = await middleware(req);
    expect(third.status).toBe(429);
  });
});
