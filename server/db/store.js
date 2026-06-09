/**
 * Data store for TransIT API.
 *
 * Currently uses JSON files on disk (backed by the build pipeline).
 * Designed so the interface can stay the same when swapping to PostgreSQL.
 *
 * Schema for a country entry:
 * {
 *   code: "DE",           // ISO 3166-1 alpha-2
 *   name: "Germany",
 *   // Equaldex data
 *   ei: 87,
 *   ei_legal: ...,
 *   ei_po: ...,
 *   rank: 12,
 *   // REST Countries data
 *   flag: "https://...",
 *   capital: "Berlin",
 *   region: "Europe",
 *   population: 83200000,
 *   languages: ["German"],
 *   currencies: ["EUR"],
 *   continent: "Europe",
 *   // Curated data
 *   safety: 4,
 *   digitalNomadVisa: "Freelancer visa...",
 *   euFreeMovement: true,
 *   languageNote: "...",
 *   notes: "...",
 *   resourceLinks: { ... },
 *   // Teleport data (Phase 1)
 *   teleport: {
 *     housingScore: ...,
 *     healthcareScore: ...,
 *     educationScore: ...,
 *     safetyScore: ...,
 *     costOfLivingScore: ...,
 *     cityScores: [...]}
 *   },
 *   // Cost of living data (WhereNext, CC BY 4.0)
 *   costOfLiving: {
 *     monthlyEstimateUSD: ...,
 *     rentIndex: ...,
 *     utilitiesIndex: ...,
 *     transportIndex: ...,
 *     costOfLivingIndex: ...,
 *   },
 *   // Metadata
 *   lastUpdated: "2026-06-08T...",
 *   dataSource: "api"     // "api" or "cache"
 * }
 */

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

// Path to the generated data files from the build pipeline
const GENERATED_DIR = path.join(__dirname, '..', '..', '.vitepress', 'theme', 'generated')

class DataStore {
  /**
   * Load the merged country dataset from the build pipeline.
   * Returns null if the file doesn't exist yet.
   */
  loadCountryDataset() {
    const filePath = path.join(GENERATED_DIR, 'country-dataset.json')
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
    } catch (err) {
      console.error('[Store] Error loading country dataset:', err.message)
    }
    return null
  }

  /**
   * Load curated country info (rights, safety, visa notes, etc.)
   */
  loadCuratedInfo() {
    const filePath = path.join(GENERATED_DIR, 'curated-country-info.json')
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
    } catch (err) {
      console.error('[Store] Error loading curated info:', err.message)
    }
    return null
  }

  /**
   * Load economy data (World Bank).
   */
  loadEconomyData() {
    const filePath = path.join(GENERATED_DIR, 'economy-data.json')
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
    } catch (err) {
      console.error('[Store] Error loading economy data:', err.message)
    }
    return null
  }

  /**
   * Load visa requirements data.
   */
  loadVisaData() {
    const filePath = path.join(GENERATED_DIR, 'visa-data.json')
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
    } catch (err) {
      console.error('[Store] Error loading visa data:', err.message)
    }
    return null
  }

  /**
   * Load UNHCR refugee/asylum data.
   */
  loadUNHCRData() {
    const filePath = path.join(GENERATED_DIR, 'unhcr-data.json')
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
    } catch (err) {
      console.error('[Store] Error loading UNHCR data:', err.message)
    }
    return null
  }

  /**
   * Load cost of living data (WhereNext).
   */
  loadCOLData() {
    const filePath = path.join(GENERATED_DIR, 'col-data.json')
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
    } catch (err) {
      console.error('[Store] Error loading cost of living data:', err.message)
    }
    return null
  }

  /**
   * Save data to a JSON file in the generated directory.
   */
  saveData(filename, data) {
    const filePath = path.join(GENERATED_DIR, filename)
    if (!fs.existsSync(GENERATED_DIR)) {
      fs.mkdirSync(GENERATED_DIR, { recursive: true })
    }
    // Add a metadata wrapper with timestamp
    const wrapped = {
      lastUpdated: new Date().toISOString(),
      data
    }
    fs.writeFileSync(filePath, JSON.stringify(wrapped, null, 2), 'utf-8')
    console.log(`[Store] Saved ${filename}`)
  }

  /**
   * Build and return the full merged country list.
   * Joins: country-dataset × curated × economy × col × visa × unhcr
   */
  getFullCountryList() {
    const dataset = this.loadCountryDataset()
    const curated = this.loadCuratedInfo()
    const economy = this.loadEconomyData()
    const col = this.loadCOLData()
    const visa = this.loadVisaData()
    const unhcr = this.loadUNHCRData()

    if (!dataset) return []

    return dataset.map(c => ({
      ...c,
       // Curated info
       ...(curated?.[c.code] || {}),
      // World Bank economic data
      economy: economy?.[c.code] || null,
      // Cost of living data (WhereNext)
      costOfLiving: col?.[c.code] || null,
      // Visa requirements summary
      visa: visa?.[c.code] || null,
      // UNHCR refugee/asylum data
      unhcr: unhcr?.[c.code] || null,
    }))
  }

  /**
   * Get a single country by ISO code.
   */
  getCountry(code) {
    const all = this.getFullCountryList()
    return all.find(c => c.code === code.toUpperCase()) || null
  }

  /**
   * Get the timestamp of the last successful data refresh.
   */
  getLastRefreshTime() {
    const dataset = this.loadCountryDataset()
    if (!dataset) return null

    // Check when the dataset was last modified
    const filePath = path.join(GENERATED_DIR, 'country-dataset.json')
    try {
      const stat = fs.statSync(filePath)
      return stat.mtime.toISOString()
    } catch {
      return null
    }
  }
}

module.exports = new DataStore()
