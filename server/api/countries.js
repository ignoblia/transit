/**
 * GET /api/countries — Main API endpoint for the Country Explorer.
 *
 * Returns the full merged country dataset including:
 *   - Basic info (name, code, flag, capital, region, population)
 *   - Equaldex equality scores
 *   - Curated trans-specific data (rights, safety, visa notes, language)
 *   - WhereNext cost of living data (free, CC BY 4.0)
 *   - World Bank economic indicators (GDP, unemployment, GINI)
 *
 * Query params:
 *   ?code=DE       — Filter by country code (ISO alpha-2)
 *   ?search=...    — Search by name
 *   ?sort=ei       — Sort by field (ei, name, population, etc.)
 *   ?order=asc|desc — Sort order (default: asc)
 *   ?limit=10      — Limit results
 *   ?offset=0      — Pagination offset
 */

const express = require('express')
const router = express.Router()
const store = require('../db/store')

/**
 * GET /api/countries
 */
router.get('/', (req, res) => {
  try {
    let countries = store.getFullCountryList()

    // Single country lookup by code
    const { code } = req.query
    if (code) {
      const country = countries.find(c => c.code === code.toUpperCase())
      if (!country) {
        return res.status(404).json({
          error: 'Country not found',
          code: code.toUpperCase(),
        })
      }
      return res.json({
        data: country,
        meta: {
          lastRefresh: store.getLastRefreshTime(),
        },
      })
    }

    // Search
    const { search } = req.query
    if (search) {
      const q = search.toLowerCase()
      countries = countries.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q)
      )
    }

    // Sort
    const { sort, order } = req.query
    const sortField = sort || 'name'
    const sortOrder = order === 'desc' ? -1 : 1

    countries.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // Handle nested fields (e.g., costOfLiving.monthlyEstimateUSD)
      if (sortField.includes('.')) {
        const parts = sortField.split('.')
        aVal = parts.reduce((o, k) => o?.[k], a)
        bVal = parts.reduce((o, k) => o?.[k], b)
      }

      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * sortOrder
      }
      return (aVal - bVal) * sortOrder
    })

    // Pagination
    const limit = parseInt(req.query.limit) || countries.length
    const offset = parseInt(req.query.offset) || 0
    const paginated = countries.slice(offset, offset + limit)

    res.json({
      data: paginated,
      meta: {
        total: countries.length,
        limit,
        offset,
        lastRefresh: store.getLastRefreshTime(),
      },
    })
  } catch (err) {
    console.error('[API] Error in GET /api/countries:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    })
  }
})

/**
 * GET /api/countries/:code
 * Single country by ISO code (alternative to ?code=DE).
 */
router.get('/:code', (req, res) => {
  const country = store.getCountry(req.params.code)
  if (!country) {
    return res.status(404).json({
      error: 'Country not found',
      code: req.params.code.toUpperCase(),
    })
  }
  res.json({
    data: country,
    meta: {
      lastRefresh: store.getLastRefreshTime(),
    },
  })
})

module.exports = router
