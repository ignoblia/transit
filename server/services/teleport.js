/**
 * Numbeo Quality of Life Index integration service.
 *
 * Fetches quality of life data for cities/countries via Numbeo.
 * Numbeo provides quality of life indices including:
 *   - Purchasing Power Index
 *   - Safety Index
 *   - Health Care Index
 *   - Cost of Living Index
 *   - Property Price to Income Ratio
 *   - Traffic Commute Time Index
 *   - Pollution Index
 *   - Climate Index
 *
 * This replaces the now-deprecated Teleport API (api.teleport.org no longer resolves).
 * Numbeo requires an API key from https://www.numbeo.com/api/
 */

const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const NUMBEO_BASE_URL = 'https://www.numbeo.com/api'
const API_KEY = process.env.NUMBEO_API_KEY || ''

// Target cities mapped to country codes for QoL queries
const TARGET_CITIES = {
  AR: 'Buenos+Aires',
  AT: 'Vienna',
  AU: 'Sydney',
  BE: 'Brussels',
  BR: 'Sao+Paulo',
  CA: 'Toronto',
  CH: 'Zurich',
  CL: 'Santiago',
  CR: 'San+Jose',
  CY: 'Nicosia',
  CZ: 'Prague',
  DE: 'Berlin',
  DK: 'Copenhagen',
  EE: 'Tallinn',
  ES: 'Madrid',
  FI: 'Helsinki',
  FR: 'Paris',
  GB: 'London',
  GR: 'Athens',
  HR: 'Zagreb',
  HU: 'Budapest',
  IE: 'Dublin',
  IL: 'Tel+Aviv',
  IS: 'Reykjavik',
  IT: 'Rome',
  JP: 'Tokyo',
  KR: 'Seoul',
  LT: 'Vilnius',
  LU: 'Luxembourg',
  LV: 'Riga',
  MT: 'Valletta',
  MX: 'Mexico+City',
  NL: 'Amsterdam',
  NO: 'Oslo',
  NZ: 'Auckland',
  PL: 'Warsaw',
  PT: 'Lisbon',
  RO: 'Bucharest',
  SE: 'Stockholm',
  SI: 'Ljubljana',
  SK: 'Bratislava',
  TH: 'Bangkok',
  TR: 'Istanbul',
  TW: 'Taipei',
  UY: 'Montevideo',
  ZA: 'Cape+Town',
}

/**
 * Fetch quality of life data for a single city from Numbeo.
 * The Numbeo API returns city-level indices.
 */
async function fetchCityQualityOfLife(city) {
  if (!API_KEY) {
    return null
  }

   const url = `${NUMBEO_BASE_URL}/city_prices?api_key=${API_KEY}&city=${city}`
   try {
     const controller = new AbortController()
     const timeout = setTimeout(() => controller.abort(), 60000)
     const resp = await fetch(url, { signal: controller.signal })
     clearTimeout(timeout)

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()

    // Numbeo returns city prices; also check if quality_of_life data is included
    return data
  } catch (err) {
    console.error(`  [QoL] Error fetching ${city}: ${err.message}`)
    return null
  }
}

/**
 * Fetch the country-level quality of life indices from Numbeo.
 * The /api/indices endpoint includes quality of life metrics.
 */
async function fetchCountryIndices() {
  if (!API_KEY) {
    console.warn('  [QoL] No API key set — skipping. Set NUMBEO_API_KEY in .env to enable.')
    return null
  }

  const url = `${NUMBEO_BASE_URL}/indices?api_key=${API_KEY}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    return await resp.json()
  } catch (err) {
    console.error(`  [QoL] Error fetching country indices: ${err.message}`)
    return null
  }
}

/**
 * Normalize Numbeo quality of life data into a consistent schema.
 */
function normalizeQoLData(raw) {
  if (!raw) return null

  return {
    qualityOfLifeIndex: raw.quality_of_life_index ?? null,
    purchasingPowerIndex: raw.purchasing_power_index ?? null,
    safetyIndex: raw.safety_index ?? null,
    healthCareIndex: raw.health_care_index ?? null,
    costOfLivingIndex: raw.cost_of_living_index ?? null,
    propertyPriceToIncomeRatio: raw.property_price_to_income_ratio ?? null,
    trafficCommuteTimeIndex: raw.traffic_commute_time_index ?? null,
    pollutionIndex: raw.pollution_index ?? null,
    climateIndex: raw.climate_index ?? null,
    // City-level details (if available from city_prices endpoint)
    cityName: raw.city_name || null,
    prices: raw.prices ? raw.prices.slice(0, 20).map(p => ({
      item: p.item_name,
      average: p.average_price,
      low: p.low_price,
      high: p.high_price,
    })) : [],
  }
}

/**
 * Main entry: fetch quality of life data for all target countries.
 * Returns a map of { countryCode: normalizedData }.
 */
async function fetchAll() {
  console.log('[QoL] Fetching Numbeo Quality of Life data...')

  if (!API_KEY) {
    console.log('  → Skipped (no API key). Set NUMBEO_API_KEY in .env to enable.')
    return {}
  }

  const result = {}

  // First try the country-level indices endpoint
  const indices = await fetchCountryIndices()
  if (indices?.indices) {
    for (const entry of indices.indices) {
      const code = entry.country_code?.toUpperCase()
      if (code && TARGET_CITIES[code]) {
        result[code] = normalizeQoLData(entry)
      }
    }
    console.log(`  → Fetched indices for ${Object.keys(result).length} countries`)
  }

  // Also try city-level data for richer detail
  const codes = Object.keys(TARGET_CITIES)
  let cityCount = 0
  for (const code of codes) {
    const city = TARGET_CITIES[code]
    const cityData = await fetchCityQualityOfLife(city)
    if (cityData?.prices) {
      if (!result[code]) {
        result[code] = normalizeQoLData(cityData)
      } else {
        // Merge city detail into existing entry
        result[code].cityName = cityData.city_name || city.replace(/\+/g, ' ')
        result[code].prices = cityData.prices.slice(0, 20).map(p => ({
          item: p.item_name,
          average: p.average_price,
          low: p.low_price,
          high: p.high_price,
        }))
      }
      cityCount++
    }
    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`  → Fetched city detail for ${cityCount} cities`)

  return result
}

module.exports = { fetchAll, normalizeQoLData }
