/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fetchApprovedServices } from './api/_lib/airtable.js'

function localApiPlugin() {
  return {
    name: 'local-api-services',
    configureServer(server) {
      server.middlewares.use('/api/submit-service', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = JSON.parse(Buffer.concat(chunks).toString())

          const { category, businessName, descriptionEn, descriptionUa, phone, email,
                  address, website, instagram, facebook, linkedin, imageUrls, honeypot } = body

          if (honeypot) { res.statusCode = 200; res.end(JSON.stringify({ success: true })); return }

          if (!category || !businessName?.trim() || !descriptionEn?.trim() || !descriptionUa?.trim() || !phone?.trim() || !email?.trim()) {
            res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing required fields' })); return
          }

          const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env
          const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Services'

          if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
            res.statusCode = 500; res.end(JSON.stringify({ error: 'Server configuration error' })); return
          }

          const fields = {
            title: businessName.trim(), description_en: descriptionEn.trim(),
            description_ua: descriptionUa.trim(), category,
            phone: phone.trim(), email: email.trim(), approved: false,
          }
          if (address?.trim()) fields.address = address.trim()
          if (website?.trim()) fields.website = website.trim()
          if (instagram?.trim()) fields.instagram = instagram.trim()
          if (facebook?.trim()) fields.facebook = facebook.trim()
          if (linkedin?.trim()) fields.linkedin = linkedin.trim()

          const validImageUrls = Array.isArray(imageUrls)
            ? imageUrls.filter((u) => typeof u === 'string' && u.startsWith('https://res.cloudinary.com/')).slice(0, 5)
            : []
          if (validImageUrls.length > 0) fields.images = validImageUrls.join(',')

          const atRes = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
            { method: 'POST', headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }
          )

          if (!atRes.ok) {
            console.error('Airtable error:', await atRes.text())
            res.statusCode = 500; res.end(JSON.stringify({ error: 'Failed to submit' })); return
          }

          res.statusCode = 200
          res.end(JSON.stringify({ success: true }))
        } catch (error) {
          console.error('Submit error:', error)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to submit' }))
        }
      })

      server.middlewares.use('/api/delete-image', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const { publicId } = JSON.parse(Buffer.concat(chunks).toString())

          if (!publicId || typeof publicId !== 'string') {
            res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing publicId' })); return
          }

          const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

          if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            res.statusCode = 500; res.end(JSON.stringify({ error: 'Server configuration error' })); return
          }

          const credentials = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')
          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload?public_ids[]=${encodeURIComponent(publicId)}`,
            { method: 'DELETE', headers: { Authorization: `Basic ${credentials}` } },
          )

          if (!cloudRes.ok) {
            console.error('Cloudinary delete error:', await cloudRes.text())
            res.statusCode = 500; res.end(JSON.stringify({ error: 'Failed to delete image' })); return
          }

          res.statusCode = 200
          res.end(JSON.stringify({ success: true }))
        } catch (error) {
          console.error('Delete error:', error)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to delete' }))
        }
      })

      server.middlewares.use('/api/services', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const url = new URL(req.url || '/', 'http://localhost')
          const category = url.searchParams.get('category') || undefined
          const limitParam = url.searchParams.get('limit')
          const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined
          const lang = url.searchParams.get('lang') || 'en'

          const services = await fetchApprovedServices({ category, limit, lang })
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(services))
        } catch (error) {
          console.error('Local API error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Failed to fetch services' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Make server-only Airtable variables available to local API middleware.
  process.env.AIRTABLE_API_KEY ||= env.AIRTABLE_API_KEY
  process.env.AIRTABLE_BASE_ID ||= env.AIRTABLE_BASE_ID
  process.env.AIRTABLE_TABLE_NAME ||= env.AIRTABLE_TABLE_NAME
  process.env.CLOUDINARY_CLOUD_NAME ||= env.CLOUDINARY_CLOUD_NAME
  process.env.CLOUDINARY_API_KEY ||= env.CLOUDINARY_API_KEY
  process.env.CLOUDINARY_API_SECRET ||= env.CLOUDINARY_API_SECRET

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  }
})
