/**
 * Generates curated country data: detailed trans rights checklists,
 * healthcare, safety, visa info, and notes.
 * 
 * Rights are encoded as arrays for compactness then expanded to objects.
 * Order: [legalRecognition, sameSexMarriage, adoptionBySameSex, conversionTherapyBan,
 *         hateCrimeLaws, employmentDiscrimination, housingDiscrimination,
 *         bloodDonation, transMilitary, thirdGenderOption, healthcareCoverage]
 *   legalRecognition: 2=Self-ID, 1=Medicalized, 0=Banned
 *   healthcareCoverage: 2=Public, 1=Private only, 0=None
 *   All others: 1=Yes, 0=No
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '.vitepress', 'theme', 'generated')

const RIGHT_LABELS = [
  'legalRecognition',
  'sameSexMarriage',
  'adoptionBySameSex',
  'conversionTherapyBan',
  'hateCrimeLaws',
  'employmentDiscrimination',
  'housingDiscrimination',
  'bloodDonation',
  'transMilitary',
  'thirdGenderOption',
  'healthcareCoverage',
]

function expandRights(encoded, legalText, healthcareText, antiDiscText) {
  const obj = {}
  encoded.forEach((val, i) => {
    const key = RIGHT_LABELS[i]
    if (key === 'legalRecognition') {
      obj[key] = val === 2 ? 'self-id' : val === 1 ? 'medicalized' : 'banned'
    } else if (key === 'healthcareCoverage') {
      obj[key] = val === 2 ? 'public' : val === 1 ? 'private' : 'none'
    } else {
      obj[key] = val === 1
    }
  })
  obj.legalRecognitionLabel = legalText
  obj.healthcareLabel = healthcareText
  obj.antiDiscriminationLabel = antiDiscText
  return obj
}

const curatedData = {
  // ===== EUROPE =====
  // Rights: [recognition, marriage, adoption, conversionTherapy, hateCrime, employment, housing, bloodDonation, military, thirdGender, healthcare]
  IS: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2019)', 'Informed consent', 'Comprehensive (includes gender identity)'),
    safety: 5,
    digitalNomadVisa: 'Remote work visa (up to 18 months)',
    euFreeMovement: true,
    notes: 'Pioneer in trans rights; small population but strong community.',
  },
  NO: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2016)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'No specific visa, but can stay up to 6 months as tourist',
    euFreeMovement: false,
    notes: 'Very progressive; part of EEA/Schengen.',
  },
  ES: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (Law 3/2023)', 'Informed consent (varies by region)', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'Digital Nomad Visa (1 year, renewable)',
    euFreeMovement: true,
    notes: 'Excellent legal protections; large LGBTQ+ community.',
  },
  DK: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2017)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'Start-up visa available',
    euFreeMovement: true,
    notes: 'Very progressive; strong social support.',
  },
  MT: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2015)', 'Informed consent', 'Comprehensive (constitutional)'),
    safety: 4,
    digitalNomadVisa: 'Nomad Residence Permit (1 year)',
    euFreeMovement: true,
    notes: 'Consistently ranked #1 in ILGA Europe.',
  },
  DE: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,2],
      'Self-ID (2025)', 'Informed consent (varies by state)', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'Freelancer visa (6 months, renewable)',
    euFreeMovement: true,
    notes: 'New self-ID law passed in 2025.',
  },
  BE: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2018)', 'Informed consent', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'No specific visa; work as freelancer',
    euFreeMovement: true,
    notes: 'Good healthcare system; strong anti-discrimination laws.',
  },
  PT: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2018)', 'Informed consent (some gatekeeping)', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'D7 Passive Income Visa & Digital Nomad Visa',
    euFreeMovement: true,
    notes: 'Popular destination; affordable with good healthcare.',
  },
  FI: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2023)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'Startup visa; self-employment possible',
    euFreeMovement: true,
    notes: 'Very safe; strong social support.',
  },
  NL: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2014)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'Freelancer visa (DAFT treaty for US citizens)',
    euFreeMovement: true,
    notes: 'Very progressive; large expat community.',
  },
  SE: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (1972 - first in world)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'No specific visa; self-employment possible',
    euFreeMovement: true,
    notes: 'Pioneer in trans rights; long wait times for HRT in some regions.',
  },
  FR: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,2],
      'Self-ID (2022)', 'Informed consent (with some requirements)', 'Comprehensive'),
    safety: 3,
    digitalNomadVisa: 'No specific visa; freelance visa possible',
    euFreeMovement: true,
    notes: 'Good legal protections; safety varies by area.',
  },
  AT: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,2],
      'Self-ID (2024)', 'Informed consent', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'Red-White-Red Card for freelancers',
    euFreeMovement: true,
    notes: 'Good healthcare system; strong legal protections.',
  },
  CZ: {
    rights: expandRights([1,1,1,0,1,1,1,1,1,0,1],
      'Medicalized (requires surgery)', 'Gatekeeping (long wait times)', 'Partial (sexual orientation only)'),
    safety: 3,
    digitalNomadVisa: 'Zivno (freelancer visa)',
    euFreeMovement: true,
    notes: 'Moderate trans rights; affordable cost of living.',
  },
  CH: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,1],
      'Self-ID (2022)', 'Informed consent', 'Partial (varies by canton)'),
    safety: 4,
    digitalNomadVisa: 'No specific visa; high cost of living',
    euFreeMovement: false,
    notes: 'Good healthcare; private insurance system.',
  },
  IE: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,2],
      'Self-ID (2015)', 'Informed consent', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'No specific visa; work visa required',
    euFreeMovement: true,
    notes: 'Very progressive; housing crisis affects newcomers.',
  },
  GB: {
    rights: expandRights([1,1,1,0,1,1,1,1,1,0,1],
      'Medicalized (requires diagnosis)', 'Gatekeeping (long wait times - years)', 'Comprehensive (Equality Act 2010)'),
    safety: 3,
    digitalNomadVisa: 'Global Talent visa; Youth Mobility (under 35)',
    euFreeMovement: false,
    notes: 'Post-Brexit; NHS has very long waiting lists for gender clinics.',
  },
  LU: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2018)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'No specific visa; EU freedom of movement',
    euFreeMovement: true,
    notes: 'Very wealthy; strong protections.',
  },
  IT: {
    rights: expandRights([1,1,1,0,1,1,1,1,1,0,1],
      'Medicalized (requires court approval)', 'Gatekeeping', 'Partial (inconsistent enforcement)'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (2024, new)',
    euFreeMovement: true,
    notes: 'Conservative influence rising; safety varies by region.',
  },
  GR: {
    rights: expandRights([1,1,1,0,1,1,0,1,1,0,1],
      'Medicalized (surgery required)', 'Gatekeeping', 'Partial'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (up to 2 years)',
    euFreeMovement: true,
    notes: 'Improving but conservative attitudes prevalent.',
  },
  SI: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,2],
      'Self-ID (2022)', 'Informed consent', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'No specific visa; EU freedom of movement',
    euFreeMovement: true,
    notes: 'Very progressive for the region.',
  },
  EE: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,0,2],
      'Self-ID (2023)', 'Informed consent', 'Comprehensive'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (1 year)',
    euFreeMovement: true,
    notes: 'Progressive; excellent digital infrastructure.',
  },
  CY: {
    rights: expandRights([1,1,1,0,1,1,1,1,1,0,1],
      'Medicalized (surgery required)', 'Limited (private clinics)', 'Partial'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (1 year)',
    euFreeMovement: true,
    notes: 'Mixed attitudes; improving slowly.',
  },
  HR: {
    rights: expandRights([2,1,1,0,1,1,1,1,1,0,1],
      'Self-ID (2021)', 'Gatekeeping', 'Comprehensive'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (1 year)',
    euFreeMovement: true,
    notes: 'Improving; popular tourist destination.',
  },
  PL: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,0],
      'Medicalized (requires diagnosis)', 'Gatekeeping (difficult access)', 'Partial (limited protections)'),
    safety: 2,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: true,
    notes: 'Rising conservative sentiment.',
  },
  SK: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,0],
      'Medicalized (surgery required)', 'Gatekeeping', 'Partial'),
    safety: 2,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: true,
    notes: 'Conservative attitudes; limited protections.',
  },
  HU: {
    rights: expandRights([0,0,0,0,0,0,0,1,1,0,0],
      'Banned (2020 - no legal recognition)', 'Gatekeeping (restricted)', 'Partial (sexual orientation only)'),
    safety: 1,
    digitalNomadVisa: 'White Card (2 years, freelance)',
    euFreeMovement: true,
    notes: 'Government hostile to LGBTQ+ rights.',
  },
  LT: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,0],
      'Medicalized (surgery required)', 'Gatekeeping', 'Partial'),
    safety: 2,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: true,
    notes: 'Conservative; protections limited.',
  },
  RO: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,0],
      'Medicalized (surgery required)', 'Gatekeeping (limited access)', 'Partial'),
    safety: 2,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: true,
    notes: 'Very conservative; discrimination common.',
  },
  LV: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,0],
      'Medicalized (surgery required)', 'Gatekeeping', 'Partial'),
    safety: 2,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: true,
    notes: 'Conservative attitudes; limited protections.',
  },
  BG: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,0],
      'Medicalized (surgery required)', 'Gatekeeping (limited)', 'Partial'),
    safety: 2,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: true,
    notes: 'Very conservative; discrimination prevalent.',
  },
  // ===== NON-EUROPE =====
  CA: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (varies by province)', 'Informed consent (varies by province)', 'Comprehensive (federal + provincial)'),
    safety: 5,
    digitalNomadVisa: 'No specific visa; Express Entry or work permit',
    euFreeMovement: false,
    notes: 'Very progressive; publicly funded healthcare covers gender-affirming care.',
  },
  US: {
    rights: expandRights([2,1,1,0,1,1,1,0,1,1,1],
      'Varies by state (19 states + DC have self-ID)', 'Varies by state (informed consent in many)', 'Partial (federal protections, varies by state)'),
    safety: 3,
    digitalNomadVisa: 'Domestic: varies; International: ESTA/B-1',
    euFreeMovement: false,
    notes: 'Very polarized; some states have sanctuary laws, others have bans.',
  },
  AU: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (some states; federal varies)', 'Informed consent', 'Comprehensive (federal)'),
    safety: 4,
    digitalNomadVisa: 'Working Holiday Visa (under 35)',
    euFreeMovement: false,
    notes: 'Strong protections; healthcare varies by state.',
  },
  NZ: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2021)', 'Informed consent', 'Comprehensive'),
    safety: 5,
    digitalNomadVisa: 'Working Holiday Visa or Green List work visa',
    euFreeMovement: false,
    notes: 'Very progressive; strong community.',
  },
  AR: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2012 - first in Latin America)', 'Informed consent (public healthcare covers GAC)', 'Comprehensive'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (2022, 6 months)',
    euFreeMovement: false,
    notes: 'Very progressive laws; economic instability a concern.',
  },
  UY: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2009 - first in LatAm)', 'Informed consent (public system covers)', 'Comprehensive'),
    safety: 4,
    digitalNomadVisa: 'No specific visa; Mercosur freedom of movement',
    euFreeMovement: false,
    notes: 'Most progressive in Latin America; small population.',
  },
  BR: {
    rights: expandRights([2,1,1,1,1,1,1,1,1,1,2],
      'Self-ID (2018, Supreme Court)', 'Informed consent (public SUS covers GAC)', 'Comprehensive (Supreme Court rulings)'),
    safety: 2,
    digitalNomadVisa: 'Digital Nomad Visa (1 year, renewable)',
    euFreeMovement: false,
    notes: 'Strongest trans rights in LatAm; but high violence rates.',
  },
  JP: {
    rights: expandRights([1,0,0,0,0,1,0,1,1,0,1],
      'Medicalized (surgery + sterilization required)', 'Gatekeeping (strict requirements)', 'Partial (no federal law; some local ordinances)'),
    safety: 3,
    digitalNomadVisa: 'Digital Nomad Visa (2024, new)',
    euFreeMovement: false,
    notes: 'Slow progress; 2023 Supreme Court ruled sterilization requirement unconstitutional.',
  },
  TW: {
    rights: expandRights([1,1,1,0,1,1,1,1,1,0,1],
      'Medicalized (surgery required)', 'Gatekeeping (some informed consent options)', 'Comprehensive (2023 legal protections)'),
    safety: 4,
    digitalNomadVisa: 'Gold Card visa for professionals',
    euFreeMovement: false,
    notes: 'Most progressive in Asia; first Asian country to legalize same-sex marriage.',
  },
  KR: {
    rights: expandRights([1,0,0,0,0,0,0,1,1,0,0],
      'Medicalized (surgery required, restrictive)', 'Gatekeeping', 'None (no federal anti-discrimination law)'),
    safety: 2,
    digitalNomadVisa: 'Digital Nomad Visa (2024)',
    euFreeMovement: false,
    notes: 'Strong conservative influence; limited protections.',
  },
  TH: {
    rights: expandRights([1,1,0,0,1,1,1,1,1,0,1],
      'Medicalized (surgery required)', 'Informed consent (many clinics)', 'Partial (Marriage Equality Act 2024)'),
    safety: 3,
    digitalNomadVisa: 'Long-term visa for remote workers',
    euFreeMovement: false,
    notes: 'Large trans community; affordable healthcare.',
  },
  ZA: {
    rights: expandRights([1,1,1,0,1,1,1,0,1,0,1],
      'Medicalized (requires surgery/court)', 'Limited public; private informed consent', 'Comprehensive (constitutional, but weak enforcement)'),
    safety: 1,
    digitalNomadVisa: 'Digital Nomad Visa (2024)',
    euFreeMovement: false,
    notes: 'Constitutional protections but high violence; safety major concern.',
  },
  IL: {
    rights: expandRights([1,0,0,0,1,1,1,1,1,0,2],
      'Medicalized (requires letter from doctor)', 'Informed consent (public health covers)', 'Comprehensive (Employment)'),
    safety: 3,
    digitalNomadVisa: 'No specific visa; work visa required',
    euFreeMovement: false,
    notes: 'Mixed attitudes; strong LGBTQ+ community in Tel Aviv.',
  },
  TR: {
    rights: expandRights([1,0,0,0,0,0,0,1,1,0,0],
      'Medicalized (surgery required)', 'Gatekeeping', 'Partial (limited constitutional protections)'),
    safety: 1,
    digitalNomadVisa: 'No specific visa',
    euFreeMovement: false,
    notes: 'Increasingly hostile government; Pride events banned in many cities.',
  },
}

function generate() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  const outputPath = path.join(DATA_DIR, 'curated-country-info.json')
  fs.writeFileSync(outputPath, JSON.stringify(curatedData, null, 2), 'utf-8')
  console.log(`[Curated] Saved ${Object.keys(curatedData).length} country profiles to ${outputPath}`)
}

generate()
