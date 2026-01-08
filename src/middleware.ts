
import { withAuth } from "next-auth/middleware";
import crypto from 'crypto';
import { NextResponse, NextRequest } from 'next/server';

let NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  } else {
    console.warn('Warning: NEXTAUTH_SECRET not set — using ephemeral secret for local development');
    NEXTAUTH_SECRET = crypto.randomBytes(32).toString('hex');
  }
}

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  secret: NEXTAUTH_SECRET,
});

// Simple in-memory rate limiter (IP-based). For production, replace with Redis or external store.
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MIN || '60');
const RATE_WINDOW_MS = 60 * 1000;
const rateMap = new Map<string, { count: number; reset: number }>();

export default async function middleware(req: NextRequest) {
  // Security headers to add on every response
  const securityHeaders: Record<string, string> = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'geolocation=()',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline';"
  };

  // Apply rate limiting only to API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.ip || 'unknown');
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + RATE_WINDOW_MS;
    }
    entry.count += 1;
    rateMap.set(ip, entry);
    const limit = process.env.NODE_ENV === 'production' ? RATE_LIMIT : RATE_LIMIT * 10;
    if (entry.count > limit) {
      const tooMany = new NextResponse('Too Many Requests', { status: 429 });
      for (const [k, v] of Object.entries(securityHeaders)) tooMany.headers.set(k, v);
      tooMany.headers.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      return tooMany;
    }
  }

  // Delegate to NextAuth middleware for protected routes (it will return a Response if it needs to redirect)
  const authRes = await authMiddleware(req as any);
  if (authRes instanceof NextResponse) {
    for (const [k, v] of Object.entries(securityHeaders)) authRes.headers.set(k, v);
    return authRes;
  }

n  // Otherwise continue and add headers
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(securityHeaders)) res.headers.set(k, v);
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
