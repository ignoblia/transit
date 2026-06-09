<template>
  <!-- Global safety banner — matches the "DO NOT MOVE" banner theme -->
  <Teleport to="body">
    <div
      v-if="showBanner"
      class="safety-banner"
    >
      <div class="safety-banner-inner">
        <div class="safety-banner-content">
          <span class="safety-banner-icon">🚨</span>
          <div class="safety-banner-text">
            <div class="safety-banner-title">Safety Notice</div>
            <p class="safety-banner-description">
              We noticed you're accessing this site from <strong>{{ detectedCountryName }}</strong>,
              which has severe legal restrictions for LGBTQ+ people.
              If you're in danger or concerned about your safety, please visit the
              <a href="/transit/emergency/" class="safety-banner-link">Emergency Resources page</a>.
            </p>
            <p class="safety-banner-footer">
              Press <kbd class="safety-banner-kbd">Esc</kbd> 3× for an immediate safe exit
            </p>
          </div>
        </div>
        <button
          @click="dismiss"
          class="safety-banner-close"
          aria-label="Dismiss safety notice"
          title="Dismiss"
        >
          <svg class="safety-banner-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'transit-safety-banner-dismissed'

const showBanner = ref(false)
const detectedCountryName = ref('')
const loaded = ref(false)

function dismiss() {
  showBanner.value = false
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch (_) {}
}

async function checkLocation() {
  if (loaded.value) return
  loaded.value = true

  // Check if previously dismissed
  try {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed === 'true') return
  } catch (_) {}

  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const countryCode = data.country_code
    if (!countryCode) return

    // Dynamically import the dataset to check the country's EI score
    const dataset = await import('../generated/country-dataset.json')
    const match = dataset.default.find(c => c.code === countryCode)
    if (match && match.ei !== undefined && match.ei !== null && match.ei < 25) {
      detectedCountryName.value = match.name
      // Small delay so page renders first
      setTimeout(() => {
        showBanner.value = true
      }, 500)
    }
  } catch (e) {
    console.info('[SafetyBanner] Could not detect country:', e.message)
  }
}

onMounted(() => {
  checkLocation()
})
</script>

<style scoped>
.safety-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background: #fef2f2;
  border-bottom: 2px solid #f87171;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark .safety-banner {
  background: #450a0a;
  border-bottom-color: #dc2626;
}

.safety-banner-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.safety-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.safety-banner-icon {
  font-size: 2.25rem;  /* text-4xl */
  flex-shrink: 0;
  line-height: 1;
}

.safety-banner-text {
  flex: 1;
  min-width: 0;
}

.safety-banner-title {
  font-size: 1.25rem;   /* text-xl */
  font-weight: 700;      /* font-bold */
  color: #991b1b;        /* text-red-800 */
  margin: 0;
  line-height: 1.3;
}

.dark .safety-banner-title {
  color: #fecaca;        /* dark:text-red-200 */
}

.safety-banner-description {
  font-size: 0.875rem;   /* text-sm */
  color: #b91c1c;        /* text-red-700 */
  margin: 4px 0 0 0;
  line-height: 1.5;
  font-weight: 500;       /* font-medium */
}

.dark .safety-banner-description {
  color: #fca5a5;        /* dark:text-red-300 */
}

.safety-banner-link {
  font-weight: 700;
  text-decoration: underline;
  color: #991b1b;
}

.dark .safety-banner-link {
  color: #fecaca;
}

.safety-banner-link:hover {
  color: #7f1d1d;
}

.dark .safety-banner-link:hover {
  color: #fef2f2;
}

.safety-banner-footer {
  font-size: 0.75rem;    /* text-xs */
  color: #dc2626;         /* text-red-600 */
  margin: 6px 0 0 0;
}

.dark .safety-banner-footer {
  color: #f87171;         /* dark:text-red-400 */
}

.safety-banner-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  font-size: 0.75rem;
  font-family: monospace;
  background: #fca5a5;
  color: #7f1d1d;
  border-radius: 4px;
  border: 1px solid #ef4444;
}

.dark .safety-banner-kbd {
  background: #7f1d1d;
  color: #fecaca;
  border-color: #ef4444;
}

.safety-banner-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(185, 28, 28, 0.25);
  background: transparent;
  color: #991b1b;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 2px;
}

.safety-banner-close:hover {
  background: rgba(185, 28, 28, 0.1);
}

.dark .safety-banner-close {
  color: #fecaca;
  border-color: rgba(252, 165, 165, 0.25);
}

.dark .safety-banner-close:hover {
  background: rgba(252, 165, 165, 0.1);
}

.safety-banner-close-icon {
  width: 16px;
  height: 16px;
}
</style>
