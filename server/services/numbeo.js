/**
 * Numbeo API integration service.
 *
 * Fetches cost of living indices for countries via the Numbeo API.
 * Uses country-level city data and averages it per country.
 *
 * Numbeo API docs: https://www.numbeo.com/api/
 * Requires a free API key from https://www.numbeo.com/api/
 *
 * Endpoints used:
 *   - /api/city_prices?api_key=KEY&city=CITY&country=COUNTRY
 *   - /api/city_prices?api_key=KEY&city=CITY&country=COUNTRY
 */

const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const NUMBEO_BASE_URL = 'https://www.numbeo.com/api'
const API_KEY = process.env.NUMBEO_API_KEY || ''

// Country code -> major city mapping for Numbeo queries
const COUNTRY_CITIES = {
  AR: 'Buenos+Aires',
  AU: 'Sydney',
  AT: 'Vienna',
  BE: 'Brussels',
  BR: 'Sao+Paulo',
  CA: 'Toronto',
  CL: 'Santiago',
  CR: 'San+Jose',
  CY: 'Nicosia',
  CZ: 'Prague',
  DK: 'Copenhagen',
  EE: 'Tallinn',
  FI: 'Helsinki',
  FR: 'Paris',
  DE: 'Berlin',
  GR: 'Athens',
  HU: 'Budapest',
  IS: 'Reykjavik',
  IE: 'Dublin',
  IL: 'Tel+Aviv',
  IT: 'Rome',
  JP: 'Tokyo',
  LV: 'Riga',
  LT: 'Vilnius',
  LU: 'Luxembourg',
  MT: 'Valletta',
  MX: 'Mexico+City',
  NL: 'Amsterdam',
  NZ: 'Auckland',
  NO: 'Oslo',
  PL: 'Warsaw',
  PT: 'Lisbon',
  RO: 'Bucharest',
  SK: 'Bratislava',
  SI: 'Ljubljana',
  ZA: 'Cape+Town',
  KR: 'Seoul',
  ES: 'Madrid',
  SE: 'Stockholm',
  CH: 'Zurich',
  TW: 'Taipei',
  TH: 'Bangkok',
  TR: 'Istanbul',
  GB: 'London',
  US: 'New+York',
  UY: 'Montevideo',
}

/**
 * Fetch cost of living data for a single city from Numbeo.
 */
async function fetchCityPrices(city) {
  if (!API_KEY) {
    console.warn('  [Numbeo] No API key set — skipping. Set NUMBEO_API_KEY in .env')
    return null
  }

  const url = `${NUMBEO_BASE_URL}/city_prices?api_key=${API_KEY}&city=${city}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }
    return await resp.json()
  } catch (err) {
    console.error(`  [Numbeo] Error fetching ${city}: ${err.message}`)
    return null
  }
}

/**
 * Fetch the full country-level cost of living indices from Numbeo.
 * Numbeo provides a country-level endpoint that returns indices directly.
 */
async function fetchCountryPrices(countryCode) {
  if (!API_KEY) {
    console.warn('  [Numbeo] No API key set — skipping.')
    return null
  }

  const url = `${NUMBEO_BASE_URL}/country_prices?api_key=${API_KEY}&country=${countryCode}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }
    return await resp.json()
  } catch (err) {
    console.error(`  [Numbeo] Error fetching country ${countryCode}: ${err.message}`)
    return null
  }
}

/**
 * Fetch the global cost of living indices (country-level aggregates).
 */
async function fetchIndices() {
  if (!API_KEY) {
    console.warn('  [Numbeo] No API key set — skipping.')
    return null
  }

  const url = `${NUMBEO_BASE_URL}/indices?api_key=${API_KEY}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }
    return await resp.json()
  } catch (err) {
    console.error(`  [Numbeo] Error fetching indices: ${err.message}`)
    return null
  }
}

/**
 * Extract relevant cost-of-living metrics from Numbeo's response.
 * Normalises the response into a consistent schema.
 */
function normalizeNumbeoData(raw) {
  if (!raw) return null

  return {
    costOfLivingIndex: raw.cost_of_living_index || null,
    rentIndex: raw.rent_index || null,
    costOfLivingPlusRentIndex: raw.cost_of_living_plus_rent_index || null,
    groceriesIndex: raw.groceries_index || null,
    restaurantPriceIndex: raw.restaurant_price_index || null,
    localPurchasingPowerIndex: raw.local_purchasing_power_index || null,
    // City-level detail (if available)
    prices: raw.prices ? raw.prices.map(p => ({
      itemName: p.item_name,
      averagePrice: p.average_price,
      lowPrice: p.low_price,
      highPrice: p.high_price,
    })) : [],
  }
}

/**
 * Main entry: fetch Numbeo data for all target countries.
 * Returns a map of { countryCode: normalizedData }.
 */
async function fetchAll() {
  console.log('[Numbeo] Fetching cost of living data...')

  if (!API_KEY) {
    console.log('  → Skipped (no API key). Set NUMBEO_API_KEY in .env to enable.')
    return {}
  }

  const result = {}

  // Try the country-level indices endpoint first
  const indices = await fetchIndices()
  if (indices?.indices) {
    for (const entry of indices.indices) {
      const code = entry.country_code?.toUpperCase()
      if (code && COUNTRY_CITIES[code]) {
        result[code] = normalizeNumbeoData(entry)
      }
    }
    console.log(`  → Fetched indices for ${Object.keys(result).length} countries`)
  }

  // Also try city-level data for our target countries
  const cityCodes = Object.keys(COUNTRY_CITIES)
  let cityCount = 0
  for (const code of cityCodes) {
    const city = COUNTRY_CITIES[code]
    const cityData = await fetchCityPrices(city)
    if (cityData) {
      // Merge city-level prices into the country entry
      if (!result[code]) {
        result[code] = normalizeNumbeoData(cityData)
      } else if (cityData.prices) {
        result[code].prices = cityData.prices.map(p => ({
          itemName: p.item_name,
          averagePrice: p.average_price,
          lowPrice: p.low_price,
          highPrice: p.high_price,
        }))
      }
      cityCount++
    }
    // Rate limiting: be nice to the Numbeo API
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`  → Fetched city prices for ${cityCount} cities`)

  return result
}

module.exports = { fetchAll, normalizeNumbeoData }
