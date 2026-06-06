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
        'fmhy': {
          'blue': 'hsl(211, 63%, 61%)',
          'blue-dark': 'hsl(215, 57%, 53%)',
          'blue-darker': 'hsl(220, 48%, 40%)',
          'blue-soft': 'hsl(207, 65%, 68%)',
        },
      },
    },
  },
  plugins: [],
}
