/**
 * Economic & Cost of Living data service.
 *
 * Replaced Numbeo (paid-only) with free alternatives:
 *   - World Bank API: GDP, unemployment, GINI, population stats
 *   - IMF API: Additional economic indicators
 *
 * World Bank API docs: https://documents.worldbank.org/en/publication/documents-reports/api
 * Free, no API key required.
 */

const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const WORLD_BANK_API = 'https://api.worldbank.org/v2'

// ISO2 -> ISO3 mapping for World Bank API calls
const ISO2_TO_ISO3 = {
  AR: 'ARG', AT: 'AUT', AU: 'AUS', BE: 'BEL', BG: 'BGR', BR: 'BRA',
  CA: 'CAN', CH: 'CHE', CL: 'CHL', CN: 'CHN', CO: 'COL', CR: 'CRI',
  CY: 'CYP', CZ: 'CZE', DE: 'DEU', DK: 'DNK', DZ: 'DZA', EC: 'ECU',
  EE: 'EST', EG: 'EGY', ES: 'ESP', FI: 'FIN', FR: 'FRA', GB: 'GBR',
  GR: 'GRC', HK: 'HKG', HR: 'HRV', HU: 'HUN', ID: 'IDN', IE: 'IRL',
  IL: 'ISR', IN: 'IND', IS: 'ISL', IT: 'ITA', JP: 'JPN', KE: 'KEN',
  KR: 'KOR', LT: 'LTU', LU: 'LUX', LV: 'LVA', MA: 'MAR', MT: 'MLT',
  MX: 'MEX', MY: 'MYS', NG: 'NGA', NL: 'NLD', NO: 'NOR', NZ: 'NZL',
  PE: 'PER', PH: 'PHL', PK: 'PAK', PL: 'POL', PT: 'PRT', RO: 'ROU',
  RS: 'SRB', RU: 'RUS', SE: 'SWE', SG: 'SGP', SI: 'SVN', SK: 'SVK',
  TH: 'THA', TN: 'TUN', TR: 'TUR', TW: 'TWN', TZ: 'TZA', UA: 'UKR',
  UG: 'UGA', US: 'USA', UY: 'URY', VN: 'VNM', ZA: 'ZAF',
}

/**
 * Fetch a single economic indicator for a country from the World Bank API.
 * 
 * @param {string} iso3 - ISO 3166-1 alpha-3 country code
 * @param {string} indicator - World Bank indicator code
 * @returns {Promise<{value: number, year: string}|null>}
 */
async function fetchIndicator(iso3, indicator) {
  try {
    const url = `${WORLD_BANK_API}/country/${iso3}/indicator/${indicator}?format=json&per_page=5&date=2020:2026`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) return null
    const [meta, data] = await resp.json()
    if (!data || !Array.isArray(data)) return null

    // Find the most recent non-null value
    for (const entry of data) {
      if (entry.value !== null) {
        return { value: entry.value, year: entry.date }
      }
    }
    return null
  } catch (err) {
    return null
  }
}

/**
 * Fetch economic indicators for a country from the World Bank API.
 * Fetches each indicator separately since the API doesn't support batches.
 * 
 * @param {string} iso3 - ISO 3166-1 alpha-3 country code
 * @returns {Promise<Object|null>}
 */
async function fetchWorldBankData(iso3) {
  try {
    // NY.GDP.PCAP.PP.CD = GDP per capita (PPP)
    // SL.UEM.TOTL.ZS = Unemployment (% of total labor force)
    // SI.POV.GINI = GINI index
    // NY.GNP.PCAP.PP.CD = GNI per capita (PPP)
    // FP.CPI.TOTL.ZG = Inflation consumer prices
    const indicators = {
      'NY.GDP.PCAP.PP.CD': 'gdpPerCapitaPPP',
      'SL.UEM.TOTL.ZS': 'unemploymentRate',
      'SI.POV.GINI': 'giniIndex',
      'NY.GNP.PCAP.PP.CD': 'gniPerCapitaPPP',
      'FP.CPI.TOTL.ZG': 'inflationRate',
    }

    const results = await Promise.all(
      Object.keys(indicators).map(ind => fetchIndicator(iso3, ind))
    )

    const data = { iso3 }
    for (let i = 0; i < Object.keys(indicators).length; i++) {
      const key = Object.values(indicators)[i]
      const indKey = Object.keys(indicators)[i]
      if (results[i]) {
        data[key] = results[i].value
        data[key.replace('PerCapita', '') + 'Year'] = results[i].year
        // Fix naming for the year fields
        if (key === 'gdpPerCapitaPPP') data.gdpYear = results[i].year
        if (key === 'unemploymentRate') data.unemploymentYear = results[i].year
        if (key === 'giniIndex') data.giniYear = results[i].year
        if (key === 'gniPerCapitaPPP') data.gniYear = results[i].year
        if (key === 'inflationRate') data.inflationYear = results[i].year
      }
    }

    data.source = 'World Bank Open Data'
    return data
  } catch (err) {
    return null
  }
}

/**
 * Main entry: fetch economic data for all target countries.
 * Returns a map of { countryCode: normalizedData }.
 */
async function fetchAll() {
  console.log('[Economy] Fetching World Bank economic data...')

  const result = {}
  const codes = Object.keys(ISO2_TO_ISO3)
  
  // Process in batches to be respectful
  const batchSize = 5
  let successCount = 0
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize)
    const promises = batch.map(async (iso2) => {
      const iso3 = ISO2_TO_ISO3[iso2]
      const data = await fetchWorldBankData(iso3)
      if (data && (data.gdpPerCapitaPPP !== null || data.unemploymentRate !== null)) {
        result[iso2] = data
        successCount++
      }
    })
    await Promise.all(promises)
  }
  
  console.log(`  → Fetched economic data for ${successCount} countries`)
  return result
}

module.exports = { fetchAll }
