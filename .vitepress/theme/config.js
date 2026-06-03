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
        { text: '🇪🇺 EU Overview', link: '/europe/eu-trans-friendly' },
        { text: '🗺️ ILGA Resources', link: '/europe/ilga-resources' },
        '---',
        {
          text: '🇦🇹 Austria',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/austria/' },
            { text: 'Legal Rights', link: '/europe/austria/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/austria/healthcare' },
            { text: 'Moving There', link: '/europe/austria/moving-there' }
          ]
        },
        {
          text: '🇧🇪 Belgium',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/belgium/' },
            { text: 'Legal Rights', link: '/europe/belgium/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/belgium/healthcare' },
            { text: 'Moving There', link: '/europe/belgium/moving-there' }
          ]
        },
        {
          text: '🇧🇬 Bulgaria',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/bulgaria/' },
            { text: 'Legal Rights', link: '/europe/bulgaria/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/bulgaria/healthcare' },
            { text: 'Moving There', link: '/europe/bulgaria/moving-there' }
          ]
        },
        {
          text: '🇭🇷 Croatia',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/croatia/' },
            { text: 'Legal Rights', link: '/europe/croatia/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/croatia/healthcare' },
            { text: 'Moving There', link: '/europe/croatia/moving-there' }
          ]
        },
        {
          text: '🇨🇾 Cyprus',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/cyprus/' },
            { text: 'Legal Rights', link: '/europe/cyprus/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/cyprus/healthcare' },
            { text: 'Moving There', link: '/europe/cyprus/moving-there' }
          ]
        },
        {
          text: '🇨🇿 Czech Republic',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/czech-republic/' },
            { text: 'Legal Rights', link: '/europe/czech-republic/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/czech-republic/healthcare' },
            { text: 'Moving There', link: '/europe/czech-republic/moving-there' }
          ]
        },
        {
          text: '🇩🇰 Denmark',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/denmark/' },
            { text: 'Legal Rights', link: '/europe/denmark/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/denmark/healthcare' },
            { text: 'Moving There', link: '/europe/denmark/moving-there' }
          ]
        },
        {
          text: '🇪🇪 Estonia',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/estonia/' },
            { text: 'Legal Rights', link: '/europe/estonia/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/estonia/healthcare' },
            { text: 'Moving There', link: '/europe/estonia/moving-there' }
          ]
        },
        {
          text: '🇫🇮 Finland',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/finland/' },
            { text: 'Legal Rights', link: '/europe/finland/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/finland/healthcare' },
            { text: 'Moving There', link: '/europe/finland/moving-there' }
          ]
        },
        {
          text: '🇫🇷 France',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/france/' },
            { text: 'Legal Rights', link: '/europe/france/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/france/healthcare' },
            { text: 'Moving There', link: '/europe/france/moving-there' }
          ]
        },
        {
          text: '🇩🇪 Germany',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/germany/' },
            { text: 'Legal Rights', link: '/europe/germany/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/germany/healthcare' },
            { text: 'Moving There', link: '/europe/germany/moving-there' }
          ]
        },
        {
          text: '🇬🇷 Greece',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/greece/' },
            { text: 'Legal Rights', link: '/europe/greece/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/greece/healthcare' },
            { text: 'Moving There', link: '/europe/greece/moving-there' }
          ]
        },
        {
          text: '🇭🇺 Hungary',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/hungary/' },
            { text: 'Legal Rights', link: '/europe/hungary/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/hungary/healthcare' },
            { text: 'Moving There', link: '/europe/hungary/moving-there' }
          ]
        },
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
          text: '🇮🇪 Ireland',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/ireland/' },
            { text: 'Legal Rights', link: '/europe/ireland/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/ireland/healthcare' },
            { text: 'Moving There', link: '/europe/ireland/moving-there' }
          ]
        },
        {
          text: '🇮🇹 Italy',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/italy/' },
            { text: 'Legal Rights', link: '/europe/italy/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/italy/healthcare' },
            { text: 'Moving There', link: '/europe/italy/moving-there' }
          ]
        },
        {
          text: '🇱🇻 Latvia',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/latvia/' },
            { text: 'Legal Rights', link: '/europe/latvia/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/latvia/healthcare' },
            { text: 'Moving There', link: '/europe/latvia/moving-there' }
          ]
        },
        {
          text: '🇱🇹 Lithuania',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/lithuania/' },
            { text: 'Legal Rights', link: '/europe/lithuania/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/lithuania/healthcare' },
            { text: 'Moving There', link: '/europe/lithuania/moving-there' }
          ]
        },
        {
          text: '🇱🇺 Luxembourg',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/luxembourg/' },
            { text: 'Legal Rights', link: '/europe/luxembourg/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/luxembourg/healthcare' },
            { text: 'Moving There', link: '/europe/luxembourg/moving-there' }
          ]
        },
        {
          text: '🇲🇹 Malta',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/malta/' },
            { text: 'Legal Rights', link: '/europe/malta/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/malta/healthcare' },
            { text: 'Moving There', link: '/europe/malta/moving-there' }
          ]
        },
        {
          text: '🇳🇱 Netherlands',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/netherlands/' },
            { text: 'Legal Rights', link: '/europe/netherlands/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/netherlands/healthcare' },
            { text: 'Moving There', link: '/europe/netherlands/moving-there' }
          ]
        },
        {
          text: '🇳🇴 Norway',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/norway/' },
            { text: 'Legal Rights', link: '/europe/norway/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/norway/healthcare' },
            { text: 'Moving There', link: '/europe/norway/moving-there' }
          ]
        },
        {
          text: '🇵🇱 Poland',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/poland/' },
            { text: 'Legal Rights', link: '/europe/poland/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/poland/healthcare' },
            { text: 'Moving There', link: '/europe/poland/moving-there' }
          ]
        },
        {
          text: '🇵🇹 Portugal',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/portugal/' },
            { text: 'Legal Rights', link: '/europe/portugal/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/portugal/healthcare' },
            { text: 'Moving There', link: '/europe/portugal/moving-there' }
          ]
        },
        {
          text: '🇷🇴 Romania',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/romania/' },
            { text: 'Legal Rights', link: '/europe/romania/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/romania/healthcare' },
            { text: 'Moving There', link: '/europe/romania/moving-there' }
          ]
        },
        {
          text: '🇸🇰 Slovakia',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/slovakia/' },
            { text: 'Legal Rights', link: '/europe/slovakia/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/slovakia/healthcare' },
            { text: 'Moving There', link: '/europe/slovakia/moving-there' }
          ]
        },
        {
          text: '🇸🇮 Slovenia',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/slovenia/' },
            { text: 'Legal Rights', link: '/europe/slovenia/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/slovenia/healthcare' },
            { text: 'Moving There', link: '/europe/slovenia/moving-there' }
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
        {
          text: '🇸🇪 Sweden',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/sweden/' },
            { text: 'Legal Rights', link: '/europe/sweden/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/sweden/healthcare' },
            { text: 'Moving There', link: '/europe/sweden/moving-there' }
          ]
        },
        {
          text: '🇨🇭 Switzerland',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/switzerland/' },
            { text: 'Legal Rights', link: '/europe/switzerland/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/switzerland/healthcare' },
            { text: 'Moving There', link: '/europe/switzerland/moving-there' }
          ]
        },
        {
          text: '🇬🇧 United Kingdom',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/europe/united-kingdom/' },
            { text: 'Legal Rights', link: '/europe/united-kingdom/legal-rights' },
            { text: 'Healthcare & HRT', link: '/europe/united-kingdom/healthcare' },
            { text: 'Moving There', link: '/europe/united-kingdom/moving-there' }
          ]
        },
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