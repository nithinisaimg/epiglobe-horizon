// Curated historical disease outbreaks per country/region.
// "spreadRate" is an approximate basic reproduction number (R0) where available,
// otherwise a relative qualitative score (1=slow, 5=explosive). Years/cases are
// historical estimates compiled from public sources (WHO, CDC). Numbers are
// approximate and intended for educational visualization, not clinical use.

export interface HistoricalDisease {
  name: string;
  year: string; // e.g. "1918" or "1347-1351"
  cases: number; // estimated cases/infections
  deaths: number; // estimated deaths
  spreadRate: number; // R0 or relative score
  transmission: string;
}

// Diseases that affected most of the world — used as fallback for any country.
const GLOBAL: HistoricalDisease[] = [
  {
    name: "Spanish Flu (H1N1)",
    year: "1918-1920",
    cases: 500_000_000,
    deaths: 50_000_000,
    spreadRate: 2.0,
    transmission: "Respiratory droplets",
  },
  {
    name: "Asian Flu (H2N2)",
    year: "1957-1958",
    cases: 250_000_000,
    deaths: 1_100_000,
    spreadRate: 1.7,
    transmission: "Respiratory droplets",
  },
  {
    name: "Hong Kong Flu (H3N2)",
    year: "1968-1969",
    cases: 100_000_000,
    deaths: 1_000_000,
    spreadRate: 1.8,
    transmission: "Respiratory droplets",
  },
  {
    name: "HIV/AIDS",
    year: "1981-present",
    cases: 85_000_000,
    deaths: 40_000_000,
    spreadRate: 4.0,
    transmission: "Blood / sexual contact",
  },
  {
    name: "Tuberculosis",
    year: "Ongoing",
    cases: 10_000_000,
    deaths: 1_300_000,
    spreadRate: 2.5,
    transmission: "Airborne",
  },
  {
    name: "Measles",
    year: "Pre-vaccine era",
    cases: 30_000_000,
    deaths: 2_600_000,
    spreadRate: 15.0,
    transmission: "Airborne",
  },
];

// Region/country specific historical outbreaks.
const REGIONAL: Record<string, HistoricalDisease[]> = {
  // Europe
  Europe: [
    {
      name: "Black Death (Plague)",
      year: "1347-1351",
      cases: 75_000_000,
      deaths: 50_000_000,
      spreadRate: 4.5,
      transmission: "Flea / rodent vector",
    },
    {
      name: "Smallpox",
      year: "18th century",
      cases: 60_000_000,
      deaths: 15_000_000,
      spreadRate: 6.0,
      transmission: "Airborne",
    },
    {
      name: "Cholera (1854)",
      year: "1854",
      cases: 50_000,
      deaths: 23_000,
      spreadRate: 2.0,
      transmission: "Contaminated water",
    },
  ],
  // Africa
  Africa: [
    {
      name: "Ebola (West Africa)",
      year: "2014-2016",
      cases: 28_600,
      deaths: 11_300,
      spreadRate: 1.8,
      transmission: "Bodily fluids",
    },
    {
      name: "Malaria",
      year: "Ongoing",
      cases: 240_000_000,
      deaths: 600_000,
      spreadRate: 5.0,
      transmission: "Mosquito vector",
    },
    {
      name: "Yellow Fever",
      year: "Recurrent",
      cases: 200_000,
      deaths: 30_000,
      spreadRate: 2.0,
      transmission: "Mosquito vector",
    },
  ],
  // Asia
  Asia: [
    {
      name: "SARS",
      year: "2002-2003",
      cases: 8_098,
      deaths: 774,
      spreadRate: 2.5,
      transmission: "Respiratory droplets",
    },
    {
      name: "Avian Flu (H5N1)",
      year: "2003-present",
      cases: 870,
      deaths: 460,
      spreadRate: 1.2,
      transmission: "Bird-to-human",
    },
    {
      name: "Cholera",
      year: "19th-20th century",
      cases: 1_000_000,
      deaths: 500_000,
      spreadRate: 2.0,
      transmission: "Contaminated water",
    },
  ],
  // North America
  "North America": [
    {
      name: "Polio",
      year: "1916-1955",
      cases: 500_000,
      deaths: 30_000,
      spreadRate: 5.0,
      transmission: "Fecal-oral",
    },
    {
      name: "H1N1 Swine Flu",
      year: "2009-2010",
      cases: 60_800_000,
      deaths: 12_500,
      spreadRate: 1.5,
      transmission: "Respiratory droplets",
    },
    {
      name: "West Nile Virus",
      year: "1999-present",
      cases: 51_000,
      deaths: 2_300,
      spreadRate: 1.0,
      transmission: "Mosquito vector",
    },
  ],
  // South America
  "South America": [
    {
      name: "Zika",
      year: "2015-2016",
      cases: 1_500_000,
      deaths: 20,
      spreadRate: 2.0,
      transmission: "Mosquito vector",
    },
    {
      name: "Dengue",
      year: "Ongoing",
      cases: 4_200_000,
      deaths: 2_100,
      spreadRate: 3.5,
      transmission: "Mosquito vector",
    },
    {
      name: "Chagas Disease",
      year: "Endemic",
      cases: 6_000_000,
      deaths: 12_000,
      spreadRate: 1.5,
      transmission: "Triatomine bug",
    },
  ],
  Oceania: [
    {
      name: "Ross River Fever",
      year: "Endemic",
      cases: 5_000,
      deaths: 0,
      spreadRate: 1.5,
      transmission: "Mosquito vector",
    },
    {
      name: "Murray Valley Encephalitis",
      year: "Recurrent",
      cases: 200,
      deaths: 40,
      spreadRate: 1.2,
      transmission: "Mosquito vector",
    },
  ],
};

// Country-specific overrides for notable outbreaks
const COUNTRY_SPECIFIC: Record<string, HistoricalDisease[]> = {
  China: [
    {
      name: "SARS-CoV-1",
      year: "2002-2003",
      cases: 5_327,
      deaths: 349,
      spreadRate: 2.5,
      transmission: "Respiratory droplets",
    },
  ],
  "DR Congo": [
    {
      name: "Ebola (Kivu)",
      year: "2018-2020",
      cases: 3_470,
      deaths: 2_280,
      spreadRate: 1.8,
      transmission: "Bodily fluids",
    },
  ],
  Liberia: [
    {
      name: "Ebola Outbreak",
      year: "2014-2016",
      cases: 10_675,
      deaths: 4_809,
      spreadRate: 1.9,
      transmission: "Bodily fluids",
    },
  ],
  India: [
    {
      name: "Plague (Surat)",
      year: "1994",
      cases: 693,
      deaths: 56,
      spreadRate: 2.0,
      transmission: "Flea / rodent vector",
    },
  ],
  USA: [
    {
      name: "1918 Flu (US wave)",
      year: "1918-1919",
      cases: 25_000_000,
      deaths: 675_000,
      spreadRate: 2.0,
      transmission: "Respiratory droplets",
    },
  ],
  Mexico: [
    {
      name: "H1N1 Origin",
      year: "2009",
      cases: 72_000,
      deaths: 1_316,
      spreadRate: 1.5,
      transmission: "Respiratory droplets",
    },
  ],
  Brazil: [
    {
      name: "Zika Epidemic",
      year: "2015-2016",
      cases: 1_300_000,
      deaths: 12,
      spreadRate: 2.2,
      transmission: "Mosquito vector",
    },
  ],
  "Saudi Arabia": [
    {
      name: "MERS-CoV",
      year: "2012-present",
      cases: 2_600,
      deaths: 940,
      spreadRate: 0.7,
      transmission: "Camel-to-human / nosocomial",
    },
  ],
  UK: [
    {
      name: "Great Plague of London",
      year: "1665-1666",
      cases: 100_000,
      deaths: 100_000,
      spreadRate: 3.0,
      transmission: "Flea / rodent vector",
    },
  ],
  Italy: [
    {
      name: "Plague of Milan",
      year: "1629-1631",
      cases: 1_100_000,
      deaths: 1_000_000,
      spreadRate: 4.0,
      transmission: "Flea / rodent vector",
    },
  ],
  Russia: [
    {
      name: "Russian Flu",
      year: "1889-1890",
      cases: 1_000_000_000,
      deaths: 1_000_000,
      spreadRate: 2.1,
      transmission: "Respiratory droplets",
    },
  ],
};

export function getHistoricalDiseases(country: string, continent?: string): HistoricalDisease[] {
  const specific = COUNTRY_SPECIFIC[country] ?? [];
  const regional = continent ? (REGIONAL[continent] ?? []) : [];
  // De-dup by name, country-specific first
  const seen = new Set<string>();
  return [...specific, ...regional, ...GLOBAL].filter((d) => {
    if (seen.has(d.name)) return false;
    seen.add(d.name);
    return true;
  });
}

export function spreadRateLabel(r: number): string {
  if (r >= 10) return "Extreme";
  if (r >= 4) return "Very High";
  if (r >= 2) return "High";
  if (r >= 1.2) return "Moderate";
  return "Low";
}

export function spreadRateColor(r: number): string {
  if (r >= 10) return "#CC0000";
  if (r >= 4) return "#FF3B3B";
  if (r >= 2) return "#FF6B35";
  if (r >= 1.2) return "#FFB347";
  return "#1DB954";
}
