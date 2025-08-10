# Widget Notes

This widget uses inline styles instead of Tailwind to avoid CSS conflicts with host apps. We had issues with Tailwind's global CSS breaking things like admin sidebars that use CSS custom properties.

Tried some solutions nothing seems to work out so now I changed the widget to run in an iframe for complete isolation - no style leaks, no script conflicts, just works everywhere without breaking anything.
