<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Overall Score</th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Legal</th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Public Opinion</th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bar</th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="country in filteredCountries" :key="country.region_id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20': highlightCodes.includes(country.region_id) }">
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            #{{ country.rank }}
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
            <a :href="countryLink(country)" class="hover:text-blue-600 dark:hover:text-blue-400">
              {{ countryName(country) }}
            </a>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
            <span :class="scoreClass(country.ei)" class="font-bold">
              {{ country.ei }}
            </span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
            {{ country.ei_legal ?? '-' }}
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
            {{ country.ei_po ?? '-' }}
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 min-w-[80px]">
              <div class="h-2.5 rounded-full transition-all duration-500" 
                   :class="scoreBarClass(country.ei)"
                   :style="{ width: country.ei + '%' }"></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import equalityData from '../generated/equality-index.json'

const props = defineProps({
  highlightCodes: { type: Array, default: () => [] },
  topN: { type: Number, default: 0 },
})



// Map known codes to display names
function countryName(country) {
  const names = {
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
  return names[country.region_id] || country.name || country.region_id
}

function countryLink(country) {
  const name = countryName(country).toLowerCase().replace(/\s+/g, '-')
  return `/transit/explorer/#${name}`
}

function scoreClass(score) {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-blue-600 dark:text-blue-400'
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function scoreBarClass(score) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const filteredCountries = computed(() => {
  let list = equalityData
  if (props.topN > 0) {
    list = list.slice(0, props.topN)
  }
  
  return list
})
</script>