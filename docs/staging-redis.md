# Staging Redis

This document explains how to provision Redis for staging.

Options:

- Managed Redis (recommended):
  - Provision a managed Redis instance (e.g., AWS ElastiCache, Azure Cache for Redis).
  - Create a `REDIS_URL` secret in GitHub (format: `redis://:<password>@<host>:6379`).

- In-cluster Redis (quick):
  - Apply the manifest `k8s/staging/redis-deployment.yaml` included in this repo:
    - `kubectl -n staging apply -f k8s/staging/redis-deployment.yaml`
  - Expose the service internally as `albushra-redis:6379` and point your app's `REDIS_URL` to it: `redis://albushra-redis:6379`

Notes:
- For production or heavy load, use a managed Redis service with persistence and replication.
- If using in-cluster Redis, consider a Helm chart (bitnami/redis) for HA and persistence.
