# Route Structure Documentation

This document outlines the route structure for the Markerio web application.

## Route Overview

The application is organized into three main sections:

### 1. Main Routes
- `/` - Home page
- `/dashboard` - User dashboard
- `/landing` - Landing page
- `/login` - Authentication page

### 2. Public Routes (`/public`)
Public-facing routes for community interaction and information.

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

### 3. Admin Routes (`/admin`)
Administrative interface for platform management.

- `/admin/` - Admin dashboard with analytics and quick actions

## Navigation Structure

### Header Navigation
The main header includes navigation for all route sections:
- **Main**: Home, Dashboard
- **Public**: Board, Roadmap, Changelog
- **Admin**: Admin Dashboard

### Public Layout Navigation
The public layout includes a sub-navigation bar for:
- Board
- Roadmap
- Changelog

### Board Layout Navigation
The board layout includes tabs for:
- Features
- Bug Reports
- Feedback

## Route Features

### Public Routes
- **Board**: Community-driven feature requests, bug reports, and feedback
- **Roadmap**: Timeline view of planned features and improvements
- **Changelog**: Version history with detailed release notes

### Admin Routes
- **Dashboard**: Platform analytics, recent activity, and quick action buttons
- **Sidebar Navigation**: Dedicated admin navigation (expandable for future admin features)

## Layout Hierarchy

```
__root.tsx (Theme provider, header, global layout)
├── index.tsx (Home)
├── dashboard.tsx (Dashboard)
├── landing.tsx (Landing)
├── login.tsx (Login)
├── admin.tsx (Admin layout with sidebar)
│   └── admin/index.tsx (Admin dashboard)
└── public.tsx (Public layout with navigation)
    ├── public/index.tsx (Redirects to board)
    ├── public/roadmap.tsx (Roadmap)
    ├── public/changelog.tsx (Changelog)
    └── public/board.tsx (Board layout with tabs)
        ├── public/board/index.tsx (Board overview)
        ├── public/board/features.tsx (Feature requests)
        ├── public/board/bugs.tsx (Bug reports)
        └── public/board/feedback.tsx (User feedback)
```

## Styling and Components

- All routes use consistent Tailwind CSS styling
- Shared components: Header, navigation, cards, buttons
- Responsive design with mobile-first approach
- Dark mode support throughout

## Future Expansion

The structure is designed to easily accommodate:
- Additional admin routes (users, settings, analytics)
- More board categories
- Public API documentation routes
- Help and documentation sections