<template>
  <!-- Global safety banner — appears at the top of every page if user is in a dangerous country -->
  <div
    v-if="showBanner"
    class="safety-banner"
  >
    <div class="safety-banner-inner">
      <div class="safety-banner-content">
        <span class="safety-banner-icon">🚨</span>
        <div class="safety-banner-text">
          <p class="safety-banner-title">Safety Notice</p>
          <p class="safety-banner-description">
            We noticed you're accessing this site from <strong>{{ detectedCountryName }}</strong>,
            which has severe legal restrictions for LGBTQ+ people.
            If you're in danger or concerned about your safety, please visit the
            <a href="/transit/emergency/" class="safety-banner-link">Emergency Resources page</a>.
          </p>
        </div>
      </div>
      <div class="safety-banner-actions">
        <span class="safety-banner-hint">
          <kbd class="safety-banner-kbd">Esc</kbd> ×3 for safe exit
        </span>
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
  </div>
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
  position: relative;
  z-index: 100;
  width: 100%;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-bottom: 2px solid #f87171;
}

.dark .safety-banner {
  background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%);
  border-bottom-color: #dc2626;
}

.safety-banner-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.safety-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.safety-banner-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  line-height: 1.4;
}

.safety-banner-text {
  flex: 1;
  min-width: 0;
}

.safety-banner-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #991b1b;
  margin: 0;
}

.dark .safety-banner-title {
  color: #fca5a5;
}

.safety-banner-description {
  font-size: 0.8125rem;
  color: #b91c1c;
  margin: 2px 0 0 0;
  line-height: 1.4;
}

.dark .safety-banner-description {
  color: #fecaca;
}

.safety-banner-link {
  font-weight: 600;
  text-decoration: underline;
  color: #991b1b;
}

.dark .safety-banner-link {
  color: #fca5a5;
}

.safety-banner-link:hover {
  color: #7f1d1d;
}

.dark .safety-banner-link:hover {
  color: #fef2f2;
}

.safety-banner-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.safety-banner-hint {
  font-size: 0.75rem;
  color: #dc2626;
  white-space: nowrap;
}

.dark .safety-banner-hint {
  color: #fca5a5;
}

.safety-banner-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  font-size: 0.6875rem;
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
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;
  transition: background 0.15s;
}

.safety-banner-close:hover {
  background: rgba(185, 28, 28, 0.12);
}

.dark .safety-banner-close {
  color: #fca5a5;
}

.dark .safety-banner-close:hover {
  background: rgba(252, 165, 165, 0.15);
}

.safety-banner-close-icon {
  width: 16px;
  height: 16px;
}
</style>
