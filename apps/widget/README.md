# Widget Notes

This widget uses inline styles instead of Tailwind to avoid CSS conflicts with host apps. We had issues with Tailwind's global CSS breaking things like admin sidebars that use CSS custom properties.

Tried some solutions nothing seems to work out so now I changed the widget to run in an iframe for complete isolation - no style leaks, no script conflicts, just works everywhere without breaking anything.


### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `publicKey` | `string` | **Required** | Your public API key |
| `apiUrl` | `string` | `https://localhost:8080` | API endpoint URL |
| `boardId` | `string` | - | Default board for feedback |
| `position` | `'center' \| 'above-button'` | `'above-button'` | Widget position |
| `portalUrl` | `string` | - | Base URL for roadmap/changelog |
| `theme.primaryColor` | `string` | `#007bff` | Primary color (hex) |
| `theme.borderRadius` | `string` | `12px` | Border radius (CSS value) |
| `theme.fontFamily` | `string` | System fonts | Font family (CSS value) |
| `theme.zIndex` | `number` | `999999` | Custom z-index |
| `user.id` | `string` | - | User identifier |
| `user.name` | `string` | - | User display name |
| `user.email` | `string` | - | User email |