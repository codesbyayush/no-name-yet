# OmniFeedback API Documentation

A comprehensive multi-tenant feedback and content management API built with Hono, Drizzle ORM, and PostgreSQL.

## 🚀 Features

- **Multi-tenant architecture** with row-level security
- **Enhanced authentication** with role-based access control
- **AI-ready content system** with sentiment analysis and vector embeddings
- **Hierarchical commenting** with nested replies
- **Intelligent voting system** with weighted votes
- **Custom fields system** for flexible data modeling
- **Third-party integrations** (Jira, Salesforce, Slack, Zendesk)
- **Real-time statistics** and analytics

## 📊 Database Schema

### Core Tables
- `tenants` - Multi-tenant organizations
- `user` - Enhanced user management with roles
- `user_auth` - Security-sensitive authentication data
- `boards` - Hierarchical content organization
- `posts` - AI-ready content with sentiment scoring
- `comments` - Nested comment threads
- `votes` - Weighted voting system
- `custom_fields` - Dynamic field definitions
- `custom_field_values` - Custom field data
- `integrations` - Third-party service configurations
- `post_integrations` - External system mappings
- `feedback` - Legacy feedback system

## 🛠 API Endpoints

### Authentication
```
POST   /api/auth/**        # Better-auth endpoints
```

### Tenants
```
GET    /api/tenants        # List all tenants
POST   /api/tenants        # Create tenant
GET    /api/tenants/:id    # Get tenant by ID
PUT    /api/tenants/:id    # Update tenant
DELETE /api/tenants/:id    # Deactivate tenant
POST   /api/tenants/:id/activate # Reactivate tenant
```

### Users
```
GET    /api/users                          # List users (requires tenantId or search)
POST   /api/users                          # Create user
GET    /api/users/:id                      # Get user by ID
PUT    /api/users/:id                      # Update user
DELETE /api/users/:id                      # Soft delete user
POST   /api/users/:id/restore              # Restore deleted user
POST   /api/users/:id/last-active          # Update last active timestamp
POST   /api/users/:id/auth                 # Create user auth
GET    /api/users/:id/auth                 # Get user auth (sanitized)
POST   /api/users/:id/auth/reset-failed-attempts # Reset failed login attempts
GET    /api/users/stats/:tenantId          # Get user statistics
```

### Boards
```
GET    /api/boards                         # List boards by tenant
POST   /api/boards                         # Create board
GET    /api/boards/:id                     # Get board by ID
GET    /api/boards/slug/:slug              # Get board by slug
PUT    /api/boards/:id                     # Update board
DELETE /api/boards/:id                     # Soft delete board
POST   /api/boards/:id/restore             # Restore deleted board
GET    /api/boards/public/:tenantId        # Get public boards
GET    /api/boards/:id/stats               # Get board statistics
GET    /api/boards/stats/tenant/:tenantId  # Get tenant board stats
GET    /api/boards/search/:tenantId        # Search boards
```

### Posts
```
GET    /api/posts                          # List posts by tenant
POST   /api/posts                          # Create post
GET    /api/posts/:id                      # Get post by ID
GET    /api/posts/slug/:slug               # Get post by slug
GET    /api/posts/board/:boardId           # Get posts by board
PUT    /api/posts/:id                      # Update post
DELETE /api/posts/:id                      # Soft delete post
POST   /api/posts/:id/restore              # Restore deleted post
POST   /api/posts/:id/upvote               # Add upvote
POST   /api/posts/:id/downvote             # Add downvote
POST   /api/posts/:id/sentiment            # Update sentiment score
GET    /api/posts/top/:tenantId            # Get top voted posts
GET    /api/posts/:id/stats                # Get post statistics
GET    /api/posts/stats/tenant/:tenantId   # Get tenant post stats
GET    /api/posts/search/:tenantId         # Search posts
```

### Comments
```
GET    /api/comments                       # List comments
POST   /api/comments                       # Create comment
GET    /api/comments/:id                   # Get comment by ID
GET    /api/comments/post/:postId          # Get comments by post
PUT    /api/comments/:id                   # Update comment
DELETE /api/comments/:id                   # Soft delete comment
POST   /api/comments/:id/restore           # Restore deleted comment
GET    /api/comments/:id/thread            # Get comment thread
GET    /api/comments/top-level/:postId     # Get top-level comments
POST   /api/comments/:id/sentiment         # Update sentiment score
GET    /api/comments/stats/:tenantId       # Get comment statistics
GET    /api/comments/search/:tenantId      # Search comments
GET    /api/comments/author/:authorId      # Get comments by author
```

### Votes
```
GET    /api/votes                          # List votes
POST   /api/votes                          # Create vote
GET    /api/votes/:id                      # Get vote by ID
GET    /api/votes/post/:postId             # Get votes by post
GET    /api/votes/comment/:commentId       # Get votes by comment
GET    /api/votes/user/:userId             # Get votes by user
PUT    /api/votes/:id                      # Update vote type
DELETE /api/votes/:id                      # Delete vote
GET    /api/votes/counts                   # Get vote counts
GET    /api/votes/top-posts/:tenantId      # Get top voted posts
GET    /api/votes/bookmarks/:userId        # Get user bookmarks
GET    /api/votes/stats/:tenantId          # Get vote statistics
GET    /api/votes/check                    # Check if user voted
```

### Custom Fields
```
GET    /api/custom-fields                  # List custom fields
POST   /api/custom-fields                  # Create custom field
GET    /api/custom-fields/:id              # Get custom field by ID
GET    /api/custom-fields/entity/:type     # Get fields by entity type
PUT    /api/custom-fields/:id              # Update custom field
DELETE /api/custom-fields/:id              # Delete custom field
POST   /api/custom-fields/values           # Set field value
GET    /api/custom-fields/values/:fieldId  # Get field values
GET    /api/custom-fields/values/entity/:entityId # Get entity field values
DELETE /api/custom-fields/values           # Delete field value
GET    /api/custom-fields/stats/:tenantId  # Get custom fields statistics
GET    /api/custom-fields/search/:tenantId # Search custom fields
```

### Integrations
```
GET    /api/integrations                   # List integrations
POST   /api/integrations                   # Create integration
GET    /api/integrations/:id               # Get integration by ID
PUT    /api/integrations/:id               # Update integration
DELETE /api/integrations/:id               # Delete integration
POST   /api/integrations/:id/sync          # Update last sync
GET    /api/integrations/stats/:tenantId   # Get integration statistics

GET    /api/integrations/posts             # List post integrations
POST   /api/integrations/posts             # Create post integration
GET    /api/integrations/posts/:id         # Get post integration by ID
GET    /api/integrations/posts/post/:postId # Get post integrations by post
GET    /api/integrations/posts/integration/:integrationId # Get by integration
PUT    /api/integrations/posts/:id         # Update post integration
DELETE /api/integrations/posts/:id         # Delete post integration
POST   /api/integrations/posts/:id/sync-status # Update sync status
GET    /api/integrations/posts/stats       # Get post integration statistics
```

### Feedback (Legacy)
```
GET    /api/feedback                       # List feedback
POST   /api/feedback/submit                # Submit feedback
GET    /api/feedback/:id                   # Get feedback by ID
POST   /api/feedback/:id/status            # Update feedback status
```

## 🔧 Query Parameters

### Common Parameters
- `tenantId` - Required for most endpoints (number)
- `limit` - Number of items to return (default: 50)
- `offset` - Number of items to skip (default: 0)
- `search` - Search query string

### Filtering Parameters
- `status` - Filter by status (varies by entity)
- `role` - Filter users by role
- `isPrivate` - Filter boards by privacy
- `type` - Filter by type (varies by entity)
- `priority` - Filter by priority level

## 📝 Request/Response Examples

### Create User
```json
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "emailVerified": true,
  "tenantId": 1,
  "role": "user"
}
```

### Create Board
```json
POST /api/boards
{
  "tenantId": 1,
  "name": "Feature Requests",
  "slug": "feature-requests",
  "description": "Submit your feature ideas",
  "isPrivate": false
}
```

### Create Post
```json
POST /api/posts
{
  "tenantId": 1,
  "boardId": 1,
  "authorId": "user-123",
  "title": "Dark Mode Support",
  "slug": "dark-mode-support",
  "content": "Please add dark mode to the application",
  "status": "published",
  "priority": 5
}
```

### Vote on Post
```json
POST /api/votes
{
  "tenantId": 1,
  "postId": 1,
  "userId": "user-123",
  "type": "upvote",
  "weight": 1
}
```

## 🔒 Security Features

- **Multi-tenant isolation** - All data is scoped to tenants
- **Role-based access control** - User, admin, moderator roles
- **Authentication tracking** - Failed attempts, account locking
- **Soft deletes** - Data preservation with restore capability
- **Input validation** - Zod schema validation on all endpoints

## 🚀 Getting Started

1. **Database Setup**
   ```bash
   bun run db:reset     # Reset database (if needed)
   bun run db:generate  # Generate migrations
   bun run db:push      # Apply migrations
   ```

2. **Start Server**
   ```bash
   bun run dev          # Development mode
   bun run start        # Production mode
   ```

3. **Health Check**
   ```bash
   GET /health
   ```

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
PORT=8080
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## 🎯 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔄 Multi-Tenant Architecture

All endpoints (except auth) require a `tenantId` parameter to ensure data isolation. Each tenant's data is completely separated at the database level.

## 🤖 AI Integration Ready

- **Content vectors** - Store AI embeddings in `contentVector` fields
- **Sentiment analysis** - Built-in sentiment scoring for posts and comments
- **Custom fields** - Flexible metadata for AI-driven features

## 📈 Analytics & Statistics

Each entity provides comprehensive statistics endpoints for:
- Usage metrics
- Growth trends
- Performance analytics
- User engagement

## 🔗 Integration Support

Built-in support for:
- **Jira** - Project management integration
- **Salesforce** - CRM synchronization
- **Slack** - Team communication
- **Zendesk** - Customer support

## 🛠 Development

The API is built with:
- **Hono** - Fast web framework
- **Drizzle ORM** - Type-safe database access
- **Zod** - Runtime type validation
- **PostgreSQL** - Primary database
- **Better Auth** - Authentication system

## 📚 Further Reading

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Hono Documentation](https://hono.dev/)
- [Better Auth Documentation](https://better-auth.com/)