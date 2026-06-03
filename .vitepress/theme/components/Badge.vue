<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  }
})

const variantClasses = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 mb-2'
  return `${base} ${variantClasses[props.variant] || variantClasses.default}`
})
</script>