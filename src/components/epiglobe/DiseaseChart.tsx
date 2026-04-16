import { useEffect, useRef, useState } from 'react';
import type { HistoricalData } from '@/utils/diseaseAPI';
import type { SIRResult } from '@/utils/sirModel';

interface DiseaseChartProps {
  historical: HistoricalData | null;
  predictions: SIRResult[] | null;
  timeMode: string;
  loading: boolean;
}

export default function DiseaseChart({ historical, predictions, timeMode, loading }: DiseaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Dynamically load chart.js
  useEffect(() => {
    import('chart.js').then(mod => {
      const { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } = mod;
      Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    
    import('chart.js').then(({ Chart }) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;

      let labels: string[] = [];
      let datasets: any[] = [];

      if ((timeMode === 'PAST' || timeMode === 'PRESENT') && historical?.timeline?.cases) {
        const entries = Object.entries(historical.timeline.cases);
        labels = entries.map(([date]) => date);
        datasets = [{
          label: 'Cases',
          data: entries.map(([, val]) => val),
          borderColor: '#00FFD1',
          backgroundColor: 'rgba(0,255,209,0.05)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: true,
          tension: 0.3,
        }];

        if (historical.timeline.deaths) {
          const deathEntries = Object.entries(historical.timeline.deaths);
          datasets.push({
            label: 'Deaths',
            data: deathEntries.map(([, val]) => val),
            borderColor: '#FF3B3B',
            backgroundColor: 'rgba(255,59,59,0.05)',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: true,
            tension: 0.3,
          });
        }
      }

      if (timeMode === 'FUTURE' && predictions) {
        labels = predictions.map(p => `Day ${p.day}`);
        datasets = [
          {
            label: 'Projected Infected',
            data: predictions.map(p => p.infected),
            borderColor: '#FFB347',
            borderDash: [5, 3],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Projected Recovered',
            data: predictions.map(p => p.recovered),
            borderColor: '#1DB954',
            borderDash: [5, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
            fill: false,
          },
        ];

        // Add historical tail if available
        if (historical?.timeline?.cases) {
          const entries = Object.entries(historical.timeline.cases).slice(-30);
          const histLabels = entries.map(([date]) => date);
          const histData = entries.map(([, val]) => val);
          labels = [...histLabels, ...labels];
          datasets.unshift({
            label: 'Historical Cases',
            data: [...histData, ...Array(predictions.length).fill(null)],
            borderColor: '#00FFD1',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
            fill: false,
          });
          // Pad predictions
          datasets[1].data = [...Array(histLabels.length).fill(null), ...predictions.map(p => p.infected)];
          datasets[2].data = [...Array(histLabels.length).fill(null), ...predictions.map(p => p.recovered)];
        }
      }

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#E8EDF588', font: { family: "'Space Grotesk'", size: 10 } },
            },
            tooltip: {
              backgroundColor: '#0A1020',
              borderColor: '#1A2540',
              borderWidth: 1,
              titleFont: { family: "'Space Grotesk'" },
              bodyFont: { family: "'Space Grotesk'" },
            },
          },
          scales: {
            x: {
              ticks: { color: '#E8EDF544', font: { size: 9, family: "'Space Grotesk'" }, maxTicksLimit: 8 },
              grid: { color: '#1A254033' },
            },
            y: {
              ticks: { color: '#E8EDF544', font: { size: 9, family: "'Space Grotesk'" } },
              grid: { color: '#1A254033' },
            },
          },
        },
      });
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [ready, historical, predictions, timeMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00FFD1', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ height: 200 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
