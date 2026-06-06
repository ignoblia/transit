/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
        // Trans Pride flag palette
        'trans': {
          'blue': '#5BCFFA',
          'pink': '#F5A9B8',
          'white': '#FFFFFF',
          'blue-dark': '#3BA8D4',
          'pink-dark': '#D48696',
        },
      },
    },
  },
  plugins: [],
}
