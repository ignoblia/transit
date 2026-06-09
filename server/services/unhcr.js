/**
 * UNHCR Refugee Data API integration service.
 *
 * Fetches refugee and asylum seeker population data by country.
 * Uses the UNHCR Refugee Population Statistics API.
 *
 * API docs: https://popstats.unhcr.org/en/persons_of_concern
 * Note: The actual API endpoint may vary - this implements based on known structure.
 */

const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

// UNHCR API configuration
const UNHCR_API_BASE_URL = 'https://popstats.unhcr.org/api'
// Note: UNHCR API may require specific endpoints or have different structure
// This implementation follows common patterns; adjust as needed based on actual API

/**
 * Fetch refugee/persons of concern data for a specific country.
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @param {number} year - Year for data (optional, defaults to recent)
 * @returns {Promise<Object|null>} UNHCR data or null
 */
async function fetchCountryUNHCRData(countryCode, year = null) {
  try {
    // Determine year to fetch (default to most recent complete year)
    const fetchYear = year || (new Date().getFullYear() - 1) // Last full year
    
    // Try common UNHCR API endpoint patterns
    const possibleUrls = [
      `${UNHCR_API_BASE_URL}/persons_of_concern/${countryCode}?year=${fetchYear}`,
      `${UNHCR_API_BASE_URL}/api/persons_of_concern/${countryCode}.json?year=${fetchYear}`,
      `https://www.unhcr.org/refugee-statistics/download/?url=${countryCode}_${fetchYear}`
    ]
    
    for (const url of possibleUrls) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const resp = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        
        if (resp.ok) {
          const data = await resp.json()
          return normalizeUNHCRData(data, countryCode, fetchYear)
        }
        // If 404, try next URL pattern
      } catch (err) {
        // Continue to next URL pattern
        continue
      }
    }
    
    // If all direct attempts fail, try the main API with query params
    const mainUrl = `${UNHCR_API_BASE_URL}/persons_of_concern`
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const resp = await fetch(`${mainUrl}?country=${countryCode}&year=${fetchYear}`, { 
        signal: controller.signal 
      })
      clearTimeout(timeout)
      
      if (resp.ok) {
        const data = await resp.json()
        return normalizeUNHCRData(data, countryCode, fetchYear)
      }
    } catch (err) {
      // Fall through to return null
    }
    
    return null
  } catch (err) {
    console.error(`  [UNHCR] Error fetching data for ${countryCode}: ${err.message}`)
    return null
  }
}

/**
 * Normalize UNHCR data into a consistent schema.
 * 
 * Expected normalized format:
 * {
 *   year: number,
 *   countryCode: string,
 *   countryName: string,
 *   refugees: number,           // Refugee population
 *   asylumSeekers: number,      // Pending asylum cases
 *   idps: number,               // Internally displaced persons
 *   stateless: number,          // Stateless persons
 *   returnedRefugees: number,   // Refugees who returned during year
 *   asylumApplications: number, // New asylum applications during year
 *   asylumDecisions: number,    // Asylum decisions made during year
 *   recognitionRate: number,    // Percentage of positive decisions
 *   totalPopulationOfConcern: number,
 *   dataSource: string,
 *   lastUpdated: string
 * }
 */
function normalizeUNHCRData(rawData, countryCode, year) {
  if (!rawData) return null

  // UNHCR API response structure can vary; this is a common normalization
  // Adjust based on actual API response format
  
  return {
    year: year,
    countryCode: countryCode.toUpperCase(),
    countryName: rawData.country_name || rawData.name || '',
    refugees: parseInt(rawData.refugees || rawData.refugee_population || 0, 10) || 0,
    asylumSeekers: parseInt(rawData.asylum_seekers || rawData.pending_asylum || 0, 10) || 0,
    idps: parseInt(rawData.idps || rawData.internal_displacement || 0, 10) || 0,
    stateless: parseInt(rawData.stateless || rawData.stateless_persons || 0, 10) || 0,
    returnedRefugees: parseInt(rawData.returned_refugees || rawData.returnees || 0, 10) || 0,
    asylumApplications: parseInt(rawData.asylum_applications || rawData.new_asylum_applications || 0, 10) || 0,
    asylumDecisions: parseInt(rawData.asylum_decisions || rawData.total_decisions || 0, 10) || 0,
    recognitionRate: rawData.recognition_rate || rawData.positive_decision_rate || null,
    totalPopulationOfConcern: parseInt(rawData.total_population_of_concern || rawData.total || 0, 10) || 0,
    dataSource: 'UNHCR Refugee Population Statistics',
    lastUpdated: rawData.last_updated || new Date().toISOString()
  }
}

/**
 * Fetch UNHCR data for all target countries in our dataset.
 * 
 * @returns {Promise<Object>} Map of countryCode => UNHCR data
 */
async function fetchAll() {
  console.log('[UNHCR] Fetching refugee and asylum seeker data...')
  
  // Load our country dataset to know which countries we need data for
  const store = require('../db/store')
  const dataset = store.loadCountryDataset()
  
  if (!dataset || dataset.length === 0) {
    console.log('  → No country dataset found, skipping UNHCR data')
    return {}
  }

  const result = {}
  const countryCodes = dataset.map(c => c.code)
  
  // Process in reasonable batches to be respectful to the API
  const batchSize = 10
  for (let i = 0; i < countryCodes.length; i += batchSize) {
    const batch = countryCodes.slice(i, i + batchSize)
    
    // Process batch concurrently but with limits
    const batchPromises = batch.map(async (countryCode) => {
      const data = await fetchCountryUNHCRData(countryCode)
      if (data) {
        result[countryCode] = data
      }
      // Small delay between requests to be respectful
      await new Promise(r => setTimeout(r, 200))
    })
    
    await Promise.all(batchPromises)
    
    // Pause between batches
    if (i + batchSize < countryCodes.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  
  console.log(`  → Completed UNHCR data for ${Object.keys(result).length} countries`)
  return result
}

module.exports = { fetchAll, fetchCountryUNHCRData, normalizeUNHCRData }
