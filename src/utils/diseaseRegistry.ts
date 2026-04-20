import type { CountryDiseaseData, GlobalStats, HistoricalData } from "./diseaseAPI";

export interface DiseaseDef {
  id: string;
  name: string;
  short: string;
  era: "past" | "recent" | "current";
  year: string;
  R0: number;
  transmission: string;
  // Per-continent seed multiplier (how prevalent the disease was/is per region, 0-1)
  regionWeight: Record<string, number>;
  // Approx global infection rate per capita at peak (for synthesis only)
  globalPrevalence: number; // 0-1
  // Case fatality rate
  cfr: number; // 0-1
  // SIR parameters
  beta: number;
  gamma: number;
  description: string;
  // Severity thresholds on ACTIVE cases (for globe coloring)
  severity: { low: number; moderate: number; high: number; critical: number; extreme: number };
}

export const DISEASES: DiseaseDef[] = [
  {
    id: "covid19",
    name: "COVID-19",
    short: "COVID-19",
    era: "current",
    year: "2019-present",
    R0: 3.0,
    transmission: "Respiratory droplets / aerosol",
    regionWeight: {
      "North America": 1,
      Europe: 1,
      "South America": 0.9,
      Asia: 0.95,
      Africa: 0.6,
      Oceania: 0.7,
      "Australia-Oceania": 0.7,
    },
    globalPrevalence: 0.09,
    cfr: 0.01,
    beta: 0.3,
    gamma: 0.1,
    description:
      "SARS-CoV-2 coronavirus causing respiratory illness. Pandemic declared March 2020.",
    severity: { low: 1, moderate: 100_000, high: 500_000, critical: 1_000_000, extreme: 5_000_000 },
  },
  {
    id: "influenza",
    name: "Seasonal Influenza",
    short: "Flu",
    era: "current",
    year: "Annual",
    R0: 1.3,
    transmission: "Respiratory droplets",
    regionWeight: {
      "North America": 1,
      Europe: 1,
      "South America": 0.7,
      Asia: 0.9,
      Africa: 0.5,
      Oceania: 0.8,
      "Australia-Oceania": 0.8,
    },
    globalPrevalence: 0.05,
    cfr: 0.001,
    beta: 0.22,
    gamma: 0.18,
    description: "Seasonal flu strains circulate every winter, causing 3-5M severe cases globally.",
    severity: { low: 1, moderate: 50_000, high: 250_000, critical: 750_000, extreme: 2_000_000 },
  },
  {
    id: "mpox",
    name: "Mpox (Monkeypox)",
    short: "Mpox",
    era: "recent",
    year: "2022-present",
    R0: 1.8,
    transmission: "Close contact / lesions",
    regionWeight: {
      Africa: 1,
      Europe: 0.6,
      "North America": 0.5,
      "South America": 0.4,
      Asia: 0.3,
      Oceania: 0.2,
      "Australia-Oceania": 0.2,
    },
    globalPrevalence: 0.0002,
    cfr: 0.03,
    beta: 0.15,
    gamma: 0.08,
    description: "Orthopoxvirus causing rash and fever. Re-emerged globally in 2022.",
    severity: { low: 1, moderate: 200, high: 1_000, critical: 5_000, extreme: 20_000 },
  },
  {
    id: "dengue",
    name: "Dengue Fever",
    short: "Dengue",
    era: "current",
    year: "Ongoing",
    R0: 2.5,
    transmission: "Aedes mosquito vector",
    regionWeight: {
      "South America": 1,
      Asia: 1,
      Africa: 0.8,
      "North America": 0.3,
      Oceania: 0.6,
      "Australia-Oceania": 0.6,
      Europe: 0.1,
    },
    globalPrevalence: 0.02,
    cfr: 0.005,
    beta: 0.2,
    gamma: 0.12,
    description: "Mosquito-borne flavivirus, endemic in tropical/subtropical regions.",
    severity: { low: 1, moderate: 10_000, high: 50_000, critical: 250_000, extreme: 1_000_000 },
  },
  {
    id: "malaria",
    name: "Malaria",
    short: "Malaria",
    era: "current",
    year: "Ongoing",
    R0: 5.0,
    transmission: "Anopheles mosquito vector",
    regionWeight: {
      Africa: 1,
      Asia: 0.6,
      "South America": 0.5,
      Oceania: 0.4,
      "Australia-Oceania": 0.2,
      "North America": 0.05,
      Europe: 0.02,
    },
    globalPrevalence: 0.03,
    cfr: 0.003,
    beta: 0.35,
    gamma: 0.07,
    description: "Plasmodium parasite transmitted by mosquitoes. 600k+ deaths annually.",
    severity: { low: 1, moderate: 50_000, high: 500_000, critical: 2_000_000, extreme: 10_000_000 },
  },
  {
    id: "ebola",
    name: "Ebola Virus",
    short: "Ebola",
    era: "recent",
    year: "1976-present",
    R0: 1.8,
    transmission: "Bodily fluids contact",
    regionWeight: {
      Africa: 1,
      Europe: 0.05,
      "North America": 0.02,
      Asia: 0.02,
      "South America": 0.01,
      Oceania: 0.01,
      "Australia-Oceania": 0.01,
    },
    globalPrevalence: 0.00005,
    cfr: 0.5,
    beta: 0.18,
    gamma: 0.1,
    description: "Severe hemorrhagic fever. West Africa outbreak 2014-16: 11,300 deaths.",
    severity: { low: 1, moderate: 50, high: 500, critical: 2_000, extreme: 10_000 },
  },
  {
    id: "sars",
    name: "SARS",
    short: "SARS",
    era: "past",
    year: "2002-2003",
    R0: 2.5,
    transmission: "Respiratory droplets",
    regionWeight: {
      Asia: 1,
      "North America": 0.4,
      Europe: 0.2,
      Oceania: 0.1,
      "Australia-Oceania": 0.1,
      Africa: 0.02,
      "South America": 0.02,
    },
    globalPrevalence: 0.00001,
    cfr: 0.096,
    beta: 0.25,
    gamma: 0.1,
    description: "SARS-CoV-1 outbreak originated in China. 8,098 cases, 774 deaths.",
    severity: { low: 1, moderate: 20, high: 100, critical: 500, extreme: 2_000 },
  },
  {
    id: "h1n1",
    name: "H1N1 Swine Flu",
    short: "H1N1",
    era: "past",
    year: "2009-2010",
    R0: 1.5,
    transmission: "Respiratory droplets",
    regionWeight: {
      "North America": 1,
      Europe: 0.8,
      "South America": 0.7,
      Asia: 0.7,
      Africa: 0.4,
      Oceania: 0.6,
      "Australia-Oceania": 0.6,
    },
    globalPrevalence: 0.15,
    cfr: 0.0002,
    beta: 0.2,
    gamma: 0.13,
    description: "2009 H1N1 pandemic. Estimated 60M cases in the US alone.",
    severity: { low: 1, moderate: 10_000, high: 100_000, critical: 500_000, extreme: 2_000_000 },
  },
  {
    id: "spanish_flu",
    name: "Spanish Flu (H1N1 1918)",
    short: "Spanish Flu",
    era: "past",
    year: "1918-1920",
    R0: 2.0,
    transmission: "Respiratory droplets",
    regionWeight: {
      Europe: 1,
      "North America": 1,
      Asia: 0.9,
      Africa: 0.7,
      "South America": 0.7,
      Oceania: 0.6,
      "Australia-Oceania": 0.6,
    },
    globalPrevalence: 0.33,
    cfr: 0.025,
    beta: 0.28,
    gamma: 0.12,
    description: "Deadliest pandemic in modern history. ~500M infected, ~50M deaths.",
    severity: {
      low: 1,
      moderate: 100_000,
      high: 1_000_000,
      critical: 5_000_000,
      extreme: 20_000_000,
    },
  },
  {
    id: "plague",
    name: "Black Death (Plague)",
    short: "Plague",
    era: "past",
    year: "1347-1351",
    R0: 4.5,
    transmission: "Flea / rodent vector",
    regionWeight: {
      Europe: 1,
      Asia: 0.9,
      Africa: 0.7,
      "North America": 0,
      "South America": 0,
      Oceania: 0,
      "Australia-Oceania": 0,
    },
    globalPrevalence: 0.3,
    cfr: 0.6,
    beta: 0.4,
    gamma: 0.08,
    description: "Yersinia pestis bubonic plague. Killed 30-50% of Europe's population.",
    severity: { low: 1, moderate: 50_000, high: 500_000, critical: 2_000_000, extreme: 10_000_000 },
  },
  {
    id: "smallpox",
    name: "Smallpox",
    era: "past",
    short: "Smallpox",
    year: "Eradicated 1980",
    R0: 6.0,
    transmission: "Airborne",
    regionWeight: {
      Europe: 1,
      Asia: 1,
      Africa: 0.9,
      "North America": 0.8,
      "South America": 0.8,
      Oceania: 0.5,
      "Australia-Oceania": 0.5,
    },
    globalPrevalence: 0.1,
    cfr: 0.3,
    beta: 0.5,
    gamma: 0.1,
    description: "Variola virus. Eradicated by WHO in 1980 after vaccination campaign.",
    severity: { low: 1, moderate: 10_000, high: 100_000, critical: 500_000, extreme: 2_000_000 },
  },
];

export function getDisease(id: string): DiseaseDef {
  return DISEASES.find((d) => d.id === id) ?? DISEASES[0];
}

// Deterministic pseudo-random from a string — ensures stable per-country numbers
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

/** Synthesize country-level data for a given disease based on real population + continent. */
export function synthesizeCountryData(
  base: CountryDiseaseData[],
  disease: DiseaseDef,
): CountryDiseaseData[] {
  if (disease.id === "covid19") return base; // use real API data

  return base.map((c) => {
    const w = disease.regionWeight[c.continent] ?? 0.1;
    const rnd = 0.4 + hashStr(`${disease.id}-${c.country}`) * 1.2; // 0.4..1.6
    const prevalence = disease.globalPrevalence * w * rnd;
    const cases = Math.round(c.population * prevalence);
    const deaths = Math.round(cases * disease.cfr);
    const recovered = Math.round(cases * 0.85);
    const active = Math.max(0, cases - deaths - recovered);
    const todayCases = Math.round(
      active * (0.005 + hashStr(`t-${disease.id}-${c.country}`) * 0.02),
    );
    const todayDeaths = Math.round(todayCases * disease.cfr);
    return {
      ...c,
      cases,
      deaths,
      recovered,
      active,
      todayCases,
      todayDeaths,
      critical: Math.round(active * 0.02),
    };
  });
}

export function synthesizeGlobalStats(data: CountryDiseaseData[]): GlobalStats {
  const totals = data.reduce(
    (a, c) => {
      a.cases += c.cases;
      a.deaths += c.deaths;
      a.recovered += c.recovered;
      a.active += c.active;
      if (c.cases > 0) a.affectedCountries += 1;
      return a;
    },
    { cases: 0, deaths: 0, recovered: 0, active: 0, affectedCountries: 0 },
  );
  return { ...totals, updated: Date.now() };
}

/** Synthetic historical timeline (180 days) using logistic growth for non-COVID diseases. */
export function synthesizeHistorical(
  country: CountryDiseaseData,
  disease: DiseaseDef,
  days = 180,
): HistoricalData {
  const cases: Record<string, number> = {};
  const deaths: Record<string, number> = {};
  const recovered: Record<string, number> = {};

  const total = country.cases;
  const totalDeaths = country.deaths;
  const k = 6 / days; // steepness
  const midpoint = days * (0.4 + hashStr(`mid-${disease.id}-${country.country}`) * 0.3);

  const now = Date.now();
  for (let i = 0; i <= days; i++) {
    const t = i;
    const logistic = 1 / (1 + Math.exp(-k * (t - midpoint)));
    const d = new Date(now - (days - i) * 86400000);
    const key = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
    cases[key] = Math.round(total * logistic);
    deaths[key] = Math.round(totalDeaths * logistic);
    recovered[key] = Math.round(total * 0.85 * Math.max(0, logistic - 0.05));
  }
  return { timeline: { cases, deaths, recovered } };
}

export function severityColorFor(active: number, disease: DiseaseDef): string {
  const s = disease.severity;
  if (active >= s.extreme) return "#CC0000";
  if (active >= s.critical) return "#FF3B3B";
  if (active >= s.high) return "#FF6B35";
  if (active >= s.moderate) return "#FFB347";
  if (active >= s.low) return "#1DB954";
  return "#1A2540";
}

export function severityLevelFor(active: number, disease: DiseaseDef): string {
  const s = disease.severity;
  if (active >= s.extreme) return "extreme";
  if (active >= s.critical) return "critical";
  if (active >= s.high) return "high";
  if (active >= s.moderate) return "moderate";
  if (active >= s.low) return "low";
  return "none";
}
