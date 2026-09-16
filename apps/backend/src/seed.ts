import pool from "./db.js";

// ─── Comprehensive Parcel Seed Data ─────────────────────────────────
// Covers 10 states with realistic coordinates and parcel sizes

interface ParcelSeed {
  ulpin: string;
  sourceState: string;
  areaSqm: number;
  geojson: object;
}

// Helper to make a rectangular parcel polygon
function makeRect(cx: number, cy: number, w: number, h: number) {
  return {
    type: "Polygon",
    coordinates: [[[cx, cy], [cx + w, cy], [cx + w, cy + h], [cx, cy + h], [cx, cy]]],
  };
}

const parcels: ParcelSeed[] = [
  // ── ODISHA ──
  { ulpin: "OD-101-0001", sourceState: "OD", areaSqm: 4856.23, geojson: makeRect(85.820, 20.296, 0.001, 0.001) },
  { ulpin: "OD-101-0002", sourceState: "OD", areaSqm: 2023.43, geojson: makeRect(85.822, 20.296, 0.001, 0.001) },
  { ulpin: "OD-101-0003", sourceState: "OD", areaSqm: 6070.28, geojson: makeRect(85.824, 20.296, 0.002, 0.001) },
  { ulpin: "OD-102-0001", sourceState: "OD", areaSqm: 3240.56, geojson: makeRect(85.950, 20.520, 0.001, 0.001) },
  { ulpin: "OD-103-0001", sourceState: "OD", areaSqm: 8093.71, geojson: makeRect(85.750, 19.850, 0.002, 0.002) },
  { ulpin: "OD-104-0001", sourceState: "OD", areaSqm: 12140.57, geojson: makeRect(84.970, 19.370, 0.003, 0.002) },
  // ── TAMIL NADU ──
  { ulpin: "TN-202-0001", sourceState: "TN", areaSqm: 4856.23, geojson: makeRect(76.955, 11.016, 0.0015, 0.0015) },
  { ulpin: "TN-202-0002", sourceState: "TN", areaSqm: 3240.56, geojson: makeRect(76.957, 11.016, 0.001, 0.001) },
  { ulpin: "TN-203-0001", sourceState: "TN", areaSqm: 6070.28, geojson: makeRect(80.220, 13.020, 0.001, 0.001) },
  { ulpin: "TN-204-0001", sourceState: "TN", areaSqm: 5261.12, geojson: makeRect(78.150, 9.950, 0.002, 0.001) },
  { ulpin: "TN-205-0001", sourceState: "TN", areaSqm: 2428.11, geojson: makeRect(77.750, 8.750, 0.001, 0.001) },
  // ── PUNJAB ──
  { ulpin: "PB-303-0001", sourceState: "PB", areaSqm: 8093.71, geojson: makeRect(75.857, 30.901, 0.002, 0.002) },
  { ulpin: "PB-303-0002", sourceState: "PB", areaSqm: 4046.86, geojson: makeRect(75.860, 30.901, 0.001, 0.001) },
  { ulpin: "PB-304-0001", sourceState: "PB", areaSqm: 12140.57, geojson: makeRect(74.850, 31.620, 0.003, 0.002) },
  { ulpin: "PB-305-0001", sourceState: "PB", areaSqm: 6070.28, geojson: makeRect(76.350, 30.350, 0.002, 0.001) },
  // ── GUJARAT ──
  { ulpin: "GJ-401-0001", sourceState: "GJ", areaSqm: 10117.14, geojson: makeRect(72.550, 23.050, 0.002, 0.002) },
  { ulpin: "GJ-401-0002", sourceState: "GJ", areaSqm: 3240.56, geojson: makeRect(72.553, 23.050, 0.001, 0.001) },
  { ulpin: "GJ-402-0001", sourceState: "GJ", areaSqm: 6070.28, geojson: makeRect(72.850, 21.220, 0.002, 0.001) },
  { ulpin: "GJ-403-0001", sourceState: "GJ", areaSqm: 8093.71, geojson: makeRect(73.250, 22.320, 0.002, 0.002) },
  // ── ASSAM ──
  { ulpin: "AS-501-0001", sourceState: "AS", areaSqm: 4856.23, geojson: makeRect(91.670, 26.150, 0.001, 0.001) },
  { ulpin: "AS-501-0002", sourceState: "AS", areaSqm: 6070.28, geojson: makeRect(91.672, 26.150, 0.002, 0.001) },
  { ulpin: "AS-502-0001", sourceState: "AS", areaSqm: 3240.56, geojson: makeRect(92.670, 26.350, 0.001, 0.001) },
  // ── MAHARASHTRA ──
  { ulpin: "MH-601-0001", sourceState: "MH", areaSqm: 8093.71, geojson: makeRect(73.850, 18.520, 0.002, 0.002) },
  { ulpin: "MH-601-0002", sourceState: "MH", areaSqm: 4046.86, geojson: makeRect(73.853, 18.520, 0.001, 0.001) },
  { ulpin: "MH-602-0001", sourceState: "MH", areaSqm: 12140.57, geojson: makeRect(79.100, 21.150, 0.003, 0.002) },
  // ── KARNATAKA ──
  { ulpin: "KA-701-0001", sourceState: "KA", areaSqm: 6070.28, geojson: makeRect(77.600, 12.970, 0.001, 0.001) },
  { ulpin: "KA-701-0002", sourceState: "KA", areaSqm: 3240.56, geojson: makeRect(77.602, 12.970, 0.001, 0.001) },
  { ulpin: "KA-702-0001", sourceState: "KA", areaSqm: 4856.23, geojson: makeRect(76.650, 12.300, 0.002, 0.001) },
  // ── RAJASTHAN ──
  { ulpin: "RJ-801-0001", sourceState: "RJ", areaSqm: 16187.43, geojson: makeRect(75.800, 26.920, 0.003, 0.003) },
  { ulpin: "RJ-802-0001", sourceState: "RJ", areaSqm: 8093.71, geojson: makeRect(73.020, 26.280, 0.002, 0.002) },
  // ── UTTAR PRADESH ──
  { ulpin: "UP-901-0001", sourceState: "UP", areaSqm: 10117.14, geojson: makeRect(80.950, 26.850, 0.002, 0.002) },
  { ulpin: "UP-901-0002", sourceState: "UP", areaSqm: 4046.86, geojson: makeRect(80.953, 26.850, 0.001, 0.001) },
  { ulpin: "UP-902-0001", sourceState: "UP", areaSqm: 6070.28, geojson: makeRect(83.000, 25.320, 0.002, 0.001) },
  { ulpin: "UP-903-0001", sourceState: "UP", areaSqm: 4856.23, geojson: makeRect(78.020, 27.180, 0.001, 0.001) },
  // ── MADHYA PRADESH ──
  { ulpin: "MP-A01-0001", sourceState: "MP", areaSqm: 8093.71, geojson: makeRect(77.420, 23.260, 0.002, 0.002) },
  { ulpin: "MP-A02-0001", sourceState: "MP", areaSqm: 6070.28, geojson: makeRect(75.870, 22.720, 0.002, 0.001) },
  // ── WEST BENGAL ──
  { ulpin: "WB-B01-0001", sourceState: "WB", areaSqm: 4046.86, geojson: makeRect(88.350, 22.570, 0.001, 0.001) },
  { ulpin: "WB-B01-0002", sourceState: "WB", areaSqm: 3240.56, geojson: makeRect(88.352, 22.570, 0.001, 0.001) },
  { ulpin: "WB-B02-0001", sourceState: "WB", areaSqm: 6070.28, geojson: makeRect(88.300, 22.600, 0.002, 0.001) },
];

// ─── ROR / Registration / Tax seed data ─────────────────────────────

const OWNERS = [
  "Ramesh Kumar", "Suresh Nayak", "Priya Mohanty", "Lakshmi Devi", "Bijay Das",
  "Sanjay Mishra", "Anita Pradhan", "Manoj Pattnaik", "Debashis Jena", "Tapan Behera",
  "Aarav Iyer", "Neha Gupta", "Rajesh Patel", "Meena Kumari", "Ashok Reddy",
  "Pooja Verma", "Kiran Bose", "Arup Sarkar", "Tanvi Joshi", "Omkar Deshmukh",
  "Harpreet Kaur", "Gurinder Gill", "Balwant Rai", "Fatima Begum", "Vikram Singh",
  "Sunita Sharma", "Niranjan Swain", "Rashmi Rout", "Kalyani Trust", "Amarjit Sodhi",
  "Debashree Mukherjee", "Partha Ghosh", "Ritika Jain", "Arjun Nair", "Kavita Rao",
  "Sunil Tiwari", "Deepa Menon", "Rahul Saxena", "Swati Kulkarni", "Vivek Chauhan",
];

// ─── Seed runner ────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log("🌱 Seeding database…\n");

  // Clear existing data
  await pool.query("DELETE FROM audit_logs");
  await pool.query("DELETE FROM conflicts");
  await pool.query("DELETE FROM tax_records");
  await pool.query("DELETE FROM registration_records");
  await pool.query("DELETE FROM ror_records");
  await pool.query("DELETE FROM parcels");
  console.log("   🗑  Cleared all existing data");

  // Insert all parcels
  for (const p of parcels) {
    await pool.query(
      `INSERT INTO parcels (ulpin, source_state, geom, area_sqm)
       VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4)`,
      [p.ulpin, p.sourceState, JSON.stringify(p.geojson), p.areaSqm]
    );
    console.log(`   📍 Inserted parcel ${p.ulpin} (${p.sourceState})`);
  }

  // Insert ROR, Registration, Tax records for each parcel
  for (let i = 0; i < parcels.length; i++) {
    const p = parcels[i];
    const rorOwner = OWNERS[i % OWNERS.length];
    // Introduce name mismatch for ~30% of records (to create conflicts)
    const regOwner = i % 3 === 0 ? OWNERS[(i + 7) % OWNERS.length] : rorOwner;
    const areaAcre = (p.areaSqm / 4046.86).toFixed(4);
    // Introduce area mismatch for ~25% of records
    const regArea = i % 4 === 0 ? (parseFloat(areaAcre) * 1.15).toFixed(4) : areaAcre;
    
    // ROR
    await pool.query(
      `INSERT INTO ror_records (ulpin, owner_name, area_acre, khata_no, plot_no)
       VALUES ($1, $2, $3, $4, $5)`,
      [p.ulpin, rorOwner, areaAcre, `K-${1000 + i}`, `P-${5000 + i}`]
    );

    // Registration
    await pool.query(
      `INSERT INTO registration_records (ulpin, owner_name, area_acre, deed_no, registered_on)
       VALUES ($1, $2, $3, $4, $5)`,
      [p.ulpin, regOwner, regArea, `D-${2000 + i}`, `2023-0${(i % 9) + 1}-${((i * 3) % 28) + 1}`]
    );

    // Tax
    const taxDue = i % 5 === 0 ? (2000 + Math.floor(Math.random() * 8000)).toFixed(2) : "0.00";
    await pool.query(
      `INSERT INTO tax_records (ulpin, owner_name, tax_due, last_paid_on)
       VALUES ($1, $2, $3, $4)`,
      [p.ulpin, rorOwner, taxDue, `2023-0${(i % 9) + 1}-15`]
    );

    // Create conflicts for mismatched records
    if (rorOwner !== regOwner) {
      await pool.query(
        `INSERT INTO conflicts (ulpin, conflict_type, field_values, severity)
         VALUES ($1, 'OWNERSHIP', $2, 'HIGH')`,
        [p.ulpin, JSON.stringify({ ror_owner: rorOwner, reg_owner: regOwner })]
      );
      console.log(`   ⚠  Created OWNERSHIP conflict for ${p.ulpin}`);
    }

    if (areaAcre !== regArea) {
      await pool.query(
        `INSERT INTO conflicts (ulpin, conflict_type, field_values, severity)
         VALUES ($1, 'AREA', $2, 'MEDIUM')`,
        [p.ulpin, JSON.stringify({ ror_area: areaAcre, reg_area: regArea })]
      );
      console.log(`   ⚠  Created AREA conflict for ${p.ulpin}`);
    }
  }

  console.log(`\n✅ Seed complete — ${parcels.length} parcels across 10 states inserted with ROR, Registration, Tax & Conflict records`);
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
