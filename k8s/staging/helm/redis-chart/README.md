# albushra-redis Helm chart

This is a small in-repo Helm chart that deploys an HA Redis StatefulSet for staging testing.

Usage:

- Install with a generated password (recommended to set as GitHub Secret `STAGING_REDIS_PASSWORD`):

  ```bash
  helm upgrade --install albushra-redis k8s/staging/helm/redis-chart -n staging --create-namespace \
    --set redis.password="$(<password>)" \
    --set replicaCount=3
  ```

- Alternatively set the password with `--set redis.password=${REDIS_PW}` or include in a values file.

Notes:
- This chart is intended for staging use only. For production use a managed Redis or a hardened chart with Sentinel/cluster and persistence tuned.
- The chart creates a secret `albushra-redis-secret` containing `redis-password` key.
