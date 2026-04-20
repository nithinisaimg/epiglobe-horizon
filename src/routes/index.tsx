import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import NavBar from '@/components/epiglobe/NavBar';
import TickerStrip from '@/components/epiglobe/TickerStrip';
import StatsBar from '@/components/epiglobe/StatsBar';
import SearchBar from '@/components/epiglobe/SearchBar';
import SidePanel from '@/components/epiglobe/SidePanel';
import type { CountryDiseaseData, GlobalStats } from '@/utils/diseaseAPI';
import { fetchAllCountries, fetchGlobalStats } from '@/utils/diseaseAPI';
import type { GlobeHandle } from '@/components/epiglobe/GlobeView';
import { DISEASES, synthesizeCountryData, synthesizeGlobalStats, type DiseaseDef } from '@/utils/diseaseRegistry';

export const Route = createFileRoute('/')({
  component: Index,
  head: () => ({
    meta: [
      { title: 'EpiGlobe — Global Disease Intelligence' },
      { name: 'description', content: 'Real-time interactive 3D globe for tracking global disease outbreaks and spread predictions.' },
    ],
  }),
});

function Index() {
  const [baseCountries, setBaseCountries] = useState<CountryDiseaseData[]>([]);
  const [covidGlobal, setCovidGlobal] = useState<GlobalStats | null>(null);
  const [disease, setDisease] = useState<DiseaseDef>(DISEASES[0]);
  const [selectedCountry, setSelectedCountry] = useState<CountryDiseaseData | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [timeMode, setTimeMode] = useState('PRESENT');
  const [showIntro, setShowIntro] = useState(true);
  const [GlobeComponent, setGlobeComponent] = useState<any>(null);
  const globeRef = useRef<GlobeHandle>(null);

  // Load Globe dynamically (client-only)
  useEffect(() => {
    import('@/components/epiglobe/GlobeView').then(mod => {
      setGlobeComponent(() => mod.default);
    });
  }, []);

  // Fetch data
  useEffect(() => {
    fetchAllCountries().then(setBaseCountries).catch(console.error);
    fetchGlobalStats().then(setCovidGlobal).catch(console.error);
  }, []);

  // Hide intro
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const countries = useMemo(
    () => synthesizeCountryData(baseCountries, disease),
    [baseCountries, disease],
  );
  const globalStats = useMemo(
    () => (disease.id === 'covid19' ? covidGlobal : synthesizeGlobalStats(countries)),
    [disease, covidGlobal, countries],
  );

  // When disease changes, refresh the selected country's data so side panel updates
  useEffect(() => {
    if (!selectedCountry) return;
    const refreshed = countries.find(c => c.country === selectedCountry.country);
    if (refreshed) setSelectedCountry(refreshed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disease, countries]);

  const handleCountryClick = useCallback((country: CountryDiseaseData, name: string) => {
    setSelectedCountry(country);
    setSelectedName(name);
  }, []);

  const handleSearch = useCallback((country: CountryDiseaseData) => {
    setSelectedCountry(country);
    setSelectedName(country.country);
    globeRef.current?.flyTo(country.countryInfo.lat, country.countryInfo.long);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedCountry(null);
    setSelectedName('');
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#050A14' }}>
      {/* Globe (full viewport background) */}
      {GlobeComponent && (
        <GlobeComponent
          ref={globeRef}
          diseaseData={countries}
          onCountryClick={handleCountryClick}
          disease={disease}
        />
      )}

      {/* Intro overlay */}
      {showIntro && (
        <div className="intro-overlay absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p
            className="text-[13px] tracking-[0.15em] uppercase"
            style={{ color: 'rgba(0,255,209,0.5)' }}
          >
            Select a region to begin → Click any country on the globe
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <NavBar timeMode={timeMode} onTimeModeChange={setTimeMode} disease={disease} onDiseaseChange={setDisease} />
        <TickerStrip data={countries} disease={disease} />
      </div>

      {/* Search */}
      <SearchBar countries={countries} onSelect={handleSearch} />

      {/* Side Panel */}
      <SidePanel
        country={selectedCountry}
        countryName={selectedName}
        timeMode={timeMode}
        disease={disease}
        onClose={handleClose}
      />

      {/* Bottom Stats */}
      <StatsBar stats={globalStats ?? null} disease={disease} />
    </div>
  );
}
