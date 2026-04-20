import { useMemo } from 'react';
import type { CountryDiseaseData } from '@/utils/diseaseAPI';
import {
  DISEASES,
  synthesizeCountryData,
  severityColorFor,
} from '@/utils/diseaseRegistry';

interface TickerStripProps {
  // Base (real) country list — we compute the worst non-COVID disease per country ourselves
  data: CountryDiseaseData[];
}

export default function TickerStrip({ data }: TickerStripProps) {
  // For each country, find the non-COVID disease with the highest synthesized case count.
  const items = useMemo(() => {
    if (!data.length) return [];
    const nonCovid = DISEASES.filter(d => d.id !== 'covid19');

    // Pre-synthesize once per disease for efficiency
    const perDisease = nonCovid.map(d => ({
      disease: d,
      byCountry: new Map(
        synthesizeCountryData(data, d).map(c => [c.country, c]),
      ),
    }));

    return data.map(c => {
      let bestDisease = perDisease[0].disease;
      let bestCases = 0;
      let bestActive = 0;
      for (const { disease, byCountry } of perDisease) {
        const entry = byCountry.get(c.country);
        if (entry && entry.cases > bestCases) {
          bestCases = entry.cases;
          bestActive = entry.active;
          bestDisease = disease;
        }
      }
      return {
        country: c.country,
        disease: bestDisease.short,
        cases: bestCases,
        active: bestActive,
        color: severityColorFor(bestActive, bestDisease),
      };
    }).sort((a, b) => b.cases - a.cases);
  }, [data]);

  if (!items.length) return null;

  const content = items.map((item, i) => (
    <span key={i} className="inline-flex items-center gap-2 mx-4 whitespace-nowrap text-xs tracking-wide">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: item.color }} />
      <span style={{ color: '#E8EDF5' }}>{item.country}</span>
      <span style={{ color: '#E8EDF588' }}>{item.disease}</span>
      <span style={{ color: item.color }}>{item.cases.toLocaleString()}</span>
      <span style={{ color: '#1A2540' }}>·</span>
    </span>
  ));

  return (
    <div
      className="relative z-20 overflow-hidden"
      style={{ height: 28, background: '#0A1020', borderBottom: '1px solid #1A2540' }}
    >
      <div className="ticker-animate flex items-center h-full" style={{ width: 'max-content' }}>
        {content}
        {content}
      </div>
    </div>
  );
}
