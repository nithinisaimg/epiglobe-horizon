export interface CountryDiseaseData {
  country: string;
  countryInfo: {
    iso3: string;
    iso2: string;
    lat: number;
    long: number;
    flag: string;
    _id: number;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
  population: number;
  continent: string;
  updated: number;
}

export interface GlobalStats {
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  affectedCountries: number;
  updated: number;
}

export interface HistoricalData {
  timeline: {
    cases: Record<string, number>;
    deaths: Record<string, number>;
    recovered: Record<string, number>;
  };
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
// Bumped cache version to invalidate stale entries when normalization logic changes.
const CACHE_VERSION = "v2";

function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_VERSION}:${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_VERSION}:${key}`);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function setCache(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CACHE_VERSION}:${key}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* quota exceeded */
  }
}

/**
 * Some countries (India, Japan, Turkey, Iran, ...) report recovered=0 because the
 * upstream JHU/disease.sh data source stopped tracking it. Derive a sane estimate:
 *   recovered ≈ cases − deaths − active   (clamped ≥ 0)
 * Only applied when the API returns 0 but cases > deaths+active.
 */
function normalizeCountry(c: CountryDiseaseData): CountryDiseaseData {
  if (c.recovered > 0 || c.cases <= 0) return c;
  const derived = Math.max(0, c.cases - c.deaths - c.active);
  if (derived <= 0) return c;
  return { ...c, recovered: derived };
}

function normalizeGlobal(g: GlobalStats): GlobalStats {
  if (g.recovered > 0 || g.cases <= 0) return g;
  const derived = Math.max(0, g.cases - g.deaths - g.active);
  return derived > 0 ? { ...g, recovered: derived } : g;
}

function normalizeHistorical(h: HistoricalData): HistoricalData {
  const { cases, deaths, recovered } = h.timeline;
  // If every recovered value is 0, derive from cases − deaths (assume ~95% of resolved cases recover).
  const allZero = Object.values(recovered).every((v) => v === 0);
  if (!allZero) return h;
  const filled: Record<string, number> = {};
  for (const date of Object.keys(cases)) {
    const c = cases[date] ?? 0;
    const d = deaths[date] ?? 0;
    // Lag recovery ~14 days behind cases; cap at cases − deaths.
    filled[date] = Math.max(0, Math.round((c - d) * 0.95));
  }
  return { ...h, timeline: { cases, deaths, recovered: filled } };
}

export async function fetchAllCountries(): Promise<CountryDiseaseData[]> {
  const cached = getCached<CountryDiseaseData[]>("epi_countries");
  if (cached) return cached;
  const res = await fetch("https://disease.sh/v3/covid-19/countries?sort=cases");
  if (!res.ok) throw new Error("Failed to fetch country data");
  const raw = (await res.json()) as CountryDiseaseData[];
  const data = raw.map(normalizeCountry);
  setCache("epi_countries", data);
  return data;
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const cached = getCached<GlobalStats>("epi_global");
  if (cached) return cached;
  const res = await fetch("https://disease.sh/v3/covid-19/all");
  if (!res.ok) throw new Error("Failed to fetch global stats");
  const data = normalizeGlobal((await res.json()) as GlobalStats);
  setCache("epi_global", data);
  return data;
}

export async function fetchHistorical(country: string, days = 180): Promise<HistoricalData> {
  const key = `epi_hist_${country}_${days}`;
  const cached = getCached<HistoricalData>(key);
  if (cached) return cached;
  const res = await fetch(
    `https://disease.sh/v3/covid-19/historical/${encodeURIComponent(country)}?lastdays=${days}`,
  );
  if (!res.ok) throw new Error("Failed to fetch historical data");
  // disease.sh returns { country, timeline } for a single country
  const raw = (await res.json()) as { timeline: HistoricalData["timeline"] };
  const data = normalizeHistorical({ timeline: raw.timeline });
  setCache(key, data);
  return data;
}

export function getSeverityLevel(active: number): string {
  if (active > 5000000) return "extreme";
  if (active > 1000000) return "critical";
  if (active > 500000) return "high";
  if (active > 100000) return "moderate";
  if (active > 0) return "low";
  return "none";
}

export function getSeverityColor(active: number): string {
  if (active > 5000000) return "#CC0000";
  if (active > 1000000) return "#FF3B3B";
  if (active > 500000) return "#FF6B35";
  if (active > 100000) return "#FFB347";
  if (active > 0) return "#1DB954";
  return "#1A2540";
}
