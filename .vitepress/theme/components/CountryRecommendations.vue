<template>
  <div class="space-y-10">
    <div v-for="cont in sortedContinents" :key="cont.name" class="animate-fade-in">
      <h2 :id="cont.anchor" class="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span>{{ cont.emoji }}</span>
        <span>{{ cont.name }}</span>
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Top {{ cont.countries.length }})</span>
      </h2>

      <!-- Ranked list -->
      <div class="grid gap-3">
        <div v-for="(c, i) in cont.countries" :key="c.code"
             class="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
          <!-- Rank number -->
          <span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                :class="rankClass(i)">
            {{ i + 1 }}
          </span>

          <!-- Flag -->
          <img v-if="c.flag" :src="c.flag" :alt="c.flagAlt || c.name" class="w-7 h-auto rounded" loading="lazy" />

          <!-- Country name + EI score -->
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ c.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ c.capital || '' }}</div>
          </div>

          <!-- EI Score badge -->
          <div class="flex-shrink-0 text-center min-w-[60px]">
            <div class="text-lg font-bold" :class="scoreTextClass(c.ei)">{{ c.ei }}</div>
            <div class="text-xs text-gray-400">score</div>
          </div>

          <!-- Trans rights highlights (from curated) -->
          <div class="flex-shrink-0 hidden md:flex items-center gap-1.5">
            <Badge v-if="curatedMap[c.code]" :variant="recognitionBadge(curatedMap[c.code].rights.legalRecognition)" class="text-[11px]">
              {{ labelShort(curatedMap[c.code].rights.legalRecognition) }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dataset from '../generated/country-dataset.json'
import curatedRaw from '../generated/curated-country-info.json'

// Build a map of curated data by country code
const curatedMap = {}
if (Array.isArray(curatedRaw)) {
  curatedRaw.forEach(c => { curatedMap[c.code] = c })
}

// Continent emoji map
const continentMeta = {
  Europe: { emoji: '🌍', anchor: 'europe' },
  'North America': { emoji: '🌎', anchor: 'north-america' },
  'South America': { emoji: '🌎', anchor: 'south-america' },
  Asia: { emoji: '🌏', anchor: 'asia' },
  Africa: { emoji: '🌍', anchor: 'africa' },
  Oceania: { emoji: '🌏', anchor: 'oceania' },
  Antarctica: { emoji: '🧊', anchor: 'antarctica' },
}

// Group dataset by continent, sort by EI, take top 10
const continentGroups = computed(() => {
  const groups = {}
  dataset.forEach(c => {
    const cont = c.continent || 'Unknown'
    if (!groups[cont]) groups[cont] = []
    groups[cont].push(c)
  })
  // Sort each group by EI descending
  Object.keys(groups).forEach(k => {
    groups[k].sort((a, b) => b.ei - a.ei)
    groups[k] = groups[k].slice(0, 10)
  })
  return groups
})

// Sort continents by their top country's score (or alphabetically)
const sortedContinents = computed(() => {
  const metaKeys = Object.keys(continentMeta)
  const entries = Object.entries(continentGroups.value)
    .filter(([, list]) => list.length > 0)
    .map(([name, countries]) => ({
      name,
      countries,
      anchor: continentMeta[name]?.anchor || name.toLowerCase().replace(/\s+/g, '-'),
      emoji: continentMeta[name]?.emoji || '🌐',
      topScore: countries[0]?.ei || 0,
    }))
  // Sort Europe first, then by top score descending
  entries.sort((a, b) => {
    if (a.name === 'Europe') return -1
    if (b.name === 'Europe') return 1
    return b.topScore - a.topScore
  })
  return entries
})

function rankClass(i) {
  if (i === 0) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  if (i === 1) return 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
  if (i === 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  return 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
}

function scoreTextClass(score) {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-blue-600 dark:text-blue-400'
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function recognitionBadge(val) {
  if (val === 'self-id') return 'green'
  if (val === 'medicalized') return 'yellow'
  return 'red'
}

function labelShort(val) {
  if (val === 'self-id') return 'Self-ID'
  if (val === 'medicalized') return 'Medical'
  if (val === 'banned') return 'Banned'
  return ''
}
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
