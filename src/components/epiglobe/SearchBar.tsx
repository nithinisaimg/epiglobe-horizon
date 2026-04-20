import { useState, useRef, useEffect } from "react";
import type { CountryDiseaseData } from "@/utils/diseaseAPI";

interface SearchBarProps {
  countries: CountryDiseaseData[];
  onSelect: (country: CountryDiseaseData) => void;
}

export default function SearchBar({ countries, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length > 0
      ? countries.filter((c) => c.country.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest(".search-container")) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="search-container fixed top-28 left-6 z-10" style={{ width: 250 }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search country..."
        className="w-full px-3 py-2 text-xs tracking-wide outline-none"
        style={{
          background: "rgba(10,16,32,0.9)",
          border: "1px solid #1A2540",
          color: "#E8EDF5",
          borderRadius: 2,
          backdropFilter: "blur(8px)",
        }}
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-0.5 overflow-hidden"
          style={{ background: "#0A1020", border: "1px solid #1A2540", borderRadius: 2 }}
        >
          {filtered.map((c) => (
            <button
              key={c.countryInfo._id}
              className="w-full px-3 py-2 text-left text-xs hover:bg-white/5 flex items-center gap-2 transition-colors"
              style={{ color: "#E8EDF5" }}
              onClick={() => {
                onSelect(c);
                setQuery("");
                setOpen(false);
              }}
            >
              <img src={c.countryInfo.flag} alt="" className="w-4 h-3 object-cover" />
              {c.country}
              <span className="ml-auto text-[10px]" style={{ color: "#E8EDF555" }}>
                {c.active.toLocaleString()} active
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
