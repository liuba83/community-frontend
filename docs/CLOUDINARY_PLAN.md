# Cloudinary Integration Plan

## What changes and why

### 1. `src/components/AddServiceForm/AddServiceForm.jsx`
- Add `uploadToCloudinary(file)` helper — POSTs directly to Cloudinary's unsigned upload API using two `VITE_` env vars (safe to expose for unsigned presets)
- Add `images` state: array of `{ id, previewUrl, cloudUrl, status: 'uploading'|'done'|'error' }`
- Add file input in the Optional section — max 5 files, 5 MB each, `accept="image/*"`
- Show thumbnails with a remove button; spinner overlay while uploading; red tint on error
- Block submit while any image is still uploading
- Include `imageUrls` (array of Cloudinary URLs) in the POST body

### 2. `api/submit-service.js`
- Destructure `imageUrls` from request body
- Save as comma-separated string in the Airtable `images` field

### 3. `src/utils/imageUrl.js`
- No change needed — Cloudinary URLs are already direct image URLs and pass through `convertGoogleDriveUrl` unchanged. Existing Google Drive entries continue to work.

### 4. `src/i18n/en.json` + `ua.json`
- Add to `addService.fields`: `images`, `imagesHint` ("Up to 5 photos, max 5 MB each"), `imagesAdd` ("Add photos")
- Add to `addService.errors`: `imageTooLarge` ("File exceeds 5 MB limit")

### 5. `.env.example`
- Add `VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name`
- Add `VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset`

---

## Cloudinary one-time setup (manual)

1. Create a free account at cloudinary.com
2. Go to **Settings → Upload → Upload presets → Add upload preset**
3. Set **Signing mode** to **Unsigned**
4. Set a **Folder** (e.g. `spilno`) to keep uploads organized
5. Set **Allowed formats**: `jpg, jpeg, png, webp, gif`
6. Set **Max file size**: 5 MB
7. Copy the preset name and your cloud name → paste into `.env` (local) and Vercel env vars
