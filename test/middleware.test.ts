import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies: withAuth and next/server (provide NextResponse.next behavior)
vi.mock('next-auth/middleware', () => ({ withAuth: () => (req: any) => undefined }));
vi.mock('next/server', () => {
  class MockNextResponse {
    headers: Map<string,string> = new Map();
    status: number = 200;
    constructor(body?: any, init?: any) { if (init && init.status) this.status = init.status; }
    static next() { return new MockNextResponse(); }
    get headersMap() { return this.headers; }
  }
  return { NextResponse: MockNextResponse };
});

async function loadMiddleware(prod = false, limit = '1') {
  if (prod) {
    process.env.NODE_ENV = 'production';
    process.env.RATE_LIMIT_PER_MIN = limit;
  } else {
    process.env.NODE_ENV = 'test';
    delete process.env.RATE_LIMIT_PER_MIN;
  }
  // Clear module cache
  vi.resetModules();
  const mod = await import('../../src/middleware');
  return mod.default as any;
}

describe('middleware security headers and rate limit', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it.skip('adds security headers to responses', async () => {
    const middleware = await loadMiddleware(false);
    const req = { nextUrl: { pathname: '/some/path' }, headers: new Map(), ip: '1.2.3.4', headers: { get: (k: string) => null } } as any;
    const res: any = await middleware(req);
    // NextResponse.next returns an object with headers property
    expect(res.headers.get('Strict-Transport-Security')).toBeDefined();
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it.skip('rate limits API requests when limit exceeded (prod)', async () => {
    const middleware = await loadMiddleware(true, '1');
    const req = { nextUrl: { pathname: '/api/test' }, headers: { get: (k: string) => '1.2.3.4' }, ip: '1.2.3.4' } as any;
    const first = await middleware(req);
    expect(first.status).not.toBe(429);
    const second = await middleware(req);
    expect(second.status).toBe(429);
    expect(second.headers.get('Retry-After')).toBeDefined();
  });
});
