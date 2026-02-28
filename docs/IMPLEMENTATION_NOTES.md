# Implementation Notes

Assumptions, conflicts, and open questions tracked during MVP implementation.

---

## Conflicts Resolved

### Font: Inter vs Lato
- **docs/MVP_DOCUMENT.md** specifies `Inter`
- **Figma design** uses `Lato` throughout all frames
- **Decision:** Using **Lato** (Figma is the design source of truth for visual details)
- Per docs/DECISIONS.md: Figma designs take precedence for visual/styling decisions

---

## Assumptions

1. **Single-page app** — MVP is a single homepage route (`/`). No routing library needed.
2. **Google Form URL** — Using `VITE_GOOGLE_FORM_URL` env var; placeholder until actual form is created.
3. **Featured listings** — Showing newest 6 approved listings (no separate "featured" flag per MVP doc).
4. **Client-side filtering** — All approved services loaded at once; search/filter happens in browser (per MVP_GAPS.md recommendation for <200 listings).
5. **No footer in MVP** — MVP_GAPS.md notes footer is missing from spec. Will add a minimal footer.
6. **Image fallback** — Google Drive images may fail to load; will show placeholder on error.

---

## Open Questions

1. **Google Form URL** — Actual form URL not yet created. Using placeholder.
2. **Domain name** — TBD. Using placeholder in meta tags.
3. **Contact email** — TBD. Using `admin@example.com` placeholder.
4. **Airtable credentials** — Not yet provided. API proxy will work once env vars are set.

---

## Implementation Log

| Date | Milestone | Notes |
|------|-----------|-------|
| 2026-02-15 | Project scaffold | Vite + React + Tailwind initialized |
