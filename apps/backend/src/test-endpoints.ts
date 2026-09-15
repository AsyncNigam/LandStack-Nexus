/**
 * LandStack Nexus — API Endpoint Health Check
 * Verifies all backend endpoints return correct status codes and JSON shapes.
 * Run with: npm run test:api --workspace=@landstack/backend
 */

const BASE = "http://localhost:3000";

interface TestResult {
  name: string;
  pass: boolean;
  detail: string;
}

const results: TestResult[] = [];

// ─── Helpers ────────────────────────────────────────────────────────

async function check(
  name: string,
  url: string,
  validate: (status: number, body: Record<string, unknown>) => string | null,
): Promise<void> {
  try {
    const res = await fetch(url);
    const body = (await res.json()) as Record<string, unknown>;
    const error = validate(res.status, body);
    if (error) {
      results.push({ name, pass: false, detail: error });
    } else {
      results.push({ name, pass: true, detail: `${res.status} OK` });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, pass: false, detail: `Network error: ${msg}` });
  }
}

// ─── Tests ──────────────────────────────────────────────────────────

async function runTests(): Promise<void> {
  console.log("\n🔍 LandStack Nexus — API Health Check");
  console.log("─".repeat(50));

  // Test 1: GeoJSON endpoint
  await check(
    "GET /api/v1/parcels/geojson",
    `${BASE}/api/v1/parcels/geojson`,
    (status, body) => {
      if (status !== 200) return `Expected 200, got ${status}`;
      if (body.type !== "FeatureCollection") return `Expected FeatureCollection, got ${body.type}`;
      if (!Array.isArray(body.features)) return "features is not an array";
      if ((body.features as unknown[]).length === 0) return "features array is empty (expected seeded parcels)";
      return null;
    },
  );

  // Test 2: Conflicts list
  await check(
    "GET /api/v1/conflicts",
    `${BASE}/api/v1/conflicts`,
    (status, body) => {
      if (status !== 200) return `Expected 200, got ${status}`;
      if (body.success !== true) return `success is not true`;
      if (!Array.isArray(body.data)) return "data is not an array";
      return null;
    },
  );

  // Test 3: Tamil Nadu parcel detail
  await check(
    "GET /api/v1/parcels/TN-202-0001",
    `${BASE}/api/v1/parcels/TN-202-0001`,
    (status, body) => {
      if (status !== 200) return `Expected 200, got ${status}`;
      if (body.success !== true) return "success is not true";
      const data = body.data as Record<string, unknown> | undefined;
      if (!data) return "data is missing";
      const parcel = data.parcel as Record<string, unknown> | undefined;
      if (!parcel) return "parcel object is missing";
      if (parcel.ulpin !== "TN-202-0001") return `ULPIN mismatch: ${parcel.ulpin}`;
      return null;
    },
  );

  // Test 4: Punjab parcel detail
  await check(
    "GET /api/v1/parcels/PB-303-0001",
    `${BASE}/api/v1/parcels/PB-303-0001`,
    (status, body) => {
      if (status !== 200) return `Expected 200, got ${status}`;
      if (body.success !== true) return "success is not true";
      const data = body.data as Record<string, unknown> | undefined;
      if (!data) return "data is missing";
      const parcel = data.parcel as Record<string, unknown> | undefined;
      if (!parcel) return "parcel object is missing";
      if (parcel.ulpin !== "PB-303-0001") return `ULPIN mismatch: ${parcel.ulpin}`;
      return null;
    },
  );

  // Test 5: Clean Odisha parcel (no conflicts)
  await check(
    "GET /api/v1/parcels/OD-101-0001",
    `${BASE}/api/v1/parcels/OD-101-0001`,
    (status, body) => {
      if (status !== 200) return `Expected 200, got ${status}`;
      if (body.success !== true) return "success is not true";
      const data = body.data as Record<string, unknown> | undefined;
      if (!data) return "data is missing";
      const conflicts = data.conflicts as unknown[];
      if (!Array.isArray(conflicts)) return "conflicts is not an array";
      if (conflicts.length !== 0) return `Expected 0 conflicts, got ${conflicts.length}`;
      return null;
    },
  );

  // Test 6: 404 for unknown ULPIN
  await check(
    "GET /api/v1/parcels/XX-999-0000 (expect 404)",
    `${BASE}/api/v1/parcels/XX-999-0000`,
    (status, body) => {
      if (status !== 404) return `Expected 404, got ${status}`;
      if (body.success !== false) return "success should be false";
      return null;
    },
  );

  // Test 7: Health check
  await check(
    "GET /api/health",
    `${BASE}/api/health`,
    (status, body) => {
      if (status !== 200) return `Expected 200, got ${status}`;
      if (body.success !== true) return "success is not true";
      return null;
    },
  );

  // ── Print results ─────────────────────────────────────────────────

  console.log("");
  let allPass = true;
  for (const r of results) {
    const icon = r.pass ? "✅" : "❌";
    console.log(`  ${icon}  ${r.name}  →  ${r.detail}`);
    if (!r.pass) allPass = false;
  }

  console.log("\n" + "─".repeat(50));

  if (allPass) {
    console.log("✅ All Endpoints Operational\n");
    printUIVerification();
  } else {
    console.error("❌ SOME TESTS FAILED — fix issues before demo\n");
    process.exit(1);
  }
}

// ─── UI Verification Checklist ──────────────────────────────────────

function printUIVerification(): void {
  console.log(`
🚨 API HEALTH CHECK PASSED. NOW PERFORM MANUAL UI VERIFICATION:

1. SCENARIO 2: AREA CONFLICT (Tamil Nadu)
   - Open PWA (http://localhost:5174) -> Search 'TN-202-0001'
   - EXPECT: Score is 75/100. Area shows ⚠️ Variance flagged.
   - Open Officer Dashboard (http://localhost:5173) -> Check Sidebar
   - EXPECT: TN-202-0001 is listed with an 'AREA' conflict badge. Click it.
   - EXPECT: Evidence Card opens showing RoR Area vs Registry Area. Simulated AI flag is VISIBLE.
   - ACTION: Type "Verified field survey" and click [Resolve].

2. SCENARIO 3: OWNERSHIP CONFLICT (Punjab)
   - Open PWA -> Search 'PB-303-0001'
   - EXPECT: Score is 50/100 (or 75/100 depending on logic). Ownership shows ⚠️ Conflict detected.
   - Open Officer Dashboard -> Check Sidebar
   - EXPECT: PB-303-0001 is listed with 'OWNERSHIP' conflict badge. Click it.
   - EXPECT: Evidence Card shows mismatched names. Simulated AI flag is HIDDEN.
`);
}

// ─── Run ────────────────────────────────────────────────────────────

runTests();
