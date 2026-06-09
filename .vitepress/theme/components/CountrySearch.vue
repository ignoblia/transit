<template>
  <div class="max-w-5xl mx-auto pt-6 pb-8 px-4 sm:px-0">
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
          <span class="w-6 h-4 bg-gray-200 rounded flex items-center justify-center text-xs" v-else>?</span>
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

    <!-- Country detail — Bento Box Grid -->
    <div v-if="selectedCountry" class="animate-fade-in">
      
      <!-- Row: Country header (full width) -->
      <div class="bento-card bento-full mb-4">
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
              <span v-if="selectedCountry.population"> · Pop: {{ formatNumber(selectedCountry.population) }}</span>
            </p>
            <p class="text-xs text-gray-400 mt-1">
              <span v-if="selectedCountry.languages?.length">Languages: {{ selectedCountry.languages.join(', ') }}</span>
              <span v-if="curatedInfo?.languageNote"> · {{ curatedInfo.languageNote.split('.')[0] }}.</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Bento grid: 2 columns on desktop -->
      <div class="bento-grid">
        
        <!-- Equality Index card (spans full width) -->
        <div v-if="selectedCountry.ei !== undefined" class="bento-card bento-span-2">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            <span class="mr-2">🏳️‍⚧️</span> Equality Index
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div class="text-4xl font-bold" :class="scoreClass(selectedCountry.ei)">{{ selectedCountry.ei }}</div>
              <div class="text-xs text-gray-500 mt-1">Overall Score</div>
            </div>
            <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">{{ selectedCountry.ei_legal ?? '-' }}</div>
              <div class="text-xs text-gray-500 mt-1">Legal Score</div>
            </div>
            <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div class="text-4xl font-bold text-purple-600 dark:text-purple-400">{{ selectedCountry.ei_po ?? '-' }}</div>
              <div class="text-xs text-gray-500 mt-1">Public Opinion</div>
            </div>
          </div>
          <p v-if="selectedCountry.rank" class="text-xs text-gray-400 mt-3 text-center">
            Rank: #{{ selectedCountry.rank }} of 197
          </p>
        </div>

        <!-- Rights Checklist (always shown; uses curated data if available) -->
        <div class="bento-card">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            <span class="mr-2">🏳️‍⚧️</span> Rights Checklist
          </h3>

          <template v-if="curatedInfo">
            <!-- Summary badges -->
            <div class="grid grid-cols-1 gap-2 mb-4">
              <div class="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                <span class="text-xs uppercase tracking-wider text-gray-500">Recognition</span>
                <Badge :variant="recognitionVariant(curatedInfo.rights.legalRecognition)">
                  {{ curatedInfo.rights.legalRecognitionLabel }}
                </Badge>
              </div>
              <div class="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                <span class="text-xs uppercase tracking-wider text-gray-500">Healthcare</span>
                <Badge :variant="healthcareVariant(curatedInfo.rights.healthcareLabel)">
                  {{ curatedInfo.rights.healthcareLabel }}
                </Badge>
              </div>
              <div class="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                <span class="text-xs uppercase tracking-wider text-gray-500">Anti-Discrimination</span>
                <Badge :variant="discriminationVariant(curatedInfo.rights.antiDiscriminationLabel)">
                  {{ curatedInfo.rights.antiDiscriminationLabel }}
                </Badge>
              </div>
            </div>

            <!-- Checklist items in compact 2-col -->
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div v-for="item in rightsList" :key="item.key" class="flex items-center gap-2">
                <span class="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                      :class="item.value ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'">
                  {{ item.value ? '✓' : '✗' }}
                </span>
                <span class="text-xs text-gray-700 dark:text-gray-300 leading-tight">{{ item.label }}</span>
              </div>
            </div>

            <!-- Healthcare coverage & Safety -->
            <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <div class="flex items-center gap-2 text-xs">
                <span class="uppercase tracking-wider text-gray-500">Healthcare:</span>
                <Badge :variant="coverageVariant(curatedInfo.rights.healthcareCoverage)">
                  {{ coverageLabel(curatedInfo.rights.healthcareCoverage) }}
                </Badge>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="uppercase tracking-wider text-gray-500">Safety:</span>
                <span v-for="i in 5" :key="i" class="text-sm leading-none">
                  {{ i <= (curatedInfo.safety || 0) ? '⭐' : '☆' }}
                </span>
              </div>
            </div>

            <p v-if="curatedInfo.notes" class="mt-3 text-xs text-gray-600 dark:text-gray-400 italic">
              {{ curatedInfo.notes }}
            </p>
          </template>

          <!-- Fallback when no curated data -->
          <template v-else>
            <div class="text-center py-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Detailed trans rights data is not yet curated for this country.
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Check the <strong>Equality Index</strong> score above and the
                <strong>Relocation Index</strong> to the right for a general quality-of-life overview.
              </p>
              <div class="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 inline-block">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  Equaldex Rank: <strong class="text-gray-700 dark:text-gray-200">#{{ selectedCountry.rank || 'N/A' }}</strong> of 197
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- Relocation Index (always shown) -->
        <div class="bento-card">
          <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            <span class="mr-2">📊</span> Relocation Index
          </h3>

          <template v-if="relocInfo && !wnLoading">
            <div class="flex items-center gap-3 mb-3">
              <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">{{ relocInfo.composite_score }}</div>
              <div class="text-xs text-gray-500">
                <div>Overall Score</div>
                <div>Rank #{{ relocInfo.rank }} of 95</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="dim in dimensions" :key="dim.key"
                   class="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div class="text-base font-bold" :class="dimScoreClass(relocInfo[dim.key], dim.key)">{{ dimDisplayVal(relocInfo[dim.key], dim.key) }}</div>
                <div class="text-[10px] text-gray-500 mt-0.5">{{ dim.label }}</div>
                <div class="mt-1 h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="dimBarClass(relocInfo[dim.key], dim.key)"
                       :style="{ width: dimDisplayVal(relocInfo[dim.key], dim.key) + '%' }"></div>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="wnLoading">
            <div class="flex items-center justify-center py-8">
              <span class="text-sm text-gray-400 animate-pulse">Loading relocation data...</span>
            </div>
          </template>

          <template v-else>
            <div class="text-center py-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Relocation quality-of-life data is not available for this country.
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Use the <strong>Equality Index</strong> as a proxy for trans-specific quality of life.
              </p>
            </div>
          </template>
        </div>

        <!-- Cost of Living (always shown) -->
        <div class="bento-card">
          <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            <span class="mr-2">💰</span> Cost of Living
          </h3>

          <template v-if="costInfo">
            <!-- Monthly estimate (big) -->
            <div class="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-3">
              <div v-if="costInfo.monthly_estimate_usd" class="text-3xl font-bold text-gray-900 dark:text-gray-100">${{ costInfo.monthly_estimate_usd }}</div>
              <div class="text-xs text-gray-500 mt-1">Monthly Estimate (USD)</div>
            </div>

            <!-- Rank + Salary -->
            <div class="grid grid-cols-2 gap-2 mb-3">
              <div class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ costInfo.rank ?? '-' }}</div>
                <div class="text-[10px] text-gray-500">Rank (1=cheapest)</div>
              </div>
              <div v-if="salaryInfo" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">${{ formatNumber(salaryInfo.medianNetUSD) }}</div>
                <div class="text-[10px] text-gray-500">Median Salary/yr</div>
              </div>
              <div v-else class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-lg font-bold text-gray-400">—</div>
                <div class="text-[10px] text-gray-500">Median Salary/yr</div>
              </div>
            </div>

            <!-- Salary coverage -->
            <div v-if="costInfo.monthly_estimate_usd && salaryInfo?.medianNetUSD" class="mt-2 mb-3 text-[11px] text-gray-500 text-center">
              Salary covers ~{{ Math.round(salaryInfo.medianNetUSD / costInfo.monthly_estimate_usd) }} months of expenses
            </div>

            <!-- Cost breakdown indexes -->
            <div class="grid grid-cols-2 gap-2">
              <div v-if="costInfo.rent_index != null" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-base font-bold" :class="indexColor(costInfo.rent_index, 'cost')">{{ costInfo.rent_index }}</div>
                <div class="text-[10px] text-gray-500">Rent Index</div>
                <div class="mt-0.5 h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div class="h-full rounded-full" :class="costBarClass(costInfo.rent_index, 'cost')" :style="{ width: costInfo.rent_index + '%' }"></div>
                </div>
              </div>
              <div v-if="costInfo.utilities_index != null" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-base font-bold" :class="indexColor(costInfo.utilities_index, 'cost')">{{ costInfo.utilities_index }}</div>
                <div class="text-[10px] text-gray-500">Utilities</div>
                <div class="mt-0.5 h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div class="h-full rounded-full" :class="costBarClass(costInfo.utilities_index, 'cost')" :style="{ width: costInfo.utilities_index + '%' }"></div>
                </div>
              </div>
              <div v-if="costInfo.transport_index != null" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-base font-bold" :class="indexColor(costInfo.transport_index, 'cost')">{{ costInfo.transport_index }}</div>
                <div class="text-[10px] text-gray-500">Transport</div>
                <div class="mt-0.5 h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div class="h-full rounded-full" :class="costBarClass(costInfo.transport_index, 'cost')" :style="{ width: costInfo.transport_index + '%' }"></div>
                </div>
              </div>
              <div v-if="costInfo.grocery_index != null" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                <div class="text-base font-bold" :class="indexColor(costInfo.grocery_index, 'cost')">{{ costInfo.grocery_index }}</div>
                <div class="text-[10px] text-gray-500">Groceries</div>
                <div class="mt-0.5 h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div class="h-full rounded-full" :class="costBarClass(costInfo.grocery_index, 'cost')" :style="{ width: costInfo.grocery_index + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="mt-3 text-[10px] text-gray-400 text-center">
              Source: WhereNext (CC BY 4.0) · Lower index = cheaper
            </div>
          </template>

          <template v-else-if="wnLoading">
            <div class="flex items-center justify-center py-8">
              <span class="text-sm text-gray-400 animate-pulse">Loading cost data...</span>
            </div>
          </template>

          <template v-else>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Cost of living data is not available for this country.
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Check these sites for cost estimates:
              </p>
              <div class="flex flex-col gap-2.5">
                <a href="https://www.numbeo.com/cost-of-living/" target="_blank" rel="noopener"
                   class="block w-full py-3 rounded-xl text-sm font-medium text-center bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 transition-colors">
                  🌐  Numbeo — Compare city living costs
                </a>
                <a href="https://www.expatistan.com/cost-of-living" target="_blank" rel="noopener"
                   class="block w-full py-3 rounded-xl text-sm font-medium text-center bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 transition-colors">
                  📊  Expatistan — User-reported prices
                </a>
                <a href="https://livingcost.org/" target="_blank" rel="noopener"
                   class="block w-full py-3 rounded-xl text-sm font-medium text-center bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 transition-colors">
                  💰  LivingCost — Monthly budget breakdown
                </a>
              </div>
            </div>
          </template>
        </div>

        <!-- Quick Facts (fills gap next to Cost of Living) -->
        <div class="bento-card">
          <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            <span class="mr-2">📋</span> Quick Facts
          </h3>
          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-gray-500 dark:text-gray-400">Capital</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-right">{{ selectedCountry.capital || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-gray-500 dark:text-gray-400">Population</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-right">{{ formatNumber(selectedCountry.population) || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-gray-500 dark:text-gray-400">Languages</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-right">{{ selectedCountry.languages?.join(', ') || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-gray-500 dark:text-gray-400">Currency</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-right text-xs leading-tight">
                {{ toCurrencyCode ? formatCurrencyFull(toCurrencyCode) : (selectedCountry.currencies || 'N/A') }}
              </span>
            </div>
            <div v-if="exchangeRate && fromCurrencyCode && toCurrencyCode && fromCurrencyCode !== toCurrencyCode"
                 class="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
              <span class="text-xs text-gray-500 dark:text-gray-400">1 {{ fromCurrencyCode }} =</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-xs">
                {{ exchangeRate.toFixed(4) }} {{ toCurrencyCode }}
                <span v-if="currencyInfo[toCurrencyCode]" class="text-gray-500"> ({{ currencyInfo[toCurrencyCode].symbol }})</span>
              </span>
            </div>
            <div v-else-if="exchangeLoading && fromCurrencyCode && toCurrencyCode"
                 class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-xs text-gray-400 animate-pulse">Loading exchange rate...</span>
            </div>
            <div v-else-if="detectingCountry && !fromCurrencyCode"
                 class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-xs text-gray-400 animate-pulse">Detecting your location...</span>
            </div>
            <div v-else-if="fromCurrencyCode && toCurrencyCode && fromCurrencyCode === toCurrencyCode"
                 class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-xs text-gray-500 dark:text-gray-400">Same currency</span>
              <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">1:1</span>
            </div>
            <div v-else-if="!fromCurrencyCode && !detectingCountry"
                 class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-xs text-gray-400">Type a from-country above for exchange rate</span>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-gray-500 dark:text-gray-400">Region</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-right">{{ selectedCountry.subregion || selectedCountry.region || selectedCountry.continent }}</span>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <span class="text-gray-500 dark:text-gray-400">Continent</span>
              <span class="font-medium text-gray-900 dark:text-gray-100 text-right">{{ selectedCountry.continent }}</span>
            </div>
          </div>
        </div>

        <!-- Migration & Living (spans full width) -->
        <div class="bento-card bento-span-2">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            <span class="mr-2">✈️</span> Migration &amp; Living
          </h3>

          <!-- Your location input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
          <div v-if="selectedCountry.code" class="space-y-3 text-sm">

            <!-- Destination header -->
            <div class="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
              <span class="text-blue-600 dark:text-blue-400 font-medium">📍 Moving to {{ selectedCountry.name }}</span>
              <span v-if="curatedInfo?.euFreeMovement" class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                EU Free Movement
              </span>
            </div>

            <!-- 2x2 info grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Visa & Residency</div>
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ curatedInfo?.digitalNomadVisa || 'Standard visa/residency pathways' }}
                </div>
                <div v-if="visaDifficulty" class="mt-1">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        :class="visaDifficultyBadgeClass">{{ visaDifficulty }}</span>
                </div>
                <div v-if="curatedInfo?.resourceLinks?.immigration" class="mt-1.5">
                  <a :href="curatedInfo.resourceLinks.immigration" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    🛂 Immigration portal →
                  </a>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Healthcare Access</div>
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ curatedInfo?.rights?.healthcareLabel || 'See Rights Checklist' }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Coverage: <Badge :variant="coverageVariant(curatedInfo?.rights?.healthcareCoverage)" class="text-[11px]">
                    {{ coverageLabel(curatedInfo?.rights?.healthcareCoverage) }}
                  </Badge>
                </div>
                <div v-if="curatedInfo?.resourceLinks?.transHealthcare" class="mt-1.5">
                  <a :href="curatedInfo.resourceLinks.transHealthcare" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    🏥 Healthcare system →
                  </a>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Language</div>
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ curatedInfo?.languageNote || languageInfo }}
                </div>
                <div v-if="curatedInfo?.resourceLinks?.languageLearning" class="mt-1.5">
                  <a :href="curatedInfo.resourceLinks.languageLearning" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    📚 Learn the language →
                  </a>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div class="text-xs uppercase tracking-wider text-gray-500 mb-1">Community</div>
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">{{ communityInfo }}</div>
                <div v-if="curatedInfo?.resourceLinks?.community" class="mt-1.5">
                  <a :href="curatedInfo.resourceLinks.community" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    🏳️‍🌈 LGBTQ+ organisation →
                  </a>
                </div>
                <div v-if="curatedInfo?.resourceLinks?.housing" class="mt-1">
                  <a :href="curatedInfo.resourceLinks.housing" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    🏠 Housing →
                  </a>
                </div>
              </div>
            </div>

            <!-- Visa info from WhereNext API -->
            <div v-if="visaLoading" class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-500">
              <span class="inline-block animate-pulse">Loading visa information...</span>
            </div>
            <div v-else-if="visaApiData" class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-sm">🛂 Visa Pathways</span>
                <span v-if="visaApiData.confidence === 'high'" class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Verified</span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ visaApiData.answer }}</p>
              <div v-if="visaApiData.facts?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div v-for="fact in visaApiData.facts" :key="fact.label"
                     class="flex items-start gap-2 text-xs p-2 rounded bg-white/50 dark:bg-gray-800/50">
                  <span class="text-blue-500 mt-0.5">•</span>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{ fact.label }}:</span>
                    <span class="text-gray-600 dark:text-gray-400"> {{ fact.value }}{{ fact.unit ? ' ' + fact.unit : '' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="visaApiData.citations?.length" class="mt-2 text-[10px] text-gray-400">
                <span>Sources: </span>
                <a v-for="(citation, ci) in visaApiData.citations" :key="ci"
                   :href="citation.url" target="_blank" rel="noopener"
                   class="underline hover:text-blue-500 mr-2">{{ citation.label }}</a>
              </div>
            </div>
            <div v-else-if="visaError" class="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50">
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
        
      </div><!-- /bento-grid -->
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
import { ref, computed, onMounted, watch } from 'vue'
import dataset from '../generated/country-dataset.json'
import curatedInfoMap from '../generated/curated-country-info.json'
import colDataRaw from '../generated/col-data.json'

// ====== COST OF LIVING DATA ======
// Primary: generated col-data.json (from pipeline, cached)
// Fallback: WhereNext direct API fetch
const WHERENEXT_BASE = 'https://getwherenext.com'
const whereNextCostIndex = ref([])
const whereNextRelocIndex = ref([])
const whereNextSalaries = ref([])
const wnLoading = ref(true)
const wnError = ref('')

// Build a map from the generated col-data.json (keyed by ISO2 code)
const colMap = computed(() => {
  const map = {}
  if (colDataRaw && typeof colDataRaw === 'object') {
    for (const [code, data] of Object.entries(colDataRaw)) {
      map[code.toUpperCase()] = {
        monthly_estimate_usd: data.monthlyEstimateUSD,
        rent_index: data.rentIndex,
        utilities_index: data.utilitiesIndex,
        transport_index: data.transportIndex,
        cost_index: data.costOfLivingIndex,
        grocery_index: data.groceriesIndex,
        rank: data.rank,
        region: data.region,
        country: data.countryName,
        source: data.source || 'generated',
      }
    }
  }
  return map
})

async function fetchWhereNextData() {
  try {
    const [costRes, relocRes, salRes] = await Promise.all([
      fetch(`${WHERENEXT_BASE}/api/data/cost-of-living`),
      fetch(`${WHERENEXT_BASE}/api/data/relocation-index`),
      fetch(`${WHERENEXT_BASE}/api/data/median-salaries`).then(r => r.ok ? r.json() : { countries: [] }),
    ])
    const costData = await costRes.json()
    const relocData = await relocRes.json()
    whereNextCostIndex.value = costData.data || []
    whereNextRelocIndex.value = relocData.data || []
    whereNextSalaries.value = (salRes.countries || [])
  } catch (e) {
    wnError.value = 'Could not load relocation data'
    console.warn('[WhereNext]', e)
  } finally {
    wnLoading.value = false
  }
}

onMounted(async () => {
  fetchWhereNextData()
  await autoDetectUserCountry()
})

// ====== AUTO-DETECT USER COUNTRY ======
const detectingCountry = ref(true)

async function autoDetectUserCountry() {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const countryCode = data.country_code
    if (!countryCode) return
    // Find the country in the dataset by ISO code
    const match = dataset.find(c => c.code === countryCode)
    if (match && !selectedFromCountry.value) {
      selectedFromCountry.value = match
      fromQuery.value = match.name
    }
  } catch (e) {
    // Silently fail — user can still type their country manually
    console.info('[Auto-detect] Could not detect country:', e.message)
  } finally {
    detectingCountry.value = false
  }
}

// ====== VISA API STATE ======
const visaApiData = ref(null)
const visaLoading = ref(false)
const visaError = ref('')

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

// ====== CURRENCY DATA ======
const currencyInfo = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound Sterling', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr' },
  DKK: { name: 'Danish Krone', symbol: 'kr' },
  ISK: { name: 'Icelandic Króna', symbol: 'kr' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  ARS: { name: 'Argentine Peso', symbol: '$' },
  THB: { name: 'Thai Baht', symbol: '฿' },
  TWD: { name: 'New Taiwan Dollar', symbol: 'NT$' },
  KRW: { name: 'South Korean Won', symbol: '₩' },
  ILS: { name: 'Israeli New Shekel', symbol: '₪' },
  ZAR: { name: 'South African Rand', symbol: 'R' },
  MXN: { name: 'Mexican Peso', symbol: 'Mex$' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  PLN: { name: 'Polish Złoty', symbol: 'zł' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft' },
  RON: { name: 'Romanian Leu', symbol: 'lei' },
  BGN: { name: 'Bulgarian Lev', symbol: 'лв' },
  HRK: { name: 'Croatian Kuna', symbol: 'kn' },
  UYU: { name: 'Uruguayan Peso', symbol: '$U' },
  CLP: { name: 'Chilean Peso', symbol: '$' },
  COP: { name: 'Colombian Peso', symbol: '$' },
  PEN: { name: 'Peruvian Sol', symbol: 'S/.' },
  PHP: { name: 'Philippine Peso', symbol: '₱' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp' },
  VND: { name: 'Vietnamese Đồng', symbol: '₫' },
  NGN: { name: 'Nigerian Naira', symbol: '₦' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼' },
}

const exchangeRate = ref(null)
const exchangeLoading = ref(false)
const exchangeError = ref('')

function getCurrencyCode(country) {
  if (!country?.currencies) return null
  if (Array.isArray(country.currencies)) return country.currencies[0]?.trim() || null
  if (typeof country.currencies === 'string') return country.currencies.split(',')[0].trim()
  return null
}

function formatCurrencyFull(code) {
  if (!code) return ''
  const info = currencyInfo[code]
  return info ? `${info.name} (${info.symbol})` : code
}

const fromCurrencyCode = computed(() => getCurrencyCode(selectedFromCountry.value))
const toCurrencyCode = computed(() => getCurrencyCode(selectedCountry.value))

// Fetch exchange rate when both from/to currencies are known
watch([fromCurrencyCode, toCurrencyCode], async ([fromCur, toCur]) => {
  exchangeRate.value = null
  exchangeError.value = ''
  if (!fromCur || !toCur || fromCur === toCur) return
  exchangeLoading.value = true
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${fromCur}&to=${toCur}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    exchangeRate.value = data.rates?.[toCur] || null
  } catch (e) {
    exchangeError.value = 'Could not fetch exchange rate'
    console.warn('[Exchange Rate]', e)
  } finally {
    exchangeLoading.value = false
  }
})

// Watch both from-country and selected-country to fetch visa data from WhereNext
watch([selectedFromCountry, selectedCountry], async ([from, to]) => {
  visaApiData.value = null
  visaError.value = ''
  if (!from || !to || from.code === to.code) return
  visaLoading.value = true
  try {
    const res = await fetch(
      `${WHERENEXT_BASE}/api/answers/visa?passport=${from.code}&destination=${to.code}`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    visaApiData.value = await res.json()
  } catch (e) {
    visaError.value = 'Could not fetch visa details'
    console.warn('[Visa API]', e)
  } finally {
    visaLoading.value = false
  }
})

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

// ====== WHERENEXT COMPUTED ======
const dimensions = [
  { key: 'cost', label: 'Cost' },
  { key: 'safety', label: 'Safety' },
  { key: 'healthcare', label: 'Health' },
  { key: 'education', label: 'Education' },
  { key: 'career', label: 'Career' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'infrastructure', label: 'Infrastructure' },
]

function dimScoreClass(val, key) {
  if (key === 'cost') {
    if (val <= 30) return 'text-green-600 dark:text-green-400'
    if (val <= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
  if (val >= 70) return 'text-green-600 dark:text-green-400'
  if (val >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function dimBarClass(val, key) {
  if (key === 'cost') {
    if (val <= 30) return 'bg-green-500'
    if (val <= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  if (val >= 70) return 'bg-green-500'
  if (val >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function dimDisplayVal(val, key) {
  if (key === 'cost') return Math.round(100 - val)
  return val
}

// For cost breakdown indexes (WhereNext scale: lower = cheaper)
function indexColor(val, key) {
  if (key === 'cost') {
    if (val <= 33) return 'text-green-600 dark:text-green-400'
    if (val <= 66) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
  return 'text-gray-900 dark:text-gray-100'
}

function costBarClass(val, key) {
  if (key === 'cost') {
    if (val <= 33) return 'bg-green-500'
    if (val <= 66) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  return 'bg-blue-500'
}

const costInfo = computed(() => {
  if (!selectedCountry.value) return null
  const code = selectedCountry.value.code.toUpperCase()
  // 1. Check generated COL data first (cached, reliable)
  if (colMap.value[code]) return colMap.value[code]
  // 2. Fallback to WhereNext direct fetch (case-insensitive)
  return whereNextCostIndex.value.find(c => (c.country_code || '').toUpperCase() === code) || null
})

const relocInfo = computed(() => {
  if (!selectedCountry.value) return null
  const code = selectedCountry.value.code.toLowerCase()
  return whereNextRelocIndex.value.find(c => c.country_code === code) || null
})

const salaryInfo = computed(() => {
  if (!selectedCountry.value) return null
  const code = selectedCountry.value.code
  return whereNextSalaries.value.find(s => s.code === code) || null
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
  if (n === null || n === undefined || n === '') return ''
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(num)) return ''
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
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
  const sameContinent = from.continent === to.continent
  const fromEU = from.continent === 'Europe'
  const toEU = to.continent === 'Europe'
  if (fromEU && toEU) return 'As an EU/Schengen area resident, you can move freely between most European countries.'
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

const now = new Date()
lastUpdated.value = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<style scoped>
/* ---- Bento grid layout ---- */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Bento card base */
.bento-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 1rem;
  padding: 1.25rem;
  transition: box-shadow 0.2s ease;
}

.bento-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

html.dark .bento-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

/* Span helpers */
.bento-span-2 {
  grid-column: 1 / -1;
}

/* Full-width utility */
.bento-full {
  grid-column: 1 / -1;
}

/* ---- Fade-in animation ---- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
