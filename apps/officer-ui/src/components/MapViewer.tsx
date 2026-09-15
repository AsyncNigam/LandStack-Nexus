import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

// ─── GeoJSON types ──────────────────────────────────────────────────

interface ParcelProperties {
  ulpin: string;
  source_state: string;
  area_sqm: number;
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

// ─── Component ──────────────────────────────────────────────────────

export default function MapViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        name: "OSM Raster",
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [78.9629, 20.5937], // India centre
      zoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", async () => {
      try {
        const { data } = await axios.get<ParcelFeatureCollection>(
          "/api/v1/parcels/geojson",
        );

        // Add the parcel data source
        map.addSource("parcels", {
          type: "geojson",
          data: data as unknown as GeoJSON.FeatureCollection,
        });

        // Semi-transparent fill
        map.addLayer({
          id: "parcels-fill",
          type: "fill",
          source: "parcels",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.4,
          },
        });

        // Solid border
        map.addLayer({
          id: "parcels-outline",
          type: "line",
          source: "parcels",
          paint: {
            "line-color": "#1d4ed8",
            "line-width": 2,
          },
        });

        // Auto-zoom to parcel bounds
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

          map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
        }

        // Popup on click
        map.on("click", "parcels-fill", (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties as ParcelProperties;

          new maplibregl.Popup({ offset: 10 })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="text-sm">
                <p class="font-bold text-indigo-700">${props.ulpin}</p>
                <p>State: ${props.source_state}</p>
                <p>Area: ${props.area_sqm} sqm</p>
              </div>`,
            )
            .addTo(map);
        });

        // Pointer cursor on hover
        map.on("mouseenter", "parcels-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "parcels-fill", () => {
          map.getCanvas().style.cursor = "";
        });
      } catch (err) {
        console.error("Failed to load parcel GeoJSON:", err);
      }
    });

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}
