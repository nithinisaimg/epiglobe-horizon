import { useEffect, useState, useCallback } from 'react';
import type { CountryDiseaseData, HistoricalData } from '@/utils/diseaseAPI';
import { fetchHistorical, getSeverityLevel } from '@/utils/diseaseAPI';
import { runSIRModel, getRiskForecast } from '@/utils/sirModel';
import type { SIRResult } from '@/utils/sirModel';
import DiseaseChart from './DiseaseChart';

interface SidePanelProps {
  country: CountryDiseaseData | null;
  countryName: string;
  timeMode: string;
  onClose: () => void;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return value;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const animated = useCountUp(value);
  return (
    <div className="p-3" style={{ background: '#0D1525', border: '1px solid #1A2540' }}>
      <div className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#E8EDF555' }}>{label}</div>
      <div className="text-lg font-semibold mt-1 animate-fade-up" style={{ color }}>{animated.toLocaleString()}</div>
    </div>
  );
}

export default function SidePanel({ country, countryName, timeMode, onClose }: SidePanelProps) {
  const [historical, setHistorical] = useState<HistoricalData | null>(null);
  const [predictions, setPredictions] = useState<SIRResult[] | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = useCallback(async (c: CountryDiseaseData) => {
    setChartLoading(true);
    try {
      const hist = await fetchHistorical(c.country);
      setHistorical(hist);
      const pred = runSIRModel(c.population, c.active, c.recovered, 30);
      setPredictions(pred);
    } catch {
      setHistorical(null);
      setPredictions(null);
    }
    setChartLoading(false);
  }, []);

  const generateBriefing = useCallback((c: CountryDiseaseData, mode: string) => {
    setAiLoading(true);
    const severity = getSeverityLevel(c.active);
    const trend = c.todayCases > 0 ? 'increasing' : 'stable or decreasing';
    const briefing = `COVID-19 in ${c.country} (${mode} analysis): Currently ${severity} risk with ${c.active.toLocaleString()} active cases. The disease spreads primarily via respiratory droplets and aerosol transmission. Current trend is ${trend} with ${c.todayCases.toLocaleString()} new cases reported today. ${c.recovered.toLocaleString()} recoveries indicate ongoing containment efforts. Key prevention: maintain hand hygiene, wear masks in crowded indoor spaces, and stay up to date with vaccinations.`;
    setTimeout(() => {
      setAiBriefing(briefing);
      setAiLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    if (country) {
      loadData(country);
      generateBriefing(country, timeMode);
    }
  }, [country, timeMode, loadData, generateBriefing]);

  if (!country) return null;

  const severity = getSeverityLevel(country.active);
  const forecast = predictions ? getRiskForecast(predictions) : null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-40 overflow-y-auto slide-in-right"
      style={{
        width: 400,
        background: 'rgba(5,10,20,0.95)',
        borderLeft: '1px solid #1A2540',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-sm transition-colors"
        style={{ color: '#E8EDF566', border: '1px solid #1A2540' }}
      >
        ✕
      </button>

      <div className="p-5 space-y-5">
        {/* Country header */}
        <div>
          <div className="flex items-center gap-3">
            <img src={country.countryInfo.flag} alt="" className="w-8 h-5 object-cover" />
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#E8EDF5' }}>{countryName}</h2>
              <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#E8EDF555' }}>
                {country.continent}
              </span>
            </div>
          </div>
          <div
            className="inline-block mt-2 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase font-medium"
            style={{
              color: severity === 'extreme' || severity === 'critical' ? '#FF3B3B'
                : severity === 'high' ? '#FF6B35'
                : severity === 'moderate' ? '#FFB347'
                : '#1DB954',
              border: `1px solid ${severity === 'extreme' || severity === 'critical' ? '#FF3B3B33' : '#1A2540'}`,
              background: severity === 'extreme' || severity === 'critical' ? 'rgba(255,59,59,0.08)' : 'transparent',
            }}
          >
            {severity} risk
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Confirmed" value={country.cases} color="#E8EDF5" />
          <StatCard label="Active" value={country.active} color="#FFB347" />
          <StatCard label="Recovered" value={country.recovered} color="#1DB954" />
          <StatCard label="Deaths" value={country.deaths} color="#FF3B3B" />
        </div>

        {/* Chart */}
        <div>
          <div className="text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#E8EDF555' }}>
            {timeMode === 'PAST' ? 'Historical Trend (180 days)' : timeMode === 'PRESENT' ? 'Current Trend' : '30-Day Forecast (SIR Model)'}
          </div>
          <DiseaseChart
            historical={historical}
            predictions={timeMode === 'FUTURE' ? predictions : null}
            timeMode={timeMode}
            loading={chartLoading}
          />
        </div>

        {/* Future risk forecast */}
        {timeMode === 'FUTURE' && forecast && (
          <div className="p-3" style={{ background: '#0D1525', border: '1px solid #1A2540' }}>
            <div className="text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#E8EDF555' }}>
              Risk Forecast
            </div>
            <div className="text-xs space-y-1" style={{ color: '#E8EDF5CC' }}>
              <div>Trend: <span style={{ color: forecast.trend === 'increasing' ? '#FF3B3B' : forecast.trend === 'decreasing' ? '#1DB954' : '#FFB347' }}>
                {forecast.trend.toUpperCase()}
              </span></div>
              <div>Peak: Day {forecast.peakDay} ({forecast.peakInfected.toLocaleString()} cases)</div>
              <div>Risk Level: <span style={{ color: '#FFB347' }}>{forecast.riskLevel}</span></div>
            </div>
          </div>
        )}

        {/* AI Briefing */}
        <div>
          <div className="text-[10px] tracking-[0.15em] uppercase mb-2 flex items-center gap-2" style={{ color: '#00FFD1' }}>
            <span>◆</span> AI INTEL
          </div>
          <div className="p-3" style={{ background: '#0D1525', border: '1px solid #1A2540' }}>
            {aiLoading ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00FFD1', borderTopColor: 'transparent' }} />
                <span className="text-xs" style={{ color: '#E8EDF555' }}>Generating briefing...</span>
              </div>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: '#E8EDF5CC' }}>
                {aiBriefing}
              </p>
            )}
          </div>
          <div className="text-[9px] mt-1" style={{ color: '#E8EDF533' }}>
            Enable Lovable Cloud for live AI-powered briefings
          </div>
        </div>
      </div>
    </div>
  );
}
