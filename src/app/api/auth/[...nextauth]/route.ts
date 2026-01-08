
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from 'crypto';

nlet NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  } else {
    console.warn('Warning: NEXTAUTH_SECRET not set — using ephemeral secret for local development');
    NEXTAUTH_SECRET = crypto.randomBytes(32).toString('hex');
  }
}

const handler = NextAuth({
  ...authOptions,
  secret: NEXTAUTH_SECRET,
  debug: true,
});

export { handler as GET, handler as POST };
