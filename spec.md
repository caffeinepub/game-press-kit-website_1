# Specification

## Summary
**Goal:** Fix Internet Identity cross-browser authentication and admin access flow so the press kit admin dashboard works reliably across all major browsers.

**Planned changes:**
- Patch the Internet Identity integration layer (in `App.tsx` or surrounding code, without modifying immutable hooks) to ensure the authentication flow works in Chrome, Safari, Edge, and Firefox — including correct identity provider URL, popup/redirect handling, and browser-agnostic storage options
- Fix the Motoko backend `resetAdmin()` function to unconditionally set `adminPrincipal` to null with no access guard, and audit the null-check logic in `initializeAdmin()` so a new principal can always claim the admin slot after a reset
- Fix `AdminDashboard.tsx` to re-instantiate the actor with the authenticated identity immediately after login completes, ensuring `getAdminStatus()` and `initializeAdmin()` calls use the correct authenticated principal and the dashboard renders without showing "Access Denied"

**User-visible outcome:** Admin users can log in via Internet Identity on any major browser, successfully claim the admin slot, and access the admin dashboard without being rejected or seeing "Access Denied".
