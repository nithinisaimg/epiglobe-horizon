import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import type { CountryDiseaseData } from "@/utils/diseaseAPI";
import { severityColorFor, type DiseaseDef } from "@/utils/diseaseRegistry";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

export interface GlobeHandle {
  flyTo: (lat: number, lng: number) => void;
}

interface GlobeViewProps {
  diseaseData: CountryDiseaseData[];
  onCountryClick: (country: CountryDiseaseData, name: string) => void;
  disease: DiseaseDef;
}

interface GlobeFeature {
  properties?: {
    ISO_A3?: string;
    NAME?: string;
    ADMIN?: string;
  };
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
}

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
}

interface GlobeControls {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  dampingFactor: number;
}

interface GlobeInstance {
  width: (value: number) => GlobeInstance;
  height: (value: number) => GlobeInstance;
  globeImageUrl: (value: string) => GlobeInstance;
  bumpImageUrl: (value: string) => GlobeInstance;
  backgroundImageUrl: (value: string) => GlobeInstance;
  showAtmosphere: (value: boolean) => GlobeInstance;
  atmosphereColor: (value: string) => GlobeInstance;
  atmosphereAltitude: (value: number) => GlobeInstance;
  polygonsData: (value: GlobeFeature[]) => GlobeInstance;
  polygonCapColor: (value: (feature: GlobeFeature) => string) => GlobeInstance;
  polygonSideColor: (value: () => string) => GlobeInstance;
  polygonStrokeColor: (
    value: (() => string) | ((feature: GlobeFeature) => string),
  ) => GlobeInstance;
  polygonAltitude: (value: number | ((feature: GlobeFeature) => number)) => GlobeInstance;
  polygonLabel: (value: (feature: GlobeFeature) => string) => GlobeInstance;
  onPolygonClick: (value: (feature: GlobeFeature) => void) => GlobeInstance;
  onPolygonHover: (value: (feature: GlobeFeature) => void) => GlobeInstance;
  polygonsTransitionDuration: (value: number) => GlobeInstance;
  controls: () => GlobeControls;
  pointOfView: (position: { lat: number; lng: number; altitude: number }, ms: number) => void;
  arcsData: (value: GlobeArc[]) => GlobeInstance;
  arcColor: (value: string) => GlobeInstance;
  arcDashLength: (value: number) => GlobeInstance;
  arcDashGap: (value: number) => GlobeInstance;
  arcDashAnimateTime: (value: number) => GlobeInstance;
  arcStroke: (value: number) => GlobeInstance;
  pointsData: (value: GlobePoint[]) => GlobeInstance;
  pointAltitude: (value: number) => GlobeInstance;
  pointColor: (value: string) => GlobeInstance;
  pointRadius: (value: string) => GlobeInstance;
  _destructor?: () => void;
}

type GlobeFactory = new (container: HTMLDivElement) => GlobeInstance;

function matchCountry(d: CountryDiseaseData, feat: GlobeFeature): boolean {
  const props = feat.properties;
  if (!props) return false;
  const iso3 = props.ISO_A3;
  const name = props.NAME || props.ADMIN;
  if (d.countryInfo?.iso3 && iso3 && d.countryInfo.iso3 === iso3) return true;
  if (d.country && name && d.country.toLowerCase() === name.toLowerCase()) return true;
  return false;
}

const GlobeView = forwardRef<GlobeHandle, GlobeViewProps>(
  ({ diseaseData, onCountryClick, disease }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<GlobeInstance | null>(null);
    const dataRef = useRef<CountryDiseaseData[]>(diseaseData);
    const callbackRef = useRef(onCountryClick);
    const diseaseRef = useRef<DiseaseDef>(disease);

    dataRef.current = diseaseData;
    callbackRef.current = onCountryClick;
    diseaseRef.current = disease;

    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number) => {
        globeRef.current?.pointOfView({ lat, lng, altitude: 1.8 }, 1200);
      },
    }));

    const getColorForFeature = useCallback((feat: GlobeFeature) => {
      const data = dataRef.current;
      if (!data.length) return "#1A2540";
      const match = data.find((d) => matchCountry(d, feat));
      if (!match) return "#1A2540";
      return severityColorFor(match.active, diseaseRef.current);
    }, []);

    useEffect(() => {
      if (!containerRef.current) return;
      let destroyed = false;
      let instance: GlobeInstance | null = null;

      const init = async () => {
        const GlobeModule = await import("globe.gl");
        const Globe = GlobeModule.default as GlobeFactory;
        if (destroyed || !containerRef.current) return;

        const geoRes = await fetch(GEOJSON_URL);
        const geoData = (await geoRes.json()) as { features: GlobeFeature[] };
        if (destroyed || !containerRef.current) return;

        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;

        instance = new Globe(containerRef.current)
          .width(w)
          .height(h)
          .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
          .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
          .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
          .showAtmosphere(true)
          .atmosphereColor("#0066ff")
          .atmosphereAltitude(0.2)
          .polygonsData(geoData.features)
          .polygonCapColor((d) => getColorForFeature(d))
          .polygonSideColor(() => "rgba(0,255,209,0.03)")
          .polygonStrokeColor(() => "#1A254066")
          .polygonAltitude(0.006)
          .polygonLabel((d) => {
            const name = d.properties?.NAME || d.properties?.ADMIN || "Unknown";
            const match = dataRef.current.find((c: CountryDiseaseData) => matchCountry(c, d));
            return `<div style="background:#0A1020;padding:8px 14px;border:1px solid #1A2540;font-family:'Space Grotesk',sans-serif;color:#E8EDF5;font-size:13px;border-radius:2px">
            <b style="color:#00FFD1">${name}</b><br/>
            ${match ? `Active: <span style="color:#FFB347">${match.active?.toLocaleString()}</span>` : '<span style="color:#555">No data</span>'}
          </div>`;
          })
          .onPolygonClick((d) => {
            const name = d.properties?.NAME || d.properties?.ADMIN || "Unknown";
            const match = dataRef.current.find((c: CountryDiseaseData) => matchCountry(c, d));
            if (match) {
              callbackRef.current(match, name);
              const lat = match.countryInfo.lat;
              const lng = match.countryInfo.long;
              instance?.pointOfView({ lat, lng, altitude: 1.8 }, 1200);
            }
          })
          .onPolygonHover((d) => {
            if (instance) {
              instance.polygonAltitude((f) => (f === d ? 0.02 : 0.006));
              instance.polygonStrokeColor((f) => (f === d ? "#00FFD1" : "#1A254066"));
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
        const ro = new ResizeObserver((entries) => {
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
      globe.polygonCapColor((d) => getColorForFeature(d));

      // Arcs between top-10 countries
      const sorted = [...diseaseData].sort((a, b) => b.active - a.active).slice(0, 10);
      const arcs: GlobeArc[] = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        arcs.push({
          startLat: sorted[i].countryInfo.lat,
          startLng: sorted[i].countryInfo.long,
          endLat: sorted[i + 1].countryInfo.lat,
          endLng: sorted[i + 1].countryInfo.long,
          color: ["rgba(255,179,71,0.4)", "rgba(255,59,59,0.4)"],
        });
      }
      globe
        .arcsData(arcs)
        .arcColor("color")
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2000)
        .arcStroke(0.5);

      // Pulsing points for high-risk countries (active > 1M)
      const highRisk = diseaseData.filter((d) => d.active > 1000000);
      globe
        .pointsData(
          highRisk.map((d) => ({
            lat: d.countryInfo.lat,
            lng: d.countryInfo.long,
            size: Math.min(1, d.active / 5000000),
            color: "#FF3B3B",
          })),
        )
        .pointAltitude(0.02)
        .pointColor("color")
        .pointRadius("size");
    }, [diseaseData, getColorForFeature]);

    return (
      <div ref={containerRef} className="absolute inset-0 z-0" style={{ background: "#050A14" }} />
    );
  },
);

GlobeView.displayName = "GlobeView";
export default GlobeView;
