/**
 * TransIT Country Explorer API Server
 *
 * Express server that serves the merged country dataset.
 * Works alongside the VitePress static site — the API is consumed
 * by the explorer frontend (explorer.md).
 *
 * Start: node server/index.js         (production)
 *        node --watch server/index.js (development)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const express = require('express')
const cors = require('cors')
const path = require('path')
const { startScheduler } = require('./cron/scheduler')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} → ${res.statusCode} (${ms}ms)`)
  })
  next()
})

// ====== API Routes ======
const countriesRouter = require('./api/countries')
app.use('/api/countries', countriesRouter)

// ====== Manual refresh endpoint ======
const { runRefresh } = require('./cron/scheduler')
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('[API] Manual refresh triggered')
    await runRefresh()
    res.json({ status: 'ok', message: 'Data refreshed successfully' })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// ====== Health check ======
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: require('./package.json').version,
  })
})

// ====== Status page ======
app.get('/api/status', (req, res) => {
  const store = require('./db/store')
  const dataset = store.loadCountryDataset()
  const curated = store.loadCuratedInfo()
  const numbeo = store.loadNumbeoData()
  const teleport = store.loadTeleportData()

  res.json({
    server: 'running',
    port: PORT,
    dataSources: {
      countryDataset: dataset ? `${dataset.length} countries` : 'not loaded',
      curatedInfo: curated ? `${Object.keys(curated.data || curated).length} profiles` : 'not loaded',
      numbeo: numbeo ? `${Object.keys(numbeo.data || {}).length} entries` : 'not loaded',
      teleport: teleport ? `${Object.keys(teleport.data || {}).length} entries` : 'not loaded',
    },
    lastRefresh: store.getLastRefreshTime(),
    numbeoConfigured: !!process.env.NUMBEO_API_KEY,
  })
})

// ====== Start server ======
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     TransIT Country Explorer API         ║
║     http://localhost:${PORT}                ║
╠══════════════════════════════════════════╣
║  Endpoints:                              ║
║  GET  /api/health     — Health check     ║
║  GET  /api/status     — Data status      ║
║  GET  /api/countries  — All countries    ║
║  GET  /api/countries?code=DE — By code   ║
║  GET  /api/countries/DE      — By code   ║
║  POST /api/refresh   — Refresh data      ║
╚══════════════════════════════════════════╝
  `)

  // Start the daily data refresh scheduler
  // Pass true to run an immediate refresh on startup
  startScheduler(true)
})
