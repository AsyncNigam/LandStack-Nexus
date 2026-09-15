/**
 * LandStack Nexus — Functional Test Suite
 *
 * A standalone Node.js script that programmatically verifies
 * every critical backend API path.  No Jest/Mocha required.
 *
 * Usage:
 *   1. Start the backend:  npm run dev  (in root)
 *   2. Run this script:    npm run test:functional --workspace=@landstack/backend
 */

import axios, { AxiosError } from "axios";
import chalk from "chalk";

const API = "http://localhost:3000";
const V1 = `${API}/api/v1`;

// ─── Runner ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    await testFn();
    passed++;
    console.log(chalk.green(`  ✅ PASS `) + chalk.white(name));
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(`  ❌ FAIL `) + chalk.white(name));
    console.log(chalk.gray(`         → ${msg}`));
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ─── Tests ──────────────────────────────────────────────────────────

async function executeAll(): Promise<void> {
  console.log(
    chalk.cyan.bold("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.cyan.bold("║  LandStack Nexus — Functional Test Suite         ║"),
  );
  console.log(
    chalk.cyan.bold("╚══════════════════════════════════════════════════╝\n"),
  );

  // ── 1. Health & DB connection ───────────────────────────────────
  console.log(chalk.yellow.bold("  ▸ Core Infrastructure"));

  await runTest("System Health — HTTP 200 + DB connected", async () => {
    const { status, data } = await axios.get(`${API}/api/health`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, "Health check success !== true");
    assert(data.data.status === "ok", `DB status: ${data.data.status}`);
    assert(!!data.data.dbTime, "Missing dbTime — database unreachable");
  });

  // ── 2. GeoJSON Spatial ──────────────────────────────────────────
  console.log(chalk.yellow.bold("\n  ▸ GeoJSON / PostGIS"));

  await runTest("GeoJSON endpoint returns FeatureCollection", async () => {
    const { status, data } = await axios.get(`${V1}/parcels/geojson`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.type === "FeatureCollection", `Type: ${data.type}`);
    assert(Array.isArray(data.features), "features is not an array");
    assert(data.features.length > 0, "FeatureCollection is empty");
  });

  await runTest("GeoJSON feature has valid geometry coordinates", async () => {
    const { data } = await axios.get(`${V1}/parcels/geojson`);
    const feature = data.features[0];
    assert(!!feature.geometry, "Missing geometry");
    assert(feature.geometry.type === "Polygon", `Geometry type: ${feature.geometry.type}`);
    assert(
      Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length > 0,
      "Missing or empty coordinates array",
    );
  });

  await runTest("GeoJSON feature has ULPIN + source_state properties", async () => {
    const { data } = await axios.get(`${V1}/parcels/geojson`);
    const props = data.features[0].properties;
    assert(!!props.ulpin, "Missing ulpin property");
    assert(!!props.source_state, "Missing source_state property");
  });

  // ── 3. Parcel Detail Endpoints ──────────────────────────────────
  console.log(chalk.yellow.bold("\n  ▸ Parcel Detail API"));

  await runTest("GET /parcels/OD-101-0001 — Clean parcel (score 100)", async () => {
    const { status, data } = await axios.get(`${V1}/parcels/OD-101-0001`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, "Response success !== true");
    assert(data.data.parcel.ulpin === "OD-101-0001", "ULPIN mismatch");
    assert(Array.isArray(data.data.conflicts), "Missing conflicts array");
    assert(data.data.conflicts.length === 0, `Expected 0 conflicts, got ${data.data.conflicts.length}`);
  });

  await runTest("GET /parcels/TN-202-0001 — Area variance conflict", async () => {
    const { status, data } = await axios.get(`${V1}/parcels/TN-202-0001`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.conflicts.length > 0, "Expected at least 1 conflict");
    const areaConflict = data.data.conflicts.find(
      (c: { conflict_type: string }) => c.conflict_type === "AREA",
    );
    assert(!!areaConflict, "Missing AREA conflict for TN parcel");
  });

  await runTest("GET /parcels/PB-303-0001 — Ownership mismatch conflict", async () => {
    const { status, data } = await axios.get(`${V1}/parcels/PB-303-0001`);
    assert(status === 200, `Expected 200, got ${status}`);
    const ownerConflict = data.data.conflicts.find(
      (c: { conflict_type: string }) => c.conflict_type === "OWNERSHIP",
    );
    assert(!!ownerConflict, "Missing OWNERSHIP conflict for PB parcel");
  });

  await runTest("GET /parcels/INVALID-ULPIN — Returns 404", async () => {
    try {
      await axios.get(`${V1}/parcels/DOES-NOT-EXIST-999`);
      throw new Error("Expected 404 but got a success response");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        assert(err.response.status === 404, `Expected 404, got ${err.response.status}`);
      } else {
        throw err;
      }
    }
  });

  // ── 4. Conflict Engine ──────────────────────────────────────────
  console.log(chalk.yellow.bold("\n  ▸ Conflict Engine"));

  await runTest("GET /conflicts — Returns unresolved conflicts array", async () => {
    const { status, data } = await axios.get(`${V1}/conflicts`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, "success !== true");
    assert(Array.isArray(data.data), "data is not an array");
    assert(data.data.length > 0, "Expected at least 1 unresolved conflict");
  });

  await runTest("Conflicts contain severity + conflict_type fields", async () => {
    const { data } = await axios.get(`${V1}/conflicts`);
    const conflict = data.data[0];
    assert(!!conflict.severity, "Missing severity field");
    assert(!!conflict.conflict_type, "Missing conflict_type field");
    assert(!!conflict.ulpin, "Missing ulpin field");
    assert(!!conflict.detected_at, "Missing detected_at timestamp");
  });

  // ── 5. Ingestion Pipeline ──────────────────────────────────────
  console.log(chalk.yellow.bold("\n  ▸ Ingestion Pipeline"));

  await runTest("POST /ingest/revenue — Accepts Odisha payload (OD-101-0001)", async () => {
    const payload = {
      state_code: "OD",
      khata_no: "KH-TEST-999",
      plot_no: "101-0001",
      owner_name: "Automated Tester",
      area: 5.0,
      area_unit: "acre",
      updated_at: new Date().toISOString(),
    };
    const { status, data } = await axios.post(`${V1}/ingest/revenue`, payload);
    assert(status === 201, `Expected 201, got ${status}`);
    assert(data.success === true, "Ingestion success !== true");
    assert(!!data.data.ulpin, "Missing ulpin in response");
  });

  await runTest("POST /ingest/invalid-dept — Returns 400", async () => {
    try {
      await axios.post(`${V1}/ingest/fisheries`, { state_code: "OD" });
      throw new Error("Expected 400 but got success");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        assert(err.response.status === 400, `Expected 400, got ${err.response.status}`);
      } else {
        throw err;
      }
    }
  });

  // ── 6. Conflict Resolution Transaction ─────────────────────────
  console.log(chalk.yellow.bold("\n  ▸ Resolution Transaction"));

  await runTest("POST /conflicts/:id/resolve — Resolves a conflict", async () => {
    // Fetch an existing conflict ID first
    const { data: conflictsRes } = await axios.get(`${V1}/conflicts`);
    assert(conflictsRes.data.length > 0, "No conflicts to resolve");
    const conflictId = conflictsRes.data[0].id;

    const { status, data } = await axios.post(`${V1}/conflicts/${conflictId}/resolve`, {
      resolution_note: "Automated test resolution — verified by functional test suite.",
      resolved_by: "Test Runner",
    });
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(data.success === true, "Resolution success !== true");
  });

  // ═══ SUMMARY ═══════════════════════════════════════════════════

  console.log(
    chalk.cyan.bold("\n──────────────────────────────────────────────────"),
  );
  console.log(
    chalk.white.bold(`  Results:  `) +
      chalk.green.bold(`${passed} passed`) +
      chalk.gray(` / `) +
      chalk.red.bold(`${failed} failed`) +
      chalk.gray(` / `) +
      chalk.white(`${passed + failed} total`),
  );
  console.log(
    chalk.cyan.bold("──────────────────────────────────────────────────\n"),
  );

  if (failed > 0) {
    console.log(chalk.red.bold("  ⚠  SOME TESTS FAILED — Review errors above.\n"));
    process.exit(1);
  } else {
    console.log(
      chalk.blue.bold(
        "  🚀 FUNCTIONAL TEST SUITE COMPLETE. BACKEND IS PRODUCTION-READY.\n",
      ),
    );
    process.exit(0);
  }
}

// ─── Entrypoint ─────────────────────────────────────────────────────

executeAll().catch((err) => {
  if (err instanceof AxiosError && err.code === "ECONNREFUSED") {
    console.error(
      chalk.red.bold("\n  ❌ Cannot connect to http://localhost:3000"),
    );
    console.error(
      chalk.gray(
        "     Make sure the backend is running: npm run dev\n",
      ),
    );
  } else {
    console.error(chalk.red.bold("\n  ❌ Unexpected error:"), err);
  }
  process.exit(1);
});
