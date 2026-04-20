import { useState } from "react";
import type { HistoricalDisease } from "@/utils/historicalDiseases";
import {
  getHistoricalDiseases,
  spreadRateLabel,
  spreadRateColor,
} from "@/utils/historicalDiseases";

interface Props {
  country: string;
  continent?: string;
}

export default function HistoricalDiseases({ country, continent }: Props) {
  const [open, setOpen] = useState(false);
  const diseases: HistoricalDisease[] = getHistoricalDiseases(country, continent);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] tracking-[0.15em] uppercase transition-colors"
        style={{
          background: open ? "rgba(0,255,209,0.08)" : "#0D1525",
          border: `1px solid ${open ? "#00FFD1" : "#1A2540"}`,
          color: open ? "#00FFD1" : "#E8EDF5AA",
          borderRadius: 0,
        }}
      >
        <span className="flex items-center gap-2">
          <span>◷</span> Past Diseases ({diseases.length})
        </span>
        <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 animate-fade-up">
          {diseases.map((d, i) => {
            const color = spreadRateColor(d.spreadRate);
            return (
              <div
                key={`${d.name}-${i}`}
                className="p-3"
                style={{
                  background: "#0D1525",
                  border: "1px solid #1A2540",
                  borderLeft: `2px solid ${color}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold" style={{ color: "#E8EDF5" }}>
                    {d.name}
                  </div>
                  <div
                    className="text-[10px] tracking-[0.1em] uppercase shrink-0"
                    style={{ color: "#E8EDF566" }}
                  >
                    {d.year}
                  </div>
                </div>
                <div
                  className="mt-2 grid grid-cols-2 gap-1 text-[10px]"
                  style={{ color: "#E8EDF599" }}
                >
                  <div>
                    Cases: <span style={{ color: "#E8EDF5" }}>{d.cases.toLocaleString()}</span>
                  </div>
                  <div>
                    Deaths: <span style={{ color: "#FF3B3B" }}>{d.deaths.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span style={{ color: "#E8EDF566" }}>{d.transmission}</span>
                  <span
                    className="px-1.5 py-0.5 tracking-[0.1em] uppercase font-medium"
                    style={{ color, border: `1px solid ${color}55`, background: `${color}11` }}
                  >
                    R≈{d.spreadRate.toFixed(1)} · {spreadRateLabel(d.spreadRate)}
                  </span>
                </div>
                {/* Spread rate bar */}
                <div className="mt-2 h-1" style={{ background: "#1A2540" }}>
                  <div
                    style={{
                      width: `${Math.min(100, (d.spreadRate / 15) * 100)}%`,
                      background: color,
                      height: "100%",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
