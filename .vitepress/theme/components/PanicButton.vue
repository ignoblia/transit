<template>
  <!-- First-time visitor toast notification (3x Escape shortcut) -->
  <Teleport to="body">
    <div
      v-if="showToast"
      id="panic-toast"
      class="fixed top-4 right-4 z-[9999] max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 animate-slide-in"
    >
      <div class="flex items-start gap-3">
        <span class="text-xl flex-shrink-0">🛟</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">Quick Exit Shortcut</p>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Press the <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono border border-gray-300 dark:border-gray-600">Esc</kbd> key
            <strong>3 times within 1 second</strong> to immediately leave this site
            and go to a safe search page.
          </p>
          <button
            @click="dismissToast"
            class="mt-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
        <button
          @click="dismissToast"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ====== CONFIGURATION ======
const ESCAPE_TIMEOUT_MS = 1000    // 1-second window for 3 presses
const ESCAPE_PRESSES_NEEDED = 3
const REDIRECT_URL = 'https://www.google.com/search?q='

// ====== SAFE SEARCH PHRASES ======
const safePhrases = [
  'homework help algebra quadratic equations',
  'how to train a puppy at home',
  'best soccer highlights today champions league',
  'photosynthesis explained for students',
  'minecraft building ideas easy',
  'nba finals highlights 2026',
  'how to bake chocolate chip cookies from scratch',
  'world war 2 summary for school project',
  'cute cat videos compilation funny',
  'how to fix a bike chain at home',
  'study tips for final exams high school',
  'best free online courses for teenagers',
  'how to make slime without borax easy',
  'pokemon scarlet violet walkthrough',
  'solar system facts for science project',
  'easy guitar songs for beginners tabs',
  'how to edit videos on capcut pc',
  'ancient egypt facts for homework',
  'best anime series to watch 2026',
  'how to draw anime eyes step by step',
  'math word problems practice 8th grade',
  'fun science experiments at home with water',
  'how to gain muscle fast for teens',
  'fortnite chapter 6 new weapons guide',
  'how to write a book report middle school',
]

// ====== STATE ======
const showToast = ref(false)
let escapePressTimestamps = []
let toastCheckDone = false

// ====== PANIC LOGIC ======
function getRandomPhrase() {
  return safePhrases[Math.floor(Math.random() * safePhrases.length)]
}

function panicExit() {
  const phrase = getRandomPhrase()
  window.location.replace(REDIRECT_URL + encodeURIComponent(phrase))
}

function handleKeydown(e) {
  if (e.key !== 'Escape') return

  const now = Date.now()
  // Keep only presses within the timeout window
  escapePressTimestamps = escapePressTimestamps.filter(t => now - t < ESCAPE_TIMEOUT_MS)
  escapePressTimestamps.push(now)

  if (escapePressTimestamps.length >= ESCAPE_PRESSES_NEEDED) {
    escapePressTimestamps = [] // reset
    panicExit()
  }
}

// ====== TOAST LOGIC ======
function dismissToast() {
  showToast.value = false
  try {
    localStorage.setItem('panic-toast-dismissed', 'true')
  } catch (_) {}
}

function checkFirstVisit() {
  if (toastCheckDone) return
  toastCheckDone = true
  try {
    const dismissed = localStorage.getItem('panic-toast-dismissed')
    if (dismissed === 'true') return
  } catch (_) {}
  // Delay showing so user sees the page first
  setTimeout(() => {
    showToast.value = true
  }, 1500)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  checkFirstVisit()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>
