/**
 * Cost of Living (COL) data service.
 *
 * Fetches cost of living data from WhereNext API.
 * WhereNext is FREE, no API key required, CC BY 4.0 licensed.
 *
 * API: https://getwherenext.com/api/data/cost-of-living
 * Returns cost of living index, rent index, groceries index,
 * utilities index, transport index, and monthly USD estimate
 * for ~95 countries.
 */

const WHERENEXT_API = 'https://getwherenext.com/api/data/cost-of-living'

/**
 * Fetch cost of living data for all available countries.
 * Returns a map of { countryCode: normalizedData }.
 */
async function fetchAll() {
  console.log('[COL] Fetching cost of living data from WhereNext...')

  const result = {}

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(WHERENEXT_API, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      console.error(`  ✗ WhereNext API returned HTTP ${resp.status}`)
      return result
    }

    const json = await resp.json()
    const items = json.data || json || []

    if (!Array.isArray(items)) {
      console.error('  ✗ WhereNext response format unexpected (not an array)')
      return result
    }

    let count = 0
    for (const item of items) {
      const code = item.country_code?.toUpperCase()
      if (!code) continue

      result[code] = {
        countryName: item.country || item.country_name || null,
        countryCode: code,
        // WhereNext uses cost_index (not cost_of_living_index)
        costOfLivingIndex: item.cost_index ?? item.cost_of_living_index ?? null,
        // WhereNext uses grocery_index (not groceries_index)
        groceriesIndex: item.grocery_index ?? item.groceries_index ?? null,
        rentIndex: item.rent_index ?? null,
        utilitiesIndex: item.utilities_index ?? null,
        transportIndex: item.transport_index ?? null,
        monthlyEstimateUSD: item.monthly_estimate_usd ?? null,
        rank: item.rank ?? null,
        region: item.region ?? null,
        source: 'WhereNext (CC BY 4.0)',
      }
      count++
    }

    console.log(`  → Fetched cost of living data for ${count} countries`)
  } catch (err) {
    console.error(`  ✗ Error fetching WhereNext data: ${err.message}`)
  }

  return result
}

module.exports = { fetchAll }
