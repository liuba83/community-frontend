# MVP Gaps & Considerations

Areas to consider that may not be fully addressed in the main MVP document.

---

## Security Concerns

| Issue | Risk | Status |
|-------|------|--------|
| Airtable API key exposure | `VITE_AIRTABLE_API_KEY` is visible in browser. Anyone can read data or create spam. | ✅ **RESOLVED** — Using Vercel serverless API proxy |
| Form spam | No protection against bot submissions | ✅ **RESOLVED** — Using Google Forms (built-in reCAPTCHA) |
| XSS vulnerabilities | User-submitted content (descriptions, URLs) could contain malicious scripts | ✅ **RESOLVED** — React default escaping (no `dangerouslySetInnerHTML`) |
| URL validation | Malicious URLs in social/website fields | ⚠️ **PARTIAL** — Validate protocol (http/https) when rendering links |

---

## Missing UI Elements

### Footer

Not documented. Typical footer includes:

- Contact email for the platform
- Privacy Policy link
- Terms of Service link
- Social media links
- Copyright notice
- "Made with love by..." (optional)

### Error & Empty States

| State | When | What to show |
|-------|------|--------------|
| Empty search results | Search returns nothing | "No services found. Try a different search term." + suggestion to browse categories |
| API error | Airtable is down | Friendly error message + retry button |
| 404 page | Invalid route | Branded 404 with link back to homepage |

### Loading States

- Skeleton loaders for service cards during initial fetch
- Spinner while API loads

---

## Form UX Gaps

> **Note:** Using Google Forms for submissions. Most form UX is handled by Google.

| Consideration | Status |
|---------------|--------|
| Images | Handled by Google Forms (uploads to Google Drive) |
| Description | Set max 1000 chars in Google Form settings |
| Phone | Google Forms can validate format |
| Duplicate detection | Manual check by admin during review |
| Form errors | Handled by Google Forms |
| Success state | Google Forms shows confirmation message |

---

## SEO & Discoverability

### Meta Tags

```html
<title>Ukrainians in Texas — Find Ukrainian Professionals</title>
<meta name="description" content="Directory of 100+ trusted Ukrainian professionals across Texas. Find lawyers, cleaners, handymen, and more.">
```

### Open Graph (Social Sharing)

```html
<meta property="og:title" content="Ukrainians in Texas">
<meta property="og:description" content="Find trusted Ukrainian professionals across Texas">
<meta property="og:image" content="/og-image.jpg">
<meta property="og:url" content="https://example.com"> <!-- Replace with actual domain -->
```

### Structured Data

Consider adding LocalBusiness or Service schema for better Google results.

### URL Structure

Will categories have dedicated routes?

- `/` — Homepage (only route for MVP)
- `/services/cleaning` — Category page (optional, post-MVP)
- `/services/:id` — Individual listing page (optional, post-MVP)

> **Note:** No `/add` route — "Add service" links to external Google Form.

---

## Operational Considerations

### Deployment

| Option | Pros | Cons |
|--------|------|------|
| Vercel | Free tier, easy React deploy, serverless functions | Vendor lock-in |
| Netlify | Free tier, forms built-in, functions | Similar to Vercel |
| Cloudflare Pages | Fast, free, Workers for API | Smaller ecosystem |

**Recommendation:** Vercel or Netlify for simplicity.

### Admin Notifications

How do you know when new submissions arrive?

- Airtable Automations: Send email on new record
- Slack/Telegram integration via Airtable or Zapier
- Daily digest email

### Provider Edit Requests

How can a provider update their listing?

- Option A: Email link in footer ("Need to update your listing? Contact us")
- Option B: Edit link sent in confirmation email (requires unique token)

### Analytics Setup

To measure success metrics, integrate:

- Google Analytics 4 or Plausible (privacy-friendly)
- Track: page views, search queries, category clicks, form submissions

---

## Legal Requirements

### Privacy Policy

Required when collecting personal data (emails, phones). Should cover:

- What data is collected
- How it's used
- How long it's stored
- How to request deletion

### Terms of Service

For user submissions, should cover:

- Content guidelines
- Right to remove listings
- Disclaimer of liability

### Cookie Consent

If using Google Analytics or similar, may need cookie banner (especially for EU visitors).

---

## Performance Considerations

### Pagination Strategy

| Approach | Pros | Cons |
|----------|------|------|
| Load all | Simple, instant filtering | Slow with 500+ listings |
| Pagination | Predictable, good for SEO | Harder to browse |
| Infinite scroll | Good UX for browsing | Harder to implement, back button issues |

**Recommendation:** Start with load all; add pagination if you exceed 200 listings.

### Image Optimization

Using Google Drive for image storage. No automatic optimization.

**Limitations:**

- No automatic resizing or format conversion
- Images display at original size (may be large)
- Consider adding CSS `max-width` to prevent layout issues

**Future improvement:** Migrate to Cloudinary if image performance becomes an issue.

### Caching Strategy

- Cache Airtable responses for 5 minutes (use React Query or SWR)
- Consider `stale-while-revalidate` pattern

---

## Accessibility (a11y)

| Area | Requirement |
|------|-------------|
| Color contrast | Ensure text meets WCAG AA (4.5:1 ratio) |
| Keyboard navigation | All interactive elements focusable and operable |
| Focus states | Visible focus indicators on buttons, links, inputs |
| ARIA labels | Label icon-only buttons (hamburger, social icons) |
| Alt text | All images need descriptive alt text |
| Form labels | All inputs must have associated labels |
| Skip link | "Skip to main content" for screen readers |

---

## Browser & Device Support

### Target Browsers

- Chrome (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Known Gotchas

- iOS Safari: `position: fixed` issues with keyboard open
- Safari: Some CSS gap support issues in older versions
- Mobile: `tel:` links should work; test on actual devices

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Homepage loads with services
- [ ] Search filters correctly
- [ ] Category dropdown works (desktop + mobile)
- [ ] "Add service" button opens Google Form
- [ ] Images from Google Drive display correctly
- [ ] Language switcher works
- [ ] Mobile menu opens/closes
- [ ] All links (phone, email, website) work
- [ ] Social icons open correct URLs

### Automated Testing (Post-MVP)

- Unit tests for utility functions
- Integration tests for API calls
- E2E tests with Playwright or Cypress

---

## Questions Resolved

| Question | Decision |
|----------|----------|
| Domain name | TBD — use placeholder `https://example.com` in meta tags for now |
| Contact email | TBD — use placeholder `admin@example.com` for now |
| Approval criteria | Manual review by admin based on completeness and relevance |
| Rejection flow | Not in MVP — will consider later |
| Featured logic | Show newest 6 approved listings (no separate "featured" flag) |
