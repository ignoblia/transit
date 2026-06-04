import { navbar, sidebar } from './theme/config.js'

export default {
  title: 'TransIT',
  description: 'A guide for transgender individuals to research and plan moves to safer countries',
  base: '/transit/', // Important for GitHub Pages: <username>.github.io/<repo>/
  outDir: 'docs', // Build output to /docs for GitHub Pages
  themeConfig: {
    // Site logo (optional)
    logo: '/logo.png',
    // Navigation bar
    navbar: navbar,
    // Sidebar
    sidebar: sidebar,
    // Social links (optional)
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ignoblia/transit' }
    ],
    // Edit link (optional)
    editLink: {
      pattern: 'https://github.com/ignoblia/transit/edit/main/:path',
      text: 'Edit this page on GitHub'
    },
    // Last updated text
    lastUpdated: 'Last Updated',
    // Custom theme colors (using Tailwind classes via theme)
  },
  cleanUrls: false, // GitHub Pages needs .html extensions
  markdown: {
    // You can configure markdown-it here if needed
  }
}