import { useEffect, useRef, useState } from "react";
import { DISEASES, type DiseaseDef } from "@/utils/diseaseRegistry";

interface Props {
  selected: DiseaseDef;
  onChange: (d: DiseaseDef) => void;
  timeMode: string; // 'PAST' or 'PRESENT'
}

const ERA_LABEL: Record<DiseaseDef["era"], string> = {
  current: "CURRENT",
  recent: "RECENT",
  past: "HISTORICAL",
};

const ERA_COLOR: Record<DiseaseDef["era"], string> = {
  current: "#00FFD1",
  recent: "#FFB347",
  past: "#FF6B35",
};

export default function DiseaseSelector({ selected, onChange, timeMode }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Filter diseases by time-mode: PAST = historical outbreaks; PRESENT = current + recent
  const visible = DISEASES.filter((d) =>
    timeMode === "PAST" ? d.era === "past" : d.era !== "past",
  );
  const grouped: Record<DiseaseDef["era"], DiseaseDef[]> = { current: [], recent: [], past: [] };
  visible.forEach((d) => grouped[d.era].push(d));
  const visibleEras = (["current", "recent", "past"] as const).filter((e) => grouped[e].length > 0);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-[0.15em] uppercase font-medium transition-colors"
        style={{
          background: open ? "rgba(0,255,209,0.08)" : "rgba(10,16,32,0.9)",
          border: `1px solid ${open ? "#00FFD1" : "#1A2540"}`,
          color: open ? "#00FFD1" : "#E8EDF5CC",
          borderRadius: 0,
        }}
      >
        <span style={{ color: ERA_COLOR[selected.era] }}>◆</span>
        <span>{selected.short}</span>
        <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-72 max-h-[70vh] overflow-y-auto z-50"
          style={{ background: "#0A1020", border: "1px solid #1A2540" }}
        >
          {visibleEras.map((era) => (
            <div key={era}>
              <div
                className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase"
                style={{
                  color: ERA_COLOR[era],
                  background: "#0D1525",
                  borderBottom: "1px solid #1A2540",
                }}
              >
                {ERA_LABEL[era]}
              </div>
              {grouped[era].map((d) => {
                const active = d.id === selected.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      onChange(d);
                      setOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left transition-colors hover:bg-white/5"
                    style={{
                      background: active ? "rgba(0,255,209,0.08)" : "transparent",
                      borderLeft: active ? "2px solid #00FFD1" : "2px solid transparent",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: active ? "#00FFD1" : "#E8EDF5" }}
                      >
                        {d.name}
                      </span>
                      <span className="text-[9px] tracking-[0.1em]" style={{ color: "#E8EDF566" }}>
                        R₀ {d.R0.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#E8EDF566" }}>
                      {d.year} · {d.transmission}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
