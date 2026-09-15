import pool from "./db.js";

// ─── Parcel seed data ───────────────────────────────────────────────
// Each polygon uses real-world coordinates in EPSG:4326 (WGS 84).
// Rings are closed (first point === last point) as required by GeoJSON.

interface ParcelSeed {
  ulpin: string;
  sourceState: string;
  areaSqm: number;
  geojson: object; // GeoJSON Polygon geometry
}

const parcels: ParcelSeed[] = [
  {
    // ── Odisha — residential plot near Bhubaneswar ──────────────────
    ulpin: "OD-101-0001",
    sourceState: "OD",
    areaSqm: 4856.23, // ~1.20 acre
    geojson: {
      type: "Polygon",
      coordinates: [
        [
          [85.8200, 20.2960],
          [85.8210, 20.2960],
          [85.8210, 20.2970],
          [85.8200, 20.2970],
          [85.8200, 20.2960],
        ],
      ],
    },
  },
  {
    // ── Tamil Nadu — agricultural plot near Coimbatore ───────────────
    ulpin: "TN-202-0001",
    sourceState: "TN",
    areaSqm: 4856.23, // ~1.20 acre (Revenue's figure)
    geojson: {
      type: "Polygon",
      coordinates: [
        [
          [76.9550, 11.0160],
          [76.9565, 11.0160],
          [76.9565, 11.0175],
          [76.9550, 11.0175],
          [76.9550, 11.0160],
        ],
      ],
    },
  },
  {
    // ── Punjab — plot near Ludhiana ─────────────────────────────────
    ulpin: "PB-303-0001",
    sourceState: "PB",
    areaSqm: 8093.71, // ~2.00 acre
    geojson: {
      type: "Polygon",
      coordinates: [
        [
          [75.8570, 30.9010],
          [75.8590, 30.9010],
          [75.8590, 30.9030],
          [75.8570, 30.9030],
          [75.8570, 30.9010],
        ],
      ],
    },
  },
];

// ─── Seed runner ────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log("🌱 Seeding database…\n");

  // Clear existing parcels (cascades to dependent tables via FK)
  await pool.query("DELETE FROM audit_logs");
  await pool.query("DELETE FROM conflicts");
  await pool.query("DELETE FROM tax_records");
  await pool.query("DELETE FROM registration_records");
  await pool.query("DELETE FROM ror_records");
  await pool.query("DELETE FROM parcels");
  console.log("   🗑  Cleared all existing data");

  // Insert parcels with PostGIS geometries
  for (const p of parcels) {
    await pool.query(
      `INSERT INTO parcels (ulpin, source_state, geom, area_sqm)
       VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4)`,
      [p.ulpin, p.sourceState, JSON.stringify(p.geojson), p.areaSqm]
    );
    console.log(`   📍 Inserted parcel ${p.ulpin} (${p.sourceState})`);
  }

  console.log("\n✅ Seed complete — 3 parcels inserted with PostGIS polygons");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
