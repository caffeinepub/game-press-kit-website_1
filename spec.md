# Specification

## Summary
**Goal:** Fix the admin principal system by adding a `resetAdmin()` backend function and correcting `initializeAdmin()` logic, then updating the frontend to auto-claim admin on login and provide a reset flow from the access-denied screen.

**Planned changes:**
- Add a `resetAdmin()` public update function to the Motoko backend that sets `adminPrincipal` to `null` with no access control, leaving all other CMS stable variables untouched
- Fix `initializeAdmin()` to correctly use null/option comparison so it allows claiming when the slot is empty and rejects with "Admin already initialized" when already set
- Update `AdminDashboard.tsx` so that after Internet Identity login, it calls `getAdminStatus()`, and if no admin exists, automatically calls `initializeAdmin()` to claim the slot, then re-evaluates and renders the dashboard or access-denied screen accordingly
- Add a "Reset Admin Access" button to the access-denied screen (visible only when authenticated) that calls `resetAdmin()` then `initializeAdmin()`, styled in monochrome (black/white/grayscale only), with loading and error states

**User-visible outcome:** An authenticated user who encounters the access-denied screen can click "Reset Admin Access" to clear the admin slot and immediately claim it, and any newly logged-in user will automatically become admin if no admin is currently set.
