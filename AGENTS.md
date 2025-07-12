# AGENTS.md

## Build, Lint, and Test Commands

### Build

- Run `bun run build` to build all workspaces.

### Lint

- Run `bun run check` to lint the codebase and automatically fix issues.

### Test

- No explicit test command is defined. Add tests and use `bun` or `jest` for testing.

### Type Checking

- Run `bun run check-types` to verify TypeScript types.

### Database Operations

- `bun run db:migrate` for migrations.
- `bun run db:push` to push schema changes.
- `bun run db:studio` to open the database studio.
- `bun run db:generate` to generate database client.

## Code Style Guidelines

### Imports

- Use relative imports within the same module.
- Use absolute imports for shared modules.

### Formatting

- Follow Biome formatting rules (`bun run check`).

### Types

- Prefer TypeScript for type safety.
- Use `@types` packages for external libraries.

### Naming Conventions

- Use camelCase for variables and functions.
- Use PascalCase for components and classes.
- Use snake_case for database schema.

### Error Handling

- Use `try-catch` blocks for async operations.
- Log errors using a centralized logging utility.

### General Guidelines

- Keep functions small and focused.
- Write comments for complex logic.
- Avoid magic numbers; use constants.

This file is intended for coding agents to ensure consistency and quality across the repository.
