# Specification

## Summary
**Goal:** Add 1px borders to screenshot images in the Press Kit gallery and fix the Internet Identity "Sign In" button in the header so it reliably appears on first page load.

**Planned changes:**
- Add a 1px solid black border (1px solid white in dark mode) to every screenshot thumbnail in the Press Kit grid and to the fullscreen overlay image, applied directly on the `<img>` elements
- Rewrite `Header.tsx` to correctly import and use the `useInternetIdentity` hook, rendering a monochrome "Sign In" button in the top-right corner (next to the theme toggle) when the user is not authenticated, and hiding it once authenticated — with no initialization delay or flicker

**User-visible outcome:** Screenshot images in the Press Kit page will have a thin border for clarity. The "Sign In" button will be reliably visible in the header on first load when the user has no active Internet Identity session, and will disappear after a successful login.
