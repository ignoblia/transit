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
    text: 'Guides', 
    items: [
      { text: 'Moving Checklists', link: '/moving-checklists/' },
      { text: 'I Need to Leave Now', link: '/emergency/' },
      { text: 'Asylum Pathway', link: '/asylum/' },
      { text: '12–24 Month Countdown', link: '/prepare/' },
      { text: 'Your First Year', link: '/after/' }
    ]
  },
  {
    text: 'Countries',
    link: '/countries/'
  }
]

export const sidebar = {
  '/recommendations/': [
    {
      text: 'Top Country Recommendations',
      items: [
        { text: 'Overview', link: '/recommendations/' }
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
  ],
  '/emergency/': [
    {
      text: 'Emergency',
      items: [
        { text: 'Leave Now Guide', link: '/emergency/' }
      ]
    }
  ],
  '/asylum/': [
    {
      text: 'Asylum',
      items: [
        { text: 'Asylum Pathway', link: '/asylum/' }
      ]
    }
  ],
  '/prepare/': [
    {
      text: 'Preparation',
      items: [
        { text: '12–24 Month Countdown', link: '/prepare/' }
      ]
    }
  ],
  '/after/': [
    {
      text: 'After Arrival',
      items: [
        { text: 'Your First Year', link: '/after/' }
      ]
    }
  ],
  '/countries/': [
    {
      text: 'Country Profiles',
      items: [
        { text: 'Iceland', link: '/countries/iceland/' },
        { text: 'Spain', link: '/countries/spain/' },
        { text: 'Portugal', link: '/countries/portugal/' },
        { text: 'Germany', link: '/countries/germany/' },
        { text: 'Argentina', link: '/countries/argentina/' },
        { text: 'New Zealand', link: '/countries/new-zealand/' },
        { text: 'Finland', link: '/countries/finland/' },
        { text: 'Netherlands', link: '/countries/netherlands/' },
        { text: 'Canada', link: '/countries/canada/' },
        { text: 'Malta', link: '/countries/malta/' },
        { text: 'Taiwan', link: '/countries/taiwan/' },
        { text: 'Japan', link: '/countries/japan/' },
        { text: 'South Africa', link: '/countries/south-africa/' },
        { text: 'Brazil', link: '/countries/brazil/' },
        { text: 'Thailand', link: '/countries/thailand/' }
      ]
    }
  ]
}
