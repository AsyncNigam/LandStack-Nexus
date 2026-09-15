import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { Layers, Eye, EyeOff } from "lucide-react";

// ─── GeoJSON types ──────────────────────────────────────────────────

interface ParcelProperties {
  ulpin: string;
  source_state: string;
  area_sqm: number;
  status?: string;
  height?: number;
}

interface ParcelFeature {
  type: "Feature";
  geometry: GeoJSON.Geometry;
  properties: ParcelProperties;
}

interface ParcelFeatureCollection {
  type: "FeatureCollection";
  features: ParcelFeature[];
}

// ─── Layer toggle config ────────────────────────────────────────────

interface LayerToggle {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const LAYER_TOGGLES: LayerToggle[] = [
  {
    id: "cadastral",
    label: "Cadastral Boundaries",
    description: "PostGIS parcel extrusions",
    defaultOn: true,
  },
  {
    id: "ai-sentinel",
    label: "AI Sentinel Flags",
    description: "NDVI change detection overlay",
    defaultOn: true,
  },
  {
    id: "zoning",
    label: "Zoning Restrictions",
    description: "Agricultural / commercial zones",
    defaultOn: false,
  },
];

// ─── Component ──────────────────────────────────────────────────────

export default function MapViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [layerStates, setLayerStates] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LAYER_TOGGLES.map((l) => [l.id, l.defaultOn])),
  );

  function toggleLayer(id: string) {
    setLayerStates((prev) => ({ ...prev, [id]: !prev[id] }));
  }

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
            // Solid dark background before satellite tiles load
            id: "background",
            type: "background",
            paint: { "background-color": "#0f172a" },
          },
        ],
      },
      center: [85.82, 20.296], // Bhubaneswar — Odisha seed parcel
      zoom: 15,
      pitch: 60,
      bearing: -20,
      maxPitch: 70,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right",
    );

    map.on("load", async () => {
      // ── Satellite basemap ────────────────────────────────────
      map.addSource("satellite", {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Esri World Imagery",
      });
      map.addLayer({
        id: "satellite-layer",
        type: "raster",
        source: "satellite",
      });

      // ── Fetch & enrich parcel GeoJSON ────────────────────────
      try {
        const { data } = await axios.get<ParcelFeatureCollection>(
          "/api/v1/parcels/geojson",
        );

        // Inject mock status & extrusion height for visual effect
        const enriched: ParcelFeatureCollection = {
          type: "FeatureCollection",
          features: data.features.map((f, i) => ({
            ...f,
            properties: {
              ...f.properties,
              status: i % 2 === 0 ? "CONFLICT" : "CLEAN",
              height: i % 2 === 0 ? 50 : 15,
            },
          })),
        };

        // ── Parcel source ───────────────────────────────────────
        map.addSource("parcels", {
          type: "geojson",
          data: enriched as unknown as GeoJSON.FeatureCollection,
        });

        // ── 3D extruded parcels ─────────────────────────────────
        map.addLayer({
          id: "parcels-3d",
          type: "fill-extrusion",
          source: "parcels",
          paint: {
            "fill-extrusion-color": [
              "match",
              ["get", "status"],
              "CONFLICT",
              "#ef4444",
              "CLEAN",
              "#22c55e",
              "#3b82f6",
            ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.8,
          },
        });

        // ── Glowing border outline (flat, on top) ───────────────
        map.addLayer({
          id: "parcels-outline",
          type: "line",
          source: "parcels",
          paint: {
            "line-color": [
              "match",
              ["get", "status"],
              "CONFLICT",
              "#fca5a5",
              "CLEAN",
              "#86efac",
              "#93c5fd",
            ],
            "line-width": 2,
            "line-opacity": 0.9,
          },
        });

        // ── Auto-fly to parcel bounds ───────────────────────────
        if (data.features.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          for (const feature of data.features) {
            const geom = feature.geometry;
            if (geom.type === "Polygon") {
              for (const ring of (geom as GeoJSON.Polygon).coordinates) {
                for (const coord of ring) {
                  bounds.extend(coord as [number, number]);
                }
              }
            }
          }
          map.fitBounds(bounds, {
            padding: 80,
            maxZoom: 16,
            pitch: 60,
            bearing: -20,
          });
        }

        // ── Popup on click ──────────────────────────────────────
        map.on(
          "click",
          "parcels-3d",
          (
            e: maplibregl.MapMouseEvent & {
              features?: maplibregl.MapGeoJSONFeature[];
            },
          ) => {
            if (!e.features || e.features.length === 0) return;
            const props = e.features[0].properties as ParcelProperties;
            const statusBadge =
              props.status === "CONFLICT"
                ? '<span style="color:#ef4444;font-weight:700">⚠ CONFLICT</span>'
                : '<span style="color:#22c55e;font-weight:700">✓ CLEAN</span>';

            new maplibregl.Popup({
              offset: 15,
              className: "dark-popup",
              maxWidth: "260px",
            })
              .setLngLat(e.lngLat)
              .setHTML(
                `<div style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;font-size:13px;border:1px solid #1e293b">
                  <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Land Parcel</div>
                  <div style="font-size:15px;font-weight:700;color:white;font-family:monospace">${props.ulpin}</div>
                  <div style="margin-top:8px;display:flex;justify-content:space-between">
                    <span style="color:#94a3b8">State</span>
                    <span style="font-weight:600">${props.source_state}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between">
                    <span style="color:#94a3b8">Area</span>
                    <span style="font-weight:600">${props.area_sqm} sqm</span>
                  </div>
                  <div style="margin-top:8px;text-align:center">${statusBadge}</div>
                </div>`,
              )
              .addTo(map);
          },
        );

        // ── Cursor ──────────────────────────────────────────────
        map.on("mouseenter", "parcels-3d", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "parcels-3d", () => {
          map.getCanvas().style.cursor = "";
        });
      } catch (err) {
        console.error("Failed to load parcel GeoJSON:", err);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* ── Floating Layer Controls ────────────────────────────── */}
      <div className="absolute right-4 top-4 z-10 w-64 rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Map Layers
          </h3>
        </div>

        {/* Layer list */}
        <div className="space-y-2.5">
          {LAYER_TOGGLES.map((layer) => {
            const isOn = layerStates[layer.id];
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-800/60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200">
                    {layer.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {layer.description}
                  </p>
                </div>
                {isOn ? (
                  <Eye size={16} className="flex-shrink-0 text-emerald-400" />
                ) : (
                  <EyeOff size={16} className="flex-shrink-0 text-slate-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-slate-800 pt-2.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>PostGIS Live • EPSG:4326</span>
          </div>
        </div>
      </div>

      {/* ── Bottom-left legend ────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-10 flex gap-3 rounded-lg border border-slate-700/40 bg-slate-900/70 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-red-500 opacity-80" />
          <span className="text-[11px] font-medium text-slate-400">Conflict</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-emerald-500 opacity-80" />
          <span className="text-[11px] font-medium text-slate-400">Clean</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-500 opacity-80" />
          <span className="text-[11px] font-medium text-slate-400">Pending</span>
        </div>
      </div>
    </div>
  );
}
