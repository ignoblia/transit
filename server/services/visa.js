/**
 * Visa Requirements API integration service.
 *
 * Fetches visa requirement data for passport-country pairs.
 * Uses a RapidAPI-based visa requirements service.
 *
 * Note: This service is designed to work with APIs like:
 *   - Visa Requirements API (RapidAPI)
 *   - Visa Checker by Nationality (Apify)
 *   - Or similar visa requirement services
 *
 * The service normalizes various API responses into a consistent schema.
 */

const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

// Visa API configuration
const VISA_API_KEY = process.env.VISA_API_KEY || ''
const VISA_API_HOST = process.env.VISA_API_HOST || 'visa-requirements.p.rapidapi.com'
const VISA_API_BASE_URL = `https://${VISA_API_HOST}`

// Common passport types we want to check (focus on common refugee/source countries)
const COMMON_PASSPORTS = [
  'AF', 'SY', 'IR', 'IQ', 'SO', 'ER', 'SD', 'SS', 'MV',  // Common source countries
  'US', 'CA', 'GB', 'DE', 'FR', 'AU', 'NZ', 'JP', 'KR',  // Common destination/origin
  'BR', 'AR', 'CL', 'CO', 'VE', 'PY', 'UY',  // Latin America
  'IN', 'PK', 'BD', 'LK', 'NP',  // South Asia
  'CN', 'TW', 'HK', 'SG', 'TH', 'VN', 'PH', 'ID', 'MY',  // Southeast Asia
  'ZA', 'NG', 'KE', 'GH', 'ET', 'UG', 'TZ',  // Africa
]

/**
 * Fetch visa requirements for a specific passport to target country.
 * 
 * @param {string} passportCode - ISO 3166-1 alpha-2 passport country code
 * @param {string} targetCode - ISO 3166-1 alpha-2 target country code
 * @returns {Promise<Object|null>} Visa requirement data or null
 */
async function fetchVisaRequirement(passportCode, targetCode) {
  if (!VISA_API_KEY) {
    // In development, return mock data or skip
    return null
  }

  try {
    // Example endpoint structure (adjust based on actual API)
    const url = `${VISA_API_BASE_URL}/visa/check`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': VISA_API_KEY,
        'X-RapidAPI-Host': VISA_API_HOST,
      },
      body: JSON.stringify({
        passport: passportCode,
        destination: targetCode
      }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!resp.ok) {
      // If we get a 402 or 403, it might be API key issues
      if (resp.status === 402 || resp.status === 403) {
        console.warn(`  [Visa] API key issue for ${passportCode}→${targetCode}`)
      }
      return null
    }
    
    const data = await resp.json()
    return normalizeVisaData(data, passportCode, targetCode)
  } catch (err) {
    // Only log errors if it's not just a missing API key in dev
    if (err.name !== 'AbortError') {
      console.error(`  [Visa] Error fetching ${passportCode}→${targetCode}: ${err.message}`)
    }
    return null
  }
}

/**
 * Normalize visa requirement data from various API formats into a consistent schema.
 * 
 * Expected normalized format:
 * {
 *   visaRequired: boolean,
 *   visaFreeDays: number|null,        // If visa-free, how many days
 *   evisaAvailable: boolean,
 *   visaOnArrival: boolean,
 *   applicationTimeDays: number|null, // Typical processing time
 *   costUsd: number|null,             // Typical cost in USD
 *   maxStayDays: number|null,         // Maximum stay allowed
 *   entryType: string|null,           // 'single', 'multiple', etc.
 *   purpose: string[],                // ['tourism', 'business', 'work', etc.]
 *   notes: string,                    // Additional notes
 *   raw: Object                       // Original API response for debugging
 * }
 */
function normalizeVisaData(rawData, passportCode, targetCode) {
  if (!rawData) return null

  // This normalization will need to be adjusted based on the actual API response format
  // For now, returning a basic structure that can be extended
  
  return {
    passport: passportCode,
    destination: targetCode,
    visaRequired: rawData.visa_required ?? false,
    visaFreeDays: rawData.visa_free_days ?? null,
    evisaAvailable: rawData.evisa_available ?? false,
    visaOnArrival: rawData.visa_on_arrival ?? false,
    applicationTimeDays: rawData.processing_time_days ?? null,
    costUsd: rawData.cost_usd ?? null,
    maxStayDays: rawData.max_stay_days ?? null,
    entryType: rawData.entry_type ?? null,
    purpose: Array.isArray(rawData.purpose) ? rawData.purpose : 
             (rawData.purpose ? [rawData.purpose] : []),
    notes: rawData.notes || '',
    raw: rawData
  }
}

/**
 * Fetch visa requirements for a target country from common passport origins.
 * Returns an object mapping passport codes to visa requirement data.
 * 
 * @param {string} targetCode - ISO 3166-1 alpha-2 target country code
 * @returns {Promise<Object>} Map of passportCode => visaData
 */
async function fetchVisaRequirementsForCountry(targetCode) {
  if (!VISA_API_KEY) {
    console.log(`  [Visa] Skipped for ${targetCode} (no API key). Set VISA_API_KEY in .env to enable.`)
    return {}
  }

  console.log(`  [Visa] Fetching visa requirements for ${targetCode}...`)
  
  const result = {}
  
  // Check visa requirements from common passport origins
  // Limit to a reasonable number to avoid rate limiting
  const passportsToCheck = COMMON_PASSPORTS.slice(0, 10) 
  
  for (const passportCode of passportsToCheck) {
    // Skip if checking same country (usually domestic travel doesn't need visa)
    if (passportCode === targetCode) continue
    
    const visaData = await fetchVisaRequirement(passportCode, targetCode)
    if (visaData) {
      result[passportCode] = visaData
    }
    
    // Rate limiting: be nice to the API
    await new Promise(r => setTimeout(r, 500))
  }
  
  console.log(`  [Visa] Fetched requirements for ${Object.keys(result).length} passports to ${targetCode}`)
  return result
}

/**
 * Fetch visa requirements for all target countries in our dataset.
 * 
 * @returns {Promise<Object>} Map of targetCountryCode => { passportCode => visaData }
 */
async function fetchAll() {
  console.log('[Visa] Fetching visa requirements data...')
  
  if (!VISA_API_KEY) {
    console.log('  → Skipped (no API key). Set VISA_API_KEY in .env to enable.')
    return {}
  }

  // Load our country dataset to know which countries we need visa data for
  const store = require('../db/store')
  const dataset = store.loadCountryDataset()
  
  if (!dataset || dataset.length === 0) {
    console.log('  → No country dataset found, skipping visa data')
    return {}
  }

  const result = {}
  const targetCodes = dataset.map(c => c.code)
  
  // Process countries in batches to avoid overwhelming the API
  const batchSize = 5
  for (let i = 0; i < targetCodes.length; i += batchSize) {
    const batch = targetCodes.slice(i, i + batchSize)
    
    // Process batch sequentially to avoid too many concurrent requests
    for (const targetCode of batch) {
      const visaData = await fetchVisaRequirementsForCountry(targetCode)
      if (Object.keys(visaData).length > 0) {
        result[targetCode] = visaData
      }
    }
    
    // Pause between batches
    if (i + batchSize < targetCodes.length) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  
  console.log(`  → Completed visa requirements for ${Object.keys(result).length} countries`)
  return result
}

module.exports = { fetchAll, fetchVisaRequirementsForCountry, normalizeVisaData }
