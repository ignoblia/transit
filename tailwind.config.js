/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './.vitepress/**/*.{js,ts,vue}',
    './index.md',
    './explorer.md',
    './recommendations.md',
    './global-index.md',
    './moving-checklists.md',
  ],
  theme: {
    extend: {
      colors: {
        'trans-pink': '#f7a9b8',
        'trans-blue': '#a9d6e5',
        'trans-white': '#ffffff',
      },
    },
  },
  plugins: [],
}