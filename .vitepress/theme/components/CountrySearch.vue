<template>
  <div class="max-w-4xl mx-auto">
    <!-- Search bar -->
    <div class="relative mb-8">
      <div class="flex gap-3 items-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors p-1">
        <span class="pl-4 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          placeholder="Search any country... (e.g. Spain, Japan, Brazil)"
          class="flex-1 py-3 px-2 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          @input="onInput"
          @keydown.down="highlightNext"
          @keydown.up="highlightPrev"
          @keydown.enter="selectHighlighted"
          @keydown.escape="showDropdown = false"
          @blur="onBlur"
        />
        <button
          v-if="query"
          @click="clearSearch"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Autocomplete dropdown -->
      <div
        v-if="showDropdown && filteredCountries.length"
        class="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto"
      >
        <button
          v-for="(country, idx) in filteredCountries"
          :key="country.code"
          @click="selectCountry(country)"
          @mousedown.prevent
          class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30': idx === highlightIndex }"
        >
          <img
            v-if="country.flag"
            :src="country.flag"
            :alt="country.flagAlt || `Flag of ${country.name}`"
            class="w-6 h-4 object-cover rounded shadow-sm"
          />
          <span class="w-6 h-4 bg-gray-200 rounded flex items-center justify-center text-xs" v-else>
            ?
          </span>
          <div class="flex-1">
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ country.name }}</span>
            <span class="text-xs text-gray-500 ml-2">{{ country.continent || '' }}</span>
          </div>
          <span
            v-if="country.ei !== undefined"
            class="text-xs font-bold px-2 py-0.5 rounded-full"
            :class="scoreClass(country.ei)"
          >
            {{ country.ei }}
          </span>
        </button>
      </div>
      <div
        v-if="showDropdown && query && !filteredCountries.length"
        class="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6 text-center text-gray-500"
      >
        No countries match "{{ query }}"
      </div>
    </div>

    <!-- Country detail panel -->
    <div v-if="selectedCountry" class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex items-start gap-4 flex-wrap">
        <img
          v-if="selectedCountry.flag"
          :src="selectedCountry.flag"
          :alt="`Flag of ${selectedCountry.name}`"
          class="w-16 h-10 object-cover rounded-lg shadow-md"
        />
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ selectedCountry.name }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ selectedCountry.continent }}
            <span v-if="selectedCountry.region"> · {{ selectedCountry.region }}</span>
            <span v-if="selectedCountry.capital"> · Capital: {{ selectedCountry.capital }}</span>
            <span v-if="selectedCountry.population">
              · Population: {{ formatNumber(selectedCountry.population) }}
            </span>
          </p>
          <p v-if="selectedCountry.languages?.length" class="text-xs text-gray-400 mt-1">
            Languages: {{ selectedCountry.languages.join(', ') }}
          </p>
        </div>
      </div>

      <!-- Equality Index card -->
      <div v-if="selectedCountry.ei !== undefined" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold mb-6 pt-2 text-gray-900 dark:text-gray-100">
          <span class="mr-2">🏳️‍⚧️</span> Equality Index
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="text-3xl font-bold" :class="scoreClass(selectedCountry.ei)">{{ selectedCountry.ei }}</div>
            <div class="text-xs text-gray-500 mt-1">Overall Score</div>
          </div>
          <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ selectedCountry.ei_legal ?? '-' }}</div>
            <div class="text-xs text-gray-500 mt-1">Legal Score</div>
          </div>
          <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ selectedCountry.ei_po ?? '-' }}</div>
            <div class="text-xs text-gray-500 mt-1">Public Opinion</div>
          </div>
        </div>
        <p v-if="selectedCountry.rank" class="text-xs text-gray-400 mt-3 text-center">
          Rank: #{{ selectedCountry.rank }} of 197 · 
          <a href="https://www.equaldex.com/equality-index" target="_blank" class="underline hover:text-blue-500">Equaldex</a>
        </p>
      </div>

      <!-- Trans Rights card -->
      <div v-if="curatedInfo" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          <span class="mr-2">🏳️‍⚧️</span> Rights Checklist
        </h3>

        <!-- Recognition + Healthcare + Anti-Discrimination summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Gender Recognition</div>
            <Badge :variant="recognitionVariant(curatedInfo.rights.legalRecognition)">
              {{ curatedInfo.rights.legalRecognitionLabel }}
            </Badge>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Healthcare Access</div>
            <Badge :variant="healthcareVariant(curatedInfo.rights.healthcareLabel)">
              {{ curatedInfo.rights.healthcareLabel }}
            </Badge>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Anti-Discrimination</div>
            <Badge :variant="discriminationVariant(curatedInfo.rights.antiDiscriminationLabel)">
              {{ curatedInfo.rights.antiDiscriminationLabel }}
            </Badge>
          </div>
        </div>

        <!-- Detailed rights checklist -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          <div v-for="item in rightsList" :key="item.key" class="flex items-center gap-2.5">
            <span class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  :class="item.value ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'">
              {{ item.value ? '✓' : '✗' }}
            </span>
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.label }}</span>
          </div>
        </div>

        <!-- Healthcare coverage -->
        <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <span class="text-xs uppercase tracking-wider text-gray-500">Gender-affirming healthcare:</span>
          <Badge :variant="coverageVariant(curatedInfo.rights.healthcareCoverage)">
            {{ coverageLabel(curatedInfo.rights.healthcareCoverage) }}
          </Badge>
        </div>

        <!-- Safety rating -->
        <div class="mt-3 flex items-center gap-2">
          <span class="text-xs uppercase tracking-wider text-gray-500">Safety:</span>
          <span v-for="i in 5" :key="i" class="text-lg leading-none">
            {{ i <= (curatedInfo.safety || 0) ? '⭐' : '☆' }}
          </span>
        </div>

        <p v-if="curatedInfo.notes" class="mt-4 text-sm text-gray-600 dark:text-gray-400 italic">
          {{ curatedInfo.notes }}
        </p>
      </div>

      <!-- Migration card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          <span class="mr-2">✈️</span> Migration &amp; Living
        </h3>

        <!-- Your location input -->
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Where are you moving from?
          </label>
          <div class="relative">
            <input
              v-model="fromQuery"
              type="text"
              placeholder="Type your current country..."
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
              @input="onFromInput"
              @keydown.down="fromHighlightNext"
              @keydown.up="fromHighlightPrev"
              @keydown.enter="selectFromHighlighted"
              @blur="onFromBlur"
            />
            <div
              v-if="showFromDropdown && fromFiltered.length"
              class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              <button
                v-for="(country, idx) in fromFiltered"
                :key="country.code"
                @click="selectFromCountry(country)"
                @mousedown.prevent
                class="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm transition-colors"
                :class="{ 'bg-blue-50 dark:bg-blue-900/30': idx === fromHighlightIndex }"
              >
                <img v-if="country.flag" :src="country.flag" class="w-5 h-3 object-cover rounded" />
                <span>{{ country.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Migration details grid -->
        <div v-if="selectedCountry.code" class="space-y-4 text-sm">
          <!-- Destination header -->
          <div class="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            <span class="text-blue-600 dark:text-blue-400 font-medium">📍 Moving to {{ selectedCountry.name }}</span>
            <span v-if="curatedInfo?.euFreeMovement" class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              EU Free Movement
            </span>
          </div>

          <!-- 2-column info grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Visa & Residency -->
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Visa & Residency</div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ curatedInfo?.digitalNomadVisa || 'Standard visa/residency pathways' }}
              </div>
              <div v-if="visaDifficulty" class="mt-1">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                      :class="visaDifficultyBadgeClass">
                  {{ visaDifficulty }}
                </span>
              </div>
            </div>

            <!-- Healthcare System -->
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Healthcare Access</div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ curatedInfo?.rights?.healthcareLabel || 'See Rights Checklist' }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Coverage: <Badge :variant="coverageVariant(curatedInfo?.rights?.healthcareCoverage)" class="text-[11px]">
                  {{ coverageLabel(curatedInfo?.rights?.healthcareCoverage) }}
                </Badge>
              </div>
            </div>

            <!-- Language -->
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Languages</div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ languageInfo }}
              </div>
              <div v-if="selectedCountry.languages?.length" class="text-xs text-gray-500 mt-1">
                {{ selectedCountry.languages.length > 1 ? 'Multiple official languages' : 'Official language' }}
              </div>
            </div>

            <!-- Community & Integration -->
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Community & Integration</div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ communityInfo }}
              </div>
              <div v-if="curatedInfo?.notes" class="text-xs text-gray-500 mt-1">
                {{ curatedInfo.notes }}
              </div>
            </div>
          </div>

          <!-- Passport tip banner -->
          <div v-if="passportSuggestion" class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50">
            <p class="text-amber-800 dark:text-amber-200 text-sm">
              <span class="font-medium">💡 Passport Tip:</span>
              {{ passportSuggestion }}
            </p>
          </div>

          <p class="text-xs text-gray-400">
            Migration info is a general guide. Always verify with official government sources.
          </p>
        </div>
      </div>

      <!-- All data sources -->
      <div class="text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-8">
        <p class="mb-1">Data sources:</p>
        <ul class="list-disc list-inside space-y-0.5">
          <li><a href="https://www.equaldex.com/equality-index" target="_blank" class="underline hover:text-blue-500">Equaldex Equality Index</a> — LGBTQ+ rights scores</li>
          <li><a href="https://restcountries.com/" target="_blank" class="underline hover:text-blue-500">REST Countries</a> — flags, capitals, populations</li>
          <li>Curated data — legal recognition, healthcare, safety, visa info</li>
        </ul>
        <p class="mt-2">Last updated: {{ lastUpdated }}</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16 text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-lg">Search for a country above</p>
      <p class="text-sm mt-2">Get Equality Index scores, trans rights info, and migration guidance.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dataset from '../generated/country-dataset.json'
import curatedInfoMap from '../generated/curated-country-info.json'

// ====== SEARCH STATE ======
const query = ref('')
const showDropdown = ref(false)
const highlightIndex = ref(-1)
const selectedCountry = ref(null)
const searchInput = ref(null)
const lastUpdated = ref('')

// From-country state
const fromQuery = ref('')
const showFromDropdown = ref(false)
const fromHighlightIndex = ref(-1)
const selectedFromCountry = ref(null)

const filteredCountries = computed(() => {
  if (!query.value) return []
  const q = query.value.toLowerCase()
  return dataset
    .filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)))
    .slice(0, 15)
})

const curatedInfo = computed(() => {
  if (!selectedCountry.value) return null
  return curatedInfoMap[selectedCountry.value.code] || null
})

// Build a list of { key, label, value } for the rights checklist
const rightsList = computed(() => {
  if (!curatedInfo.value) return []
  const r = curatedInfo.value.rights
  if (!r) return []
  return [
    { key: 'sameSexMarriage', label: 'Same-sex marriage', value: r.sameSexMarriage },
    { key: 'adoptionBySameSex', label: 'Same-sex adoption', value: r.adoptionBySameSex },
    { key: 'conversionTherapyBan', label: 'Conversion therapy banned', value: r.conversionTherapyBan },
    { key: 'hateCrimeLaws', label: 'Hate crime laws include gender identity', value: r.hateCrimeLaws },
    { key: 'employmentDiscrimination', label: 'Employment discrimination protections', value: r.employmentDiscrimination },
    { key: 'housingDiscrimination', label: 'Housing discrimination protections', value: r.housingDiscrimination },
    { key: 'bloodDonation', label: 'Blood donation allowed', value: r.bloodDonation },
    { key: 'transMilitary', label: 'Trans people can serve in military', value: r.transMilitary },
    { key: 'thirdGenderOption', label: 'Third gender / X marker option', value: r.thirdGenderOption },
  ]
})

// Migration-related computed properties
const visaDifficulty = computed(() => {
  if (!curatedInfo.value) return ''
  const visa = curatedInfo.value.digitalNomadVisa || ''
  if (visa.toLowerCase().includes('no specific') || visa.toLowerCase().includes('not available')) return 'Moderate'
  if (visa.toLowerCase().includes('digital nomad') || visa.toLowerCase().includes('freelancer') || visa.toLowerCase().includes('remote work')) return 'Easy (DNV available)'
  if (visa.toLowerCase().includes('work visa') || visa.toLowerCase().includes('express entry')) return 'Moderate (points-based)'
  return 'Varies'
})

const visaDifficultyBadgeClass = computed(() => {
  const v = visaDifficulty.value
  if (v.includes('Easy')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  if (v.includes('Moderate')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
})

const languageInfo = computed(() => {
  if (!selectedCountry.value?.languages?.length) return 'See country dataset'
  const langs = selectedCountry.value.languages
  if (langs.length <= 2) return langs.join(' / ')
  return langs.slice(0, 2).join(' / ') + ` +${langs.length - 2} more`
})

const communityInfo = computed(() => {
  if (!curatedInfo.value) return 'See country guide'
  const safety = curatedInfo.value.safety || 0
  if (safety >= 4) return 'Strong LGBTQ+ community'
  if (safety >= 3) return 'Moderate community presence'
  if (safety >= 2) return 'Limited community — caution advised'
  return 'Hostile environment — exercise extreme caution'
})

// ====== HELPERS ======
function recognitionVariant(val) {
  if (val === 'self-id') return 'green'
  if (val === 'medicalized') return 'yellow'
  if (val === 'banned') return 'red'
  return 'default'
}

function healthcareVariant(val) {
  if (!val) return 'default'
  const v = val.toLowerCase()
  if (v.includes('informed consent')) return 'green'
  if (v.includes('gatekeeping')) return 'yellow'
  if (v.includes('limited') || v.includes('restricted')) return 'red'
  return 'blue'
}

function discriminationVariant(val) {
  if (!val) return 'default'
  const v = val.toLowerCase()
  if (v.includes('comprehensive')) return 'green'
  if (v.includes('partial') || v.includes('limited')) return 'yellow'
  if (v.includes('none')) return 'red'
  return 'blue'
}

function coverageVariant(val) {
  if (val === 'public') return 'green'
  if (val === 'private') return 'yellow'
  return 'red'
}

function coverageLabel(val) {
  if (val === 'public') return 'Covered by public healthcare'
  if (val === 'private') return 'Private insurance only'
  return 'Not covered'
}

function formatNumber(n) {
  if (!n) return ''
  return n.toLocaleString()
}

function scoreClass(score) {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-blue-600 dark:text-blue-400'
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function onInput() {
  showDropdown.value = true
  highlightIndex.value = -1
}

function onBlur() {
  // Delay to let click events fire
  setTimeout(() => { showDropdown.value = false }, 200)
}

function highlightNext() {
  if (!filteredCountries.value.length) return
  highlightIndex.value = (highlightIndex.value + 1) % filteredCountries.value.length
}

function highlightPrev() {
  if (!filteredCountries.value.length) return
  highlightIndex.value = highlightIndex.value <= 0
    ? filteredCountries.value.length - 1
    : highlightIndex.value - 1
}

function selectHighlighted() {
  if (highlightIndex.value >= 0 && highlightIndex.value < filteredCountries.value.length) {
    selectCountry(filteredCountries.value[highlightIndex.value])
  }
}

function selectCountry(country) {
  selectedCountry.value = country
  query.value = country.name
  showDropdown.value = false
  highlightIndex.value = -1
  // Scroll to top of results
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearSearch() {
  query.value = ''
  selectedCountry.value = null
  selectedFromCountry.value = null
  fromQuery.value = ''
  searchInput.value?.focus()
}

// ====== FROM-COUNTRY SEARCH ======
const fromFiltered = computed(() => {
  if (!fromQuery.value) return []
  const q = fromQuery.value.toLowerCase()
  return dataset
    .filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)))
    .slice(0, 10)
})

function onFromInput() {
  showFromDropdown.value = true
  fromHighlightIndex.value = -1
}

function onFromBlur() {
  setTimeout(() => { showFromDropdown.value = false }, 200)
}

function fromHighlightNext() {
  if (!fromFiltered.value.length) return
  fromHighlightIndex.value = (fromHighlightIndex.value + 1) % fromFiltered.value.length
}

function fromHighlightPrev() {
  if (!fromFiltered.value.length) return
  fromHighlightIndex.value = fromHighlightIndex.value <= 0
    ? fromFiltered.value.length - 1
    : fromHighlightIndex.value - 1
}

function selectFromHighlighted() {
  if (fromHighlightIndex.value >= 0 && fromHighlightIndex.value < fromFiltered.value.length) {
    selectFromCountry(fromFiltered.value[fromHighlightIndex.value])
  }
}

function selectFromCountry(country) {
  selectedFromCountry.value = country
  fromQuery.value = country.name
  showFromDropdown.value = false
  fromHighlightIndex.value = -1
}

const passportSuggestion = computed(() => {
  if (!selectedFromCountry.value || !selectedCountry.value) return ''
  const from = selectedFromCountry.value
  const to = selectedCountry.value
  if (from.code === to.code) return "That's your current country!"
  // Simple heuristics based on continents
  const sameContinent = from.continent === to.continent
  const fromEU = from.continent === 'Europe'
  const toEU = to.continent === 'Europe'
  if (fromEU && toEU) return 'As an EU/Schengen area resident, you can move freely between most European countries.'
  // General tips
  const tips = []
  if (from.code === 'US') tips.push('US citizens can visit many countries visa-free for 90 days.')
  if (from.code === 'GB') tips.push('UK citizens can visit many countries visa-free for 90 days (post-Brexit).')
  if (from.code === 'CA') tips.push('Canadian passport holders have visa-free access to many countries.')
  if (from.code === 'AU') tips.push('Australian passport holders have visa-free access to many countries.')
  if (from.code === 'NZ') tips.push('New Zealand passport holders have visa-free access to many countries.')
  if (fromEU && !toEU) tips.push('EU passport holders have visa-free or visa-on-arrival access to many countries.')
  if (tips.length) return tips.join(' ')
  return `Check visa requirements for ${from.name} passport holders traveling to ${to.name}.`
})

// Set last updated
const now = new Date()
lastUpdated.value = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>