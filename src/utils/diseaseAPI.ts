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

function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
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
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* quota exceeded */
  }
}

export async function fetchAllCountries(): Promise<CountryDiseaseData[]> {
  const cached = getCached<CountryDiseaseData[]>("epi_countries");
  if (cached) return cached;
  const res = await fetch("https://disease.sh/v3/covid-19/countries?sort=cases");
  if (!res.ok) throw new Error("Failed to fetch country data");
  const data = await res.json();
  setCache("epi_countries", data);
  return data;
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const cached = getCached<GlobalStats>("epi_global");
  if (cached) return cached;
  const res = await fetch("https://disease.sh/v3/covid-19/all");
  if (!res.ok) throw new Error("Failed to fetch global stats");
  const data = await res.json();
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
  const data = await res.json();
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
