import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Eye, EyeOff, ZoomIn } from "lucide-react";

// ─── All-India District Dataset (28+ districts across 10 states) ─────

interface DistrictProps {
  name: string; state: string; conflicts: number; aiFlags: number; pending: boolean; parcels: number;
}

const DISTRICTS: { props: DistrictProps; center: [number, number]; size: number }[] = [
  // ── ODISHA ──
  { props: { name: "Khordha", state: "Odisha", conflicts: 1420, aiFlags: 45, pending: true, parcels: 84200 }, center: [85.82, 20.25], size: 0.25 },
  { props: { name: "Cuttack", state: "Odisha", conflicts: 780, aiFlags: 18, pending: false, parcels: 62400 }, center: [85.95, 20.52], size: 0.25 },
  { props: { name: "Puri", state: "Odisha", conflicts: 1120, aiFlags: 32, pending: true, parcels: 55800 }, center: [85.75, 19.85], size: 0.25 },
  { props: { name: "Ganjam", state: "Odisha", conflicts: 1850, aiFlags: 67, pending: true, parcels: 92100 }, center: [84.97, 19.37], size: 0.30 },
  { props: { name: "Sambalpur", state: "Odisha", conflicts: 950, aiFlags: 28, pending: true, parcels: 47600 }, center: [83.87, 21.40], size: 0.28 },
  { props: { name: "Sundargarh", state: "Odisha", conflicts: 1310, aiFlags: 41, pending: true, parcels: 71200 }, center: [84.60, 21.97], size: 0.30 },
  { props: { name: "Koraput", state: "Odisha", conflicts: 1640, aiFlags: 55, pending: true, parcels: 68300 }, center: [82.70, 18.80], size: 0.30 },
  // ── TAMIL NADU ──
  { props: { name: "Coimbatore", state: "Tamil Nadu", conflicts: 2100, aiFlags: 78, pending: true, parcels: 110400 }, center: [76.95, 11.02], size: 0.25 },
  { props: { name: "Chennai", state: "Tamil Nadu", conflicts: 890, aiFlags: 22, pending: false, parcels: 95200 }, center: [80.22, 13.02], size: 0.20 },
  { props: { name: "Madurai", state: "Tamil Nadu", conflicts: 1560, aiFlags: 48, pending: true, parcels: 78600 }, center: [78.15, 9.95], size: 0.25 },
  { props: { name: "Salem", state: "Tamil Nadu", conflicts: 670, aiFlags: 15, pending: false, parcels: 52100 }, center: [78.15, 11.65], size: 0.25 },
  { props: { name: "Tirunelveli", state: "Tamil Nadu", conflicts: 1230, aiFlags: 38, pending: true, parcels: 64800 }, center: [77.75, 8.75], size: 0.25 },
  // ── PUNJAB ──
  { props: { name: "Ludhiana", state: "Punjab", conflicts: 980, aiFlags: 31, pending: true, parcels: 72300 }, center: [75.85, 30.87], size: 0.22 },
  { props: { name: "Amritsar", state: "Punjab", conflicts: 540, aiFlags: 11, pending: false, parcels: 58100 }, center: [74.85, 31.62], size: 0.22 },
  { props: { name: "Patiala", state: "Punjab", conflicts: 1450, aiFlags: 44, pending: true, parcels: 61200 }, center: [76.35, 30.35], size: 0.22 },
  { props: { name: "Jalandhar", state: "Punjab", conflicts: 720, aiFlags: 19, pending: false, parcels: 49800 }, center: [75.60, 31.32], size: 0.22 },
  // ── GUJARAT ──
  { props: { name: "Ahmedabad", state: "Gujarat", conflicts: 1780, aiFlags: 62, pending: true, parcels: 125600 }, center: [72.55, 23.05], size: 0.25 },
  { props: { name: "Surat", state: "Gujarat", conflicts: 920, aiFlags: 25, pending: false, parcels: 88400 }, center: [72.85, 21.22], size: 0.22 },
  { props: { name: "Rajkot", state: "Gujarat", conflicts: 480, aiFlags: 8, pending: false, parcels: 54200 }, center: [70.75, 22.32], size: 0.25 },
  { props: { name: "Vadodara", state: "Gujarat", conflicts: 1350, aiFlags: 42, pending: true, parcels: 76500 }, center: [73.25, 22.32], size: 0.22 },
  // ── ASSAM ──
  { props: { name: "Kamrup", state: "Assam", conflicts: 1100, aiFlags: 35, pending: true, parcels: 67800 }, center: [91.67, 26.15], size: 0.25 },
  { props: { name: "Nagaon", state: "Assam", conflicts: 860, aiFlags: 24, pending: true, parcels: 51400 }, center: [92.67, 26.35], size: 0.25 },
  { props: { name: "Dibrugarh", state: "Assam", conflicts: 390, aiFlags: 7, pending: false, parcels: 38200 }, center: [94.95, 27.42], size: 0.22 },
  // ── MAHARASHTRA ──
  { props: { name: "Pune", state: "Maharashtra", conflicts: 1920, aiFlags: 71, pending: true, parcels: 134800 }, center: [73.85, 18.52], size: 0.25 },
  { props: { name: "Nagpur", state: "Maharashtra", conflicts: 680, aiFlags: 16, pending: false, parcels: 58900 }, center: [79.10, 21.15], size: 0.25 },
  { props: { name: "Nashik", state: "Maharashtra", conflicts: 1070, aiFlags: 29, pending: true, parcels: 72400 }, center: [73.80, 20.00], size: 0.22 },
  // ── KARNATAKA ──
  { props: { name: "Bengaluru", state: "Karnataka", conflicts: 2340, aiFlags: 89, pending: true, parcels: 148200 }, center: [77.60, 12.97], size: 0.22 },
  { props: { name: "Mysuru", state: "Karnataka", conflicts: 520, aiFlags: 13, pending: false, parcels: 45600 }, center: [76.65, 12.30], size: 0.22 },
  // ── RAJASTHAN ──
  { props: { name: "Jaipur", state: "Rajasthan", conflicts: 1680, aiFlags: 52, pending: true, parcels: 98700 }, center: [75.80, 26.92], size: 0.28 },
  { props: { name: "Jodhpur", state: "Rajasthan", conflicts: 410, aiFlags: 9, pending: false, parcels: 41200 }, center: [73.02, 26.28], size: 0.28 },
  // ── UTTAR PRADESH ──
  { props: { name: "Lucknow", state: "Uttar Pradesh", conflicts: 2010, aiFlags: 74, pending: true, parcels: 112300 }, center: [80.95, 26.85], size: 0.25 },
  { props: { name: "Varanasi", state: "Uttar Pradesh", conflicts: 1340, aiFlags: 40, pending: true, parcels: 67800 }, center: [83.00, 25.32], size: 0.22 },
  { props: { name: "Agra", state: "Uttar Pradesh", conflicts: 890, aiFlags: 23, pending: false, parcels: 54100 }, center: [78.02, 27.18], size: 0.22 },
  // ── MADHYA PRADESH ──
  { props: { name: "Bhopal", state: "Madhya Pradesh", conflicts: 1150, aiFlags: 34, pending: true, parcels: 78200 }, center: [77.42, 23.26], size: 0.25 },
  { props: { name: "Indore", state: "Madhya Pradesh", conflicts: 760, aiFlags: 20, pending: false, parcels: 62800 }, center: [75.87, 22.72], size: 0.22 },
  // ── WEST BENGAL ──
  { props: { name: "Kolkata", state: "West Bengal", conflicts: 1870, aiFlags: 63, pending: true, parcels: 105400 }, center: [88.35, 22.57], size: 0.18 },
  { props: { name: "Howrah", state: "West Bengal", conflicts: 940, aiFlags: 27, pending: true, parcels: 61200 }, center: [88.30, 22.60], size: 0.15 },
];

// ─── Build GeoJSON from district definitions ────────────────────────

function makeDistrictRect(center: [number, number], size: number): number[][][] {
  const hs = size / 2;
  return [[[center[0]-hs, center[1]-hs], [center[0]+hs, center[1]-hs], [center[0]+hs, center[1]+hs], [center[0]-hs, center[1]+hs], [center[0]-hs, center[1]-hs]]];
}

const DISTRICT_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: DISTRICTS.map(d => ({
    type: "Feature" as const,
    properties: d.props,
    geometry: { type: "Polygon" as const, coordinates: makeDistrictRect(d.center, d.size) }
  }))
};

// ─── Auto-generate cadastral plots for EVERY district ───────────────
// Creates a 3x3 grid of individual plots centered inside each district

const OWNERS_POOL = [
  "Ramesh Kumar", "Suresh Nayak", "Priya Mohanty", "Lakshmi Devi", "Bijay Das",
  "Sanjay Mishra", "Anita Pradhan", "Manoj Pattnaik", "Debashis Jena", "Tapan Behera",
  "Rashmi Rout", "Niranjan Swain", "Kalyani Trust", "Sunita Sharma", "Vikram Singh",
  "Aarav Iyer", "Neha Gupta", "Rajesh Patel", "Meena Kumari", "Ashok Reddy",
  "Pooja Verma", "Govt. Land", "Municipal Corp.", "Forest Dept.", "Railway Board",
  "Kiran Bose", "Arup Sarkar", "Tanvi Joshi", "Omkar Deshmukh", "Fatima Begum",
  "Harpreet Kaur", "Gurinder Gill", "Balwant Rai", "Jaswinder Dhillon", "Amarjit Sodhi",
];
const STATUSES = ["Clean", "Clean", "Clean", "Conflict", "Conflict", "Govt"];
const LAND_USES = ["Residential", "Agricultural", "Commercial", "Mixed", "Public", "Industrial"];

function generateDynamicPlots(center: [number, number]): GeoJSON.Feature[] {
  // Generate a massive, realistic organic mesh of cadastral plots
  // 80x80 covers a huge ~0.16 degree area, completely filling the screen at zoom 13+
  const gridSize = 80; 
  const plotW = 0.0020; // ~200m
  const plotH = 0.0015; // ~150m
  const startX = center[0] - (gridSize * plotW) / 2;
  const startY = center[1] - (gridSize * plotH) / 2;

  // Generate a mesh of perturbed vertices (shared borders, no gaps)
  const vertices: [number, number][][] = [];
  for (let r = 0; r <= gridSize; r++) {
    const rowVerts: [number, number][] = [];
    for (let c = 0; c <= gridSize; c++) {
      const bx = startX + c * plotW;
      const by = startY + r * plotH;
      // Pseudo-random deterministic jitter
      const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      const rand1 = seed - Math.floor(seed);
      const rand2 = (seed * 10) - Math.floor(seed * 10);
      
      // Jitter up to 45% of cell size to make boundaries highly irregular
      const jx = bx + (rand1 - 0.5) * plotW * 0.9;
      const jy = by + (rand2 - 0.5) * plotH * 0.9;
      rowVerts.push([jx, jy]);
    }
    vertices.push(rowVerts);
  }

  const features: GeoJSON.Feature[] = [];
  let idx = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const p1 = vertices[r][c];
      const p2 = vertices[r][c+1];
      const p3 = vertices[r+1][c+1];
      const p4 = vertices[r+1][c];
      
      const seed = Math.floor(Math.abs(p1[0] + p1[1]) * 100000) + idx;
      
      // Randomly split into two triangular plots 30% of the time for organic realism
      const isSplit = (seed % 10) > 6;
      
      const createPlot = (coords: [number, number][], idNum: number) => ({
        type: "Feature" as const,
        properties: {
          plot: `PL-${idNum}`,
          khasra: `K-${(idNum % 999).toString().padStart(3,'0')}`,
          owner: OWNERS_POOL[seed % OWNERS_POOL.length],
          area: `${(0.5 + (seed % 20) * 0.15).toFixed(2)} ac`,
          status: STATUSES[seed % STATUSES.length],
          landUse: LAND_USES[(seed * 3) % LAND_USES.length],
        },
        geometry: {
          type: "Polygon" as const,
          // Close the polygon by repeating the first coordinate
          coordinates: [[...coords, coords[0]]]
        }
      });

      if (isSplit) {
        // Split into two triangles
        features.push(createPlot([p1, p2, p3], 1000 + idx));
        idx++;
        features.push(createPlot([p1, p3, p4], 1000 + idx));
      } else {
        // Irregular quadrilateral
        features.push(createPlot([p1, p2, p3, p4], 1000 + idx));
      }
      idx++;
    }
  }
  
  return features;
}

// Initial empty feature collection
const INITIAL_PLOTS: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

// ─── Component ──────────────────────────────────────────────────────

export default function MapViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);

  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    aiSentinel: true,
    integration: false,
    cadastral: false // New toggle for Cadastral Overlay
  });
  
  // Ref for accessing latest activeLayers in map event listeners
  const activeLayersRef = useRef(activeLayers);
  useEffect(() => {
    activeLayersRef.current = activeLayers;
  }, [activeLayers]);

  const toggleLayerState = useCallback((layerName: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  }, []);


  // ── Initialize map ────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Force MapLibre to use a CDN WebWorker in production to bypass Vite Rollup bundling bugs
    // that cause vectors/polygons (like Cadastral and Heatmap) to be invisible on Vercel.
    if (import.meta.env.PROD) {
      try {
        if ('setWorkerUrl' in maplibregl) {
          (maplibregl as any).setWorkerUrl(workerUrl);
        } else {
          Reflect.set(maplibregl, 'workerUrl', workerUrl);
        }
      } catch (e) {
        console.warn("Could not set MapLibre workerUrl dynamically:", e);
      }
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        name: "BhuSetu GIS",
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          satellite: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            maxzoom: 16, // Force overzoom past 16 to prevent blank/missing tiles in rural areas
          }
        },
        layers: [
          // Satellite imagery — always visible, no fading
          { id: "satellite-base", type: "raster", source: "satellite" }
        ],
      },
      center: [82.0, 22.0],
      zoom: 5,
      pitch: 0,
      bearing: 0,
      minZoom: 4,
      maxZoom: 17, // 64 plots per district fill the area — no blank space
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("moveend", () => {
      const currentZoom = map.getZoom();
      setZoomLevel(Math.round(currentZoom * 10) / 10);
      
      // Dynamically generate plots if cadastral mapping is enabled
      if (activeLayersRef.current.cadastral && currentZoom >= 12.5) {
        const center = map.getCenter();
        const features = generateDynamicPlots([center.lng, center.lat]);
        const source = map.getSource("plots") as maplibregl.GeoJSONSource;
        if (source) {
          source.setData({ type: "FeatureCollection", features });
        }
      } else if (!activeLayersRef.current.cadastral) {
        const source = map.getSource("plots") as maplibregl.GeoJSONSource;
        if (source) source.setData({ type: "FeatureCollection", features: [] });
      }
    });

    map.on("load", () => {
      (window as any).debugMap = map;

      // ═══ LAYER GROUP 1: District heatmap ═══════════════════════

      map.addSource("districts", { type: "geojson", data: DISTRICT_GEOJSON });

      map.addLayer({
        id: "district-heatmap", type: "fill", source: "districts", maxzoom: 14,
        paint: {
          "fill-color": ["interpolate", ["linear"], ["get", "conflicts"],
            200, "#E8D4B5", 500, "#D4A05A", 1000, "#C86B28", 1500, "#7A3E14", 2000, "#4A200A"
          ],
          "fill-opacity": 0.8,
        }
      });

      map.addLayer({
        id: "district-borders", type: "line", source: "districts", maxzoom: 14,
        paint: { "line-color": "#FFF8EE", "line-width": 2.5, "line-opacity": 0.9 }
      });

      map.addLayer({
        id: "integration-overlay", type: "line", source: "districts",
        filter: ["==", ["get", "pending"], true], maxzoom: 14,
        paint: { "line-color": "#B91C1C", "line-width": 3, "line-dasharray": [4, 3], "line-opacity": 0.7 },
        layout: { visibility: "none" }
      });

      // ═══ LAYER GROUP 2: Cadastral plots ═════════════════════════
      // Overlay mode: transparent plots on top of the satellite imagery

      map.addSource("plots", { type: "geojson", data: INITIAL_PLOTS });

      // Cadastral grid lines
      map.addLayer({
        id: "cadastral-grid", type: "line", source: "plots",
        paint: {
          "line-color": "#FFD700",
          "line-width": 1.5,
          "line-dasharray": [4, 3],
          "line-opacity": 0.6,
        }
      });

      // Plot fill — transparent overlay
      map.addLayer({
        id: "plot-fill", type: "fill", source: "plots",
        paint: {
          "fill-color": ["match", ["get", "status"],
            "Clean", "#C8E6C9",
            "Conflict", "#FFCDD2",
            "Govt", "#BBDEFB",
            "#FFF9C4"
          ],
          "fill-opacity": 0.5,
        }
      });

      // Plot borders — gold on satellite
      map.addLayer({
        id: "plot-borders", type: "line", source: "plots",
        paint: {
          "line-color": "#FFD700",
          "line-width": 2,
        }
      });

      // Conflict hatching
      map.addLayer({
        id: "plot-conflict-hatch", type: "line", source: "plots",
        filter: ["==", ["get", "status"], "Conflict"],
        paint: {
          "line-color": "#C62828",
          "line-width": 2,
          "line-dasharray": [3, 2],
          "line-opacity": 0.8,
        }
      });

      // Khasra + Owner labels
      map.addLayer({
        id: "plot-labels", type: "symbol", source: "plots",
        layout: {
          "text-field": ["concat", ["get", "khasra"], "\n", ["get", "owner"]],
          "text-font": ["Open Sans Bold"], // Ensure simple font stack that exists in demotiles
          "text-size": 12,
          "text-anchor": "center",
          "text-allow-overlap": false,
          "text-max-width": 8
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": "rgba(0,0,0,0.8)",
          "text-halo-width": 2,
        }
      });

      // ═══ POPUPS ════════════════════════════════════════════════

      map.on("click", "district-heatmap", (e: any) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties;
        const sev = p.conflicts > 1000
          ? '<span style="color:#B91C1C;font-weight:700">⚠ HIGH PRIORITY</span>'
          : '<span style="color:#15803d;font-weight:700">✓ MONITORING</span>';
        new maplibregl.Popup({ offset: 10, maxWidth: "290px" })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#ffffff;color:#09090b;padding:16px;border-radius:12px;font-size:13px;border:1px solid #e4e4e7;box-shadow:0 8px 24px -4px rgba(0,0,0,0.12);font-family:system-ui,-apple-system,sans-serif">
              <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600">${p.state} • District</div>
              <div style="font-size:17px;font-weight:700;margin-bottom:12px;color:#09090b">${p.name}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;border-top:1px solid #f4f4f5;padding-top:10px">
                <div><div style="font-size:10px;color:#71717a">Parcels</div><div style="font-size:13px;font-weight:700;font-family:monospace">${Number(p.parcels).toLocaleString()}</div></div>
                <div><div style="font-size:10px;color:#71717a">Disputes</div><div style="font-size:13px;font-weight:700;color:#dc2626;font-family:monospace">${Number(p.conflicts).toLocaleString()}</div></div>
                <div><div style="font-size:10px;color:#71717a">AI Flags</div><div style="font-size:13px;font-weight:700;color:#d97706;font-family:monospace">${p.aiFlags}</div></div>
                <div><div style="font-size:10px;color:#71717a">Pipeline</div><div style="font-size:12px;font-weight:600">${p.pending === true || p.pending === "true" ? '⏳ Pending' : '✓ Synced'}</div></div>
              </div>
              <div style="margin-top:12px;text-align:center">${sev}</div>
            </div>`)
          .addTo(map);
      });

      map.on("click", "plot-fill", (e: any) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties;
        const stColor = p.status === "Conflict" ? "#dc2626" : p.status === "Govt" ? "#2563eb" : "#16a34a";
        new maplibregl.Popup({ offset: 10, maxWidth: "300px" })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#ffffff;color:#09090b;padding:16px;border-radius:12px;font-size:12px;border:1px solid #e4e4e7;box-shadow:0 8px 24px -4px rgba(0,0,0,0.12);font-family:system-ui,-apple-system,sans-serif">
              <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Bhulekh Cadastral Parcel</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <div style="font-size:15px;font-weight:700;font-family:monospace">${p.plot}</div>
                <span style="background:${stColor};color:white;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">${p.status.toUpperCase()}</span>
              </div>
              <div style="border-top:1px solid #f4f4f5;padding-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div><div style="font-size:9px;color:#71717a">Khasra No.</div><div style="font-weight:700;font-family:monospace">${p.khasra}</div></div>
                <div><div style="font-size:9px;color:#71717a">Area</div><div style="font-weight:700">${p.area}</div></div>
                <div><div style="font-size:9px;color:#71717a">Owner</div><div style="font-weight:600">${p.owner}</div></div>
                <div><div style="font-size:9px;color:#71717a">Land Use</div><div style="font-weight:600">${p.landUse}</div></div>
                <div style="grid-column:span 2"><div style="font-size:9px;color:#71717a">District</div><div style="font-weight:600">${p.district}</div></div>
              </div>
            </div>`)
          .addTo(map);
      });

      map.on("mouseenter", "district-heatmap", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "district-heatmap", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "plot-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "plot-fill", () => { map.getCanvas().style.cursor = ""; });

      // ═══ HTML MARKERS ═════════════════════════════════════════

      for (const d of DISTRICTS) {
        const p = d.props;

        // District label
        const labelEl = document.createElement("div");
        labelEl.className = "district-label-marker";
        labelEl.innerHTML = `
          <div style="text-align:center;pointer-events:none">
            <div style="font-size:12px;font-weight:800;color:#FFF;text-shadow:0 1px 4px rgba(0,0,0,0.7)">${p.name}</div>
            <div style="font-size:10px;font-weight:600;color:#FFE4C4;text-shadow:0 1px 3px rgba(0,0,0,0.6)">${p.state}</div>
            <div style="font-size:9px;font-weight:600;color:#FCA5A5;text-shadow:0 1px 3px rgba(0,0,0,0.6)">${Number(p.conflicts).toLocaleString()} disputes</div>
          </div>
        `;
        markersRef.current.push(
          new maplibregl.Marker({ element: labelEl, anchor: "center" }).setLngLat(d.center).addTo(map)
        );

        // AI flag badge
        if (p.aiFlags > 0) {
          const aiEl = document.createElement("div");
          aiEl.className = "ai-flag-marker";
          aiEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:4px;background:rgba(185,28,28,0.9);color:#fff;padding:2px 7px;border-radius:10px;font-size:9px;font-weight:700;box-shadow:0 2px 8px rgba(185,28,28,0.4);pointer-events:none;white-space:nowrap">
              <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#FCA5A5;animation:pulse 1.5s infinite"></span>
              ⚠ ${p.aiFlags}
            </div>
          `;
          markersRef.current.push(
            new maplibregl.Marker({ element: aiEl, anchor: "top" }).setLngLat([d.center[0], d.center[1] - d.size * 0.35]).addTo(map)
          );
        }
      }

      // Note: plot labels are shown via popups on click (2000+ DOM markers would crash browser)

      // ═══ DYNAMIC CADASTRAL UPDATES ═════════════════════════════
      map.on('moveend', () => {
        if (!activeLayersRef.current.cadastral) return;
        const source = map.getSource("plots") as maplibregl.GeoJSONSource;
        if (!source) return;
        
        if (map.getZoom() >= 12.5) {
          const center = map.getCenter();
          const features = generateDynamicPlots([center.lng, center.lat]);
          source.setData({ type: "FeatureCollection", features });
        } else {
          source.setData({ type: "FeatureCollection", features: [] });
        }
      });

      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      setMapReady(false);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Imperative Cadastral Toggle ───────────────────────────────────

  const handleCadastralToggle = () => {
    const nextVal = !activeLayers.cadastral;
    toggleLayerState('cadastral');
    if (!mapRef.current) return;
    const setVis = (id: string, visible: boolean) => {
      try { if (mapRef.current?.getLayer(id)) mapRef.current.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); }
      catch (e) { console.warn("Toggle:", id, e); }
    };

    setVis("plot-fill", nextVal);
    setVis("plot-borders", nextVal);
    setVis("cadastral-grid", nextVal);
    setVis("plot-conflict-hatch", nextVal);
    setVis("plot-labels", nextVal);
    setVis("district-heatmap", activeLayers.heatmap && !nextVal);
    setVis("district-borders", activeLayers.heatmap && !nextVal);

    const source = mapRef.current.getSource("plots") as maplibregl.GeoJSONSource;
    if (source) {
      if (nextVal && mapRef.current.getZoom() >= 12.5) {
        const center = mapRef.current.getCenter();
        const features = generateDynamicPlots([center.lng, center.lat]);
        source.setData({ type: "FeatureCollection", features });
      } else {
        console.log("Toggling cadastral OFF. Clearing source...");
        source.setData({ type: "FeatureCollection", features: [] });
      }
    }
  };

  // ── General Layer Visibility ──────────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const setVis = (id: string, visible: boolean) => {
      try { if (mapRef.current?.getLayer(id)) mapRef.current.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); }
      catch (e) { console.warn("Toggle:", id, e); }
    };
    
    setVis("integration-overlay", activeLayers.integration);

    if (!activeLayers.cadastral) {
      setVis("district-heatmap", activeLayers.heatmap);
      setVis("district-borders", activeLayers.heatmap);
    }
    
    document.querySelectorAll(".district-label-marker").forEach(el => {
      (el as HTMLElement).style.display = activeLayers.heatmap ? "block" : "none";
    });
    document.querySelectorAll(".ai-flag-marker").forEach(el => {
      (el as HTMLElement).style.display = activeLayers.aiSentinel ? "block" : "none";
    });
  }, [activeLayers.integration, activeLayers.heatmap, activeLayers.aiSentinel, activeLayers.cadastral, mapReady]);

  // ── Show/hide plot labels based on zoom level ─────────────────────
  // (plot labels are handled via click popups to avoid 2000+ DOM markers)

  // ─── Render ───────────────────────────────────────────────────────

  const renderToggle = (id: keyof typeof activeLayers, label: string, desc: string) => {
    const isOn = activeLayers[id];
    const onClick = id === 'cadastral' ? handleCadastralToggle : () => toggleLayerState(id);
    return (
      <button key={id} type="button" onClick={onClick}
        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-100">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-900 font-display">{label}</p>
          <p className="text-[10px] text-zinc-500 truncate font-body">{desc}</p>
        </div>
        {isOn ? <Eye size={15} className="flex-shrink-0 text-emerald-600" /> : <EyeOff size={15} className="flex-shrink-0 text-zinc-400" />}
      </button>
    );
  };

  const plotCount = "Dynamic (Infinite Grid)";

  return (
    <div className="relative h-full w-full">
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.8)} }`}</style>

      <div ref={containerRef} className="h-full w-full" />

      {/* ── Floating Layer Controls ─────────────────────────────── */}
      <div className="absolute right-4 top-4 z-10 w-64 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur-md text-zinc-900">
        <div className="mb-3 flex items-center gap-2">
          <Layers size={15} className="text-zinc-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-display">Map Layers</h3>
        </div>
        <div className="space-y-1.5">
          {renderToggle('heatmap', 'Dispute Heatmap', `${DISTRICTS.length} districts • 10 states`)}
          {renderToggle('cadastral', 'Cadastral Overlay', 'View land plots and Khasra boundaries')}
          {renderToggle('aiSentinel', 'AI Sentinel Flags', 'Automated anomaly markers')}
          {renderToggle('integration', 'Pending Integration', 'Red dashed = unsynced pipeline')}
        </div>
        <div className="mt-3 border-t border-zinc-100 pt-2.5">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-body">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
            <span>10 States • {DISTRICTS.length} Districts • {plotCount} Plots</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <ZoomIn size={10} />
            <span>Zoom: {zoomLevel} {zoomLevel >= 12 ? "• Bhulekh Cadastral Mode" : ""}</span>
          </div>
        </div>
      </div>

      {/* ── Dynamic Zoom Toggle Button ────────────────────────────────────────── */}
      {zoomLevel >= 13 && !activeLayers.cadastral && (
        <div className="absolute left-1/2 bottom-8 z-20 -translate-x-1/2">
          <button 
            onClick={handleCadastralToggle}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-white text-xs font-bold shadow-xl hover:bg-zinc-800 transition-all animate-bounce border border-white/20 font-display"
          >
            <Layers size={15} />
            Show Cadastral Mapping
          </button>
        </div>
      )}
      {zoomLevel >= 13 && activeLayers.cadastral && (
        <div className="absolute left-1/2 bottom-8 z-20 -translate-x-1/2">
          <button 
            onClick={handleCadastralToggle}
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-white text-xs font-bold shadow-xl hover:bg-red-700 transition-all border border-white/20 font-display"
          >
            <EyeOff size={15} />
            Hide Cadastral Mapping
          </button>
        </div>
      )}

      {/* ── Bottom legend ─────────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-10 rounded-lg border border-zinc-200 bg-white/95 px-4 py-2.5 shadow-md">
        {zoomLevel < 12 ? (
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-zinc-950" /><span className="text-[11px] font-medium text-zinc-700 font-mono">2000+</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-zinc-800" /><span className="text-[11px] font-medium text-zinc-700 font-mono">1500+</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-zinc-600" /><span className="text-[11px] font-medium text-zinc-700 font-mono">1000+</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-zinc-400" /><span className="text-[11px] font-medium text-zinc-700 font-mono">500+</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-zinc-200" /><span className="text-[11px] font-medium text-zinc-700 font-mono">&lt;500</span></div>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-emerald-100 border border-emerald-500" /><span className="text-[11px] font-medium text-zinc-700 font-body">Clean</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-red-100 border border-red-500" /><span className="text-[11px] font-medium text-zinc-700 font-body">Conflict</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-blue-100 border border-blue-500" /><span className="text-[11px] font-medium text-zinc-700 font-body">Govt</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
