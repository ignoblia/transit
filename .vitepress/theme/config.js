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
        { text: 'Iceland', link: '/europe/iceland' },
        { text: 'Spain', link: '/europe/spain' },
        { text: 'EU Trans-Friendly Countries', link: '/europe/eu-trans-friendly' }
      ]
    }
  ],
  // We can add more regions as needed, but for now we focus on Europe
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