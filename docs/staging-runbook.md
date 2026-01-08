# Staging Runbook

This runbook outlines steps for deploying to Staging, verifying the deployment, and performing a rollback if needed.

## Preconditions
- `STAGING_URL`, `KUBE_CONFIG`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `REDIS_URL`, and registry credentials are configured in GitHub Secrets.
- Alternatively, you may apply the included Redis manifest `k8s/staging/redis-deployment.yaml` to provide an in-cluster Redis for staging.
- Kubernetes namespace `staging` exists with appropriate RBAC.

## Deploy (manual)
1. Push to `staging` branch or create a PR with label `deploy/staging`.
2. GitHub Actions will run the `staging-deploy` workflow.
3. On success, verify smoke tests passed in the workflow logs.

## Manual Validation
- Health check:
  - `curl -sv $STAGING_URL/api/health`
- Basic auth check:
  - Attempt login and access protected endpoint, expect 401 unauthenticated and 200 when authenticated.
- Business flow:
  - Create a payment, upload a sample file, verify invoice state updates.
- Optional: run the included e2e suite locally or from CI using `STAGING_URL` to verify end-to-end behavior (tests located in `test/e2e`).

## Rollback
If deployment fails or critical errors occur:
1. Attempt a quick rollback to previous image:
   - `kubectl -n staging rollout undo deployment/albushra-fees-system`
   - `kubectl -n staging rollout status deployment/albushra-fees-system`
2. If DB migration caused the issue, restore from snapshot:
   - Postgres example: `pg_restore -d <db> <snapshot-file>`
   - For SQLite, replace the DB file on the PV with your backup and restart pods.
3. Re-run smoke tests; if still failing, open an incident and escalate.

## Emergency Actions
- Scale down the deployment to stop traffic:
  - `kubectl -n staging scale deployment albushra-fees-system --replicas=0`

## Notes
- Ensure that any data-destructive migrates are thoroughly tested before running in staging that mirrors production data.
- Keep a short-lived backup before any migrations.
