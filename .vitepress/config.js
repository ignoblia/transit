import { navbar, sidebar } from './theme/config.js'

export default {
  title: 'TransIT',
  description: 'A guide for transgender individuals to research and plan moves to safer countries',
  base: '/transit/', // Important for GitHub Pages: <username>.github.io/<repo>/
  outDir: 'docs', // Build output to /docs for GitHub Pages
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/transit/favicon.svg?v=2' }],
  ],
  themeConfig: {
    // Site logo (optional)
    logo: '/logo.svg',
    // Navigation bar
    navbar: navbar,
    // Sidebar (disabled)
    sidebar: false,
    // Social links (optional)
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ignoblia/transit' }
    ],
    // Edit link (optional)
    editLink: {
      pattern: 'https://github.com/ignoblia/transit/edit/main/:path',
      text: 'Edit this page on GitHub'
    },
    // Local search (like FMHY)
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search'
          }
        }
      }
    },
    // Last updated text
    lastUpdated: 'Last Updated',
  },
  cleanUrls: false, // GitHub Pages needs .html extensions
  ignoreDeadLinks: true, // Allow directory-style internal links without dead link failures
  markdown: {
    // You can configure markdown-it here if needed
  }
}