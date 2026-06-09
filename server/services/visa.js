/**
 * Visa Requirements service.
 *
 * Uses free data sources (no API key required):
 *   - passport-index-data: GitHub repo updated regularly with visa requirements
 *     for 199 countries. JSON format keyed by ISO-2 codes.
 *     https://github.com/imorte/passport-index-data
 *
 * The raw JSON is at:
 *   https://raw.githubusercontent.com/imorte/passport-index-data/master/passport-index.json
 *
 * Data format: { "us": { "gb": { status: "visa free", days: 180 }, ... }, ... }
 *   status values: "visa free", "visa on arrival", "eta", "e-visa", "visa required", "no admission"
 *   days: number of visa-free days (or -1 for same country)
 */

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/imorte/passport-index-data/master/passport-index.json'

// Cache the full dataset in memory after first fetch
let cachedVisaData = null
let lastFetchTime = null
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch and cache the full passport index dataset from GitHub.
 * Updated regularly by the community.
 */
async function getVisaDataset() {
  // Return cached data if still fresh
  if (cachedVisaData && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_TTL_MS) {
    return cachedVisaData
  }

  try {
    console.log('  [Visa] Fetching passport index data from GitHub...')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const resp = await fetch(GITHUB_RAW_URL, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()

    cachedVisaData = data
    lastFetchTime = Date.now()
    const passportCount = Object.keys(data || {}).length
    console.log(`  [Visa] Loaded ${passportCount} passport entries`)
    return data
  } catch (err) {
    console.error(`  [Visa] Error fetching passport index: ${err.message}`)
    // Return stale cache if available
    if (cachedVisaData) {
      console.log('  [Visa] Using stale cache')
      return cachedVisaData
    }
    return null
  }
}

/**
 * Get visa requirement from one passport country to a destination country.
 * 
 * @param {string} passportCode - ISO 3166-1 alpha-2 passport code (lowercase)
 * @param {string} destinationCode - ISO 3166-1 alpha-2 destination code (lowercase)
 * @returns {Object|null} Visa requirement info
 */
function getVisaRequirement(passportCode, destinationCode) {
  if (!cachedVisaData) return null
  
  const pc = passportCode.toLowerCase()
  const dc = destinationCode.toLowerCase()
  
  const passportEntry = cachedVisaData[pc]
  if (!passportEntry) return null
  
  const destinationEntry = passportEntry[dc]
  if (!destinationEntry) return null
  
  return {
    status: destinationEntry.status || 'unknown',
    days: destinationEntry.days || null,
  }
}

/**
 * Normalize visa status into a simple category.
 */
function normalizeVisaStatus(status, days) {
  const normalized = {
    visaRequired: true,
    visaFreeDays: null,
    evisaAvailable: false,
    visaOnArrival: false,
    eta: false,
    maxStayDays: null,
    entryType: null,
  }

  switch (status) {
    case 'visa free':
      normalized.visaRequired = false
      normalized.visaFreeDays = days || null
      normalized.maxStayDays = days || null
      normalized.entryType = 'visa-free'
      break
    case 'visa on arrival':
      normalized.visaRequired = false
      normalized.visaOnArrival = true
      normalized.maxStayDays = days || null
      normalized.entryType = 'visa-on-arrival'
      break
    case 'eta':
      normalized.visaRequired = false
      normalized.eta = true
      normalized.maxStayDays = days || null
      normalized.entryType = 'eta'
      break
    case 'e-visa':
      normalized.visaRequired = false
      normalized.evisaAvailable = true
      normalized.maxStayDays = days || null
      normalized.entryType = 'e-visa'
      break
    case 'visa required':
      normalized.visaRequired = true
      normalized.entryType = 'visa-required'
      break
    case 'no admission':
      normalized.visaRequired = true
      normalized.entryType = 'no-admission'
      break
  }

  return normalized
}

/**
 * Get a human-readable label for a visa status.
 */
function visaStatusLabel(status) {
  const labels = {
    'visa free': '✅ Visa-free',
    'visa on arrival': '🛬 Visa on arrival',
    'eta': '📱 ETA required',
    'e-visa': '📧 eVisa required',
    'visa required': '🛂 Visa required',
    'no admission': '🚫 No admission',
  }
  return labels[status] || status || 'Unknown'
}

/**
 * Check visa requirements from common source passports to all target countries.
 * 
 * @param {string} targetCode - ISO 3166-1 alpha-2 destination country code
 * @returns {Object} Map of passportCode => visaData
 */
function getVisaRequirementsForCountry(targetCode) {
  if (!cachedVisaData) return {}

  const result = {}
  const dc = targetCode.toLowerCase()

  for (const [passportCode, destinations] of Object.entries(cachedVisaData)) {
    if (!destinations[dc]) continue
    
    const entry = destinations[dc]
    const normalized = normalizeVisaStatus(entry.status, entry.days)
    result[passportCode.toUpperCase()] = {
      ...normalized,
      passportName: null, // We don't have country names in the index
      statusLabel: visaStatusLabel(entry.status),
    }
  }

  return result
}

/**
 * Main entry: fetch visa requirements data.
 * Loads the passport index dataset from GitHub (free, no API key).
 */
async function fetchAll() {
  console.log('[Visa] Loading visa requirements data...')
  
  const data = await getVisaDataset()
  if (!data) {
    console.log('  → Failed to load visa data')
    return {}
  }

  // Create a summary: for each destination, show visa requirements from common passports
  const result = {}
  const passportCount = Object.keys(data).length
  console.log(`  → ${passportCount} passports loaded`)

  // For each destination country, compute summary stats
  for (const [passportCode, destinations] of Object.entries(data)) {
    for (const [destCode, entry] of Object.entries(destinations)) {
      if (!result[destCode.toUpperCase()]) {
        result[destCode.toUpperCase()] = { summary: { visaFree: 0, visaOnArrival: 0, eta: 0, evisa: 0, visaRequired: 0, noAdmission: 0, total: 0 } }
      }
      result[destCode.toUpperCase()].summary.total++
      switch (entry.status) {
        case 'visa free': result[destCode.toUpperCase()].summary.visaFree++; break
        case 'visa on arrival': result[destCode.toUpperCase()].summary.visaOnArrival++; break
        case 'eta': result[destCode.toUpperCase()].summary.eta++; break
        case 'e-visa': result[destCode.toUpperCase()].summary.evisa++; break
        case 'visa required': result[destCode.toUpperCase()].summary.visaRequired++; break
        case 'no admission': result[destCode.toUpperCase()].summary.noAdmission++; break
      }
    }
  }

  console.log(`  → Computed visa summaries for ${Object.keys(result).length} destinations`)
  return result
}

/**
 * Get visa requirement between two specific countries.
 * Used by the API endpoint for individual lookups.
 * 
 * @param {string} passportCode - ISO 3166-1 alpha-2
 * @param {string} destinationCode - ISO 3166-1 alpha-2
 * @returns {Object|null}
 */
function getVisaBetween(passportCode, destinationCode) {
  const entry = getVisaRequirement(passportCode, destinationCode)
  if (!entry) return null
  
  const normalized = normalizeVisaStatus(entry.status, entry.days)
  return {
    passport: passportCode.toUpperCase(),
    destination: destinationCode.toUpperCase(),
    ...normalized,
    statusLabel: visaStatusLabel(entry.status),
  }
}

module.exports = { fetchAll, getVisaBetween, getVisaRequirementsForCountry }
