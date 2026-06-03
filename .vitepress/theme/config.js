export const navbar = [
  { text: 'Home', link: '/' },
  {
    text: 'Country Guides',
    link: '/europe/', // This will be the first category in the sidebar
    activeMatch: '/europe/' // To highlight when on any europe subpage
  },
  {
    text: 'Global Index',
    link: '/global-index/'
  },
  {
    text: 'Moving Checklists',
    link: '/moving-checklists/'
  }
]

export const sidebar = {
  '/europe/': [
    {
      text: 'Europe',
      collapsed: false,
      items: [
        {
          text: '🇮🇸 Iceland',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/iceland/' },
            { text: 'Legal Rights', link: '/europe/iceland/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/iceland/healthcare' },
            { text: 'Moving There', link: '/europe/iceland/moving-there' }
          ]
        },
        {
          text: '🇪🇸 Spain',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/spain/' },
            { text: 'Legal Rights', link: '/europe/spain/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/spain/healthcare' },
            { text: 'Moving There', link: '/europe/spain/moving-there' }
          ]
        },
        { text: '🇪🇺 EU Trans-Friendly Countries', link: '/europe/eu-trans-friendly' },
        { text: '🗺️ ILGA Resources', link: '/europe/ilga-resources' }
      ]
    }
  ],
  '/global-index/': [
    {
      text: 'Global Index',
      items: [
        { text: 'Comparison Matrix', link: '/global-index/' }
      ]
    }
  ],
  '/moving-checklists/': [
    {
      text: 'Moving Checklists',
      items: [
        { text: 'Step-by-Step Guide', link: '/moving-checklists/' }
      ]
    }
  ]
}