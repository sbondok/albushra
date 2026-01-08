# Required GitHub Secrets

This document lists the secrets required for running CI, staging deployments, and the application.

## Application Secrets
- NEXTAUTH_SECRET — A 32+ byte random secret used by NextAuth for signing JWTs/session cookies. Example: `$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")`
- DATABASE_URL — Connection string for your database. For Postgres: `postgresql://user:pass@host:port/dbname`
- REDIS_URL — (Optional) Redis connection URL for rate limiting: `redis://host:6379`
- NEXTAUTH_URL — The canonical URL for the environment, e.g., `https://staging.example.com`

## CI / Registry Secrets
- REGISTRY (optional) — The container image registry (e.g., `ghcr.io/<org>` or `docker.io/<user>`)
- REGISTRY_HOST — The registry host for docker login, e.g., `ghcr.io` or `docker.io`
- REGISTRY_USERNAME — Username for pushing images
- REGISTRY_PASSWORD — Password (or PAT) for pushing images

## Kubernetes / Deploy Secrets
- KUBE_CONFIG — Base64-encoded kubeconfig for the cluster used by workflows
- STAGING_URL — Public URL of the Staging environment (used by smoke tests)
- Any environment-specific secrets for staging stored as K8s Secrets (e.g., `albushra-staging-secrets` with keys `nextauth-secret`)

## How to add secrets
1. Go to your repository on GitHub → Settings → Secrets and variables → Actions → New repository secret.
2. Add the secrets listed above with appropriate values.
3. For `KUBE_CONFIG`, use `cat ~/.kube/config | base64 -w 0` (Linux/macOS) or an equivalent base64 command on Windows.

## Security tips
- Use short expiration tokens and rotate them regularly.
- Use fine-grained tokens (GHCR fine-grained) or service principals for registries when possible.
- Do not commit secrets to the repo or include them in PRs.

