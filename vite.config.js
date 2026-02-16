/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fetchApprovedServices } from './api/_lib/airtable.js'

function localApiPlugin() {
  return {
    name: 'local-api-services',
    configureServer(server) {
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

          const services = await fetchApprovedServices({ category, limit })
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

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  }
})
