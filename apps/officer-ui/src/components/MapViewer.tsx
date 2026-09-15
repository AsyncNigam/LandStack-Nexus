import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Eye, EyeOff } from "lucide-react";

// ─── Guaranteed Demo Data ──────────────────────────────────────────

const DEMO_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { ulpin: "OD-101-0001", status: "Clean", height: 15 }, geometry: { type: "Polygon", coordinates: [[[85.824, 20.296], [85.826, 20.296], [85.826, 20.298], [85.824, 20.298], [85.824, 20.296]]] } },
    { type: "Feature", properties: { ulpin: "TN-202-0045", status: "Conflict", height: 45 }, geometry: { type: "Polygon", coordinates: [[[85.827, 20.296], [85.829, 20.296], [85.829, 20.298], [85.827, 20.298], [85.827, 20.296]]] } },
    { type: "Feature", properties: { ulpin: "PB-303-0099", status: "Clean", height: 15 }, geometry: { type: "Polygon", coordinates: [[[85.824, 20.293], [85.826, 20.293], [85.826, 20.295], [85.824, 20.295], [85.824, 20.293]]] } }
  ]
};

// ─── Component ──────────────────────────────────────────────────────

export default function MapViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const [activeLayers, setActiveLayers] = useState({
    cadastral: true,
    aiSentinel: true,
    zoning: false
  });

  const toggleLayerState = useCallback((layerName: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  }, []);

  // ── Initialize map ────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        name: "Empty Base",
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#F4EBD9" },
          },
        ],
      },
      center: [85.826, 20.295],
      zoom: 15.5,
      pitch: 60,
      bearing: -20,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right",
    );

    map.on("load", () => {
      // 1. Satellite Base
      map.addSource('satellite', { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 });
      map.addLayer({ id: 'satellite-layer', type: 'raster', source: 'satellite' });

      // 2. GeoJSON Source
      map.addSource('parcels', { type: 'geojson', data: DEMO_GEOJSON as GeoJSON.FeatureCollection });

      // 3. Cadastral 3D Layer
      map.addLayer({
        id: 'parcels-3d', type: 'fill-extrusion', source: 'parcels',
        paint: {
          'fill-extrusion-color': ['match', ['get', 'status'], 'Conflict', '#7A3E14', 'Clean', '#15803D', '#F4EBD9'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-opacity': 0.85
        }
      });

      // 4. Labels Layer (Fixing the missing ULPIN text)
      map.addLayer({
        id: 'parcel-labels', type: 'symbol', source: 'parcels',
        layout: { 'text-field': ['get', 'ulpin'], 'text-size': 14 },
        paint: { 'text-color': '#7A3E14', 'text-halo-color': '#F4EBD9', 'text-halo-width': 3 }
      });

      // 5. AI Sentinel Layer (Red Dots for Conflicts)
      map.addLayer({
        id: 'ai-markers', type: 'circle', source: 'parcels',
        filter: ['==', 'status', 'Conflict'],
        paint: { 'circle-color': '#7A3E14', 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#FFF8EE' }
      });

      // Zoning Placeholder
      map.addLayer({
        id: 'zoning-fill', type: 'fill', source: 'parcels',
        paint: { 'fill-color': '#C86B28', 'fill-opacity': 0.15 },
        layout: { visibility: 'none' }
      });

      // Popup logic
      map.on('click', 'parcels-3d', (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const statusBadge =
          props.status === 'Conflict'
            ? '<span style="color:#B91C1C;font-weight:700">⚠ CONFLICT</span>'
            : '<span style="color:#15803d;font-weight:700">✓ CLEAN</span>';

        new maplibregl.Popup({ offset: 15, className: 'oatmeal-popup', maxWidth: '260px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="background:#FFF8EE;color:#7A3E14;padding:12px;border-radius:8px;font-size:13px;border:1px solid #E8DCC8;box-shadow:0 4px 6px -1px rgba(122,62,20,0.1)">
              <div style="font-size:11px;color:#A0845C;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Land Parcel</div>
              <div style="font-size:15px;font-weight:700;color:#7A3E14;font-family:monospace">${props.ulpin}</div>
              <div style="margin-top:8px;text-align:center">${statusBadge}</div>
            </div>`
          )
          .addTo(map);
      });

      map.on("mouseenter", "parcels-3d", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "parcels-3d", () => {
        map.getCanvas().style.cursor = "";
      });

      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      setMapReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Armor-Plated Toggle useEffect ─────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    
    const toggleLayer = (id: string, isVisible: boolean) => {
      try {
        if (mapRef.current?.getLayer(id)) {
          mapRef.current.setLayoutProperty(id, 'visibility', isVisible ? 'visible' : 'none');
        }
      } catch (e) {
        console.warn('Layer toggle failed', e);
      }
    };

    toggleLayer('parcels-3d', activeLayers.cadastral);
    toggleLayer('parcel-labels', activeLayers.cadastral);
    toggleLayer('ai-markers', activeLayers.aiSentinel);
    toggleLayer('zoning-fill', activeLayers.zoning);
  }, [activeLayers, mapReady]);

  // ─── Render ───────────────────────────────────────────────────────

  const renderToggle = (id: keyof typeof activeLayers, label: string, description: string) => {
    const isOn = activeLayers[id];
    return (
      <button
        key={id}
        type="button"
        onClick={() => toggleLayerState(id)}
        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[#C86B28]/10"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#7A3E14]">{label}</p>
          <p className="text-[10px] text-[#7A3E14]/50 truncate">{description}</p>
        </div>
        {isOn ? (
          <Eye size={16} className="flex-shrink-0 text-emerald-600" />
        ) : (
          <EyeOff size={16} className="flex-shrink-0 text-[#A0845C]" />
        )}
      </button>
    );
  };

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* ── Floating Layer Controls ────────────────────────────── */}
      <div className="absolute right-4 top-4 z-10 w-64 rounded-xl border border-[#E8DCC8] bg-[#F4EBD9] p-4 shadow-md backdrop-blur-sm text-[#7A3E14]">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <Layers size={16} className="text-[#7A3E14]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#7A3E14]">
            Map Layers
          </h3>
        </div>

        {/* Layer list */}
        <div className="space-y-2.5">
          {renderToggle('cadastral', 'Cadastral Boundaries', 'PostGIS parcel extrusions & labels')}
          {renderToggle('aiSentinel', 'AI Sentinel Flags', 'NDVI change detection overlay')}
          {renderToggle('zoning', 'Zoning Restrictions', 'Agricultural / commercial zones')}
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-[#E8DCC8] pt-2.5">
          <div className="flex items-center gap-2 text-[10px] text-[#7A3E14]/50">
            <div className="h-2 w-2 rounded-full bg-emerald-600 shadow-sm" />
            <span>Demo Mode • EPSG:4326</span>
          </div>
        </div>
      </div>

      {/* ── Bottom-left legend ────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-10 flex gap-3 rounded-lg border border-[#E8DCC8] bg-[#F4EBD9] px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-[#7A3E14]" />
          <span className="text-[11px] font-medium text-[#7A3E14]">Conflict</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-emerald-600" />
          <span className="text-[11px] font-medium text-[#7A3E14]">Clean</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-[#C86B28]" />
          <span className="text-[11px] font-medium text-[#7A3E14]">Pending</span>
        </div>
      </div>
    </div>
  );
}
