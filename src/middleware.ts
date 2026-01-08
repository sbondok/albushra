
import { withAuth } from "next-auth/middleware";
import crypto from 'crypto';

let NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  } else {
    console.warn('Warning: NEXTAUTH_SECRET not set — using ephemeral secret for local development');
    NEXTAUTH_SECRET = crypto.randomBytes(32).toString('hex');
  }
}

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  secret: NEXTAUTH_SECRET,
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
