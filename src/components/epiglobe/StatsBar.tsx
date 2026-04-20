import type { GlobalStats } from '@/utils/diseaseAPI';
import type { DiseaseDef } from '@/utils/diseaseRegistry';

interface StatsBarProps {
  stats: GlobalStats | null;
  disease: DiseaseDef;
}

export default function StatsBar({ stats, disease }: StatsBarProps) {
  if (!stats) return null;

  const items = [
    { label: `${disease.short.toUpperCase()} CASES`, value: stats.cases },
    { label: 'DEATHS', value: stats.deaths },
    { label: 'COUNTRIES', value: stats.affectedCountries },
    { label: 'LAST UPDATED', value: new Date(stats.updated).toLocaleTimeString() },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-0"
      style={{ background: 'rgba(5,10,20,0.9)', borderTop: '1px solid #1A2540', backdropFilter: 'blur(8px)' }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className="flex flex-col items-center py-2.5 px-8"
          style={{ borderRight: i < items.length - 1 ? '1px solid #1A2540' : 'none' }}
        >
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#E8EDF555' }}>
            {item.label}
          </span>
          <span className="text-sm font-semibold" style={{ color: '#00FFD1' }}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
