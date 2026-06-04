export const navbar = [
  { text: 'Home', link: '/' },
  {
    text: 'Explorer',
    link: '/explorer/'
  },
  {
    text: 'Recommendations',
    link: '/recommendations/'
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
  '/recommendations/': [
    {
      text: 'Top Country Recommendations',
      items: [
        { text: '🌍 Overview', link: '/recommendations/' }
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