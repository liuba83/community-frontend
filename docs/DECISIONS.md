# Project Decisions

Key architectural and technical decisions for the Ukrainians in Texas service directory platform.

---

## Decision 1: Database — Airtable vs Alternatives

**Decision:** Use **Airtable**
**Date:** 2026-02-15
**Status:** ✅ Accepted

### Alternatives Considered

| Option | Pros | Cons | Complexity |
| -------- | ------ | ------ | ------------ |
| **Airtable** | Spreadsheet-like UI, visual, perfect for manual approval, no SQL needed, 1,200 records free | Need Vercel proxy for security, paid tier after 1,200 records ($20/month) | ⭐⭐⭐⭐⭐ Very Simple |
| **Supabase** | Better free tier (unlimited records), built-in Row Level Security, PostgreSQL, real-time updates | No spreadsheet UI, requires basic SQL knowledge, more complex for non-technical admin | ⭐⭐⭐ Medium |
| **Firebase/Firestore** | Google product, generous free tier, real-time, NoSQL | Firebase console is complex, security rules tricky, pricing scales up | ⭐⭐⭐ Medium |
| **Google Sheets** | Extremely simple, free forever, everyone knows it | NOT designed for production, slow API, security issues, no proper database features | ⭐⭐⭐⭐⭐ Very Simple (but not production-ready) |

### Why Airtable?

1. **Perfect for manual admin workflow**
   - Spreadsheet-like interface is ideal for reviewing and approving submissions
   - Visual grid view lets you see all pending listings at a glance
   - Simple approval process: just check a box

2. **No technical skills required**
   - Admin doesn't need to know SQL or database concepts
   - Anyone can use it immediately

3. **Generous free tier for MVP**
   - 1,200 records is plenty (that's 1,200 Ukrainian businesses in Texas)
   - Won't hit this limit for a long time
   - If we do grow past 1,200, $20/month is totally reasonable

4. **Cost vs complexity tradeoff**
   - Supabase is free for unlimited records, but requires SQL knowledge and has less friendly admin UI
   - For a simple service directory with manual approval, ease of use > cost savings

5. **Already architected for it**
   - Security handled via Vercel serverless proxy
   - Google Forms → Google Sheets → Airtable workflow is straightforward

### When to Reconsider

- If we hit 1,200 records and don't want to pay $20/month → migrate to Supabase
- If we need real-time updates without polling → Supabase
- If we add user authentication → Supabase has built-in auth

---

## Decision 2: Hosting — Vercel vs Netlify vs Cloudflare

**Decision:** Use **Vercel**
**Date:** 2026-02-15
**Status:** ✅ Accepted

### Alternatives Considered

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Vercel** | Free tier generous, easy React deploy, serverless functions integrated, auto-detects Vite, excellent DX | Vendor lock-in, serverless functions cold start | React apps with API routes |
| **Netlify** | Free tier generous, built-in forms, serverless functions, similar to Vercel, good docs | Similar vendor lock-in, slightly slower builds | Static sites, Jamstack |
| **Cloudflare Pages** | Fast global CDN, free tier, Workers for API, generous limits, good performance | Smaller ecosystem, Workers different from standard Node.js, less React-focused | Static sites, edge computing |

### Why Vercel?

1. **Perfect for React + Vite**
   - Auto-detects Vite projects
   - Zero-config deployment
   - Optimized for React apps

2. **Serverless functions integrated**
   - `/api` folder automatically becomes serverless functions
   - No extra configuration needed
   - Perfect for our Airtable proxy pattern

3. **Developer experience**
   - Deploy previews for every PR
   - One-click rollbacks
   - Built-in analytics
   - Excellent documentation

4. **Free tier is generous**
   - 100GB bandwidth/month
   - Unlimited serverless function invocations
   - Perfect for MVP and beyond

5. **Single platform for frontend + API**
   - No need to manage two separate services
   - Environment variables in one place
   - Simplified deployment

### Why Not Netlify?

- Very similar to Vercel
- Would work just as well
- Chose Vercel for slightly better React/Vite integration

### Why Not Cloudflare Pages?

- Cloudflare Workers use a different runtime (not standard Node.js)
- Would require adapting our Airtable API code
- Smaller ecosystem for React apps
- Better suited for edge computing use cases

### When to Reconsider

- If Vercel pricing becomes too expensive at scale → Cloudflare Pages
- If we need specific Netlify features (built-in forms) → but we're using Google Forms anyway
- If vendor lock-in becomes a concern → self-host on VPS

---

## Decision 3: Image Hosting — Google Drive vs Alternatives

**Decision:** Use **Google Drive** (via Google Forms uploads)
**Date:** 2026-02-15
**Status:** ✅ Accepted

### Alternatives Considered

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Google Drive** | Free, integrates with Google Forms, unlimited storage (15GB free), simple for users | No automatic optimization, manual URL conversion needed, not designed for web hosting | Free (15GB) |
| **Cloudinary** | Automatic optimization, image transformations, CDN, purpose-built for images | More complex setup, free tier limited (25 credits/month), overkill for MVP | Free tier limited |
| **Vercel Blob** | Integrated with Vercel, simple API, good DX | Paid only ($0.15/GB storage + $0.30/GB bandwidth), need custom upload form | Paid ($0.15/GB) |
| **AWS S3** | Cheap, scalable, industry standard | Complex setup, need to configure CloudFront CDN, overkill for MVP | Very cheap but complex |
| **imgbb / Imgur** | Simple, free, purpose-built for images | Rate limits, less reliable, not professional, terms of service restrictions | Free |

### Why Google Drive?

1. **Zero infrastructure**
   - No image hosting service to set up or manage
   - No API keys to manage (for image uploads)
   - No custom upload form needed

2. **Integrated with Google Forms**
   - Users upload images directly through Google Form
   - Files automatically saved to Google Drive
   - No backend code needed for file uploads

3. **Free and unlimited (effectively)**
   - 15GB free storage (thousands of images)
   - If we hit limit, $1.99/month for 100GB
   - Images don't count against Airtable storage

4. **Simple for users**
   - Users already understand file uploads in Google Forms
   - No special image upload interface needed

5. **Good enough for MVP**
   - Yes, images won't be optimized
   - Yes, we need to convert share URLs to direct links
   - But it's simple and works

### Tradeoffs We Accept

**No automatic optimization:**

- Images will be full size (potentially large)
- Solution: Use CSS `max-width` to prevent layout issues
- Solution: Ask users to upload reasonably-sized images in Google Form instructions

**Manual URL conversion needed:**

- Google Drive share URLs don't work directly in `<img>` tags
- Admin needs to convert: `https://drive.google.com/file/d/FILE_ID/view` → `https://drive.google.com/uc?export=view&id=FILE_ID`
- We can provide a simple script for this if needed

**Not blazing fast:**

- Google Drive CDN is decent but not optimized for web images
- For MVP, this is acceptable
- Users won't notice unless site gets huge traffic

### When to Reconsider

**Migrate to Cloudinary if:**

- Image load times become a problem
- We need automatic resizing/optimization
- We want to serve WebP/AVIF formats
- We exceed 15GB (unlikely for MVP)

**Migrate to Vercel Blob if:**

- We build a custom "Add Service" form (not using Google Forms)
- We want tighter integration with our stack
- Cost ($0.15/GB storage) is acceptable

**For now: Google Drive is perfect for MVP.**

---

## Decision 4: Forms — Google Forms vs Custom Form

**Decision:** Use **Google Forms**
**Date:** 2026-02-15
**Status:** ✅ Accepted

### Why Google Forms?

1. **Built-in spam protection**
   - reCAPTCHA automatically enabled
   - Google's rate limiting and abuse detection
   - No custom spam protection code needed

2. **Zero infrastructure**
   - No backend form submission code
   - No file upload handling
   - No form validation code

3. **Easy to modify**
   - Can add/remove fields without code changes
   - Can update validation rules in Google Forms UI
   - Non-technical admin can manage form

4. **Free and reliable**
   - Google's infrastructure
   - 99.9% uptime
   - Handles any traffic spike

### Tradeoffs

**Manual admin workflow:**

- Admin copies data from Google Sheets to Airtable
- ~2-5 minutes per submission
- If volume exceeds 10/week, can automate with Zapier/Make

**No custom branding:**

- Form opens in Google Forms (external site)
- Can't match our site design exactly
- Acceptable for MVP — users understand and trust Google Forms

### When to Reconsider

**Build custom form if:**

- Submission volume is high (>10/week) and manual import is tedious
- We want submissions to go directly to Airtable (eliminate Google Sheets step)
- Branding is critical and we need form to match our design
- We add user accounts and want submissions tied to authenticated users

**For MVP: Google Forms is the right choice.**

---

## Decision 5: Repository Structure — Monorepo vs Separate Repos

**Decision:** **Monorepo** (single repository)
**Date:** 2026-02-15
**Status:** ✅ Accepted

### Structure

```
ukrainians-in-texas/
├── api/              # Vercel serverless functions (server-side)
├── src/              # React frontend (client-side)
├── docs/             # Documentation
├── public/           # Static assets
└── package.json
```

### Why Monorepo?

1. **Vercel's default pattern**
   - Vercel automatically detects `/api` folder
   - Deploys both frontend and API in one go
   - No configuration needed

2. **Simpler for small team**
   - One repo to clone
   - One set of dependencies
   - One deployment

3. **Shared code**
   - Categories, constants, types shared between frontend and API
   - No need for npm packages or git submodules

4. **No CORS issues**
   - API and frontend on same domain
   - `/api/services` is relative path

### When to Reconsider

**Split into separate repos if:**

- Different teams work on frontend vs backend
- Backend serves multiple frontends
- Different deployment schedules needed

**For this simple MVP: Monorepo is perfect.**

---

## Summary

| Decision | Choice | Why |
|----------|--------|-----|
| **Database** | Airtable | Visual UI perfect for manual admin approval |
| **Hosting** | Vercel | Best DX for React + serverless functions |
| **Images** | Google Drive | Free, integrates with Google Forms, zero setup |
| **Forms** | Google Forms | Built-in spam protection, zero infrastructure |
| **Repo Structure** | Monorepo | Simple, standard Vercel pattern |

**Philosophy:** For MVP, prioritize **simplicity and speed** over **optimization and scale**. We can always migrate later if needed.
