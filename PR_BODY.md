Replace hard-coded NextAuth secret with env-driven secret (fail in production, ephemeral in dev).

Changes:
- Require `NEXTAUTH_SECRET` via environment variable; generate an ephemeral secret in non-production for local dev.
- Secure `payments` and `upload` API routes with `getServerSession` checks and role-based authorization (401/403 responses).
- Remove creation of an admin placeholder user during payments; link `createdBy` to the authenticated user.
- Add Vitest config and tests covering unauthenticated, insufficient-role, and authorized cases for `payments` and `upload` endpoints.

Testing:
- `npm install && npm run test` (all tests pass locally: 7 tests)
- Manual: verify protected endpoints return 401/403 as expected; verify payments are linked to authenticated user.

Rollback:
- `git revert <commit>` on branch `security/auth-and-tests` or close the PR.

Notes:
- This PR includes security hardening and tests only; recommended follow-ups: add HTTP security headers, rate-limiting, and CI secret checks before merge.