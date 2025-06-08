# Schemas Directory

This directory contains all Zod schemas organized by functionality to avoid inline schema definitions in route files.

## Structure

```
schemas/
├── common.ts                    # Core entity schemas (User, Post, Board, etc.)
├── shared-request-schemas.ts    # Common request/param schemas used across routes
├── board-schemas.ts            # Board-specific request/response schemas
├── comment-vote-schemas.ts     # Comment and vote-specific schemas
├── post-schemas.ts             # Post-specific schemas
├── tenant-schemas.ts           # Tenant-specific schemas
├── user-schemas.ts             # User-specific schemas
├── custom-integration-schemas.ts # Custom fields and integration schemas
├── index.ts                    # Main export file
└── README.md                   # This file
```

## File Descriptions

### `common.ts`
Contains all the core entity schemas that represent database models and shared response types:
- Entity schemas: `UserSchema`, `PostSchema`, `BoardSchema`, `CommentSchema`, etc.
- Base response schemas: `ErrorSchema`, `SuccessResponseSchema`, `PaginationSchema`
- Stats schemas: `UserStatsSchema`, `PostStatsSchema`, etc.

### `shared-request-schemas.ts`
Contains commonly used request parameter and query schemas to avoid duplication:
- Parameter schemas: `TenantIdParamsSchema`, `UserIdParamsSchema`, `PostIdParamsSchema`, etc.
- Query schemas: `TenantIdQuerySchema`, `PaginationQuerySchema`
- Helper schemas: `BooleanStringSchema`, `OptionalBooleanStringSchema`

### Route-specific schema files
Each route file has its corresponding schema file containing:
- Request schemas (query parameters, request bodies)
- Response schemas (success responses specific to that route)
- Route-specific parameter schemas

## Usage

### In Route Files
```typescript
import { ErrorSchema, BoardSchema } from "../schemas/common";
import { 
  GetBoardsQuerySchema,
  CreateBoardResponseSchema 
} from "../schemas/board-schemas";
```

### Benefits of This Structure

1. **No Inline Schemas**: All schemas are defined in dedicated files
2. **Reusability**: Common schemas are shared across multiple routes
3. **Organization**: Schemas are grouped by functionality
4. **Type Safety**: Full TypeScript support with proper exports
5. **Maintainability**: Easy to find and update schemas
6. **No Duplication**: Shared request schemas prevent code duplication

## Adding New Schemas

1. **For new entities**: Add to `common.ts`
2. **For new shared request patterns**: Add to `shared-request-schemas.ts`
3. **For route-specific schemas**: Create or update the appropriate route schema file
4. **Update exports**: Add new schemas to `index.ts` with explicit exports

## Naming Conventions

- **Entity schemas**: `EntitySchema` (e.g., `UserSchema`, `PostSchema`)
- **Request schemas**: `VerbEntityQuerySchema` or `VerbEntityRequestSchema`
- **Response schemas**: `VerbEntityResponseSchema`
- **Parameter schemas**: `EntityIdParamsSchema`

## Import Strategy

- Import from specific files when you need only a few schemas
- Import from `index.ts` when you need many schemas from different files
- Always use the shared schemas from `shared-request-schemas.ts` to avoid duplication