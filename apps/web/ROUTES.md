# Route Structure Documentation

This document outlines the route structure for the Markerio web application with multi-tenant support.

## Route Overview

The application is organized into four main sections:

### 1. Main Routes (Global)
- `/` - Global home page with tenant examples
- `/dashboard` - User dashboard
- `/landing` - Landing page
- `/login` - Authentication page

### 2. Tenant Routes (`/{slug}`)
Tenant-specific routes where `{slug}` is the tenant identifier:

#### Tenant Home:
- `/{slug}/` - Tenant home page with workspace overview

#### Tenant Public Routes (`/{slug}/public`):
- `/{slug}/public/` - Redirects to `/{slug}/public/board`
- `/{slug}/public/board` - Board overview and navigation
- `/{slug}/public/roadmap` - Product roadmap for the tenant
- `/{slug}/public/changelog` - Release notes and updates for the tenant

#### Tenant Board Sub-routes (`/{slug}/public/board`):
- `/{slug}/public/board/` - Board home page with overview
- `/{slug}/public/board/features` - Feature requests and enhancements
- `/{slug}/public/board/bugs` - Bug reports and issue tracking
- `/{slug}/public/board/feedback` - User feedback and suggestions

#### Tenant Admin Routes (`/{slug}/admin`):
- `/{slug}/admin/` - Admin dashboard with analytics and quick actions for the tenant

### 3. Legacy Public Routes (`/public`) - Deprecated
Public-facing routes for community interaction and information (legacy support):

#### Main Public Routes:
- `/public/` - Redirects to `/public/board`
- `/public/board` - Board overview and navigation
- `/public/roadmap` - Product roadmap
- `/public/changelog` - Release notes and updates

#### Board Sub-routes (`/public/board`):
- `/public/board/` - Board home page with overview
- `/public/board/features` - Feature requests and enhancements
- `/public/board/bugs` - Bug reports and issue tracking
- `/public/board/feedback` - User feedback and suggestions

### 4. Legacy Admin Routes (`/admin`) - Deprecated
Administrative interface for platform management (legacy support):

- `/admin/` - Admin dashboard with analytics and quick actions

## Navigation Structure

### Header Navigation
The main header dynamically adapts based on context:

#### Global Context (Non-tenant):
- **Main**: Home, Dashboard, Landing
- **Public**: Board, Roadmap, Changelog (legacy)
- **Admin**: Admin Dashboard (legacy)
- **Tenant Examples**: Quick links to demo tenants

#### Tenant Context (`/{slug}`):
- **Main**: Home, Dashboard, Landing
- **Public**: Tenant Board, Roadmap, Changelog
- **Admin**: Tenant Admin Dashboard
- **Tenant Indicator**: Shows current tenant and home link

### Tenant Layout Navigation
Each tenant has its own isolated navigation:

#### Tenant Public Layout Navigation
The tenant public layout includes a sub-navigation bar for:
- Board
- Roadmap
- Changelog

#### Tenant Board Layout Navigation
The tenant board layout includes tabs for:
- Overview
- Features
- Bug Reports
- Feedback

#### Tenant Admin Layout Navigation
The tenant admin layout includes a sidebar for:
- Dashboard
- User Management (planned)
- Settings (planned)
- Analytics (planned)
- Integrations (planned)

## Route Features

### Tenant Routes
- **Tenant Home**: Welcome page with workspace overview and navigation
- **Tenant Public Board**: Community-driven feature requests, bug reports, and feedback specific to the tenant
- **Tenant Roadmap**: Timeline view of planned features and improvements for the tenant
- **Tenant Changelog**: Version history with detailed release notes for the tenant
- **Tenant Admin**: Dashboard with analytics, recent activity, and management tools for the tenant

### Legacy Routes (Deprecated)
- **Global Public Board**: Legacy community features (maintained for backward compatibility)
- **Global Roadmap**: Legacy roadmap view
- **Global Changelog**: Legacy changelog view
- **Global Admin**: Legacy admin dashboard

## Multi-Tenant Features

### Tenant Isolation
- Each tenant has its own isolated workspace
- Tenant data is completely separated
- Custom branding and theming per tenant (planned)
- Tenant-specific analytics and reporting

### Tenant Management
- URL-based tenant identification via slug
- Tenant validation and access control
- Custom tenant configurations
- Tenant-specific user permissions (planned)

## Layout Hierarchy

```
__root.tsx (Theme provider, header, global layout)
├── index.tsx (Global home with tenant examples)
├── dashboard.tsx (Dashboard)
├── landing.tsx (Landing)
├── login.tsx (Login)
├── $tenantSlug.tsx (Tenant wrapper with slug validation)
│   ├── $tenantSlug/index.tsx (Tenant home page)
│   ├── $tenantSlug/admin.tsx (Tenant admin layout with sidebar)
│   │   └── $tenantSlug/admin/index.tsx (Tenant admin dashboard)
│   └── $tenantSlug/public.tsx (Tenant public layout with navigation)
│       ├── $tenantSlug/public/index.tsx (Redirects to board)
│       ├── $tenantSlug/public/roadmap.tsx (Tenant roadmap)
│       ├── $tenantSlug/public/changelog.tsx (Tenant changelog)
│       └── $tenantSlug/public/board.tsx (Tenant board layout with tabs)
│           ├── $tenantSlug/public/board/index.tsx (Tenant board overview)
│           ├── $tenantSlug/public/board/features.tsx (Tenant feature requests)
│           ├── $tenantSlug/public/board/bugs.tsx (Tenant bug reports)
│           └── $tenantSlug/public/board/feedback.tsx (Tenant feedback)
├── admin.tsx (Legacy admin layout with sidebar)
│   └── admin/index.tsx (Legacy admin dashboard)
└── public.tsx (Legacy public layout with navigation)
    ├── public/index.tsx (Redirects to board)
    ├── public/roadmap.tsx (Legacy roadmap)
    ├── public/changelog.tsx (Legacy changelog)
    └── public/board.tsx (Legacy board layout with tabs)
        ├── public/board/index.tsx (Legacy board overview)
        ├── public/board/features.tsx (Legacy feature requests)
        ├── public/board/bugs.tsx (Legacy bug reports)
        └── public/board/feedback.tsx (Legacy user feedback)
```

## Styling and Components

- All routes use consistent Tailwind CSS styling
- Shared components: Header, navigation, cards, buttons
- Responsive design with mobile-first approach
- Dark mode support throughout

## Tenant Examples

For demonstration purposes, the following tenant slugs are available:
- `demo-company` - Full-featured demo workspace
- `acme-corp` - Enterprise example with custom branding
- `startup-inc` - Startup workspace with active community

## URL Pattern Examples

### Tenant URLs:
- `/{slug}` - Tenant home (e.g., `/demo-company`)
- `/{slug}/public/board` - Tenant board (e.g., `/demo-company/public/board`)
- `/{slug}/public/board/features` - Tenant features (e.g., `/demo-company/public/board/features`)
- `/{slug}/admin` - Tenant admin (e.g., `/demo-company/admin`)

### Legacy URLs (Deprecated):
- `/public/board` - Global board (legacy)
- `/admin` - Global admin (legacy)

## Future Expansion

The multi-tenant structure is designed to easily accommodate:

### Tenant-Specific Features:
- Custom branding and themes per tenant
- Tenant-specific integrations and webhooks
- Advanced tenant analytics and reporting
- Tenant user management and permissions
- Tenant-specific API endpoints
- Custom domain mapping (tenant.example.com)

### Additional Routes:
- `/{slug}/settings` - Tenant configuration
- `/{slug}/users` - Tenant user management
- `/{slug}/integrations` - Tenant integrations
- `/{slug}/api-docs` - Tenant-specific API documentation
- `/{slug}/help` - Tenant help and documentation

### Global Features:
- Tenant marketplace and discovery
- Cross-tenant analytics for platform admins
- Tenant provisioning and management
- Global search across tenants (with permissions)