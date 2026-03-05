# CLAUDE.md

## Project Overview
Ukrainian professional services directory web app for the Texas community. Bilingual (English/Ukrainian), with light/dark theme support.

## Tech Stack
- **React** 19 + **Vite** 7 + **Tailwind CSS** v4
- **React Router** 7 for client-side routing
- **Vercel** for deployment (frontend + serverless API functions)
- **Airtable** as database/CMS (accessed via Vercel serverless functions)
- No Redux/Zustand — React Context API only

## Package Manager
**npm** (`npm run dev`, `npm run build`, `npm run lint`, `npm run preview`)

## Project Structure
```
src/
  components/       # UI components (PascalCase folders)
    UI/             # Reusable primitives (Button, Icon, Tag)
  pages/            # Page-level components (HomePage, PrivacyPage)
  context/          # ThemeContext, LanguageContext
  hooks/            # useTheme, useLanguage, useServices
  services/         # api.js — fetch functions
  utils/            # validation.js, imageUrl.js
  data/             # categories.js (22 categories, 200+ subcategories)
  i18n/             # en.json, ua.json — manual JSON translations
api/                # Vercel serverless functions (proxy to Airtable)
  services.js
  _lib/airtable.js
```

## Key Conventions
- **Components:** PascalCase files and folders
- **Hooks:** camelCase with `use` prefix
- **Constants:** UPPER_SNAKE_CASE
- **Styling:** Tailwind utility classes only — no CSS modules, no separate per-component CSS
- **Dark mode:** `dark:` Tailwind prefix; toggled via `dark` class on root element
- **Custom colors:** Defined as CSS custom properties in `src/index.css` (`dark-blue`, `brand-red`, `brand-blue`)
- Named exports for components (not default exports as a rule, but mixed usage exists)

## State Management
- Theme and language stored in `localStorage` and managed via Context
- Filtering state lives in `HomePage` (search and category are mutually exclusive)
- `useServices` hook handles data fetching with cancellation flag

## i18n
- No i18n library — custom `LanguageContext` with dot-notation key lookup
- Translations in `src/i18n/en.json` and `src/i18n/ua.json`

## API
- Client never talks to Airtable directly — always via `/api/services` (Vercel serverless)
- During local dev, Vite middleware in `vite.config.js` serves `/api/services` locally
- Cache headers: 5 min, stale-while-revalidate 10 min

## Environment Variables
Client-side (prefix `VITE_`):
- `VITE_GOOGLE_FORM_URL`
- `VITE_CONTACT_EMAIL`
- `VITE_API_BASE_URL`

Server-side (Vercel only, never in client):
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`

## Images
- Stored in Google Drive, URLs in Airtable
- Parsed and validated in `src/utils/imageUrl.js` and `src/utils/validation.js`
- Gallery with Lightbox component for full-size viewing

## Deployment
- Push to `main` → auto-deploys to Vercel
- Set env vars in Vercel dashboard
- `vercel.json` rewrites all routes to `/index.html` for SPA routing
