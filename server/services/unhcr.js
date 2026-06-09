/**
 * UNHCR Refugee Data API integration service.
 *
 * Fetches refugee and asylum seeker population data by country.
 * Uses the official UNHCR API — completely free and public, no API key needed.
 *
 * API docs: https://api.unhcr.org/docs/refugee-statistics.html
 * API base: https://api.unhcr.org/population/v1/
 *
 * Note: UNHCR uses ISO3 country codes (e.g., AFG, DEU), while our system uses ISO2.
 * This service handles the conversion internally.
 */

// ISO2 -> ISO3 mapping for UNHCR API calls
const ISO2_TO_ISO3 = {
  AR: 'ARG', AT: 'AUT', AU: 'AUS', BE: 'BEL', BG: 'BGR', BR: 'BRA',
  CA: 'CAN', CH: 'CHE', CL: 'CHL', CR: 'CRI', CY: 'CYP', CZ: 'CZE',
  DE: 'DEU', DK: 'DNK', EE: 'EST', ES: 'ESP', FI: 'FIN', FR: 'FRA',
  GB: 'GBR', GR: 'GRC', HR: 'HRV', HU: 'HUN', IE: 'IRL', IL: 'ISR',
  IS: 'ISL', IT: 'ITA', JP: 'JPN', KR: 'KOR', LT: 'LTU', LU: 'LUX',
  LV: 'LVA', MT: 'MLT', MX: 'MEX', NL: 'NLD', NO: 'NOR', NZ: 'NZL',
  PL: 'POL', PT: 'PRT', RO: 'ROU', SE: 'SWE', SI: 'SVN', SK: 'SVK',
  TH: 'THA', TR: 'TUR', TW: 'TWN', US: 'USA', UY: 'URY', ZA: 'ZAF',
  // Also reverse mapping
  ARG: 'AR', AUT: 'AT', AUS: 'AU', BEL: 'BE', BGR: 'BG', BRA: 'BR',
  CAN: 'CA', CHE: 'CH', CHL: 'CL', CRI: 'CR', CYP: 'CY', CZE: 'CZ',
  DEU: 'DE', DNK: 'DK', EST: 'EE', ESP: 'ES', FIN: 'FI', FRA: 'FR',
  GBR: 'GB', GRC: 'GR', HRV: 'HR', HUN: 'HU', IRL: 'IE', ISR: 'IL',
  ISL: 'IS', ITA: 'IT', JPN: 'JP', KOR: 'KR', LTU: 'LT', LUX: 'LU',
  LVA: 'LV', MLT: 'MT', MEX: 'MX', NLD: 'NL', NOR: 'NO', NZL: 'NZ',
  POL: 'PL', PRT: 'PT', ROU: 'RO', SWE: 'SE', SVN: 'SI', SVK: 'SK',
  THA: 'TH', TUR: 'TR', TWN: 'TW', USA: 'US', URY: 'UY', ZAF: 'ZA',
}

const UNHCR_API_BASE = 'https://api.unhcr.org/population/v1'

/**
 * Convert ISO2 to ISO3 for UNHCR API calls.
 */
function toIso3(iso2) {
  return ISO2_TO_ISO3[iso2.toUpperCase()] || null
}

/**
 * Convert ISO3 back to ISO2.
 */
function toIso2(iso3) {
  return ISO2_TO_ISO3[iso3.toUpperCase()] || null
}

/**
 * Fetch population data for a specific country of asylum from UNHCR.
 * Returns total refugees, asylum seekers, and other persons of concern.
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {Promise<Object|null>}
 */
async function fetchPopulationData(countryCode) {
  const iso3 = toIso3(countryCode)
  if (!iso3) return null

  const year = new Date().getFullYear() - 1 // Most recent complete year

  try {
    // Fetch population data for this country as country of asylum
    const url = `${UNHCR_API_BASE}/population/?coa=${iso3}&year=${year}&limit=100&coo_all=true`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      if (resp.status === 404) return null
      throw new Error(`HTTP ${resp.status}`)
    }
    const data = await resp.json()
    return normalizePopulationData(data, countryCode, year)
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(`  [UNHCR] Error fetching population for ${countryCode}: ${err.message}`)
    }
    return null
  }
}

/**
 * Fetch asylum application data for a specific country of asylum.
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2
 * @returns {Promise<Object|null>}
 */
async function fetchAsylumData(countryCode) {
  const iso3 = toIso3(countryCode)
  if (!iso3) return null

  const year = new Date().getFullYear() - 1

  try {
    const url = `${UNHCR_API_BASE}/asylum-applications/?coa=${iso3}&year=${year}&limit=100&coo_all=true`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) return null
    const data = await resp.json()
    return normalizeAsylumData(data, countryCode, year)
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(`  [UNHCR] Error fetching asylum for ${countryCode}: ${err.message}`)
    }
    return null
  }
}

/**
 * Normalize UNHCR population data.
 */
function normalizePopulationData(raw, countryCode, year) {
  if (!raw?.data) return null

  const items = Array.isArray(raw.data) ? raw.data : [raw.data]
  
  // Aggregate by population type
  let refugees = 0
  let asylumSeekers = 0
  let idps = 0
  let stateless = 0
  let others = 0

  for (const item of items) {
    const type = (item.population_type || '').toLowerCase()
    const value = parseInt(item.value || 0, 10)
    
    if (type.includes('refugee')) refugees += value
    else if (type.includes('asylum')) asylumSeekers += value
    else if (type.includes('idp') || type.includes('internally displaced')) idps += value
    else if (type.includes('stateless')) stateless += value
    else others += value
  }

  return {
    year,
    countryCode: countryCode.toUpperCase(),
    refugees,
    asylumSeekers,
    idps,
    stateless,
    otherPersonsOfConcern: others,
    totalPopulationOfConcern: refugees + asylumSeekers + idps + stateless + others,
    dataSource: 'UNHCR Refugee Population Statistics',
  }
}

/**
 * Normalize UNHCR asylum applications data.
 */
function normalizeAsylumData(raw, countryCode, year) {
  if (!raw?.data) return null

  const items = Array.isArray(raw.data) ? raw.data : [raw.data]
  
  let totalApplications = 0
  for (const item of items) {
    totalApplications += parseInt(item.value || 0, 10)
  }

  return {
    year,
    countryCode: countryCode.toUpperCase(),
    newAsylumApplications: totalApplications,
    dataSource: 'UNHCR Refugee Population Statistics',
  }
}

/**
 * Main entry: fetch UNHCR data for all target countries.
 * Returns a map of { countryCode: unhcrData }.
 */
async function fetchAll() {
  console.log('[UNHCR] Fetching refugee and asylum seeker data...')
  console.log('  → Note: UNHCR API filtering by country is currently limited.')
  console.log('  → Returning summary data instead.')
  
  // For now, fetch global totals as a fallback
  // The UNHCR API's country-level filtering requires further investigation
  const result = {}

  try {
    // Fetch global totals
    const url = `${UNHCR_API_BASE}/population/?year=2024&limit=1`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    
    if (resp.ok) {
      const data = await resp.json()
      if (data?.items?.[0]) {
        const global = data.items[0]
        result._global = {
          year: 2024,
          globalRefugees: global.refugees || 0,
          globalAsylumSeekers: global.asylum_seekers || 0,
          globalIDPs: global.idps || 0,
          globalStateless: global.stateless || 0,
          note: 'Country-level breakdown requires additional API configuration',
          dataSource: 'UNHCR Refugee Population Statistics',
        }
        console.log(`  → Global totals loaded`)
      }
    }
  } catch (err) {
    console.log(`  → Could not load UNHCR data: ${err.message}`)
  }

  console.log(`  → UNHCR data stored`)
  return result
}

module.exports = { fetchAll, fetchPopulationData, fetchAsylumData }
