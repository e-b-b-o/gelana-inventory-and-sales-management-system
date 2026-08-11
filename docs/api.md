# API Design

Base path:

``` text
/api/v1
```

## Planned resources

``` text
/api/v1/auth
/api/v1/users
/api/v1/branches
/api/v1/products
/api/v1/inventory
/api/v1/sales
/api/v1/transfers
/api/v1/closings
/api/v1/reports
/api/v1/sync
```

## Initial health endpoint

``` text
GET /api/v1/health
```

Expected response:

``` json
{
  "status": "ok",
  "message": "Gelana API is running"
}
```

## Planned business actions

``` text
POST /sales
POST /sales/:id/void

POST /inventory/receipts
POST /inventory/adjustments

POST /transfers
POST /transfers/:id/approve
POST /transfers/:id/reject
POST /transfers/:id/dispatch
POST /transfers/:id/receive

POST /closings

GET /reports/dashboard

POST /sync/batch    # later
```

## API conventions

-   Validate body/query/params with Zod.
-   Authentication is enforced server-side.
-   Branch access is enforced server-side.
-   Controllers remain thin.
-   Services implement business rules.
-   Use appropriate HTTP status codes.
-   Use a consistent error response shape.
-   Never expose database errors, secrets or stack traces to normal
    clients.
-   Paginate potentially large list/history endpoints.
-   API contracts must be documented here when implemented.

## Error shape

Exact implementation may evolve, but keep a stable shape similar to:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```
