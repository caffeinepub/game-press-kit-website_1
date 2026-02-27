# Specification

## Summary
**Goal:** Fix three bugs in the Poke A Nose Press Kit: update the YouTube video URL, fix the fullscreen screenshot close behavior, and reset the admin principal so a new admin can be initialized.

**Planned changes:**
- Update the YouTube embed URL in the Press Kit video section to use video ID `C-Q0-2kiFhs` with query parameters `playsinline=1` and `fs=0`, removing the old video ID entirely
- Attach a click handler directly to the fullscreen screenshot image element so clicking the image closes the overlay and stops event propagation
- Reset the `adminPrincipal` stable variable in the Motoko backend to `null` so the next authenticated Internet Identity user can call `initializeAdmin()` and become the new admin, without affecting any other CMS content

**User-visible outcome:** The correct YouTube video plays inline without a fullscreen button; clicking a fullscreen screenshot image closes it; and the admin can log in via Internet Identity without receiving an "Access denied" error.
