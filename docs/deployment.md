# Deployment

Deployment is not part of the first coding task, but the architecture
supports separate deployments from the monorepo.

## Intended topology

``` text
React/Vite web -> static web host
Express API    -> Node/container host
PostgreSQL     -> managed PostgreSQL
```

Possible providers can be selected later. Do not hard-code
provider-specific architecture prematurely.

## Required production practices

-   HTTPS only.
-   Production secrets in provider secret/environment management.
-   Never ship `.env`.
-   Automated PostgreSQL backups before real business data is used.
-   Test database restore procedure.
-   Run migrations intentionally during deployment.
-   Centralized application/error logging.
-   Separate development and production databases.
-   Prefer staging when practical.
-   Restrict database network access where provider capabilities allow.
-   Configure CORS intentionally for deployed origins.

## Deployment checklist --- later

-   [ ] Production database provisioned
-   [ ] Secrets configured
-   [ ] Migrations tested
-   [ ] API deployed
-   [ ] Web deployed
-   [ ] CORS configured
-   [ ] Health check working
-   [ ] Backups enabled
-   [ ] Restore tested
-   [ ] Error logging enabled
-   [ ] One-branch pilot completed
