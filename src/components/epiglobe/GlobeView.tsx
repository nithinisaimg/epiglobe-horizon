import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { CountryDiseaseData } from '@/utils/diseaseAPI';
import { getSeverityColor } from '@/utils/diseaseAPI';

const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

export interface GlobeHandle {
  flyTo: (lat: number, lng: number) => void;
}

interface GlobeViewProps {
  diseaseData: CountryDiseaseData[];
  onCountryClick: (country: CountryDiseaseData, name: string) => void;
}

function matchCountry(d: CountryDiseaseData, feat: any): boolean {
  const iso3 = feat.properties?.ISO_A3;
  const name = feat.properties?.NAME || feat.properties?.ADMIN;
  if (d.countryInfo?.iso3 && iso3 && d.countryInfo.iso3 === iso3) return true;
  if (d.country && name && d.country.toLowerCase() === name.toLowerCase()) return true;
  return false;
}

const GlobeView = forwardRef<GlobeHandle, GlobeViewProps>(({ diseaseData, onCountryClick }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const dataRef = useRef<CountryDiseaseData[]>(diseaseData);
  const callbackRef = useRef(onCountryClick);
  
  dataRef.current = diseaseData;
  callbackRef.current = onCountryClick;

  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number) => {
      globeRef.current?.pointOfView({ lat, lng, altitude: 1.8 }, 1200);
    },
  }));

  const getColorForFeature = useCallback((feat: any) => {
    const data = dataRef.current;
    if (!data.length) return '#1A2540';
    const match = data.find(d => matchCountry(d, feat));
    if (!match) return '#1A2540';
    return getSeverityColor(match.active);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    let instance: any = null;

    const init = async () => {
      const GlobeModule = await import('globe.gl');
      const Globe = GlobeModule.default;
      if (destroyed || !containerRef.current) return;

      const geoRes = await fetch(GEOJSON_URL);
      const geoData = await geoRes.json();
      if (destroyed || !containerRef.current) return;

      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      instance = Globe()(containerRef.current)
        .width(w)
        .height(h)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('#0066ff')
        .atmosphereAltitude(0.2)
        .polygonsData(geoData.features)
        .polygonCapColor((d: any) => getColorForFeature(d))
        .polygonSideColor(() => 'rgba(0,255,209,0.03)')
        .polygonStrokeColor(() => '#1A254066')
        .polygonAltitude(0.006)
        .polygonLabel((d: any) => {
          const name = d.properties?.NAME || d.properties?.ADMIN || 'Unknown';
          const match = dataRef.current.find((c: CountryDiseaseData) => matchCountry(c, d));
          return `<div style="background:#0A1020;padding:8px 14px;border:1px solid #1A2540;font-family:'Space Grotesk',sans-serif;color:#E8EDF5;font-size:13px;border-radius:2px">
            <b style="color:#00FFD1">${name}</b><br/>
            ${match ? `Active: <span style="color:#FFB347">${match.active?.toLocaleString()}</span>` : '<span style="color:#555">No data</span>'}
          </div>`;
        })
        .onPolygonClick((d: any) => {
          const name = d.properties?.NAME || d.properties?.ADMIN || 'Unknown';
          const match = dataRef.current.find((c: CountryDiseaseData) => matchCountry(c, d));
          if (match) {
            callbackRef.current(match, name);
            const lat = match.countryInfo.lat;
            const lng = match.countryInfo.long;
            instance?.pointOfView({ lat, lng, altitude: 1.8 }, 1200);
          }
        })
        .onPolygonHover((d: any) => {
          if (instance) {
            instance.polygonAltitude((f: any) => f === d ? 0.02 : 0.006);
            instance.polygonStrokeColor((f: any) => f === d ? '#00FFD1' : '#1A254066');
          }
        })
        .polygonsTransitionDuration(200);

      // Auto rotation
      instance.controls().autoRotate = true;
      instance.controls().autoRotateSpeed = 0.4;
      instance.controls().enableDamping = true;
      instance.controls().dampingFactor = 0.1;

      globeRef.current = instance;

      // Resize handler
      const ro = new ResizeObserver(entries => {
        if (entries[0] && instance) {
          const { width, height } = entries[0].contentRect;
          instance.width(width).height(height);
        }
      });
      ro.observe(containerRef.current!);
      
      return () => ro.disconnect();
    };

    init();

    return () => {
      destroyed = true;
      if (instance) {
        instance._destructor?.();
      }
    };
  }, [getColorForFeature]);

  // Update arcs and points when data changes
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !diseaseData.length) return;

    // Refresh polygon colors
    globe.polygonCapColor((d: any) => getColorForFeature(d));

    // Arcs between top-10 countries
    const sorted = [...diseaseData].sort((a, b) => b.active - a.active).slice(0, 10);
    const arcs: any[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      arcs.push({
        startLat: sorted[i].countryInfo.lat,
        startLng: sorted[i].countryInfo.long,
        endLat: sorted[i + 1].countryInfo.lat,
        endLng: sorted[i + 1].countryInfo.long,
        color: ['rgba(255,179,71,0.4)', 'rgba(255,59,59,0.4)'],
      });
    }
    globe
      .arcsData(arcs)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(2000)
      .arcStroke(0.5);

    // Pulsing points for high-risk countries (active > 1M)
    const highRisk = diseaseData.filter(d => d.active > 1000000);
    globe
      .pointsData(highRisk.map(d => ({
        lat: d.countryInfo.lat,
        lng: d.countryInfo.long,
        size: Math.min(1, d.active / 5000000),
        color: '#FF3B3B',
      })))
      .pointAltitude(0.02)
      .pointColor('color')
      .pointRadius('size');

  }, [diseaseData, getColorForFeature]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ background: '#050A14' }}
    />
  );
});

GlobeView.displayName = 'GlobeView';
export default GlobeView;
