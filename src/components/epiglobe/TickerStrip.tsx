import { useMemo } from 'react';
import type { CountryDiseaseData } from '@/utils/diseaseAPI';
import { severityColorFor, type DiseaseDef } from '@/utils/diseaseRegistry';

interface TickerStripProps {
  data: CountryDiseaseData[];
  disease: DiseaseDef;
}

export default function TickerStrip({ data, disease }: TickerStripProps) {
  const items = useMemo(() => {
    return [...data]
      .sort((a, b) => b.active - a.active)
      .slice(0, 30)
      .map(d => ({
        country: d.country,
        active: d.active,
        color: severityColorFor(d.active, disease),
      }));
  }, [data, disease]);

  if (!items.length) return null;

  const content = items.map((item, i) => (
    <span key={i} className="inline-flex items-center gap-2 mx-4 whitespace-nowrap text-xs tracking-wide">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: item.color }} />
      <span style={{ color: '#E8EDF5' }}>{item.country}</span>
      <span style={{ color: '#E8EDF588' }}>{disease.short}</span>
      <span style={{ color: item.color }}>{item.active.toLocaleString()}</span>
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
