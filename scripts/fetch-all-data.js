/**
 * Fetches data from multiple free APIs for the TransIT search feature.
 *
 * Sources:
 *   - Equaldex Equality Index (LGBTQ+ rights scores)
 *   - REST Countries (flags, capitals, regions, populations)
 *   - World Bank (economic indicators: GDP, unemployment, GINI)
 *   - WhereNext (cost of living data — free, no key, CC BY 4.0)
 *   - passport-index-data GitHub (visa requirements — free, CC-licensed)
 *   - UNHCR (refugee/asylum data — free, public API)
 *
 * Run: node scripts/fetch-all-data.js
 * Called automatically before `vitepress build`
 * Also called by the server's cron scheduler for daily refreshes.
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const DATA_DIR = path.join(__dirname, '..', '.vitepress', 'theme', 'generated')
const EQUALITY_INDEX_URL = 'https://www.equaldex.com/api/equality-index?format=json'
const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region,subregion,population,languages,continents,currencies'

// ====== COUNTRY NAME LOOKUP (ISO alpha-2 -> display name) ======
const COUNTRY_NAMES = {
  IS: 'Iceland', NO: 'Norway', ES: 'Spain', DK: 'Denmark', MT: 'Malta',
  DE: 'Germany', BE: 'Belgium', PT: 'Portugal', FI: 'Finland', NL: 'Netherlands',
  SE: 'Sweden', FR: 'France', AT: 'Austria', CZ: 'Czech Republic', CH: 'Switzerland',
  IE: 'Ireland', GB: 'United Kingdom', LU: 'Luxembourg', IT: 'Italy', GR: 'Greece',
  SI: 'Slovenia', EE: 'Estonia', CY: 'Cyprus', HR: 'Croatia', PL: 'Poland',
  SK: 'Slovakia', HU: 'Hungary', LT: 'Lithuania', RO: 'Romania', LV: 'Latvia',
  BG: 'Bulgaria', UA: 'Ukraine', RS: 'Serbia', BA: 'Bosnia and Herzegovina',
  AL: 'Albania', MK: 'North Macedonia', ME: 'Montenegro', XK: 'Kosovo',
  AD: 'Andorra', LI: 'Liechtenstein', MC: 'Monaco', SM: 'San Marino',
  VA: 'Vatican City', BY: 'Belarus', MD: 'Moldova', RU: 'Russia', TR: 'Turkey',
  GE: 'Georgia', AM: 'Armenia', AZ: 'Azerbaijan',
  UY: 'Uruguay', NZ: 'New Zealand', CA: 'Canada', AU: 'Australia',
  US: 'United States', AR: 'Argentina', BR: 'Brazil', MX: 'Mexico', JP: 'Japan',
  KR: 'South Korea', TW: 'Taiwan', IL: 'Israel', IN: 'India',
  TH: 'Thailand', CN: 'China', VN: 'Vietnam', PH: 'Philippines', SG: 'Singapore',
  MY: 'Malaysia', ID: 'Indonesia', PK: 'Pakistan', BD: 'Bangladesh', NP: 'Nepal',
  LK: 'Sri Lanka', AF: 'Afghanistan', IR: 'Iran', IQ: 'Iraq', SA: 'Saudi Arabia',
  AE: 'United Arab Emirates', QA: 'Qatar', KW: 'Kuwait', OM: 'Oman', BH: 'Bahrain',
  JO: 'Jordan', LB: 'Lebanon', SY: 'Syria', YE: 'Yemen', PS: 'Palestine',
  EG: 'Egypt', DZ: 'Algeria', MA: 'Morocco', TN: 'Tunisia', LY: 'Libya',
  SD: 'Sudan', SS: 'South Sudan', ET: 'Ethiopia', KE: 'Kenya', NG: 'Nigeria',
  GH: 'Ghana', ZA: 'South Africa', TZ: 'Tanzania', UG: 'Uganda', RW: 'Rwanda',
  CU: 'Cuba', CO: 'Colombia', CR: 'Costa Rica', DO: 'Dominican Republic',
  EC: 'Ecuador', SV: 'El Salvador', GT: 'Guatemala', HN: 'Honduras',
  NI: 'Nicaragua', PA: 'Panama', PE: 'Peru', PY: 'Paraguay', VE: 'Venezuela',
  BO: 'Bolivia', CL: 'Chile',
}

// ====== CACHING HELPERS ======
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`  ✓ Saved ${path.relative(DATA_DIR, filePath)}`)
}

function readCache(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (_) { /* ignore */ }
  return null
}

// ====== FETCH WITH RETRY & TIMEOUT ======
async function fetchJSON(url, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const resp = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      return await resp.json()
    } catch (err) {
      if (attempt > retries) throw err
      console.log(`  Retry ${attempt}/${retries}...`)
      await new Promise(r => setTimeout(r, 1000))
    }
  }
}

// ====== FETCH EQUALDEX DATA ======
async function fetchEqualdex() {
  console.log('[1/6] Fetching Equaldex Equality Index...')
  let data = null
  try {
    data = await fetchJSON(EQUALITY_INDEX_URL)
    console.log(`  → ${data.length} countries`)
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    data = readCache(path.join(DATA_DIR, 'equality-index.json')) || []
    if (data.length) console.log('  → Using cached data')
  }
  return data
}

// ====== FETCH REST COUNTRIES DATA ======
async function fetchRestCountries() {
  console.log('[2/6] Fetching REST Countries data...')
  let data = null
  try {
    data = await fetchJSON(REST_COUNTRIES_URL)
    // v3.1 API now returns { success: false } on deprecation; detect non-array
    if (Array.isArray(data)) {
      console.log(`  → ${data.length} countries`)
    } else {
      throw new Error('API returned non-array response (likely deprecated)')
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    // Fall back to cache
    data = readCache(path.join(DATA_DIR, 'rest-countries.json'))
    if (Array.isArray(data) && data.length) {
      console.log(`  → Loaded ${data.length} countries from cache`)
    } else {
      // Last resort: reconstruct from country-dataset.json (already has all fields)
      console.log('  → Reconstructing from country-dataset.json...')
      const datasetPath = path.join(DATA_DIR, 'country-dataset.json')
      if (fs.existsSync(datasetPath)) {
        const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
        if (Array.isArray(dataset)) {
          data = dataset.map(c => ({
            name: { common: c.name },
            cca2: c.code,
            flags: { png: c.flag, alt: c.flagAlt || '' },
            capital: c.capital ? [c.capital] : [],
            region: c.region || '',
            subregion: c.subregion || '',
            population: c.population || 0,
            languages: c.languages ? Object.fromEntries(c.languages.map(l => [l, l])) : {},
            continents: c.continent ? [c.continent] : [],
            currencies: c.currencies ? Object.fromEntries(c.currencies.map(cu => [cu, { name: cu }])) : {},
          }))
          console.log(`  → Reconstructed ${data.length} countries from dataset`)
        }
      }
    }
  }
  return data
}

// ====== FETCH ECONOMY DATA (WORLD BANK) ======
async function fetchEconomy() {
  console.log('[3/6] Fetching World Bank economic data...')
  try {
    const economy = require('../server/services/numbeo')
    const data = await economy.fetchAll()
    if (data && Object.keys(data).length > 0) {
      writeJSON(path.join(DATA_DIR, 'economy-data.json'), data)
      return data
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    const cached = readCache(path.join(DATA_DIR, 'economy-data.json'))
    if (cached) {
      console.log('  → Using cached economy data')
      return cached
    }
  }
  return {}
}

// ====== FETCH VISA DATA ======
async function fetchVisa() {
  console.log('[4/6] Fetching visa requirements data...')
  try {
    const visa = require('../server/services/visa')
    const data = await visa.fetchAll()
    if (data && Object.keys(data).length > 0) {
      writeJSON(path.join(DATA_DIR, 'visa-data.json'), data)
      return data
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    const cached = readCache(path.join(DATA_DIR, 'visa-data.json'))
    if (cached) {
      console.log('  → Using cached visa data')
      return cached
    }
  }
  return {}
}

// ====== FETCH COL DATA (WHERENEXT) ======
async function fetchCOL() {
  console.log('[5/6] Fetching cost of living data from WhereNext...')
  try {
    const col = require('../server/services/col')
    const data = await col.fetchAll()
    if (data && Object.keys(data).length > 0) {
      writeJSON(path.join(DATA_DIR, 'col-data.json'), data)
      return data
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    const cached = readCache(path.join(DATA_DIR, 'col-data.json'))
    if (cached) {
      console.log('  → Using cached cost of living data')
      return cached
    }
  }
  return {}
}

// ====== FETCH UNHCR DATA ======
async function fetchUNHCR() {
  console.log('[6/6] Fetching UNHCR refugee data...')
  try {
    const unhcr = require('../server/services/unhcr')
    const data = await unhcr.fetchAll()
    if (data && Object.keys(data).length > 0) {
      writeJSON(path.join(DATA_DIR, 'unhcr-data.json'), data)
      return data
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
    const cached = readCache(path.join(DATA_DIR, 'unhcr-data.json'))
    if (cached) {
      console.log('  → Using cached UNHCR data')
      return cached
    }
  }
  return {}
}

// ====== BUILD SEARCHABLE DATASET ======
function buildCountryDataset(equalityData, restData) {
  // Build a map of ISO2 -> rest country info
  const restMap = {}
  if (restData) {
    restData.forEach(c => {
      const code = (c.cca2 || '').toUpperCase()
      restMap[code] = {
        flag: c.flags?.png || c.flags?.svg || '',
        flagAlt: c.flags?.alt || '',
        capital: c.capital ? c.capital[0] : '',
        region: c.region || '',
        subregion: c.subregion || '',
        population: c.population || 0,
        languages: c.languages ? Object.values(c.languages) : [],
        currencies: c.currencies ? Object.keys(c.currencies) : [],
        continent: c.continents ? c.continents[0] : '',
      }
    })
  }

  // Build the merged dataset
  const dataset = []
  if (equalityData) {
    equalityData.forEach(e => {
      const code = e.region_id
      const rest = restMap[code] || {}
      dataset.push({
        code,
        name: COUNTRY_NAMES[code] || e.name || code,
        // Equaldex
        ei: e.ei,
        ei_legal: e.ei_legal,
        ei_po: e.ei_po,
        rank: e.rank,
        // Rest Countries
        ...rest,
      })
    })
  }

  // Sort by equality rank (best first), unknowns at the end
  dataset.sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank
    if (a.rank) return -1
    if (b.rank) return 1
    return 0
  })

  return dataset
}

// ====== MAIN ======
async function main() {
  console.log('')
  console.log('═══ Fetching all country data ═══')
  console.log('')

  ensureDir(DATA_DIR)

  // Fetch from all APIs
  const [equalityData, restData] = await Promise.all([
    fetchEqualdex(),
    fetchRestCountries(),
  ])

  // Write raw per-source files (backward compat)
  if (equalityData) {
    writeJSON(path.join(DATA_DIR, 'equality-index.json'), equalityData)

    const countryMap = {}
    equalityData.forEach(e => {
      countryMap[e.region_id] = {
        name: COUNTRY_NAMES[e.region_id] || e.name || e.region_id,
        ei: e.ei,
        ei_legal: e.ei_legal,
        ei_po: e.ei_po,
        rank: e.rank,
      }
    })
    writeJSON(path.join(DATA_DIR, 'equality-index-map.json'), countryMap)
  }

  if (restData) {
    writeJSON(path.join(DATA_DIR, 'rest-countries.json'), restData)
  }

  // Fetch Economy (World Bank), Visa, and Cost of Living (all free, no API keys)
  const [economyData, visaData, colData] = await Promise.all([
    fetchEconomy(),
    fetchVisa(),
    fetchCOL(),
  ])

  // Build and write the merged search dataset
  const dataset = buildCountryDataset(equalityData, restData)
  writeJSON(path.join(DATA_DIR, 'country-dataset.json'), dataset)

  // Fetch UNHCR data (runs after dataset is written since it loads the dataset)
  const unhcrData = await fetchUNHCR()

  console.log('')
  console.log('═══ Done! ═══')
  console.log(`Data directory: ${DATA_DIR}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
