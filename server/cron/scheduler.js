/**
 * Scheduled data refresh using node-cron.
 *
 * Runs the data fetch pipeline on a configurable schedule (default: daily at 3am).
 * Can also be triggered manually via the /api/refresh endpoint.
 */

const cron = require('node-cron')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const REFRESH_SCHEDULE = process.env.REFRESH_CRON_SCHEDULE || '0 3 * * *'

/**
 * Execute the full data refresh pipeline.
 * Spawns the fetch-data npm script and returns a promise.
 */
function runRefresh() {
  return new Promise((resolve, reject) => {
    console.log('[Cron] Starting data refresh...')
    const { execSync } = require('child_process')
    try {
      const output = execSync('npm run fetch-data', {
        cwd: path.join(__dirname, '..', '..'),
        encoding: 'utf-8',
        timeout: 120000, // 2 minutes
      })
      console.log('[Cron] Refresh complete:\n' + output)
      resolve(output)
    } catch (err) {
      console.error('[Cron] Refresh failed:', err.message)
      reject(err)
    }
  })
}

/**
 * Start the cron scheduler.
 * If `runImmediately` is true, also runs one refresh on startup.
 */
function startScheduler(runImmediately = false) {
  const isValid = cron.validate(REFRESH_SCHEDULE)
  if (!isValid) {
    console.warn(`[Cron] Invalid schedule expression: "${REFRESH_SCHEDULE}". Using default: daily at 3am.`)
  }

  if (runImmediately) {
    console.log('[Cron] Running initial data refresh...')
    runRefresh().catch(() => {})
  }

  const task = cron.schedule(REFRESH_SCHEDULE, () => {
    console.log(`[Cron] Triggering scheduled refresh at ${new Date().toISOString()}`)
    runRefresh().catch(err => {
      console.error('[Cron] Scheduled refresh failed:', err.message)
    })
  })

  console.log(`[Cron] Scheduler started — next refresh schedule: ${REFRESH_SCHEDULE}`)
  return task
}

module.exports = { startScheduler, runRefresh }
