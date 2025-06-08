# Authentication & Tenant Middleware

This middleware provides global authentication and tenant context management for the application. It automatically extracts user and tenant information from requests and makes them available throughout the application.

## Overview

The middleware:
- Uses Better Auth to extract user session information
- Automatically fetches tenant data based on user's tenant or X-Tenant-ID header
- Attaches user and tenant context to all API requests
- Handles unauthenticated users gracefully (attaches null)
- Provides helper functions for common authorization patterns

## Usage

### Global Middleware

The auth middleware is automatically applied to all `/api/*` routes in `index.ts`:

```typescript
import { authMiddleware } from "./middleware/auth";

app.use("/api/*", authMiddleware);
```

### Accessing User and Tenant Context

```typescript
import { getCurrentUser, getCurrentTenant } from "../middleware/utils";

// In any route handler
app.get("/some-route", (c) => {
  const user = getCurrentUser(c);
  const tenant = getCurrentTenant(c);
  
  if (user) {
    console.log(`User: ${user.name} (${user.email})`);
  }
  
  if (tenant) {
    console.log(`Tenant: ${tenant.name} (ID: ${tenant.id})`);
  }
});
```

### Authorization Helpers

#### Require Authentication

```typescript
import { requireAuth } from "../middleware/utils";

app.post("/protected-route", requireAuth, async (c) => {
  // User is guaranteed to be authenticated here
  const user = getCurrentUser(c);
  // user will never be null
});
```

#### Require Tenant Context

```typescript
import { requireTenant } from "../middleware/utils";

app.get("/tenant-data", requireTenant, async (c) => {
  // Tenant context is guaranteed to be available
  const tenant = getCurrentTenant(c);
  // tenant will never be null and will be active
});
```

#### Require Both Auth and Tenant

```typescript
import { requireAuthAndTenant } from "../middleware/utils";

app.post("/user-action", requireAuthAndTenant, async (c) => {
  // Both user and tenant are guaranteed
  const user = getCurrentUser(c);
  const tenant = getCurrentTenant(c);
});
```

#### Role-Based Authorization

```typescript
import { requireRole } from "../middleware/utils";

// Single role
app.delete("/admin-only", requireRole("admin"), async (c) => {
  // Only admins can access
});

// Multiple roles
app.get("/moderated-content", requireRole(["admin", "moderator"]), async (c) => {
  // Admins or moderators can access
});
```

### Utility Functions

```typescript
import {
  getCurrentUser,
  getCurrentTenant,
  isAuthenticated,
  hasRole,
  isAdmin,
  isModerator,
  hasTenantContext,
  getTenantId,
  getUserId,
  userBelongsToTenant,
  getAuthContext,
} from "../middleware/utils";

app.get("/example", (c) => {
  // Check authentication status
  if (isAuthenticated(c)) {
    console.log("User is logged in");
  }
  
  // Check user roles
  if (isAdmin(c)) {
    console.log("User is an admin");
  }
  
  if (isModerator(c)) {
    console.log("User is admin or moderator");
  }
  
  // Get IDs directly
  const userId = getUserId(c);
  const tenantId = getTenantId(c);
  
  // Check tenant relationship
  if (userBelongsToTenant(c)) {
    console.log("User belongs to the current tenant");
  }
  
  // Get complete context
  const context = getAuthContext(c);
  return c.json(context);
});
```

## How It Works

### Authentication Flow

1. **Session Extraction**: The middleware calls Better Auth's `getSession()` to extract user information from the request headers/cookies
2. **User Context**: If a session exists, user information is attached to the context
3. **Graceful Handling**: If no session exists, user is set to `null` (no errors thrown)

### Tenant Resolution

The middleware resolves tenant information in this priority order:

1. **User's Tenant**: If user is authenticated and has a `tenantId`, use that
2. **Header Tenant**: If no user tenant, check for `X-Tenant-ID` header
3. **No Tenant**: If neither exists, tenant is set to `null`

### Context Attachment

Both user and tenant information are attached to the Hono context using `c.set()`:

```typescript
c.set("user", user);
c.set("tenant", tenant);
```

This makes them available in all subsequent middleware and route handlers.

## Error Handling

- The middleware never throws errors or blocks requests
- If authentication fails, user is set to `null`
- If tenant lookup fails, tenant is set to `null`
- Errors are logged but don't interrupt the request flow
- Use helper functions like `requireAuth` to enforce requirements

## Testing

Use the test endpoint to verify the middleware is working:

```bash
# Test without authentication
curl http://localhost:8080/api/test

# Test with tenant header
curl -H "X-Tenant-ID: 1" http://localhost:8080/api/test

# Test with authentication (need valid session)
curl -H "Cookie: better-auth.session_token=..." http://localhost:8080/api/test
```

## Security Considerations

- Always validate tenant access in sensitive operations
- Use `userBelongsToTenant()` to ensure users only access their tenant's data
- Apply appropriate role checks for admin operations
- The middleware logs user/tenant info for debugging - remove in production

## Migration from Old Code

Before:
```typescript
// Old way - manual tenant validation
const tenantId = c.req.query("tenantId");
const tenant = await db.query.tenants.findFirst({
  where: eq(tenants.id, tenantId)
});
if (!tenant) {
  return c.json({ error: "Invalid tenant" }, 400);
}
```

After:
```typescript
// New way - automatic tenant context
app.get("/route", requireTenant, async (c) => {
  const tenant = getCurrentTenant(c);
  // tenant is guaranteed to exist and be active
});
```
