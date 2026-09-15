import pool from "../db.js";

// ─── DB row shapes ──────────────────────────────────────────────────

interface RoRRow {
  id: number;
  ulpin: string;
  owner_name: string;
  area_acre: string; // NUMERIC comes back as string from pg
  last_updated: string | Date;
}

interface RegistrationRow {
  id: number;
  ulpin: string;
  owner_name: string;
  area_acre: string;
  registered_on: string | Date;
}

// ─── Conflict field values ──────────────────────────────────────────

interface OwnershipConflictValues {
  ror: string;
  registration: string;
}

interface AreaConflictValues {
  ror: number;
  registration: number;
  variance: number;
}

interface FreshnessConflictValues {
  source: string;
  date: string;
}

// ─── Thresholds ─────────────────────────────────────────────────────

/** Area variance above 3% is flagged as a conflict. */
const AREA_TOLERANCE = 0.03;

/** Records older than this many years are considered stale. */
const FRESHNESS_YEARS = 2;

// ─── Log a detected conflict to the database ───────────────────────

async function logConflict(
  ulpin: string,
  type: string,
  values: OwnershipConflictValues | AreaConflictValues | FreshnessConflictValues,
  severity: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO conflicts
       (ulpin, conflict_type, field_values, source_timestamps, severity, status)
     VALUES
       ($1, $2, $3, '{}', $4, 'UNRESOLVED')`,
    [ulpin, type, JSON.stringify(values), severity],
  );
  console.log(`⚠️  Conflict detected [${type}] for ULPIN ${ulpin} (${severity})`);
}

// ─── Main conflict detection pipeline ───────────────────────────────

/**
 * Run conflict checks for a given ULPIN by comparing the latest
 * RoR (Revenue) record against the latest Registration record.
 *
 * Currently implements:
 *  - **Ownership check** — exact string match on owner_name
 *  - **Area check** — 3 % tolerance on area_acre
 *  - **Freshness check** — flag records older than 2 years
 */
export async function detectConflicts(ulpin: string): Promise<void> {
  // 1. Fetch the latest RoR record for this ULPIN
  const rorResult = await pool.query<RoRRow>(
    `SELECT id, ulpin, owner_name, area_acre, last_updated
       FROM ror_records
      WHERE ulpin = $1
      ORDER BY last_updated DESC
      LIMIT 1`,
    [ulpin],
  );

  // 2. Fetch the latest Registration record for this ULPIN
  const regResult = await pool.query<RegistrationRow>(
    `SELECT id, ulpin, owner_name, area_acre, registered_on
       FROM registration_records
      WHERE ulpin = $1
      ORDER BY registered_on DESC
      LIMIT 1`,
    [ulpin],
  );

  // Need both records to compare
  const ror = rorResult.rows[0];
  const reg = regResult.rows[0];

  if (!ror || !reg) {
    return;
  }

  // ── 5.2  Ownership Check ──────────────────────────────────────────
  if (ror.owner_name !== reg.owner_name) {
    await logConflict(
      ulpin,
      "OWNERSHIP",
      { ror: ror.owner_name, registration: reg.owner_name },
      "HIGH",
    );
  }

  // ── 5.1  Area Check (3 % tolerance) ──────────────────────────────
  const rorArea = parseFloat(ror.area_acre);
  const regArea = parseFloat(reg.area_acre);

  if (rorArea > 0) {
    const diff = Math.abs(rorArea - regArea);
    const percentDiff = diff / rorArea;

    if (percentDiff > AREA_TOLERANCE) {
      await logConflict(
        ulpin,
        "AREA",
        {
          ror: rorArea,
          registration: regArea,
          variance: Math.round(percentDiff * 10000) / 10000, // e.g. 0.2500
        },
        "MEDIUM",
      );
    }
  }

  // ── 5.3  Freshness Check (2-year staleness) ────────────────────────
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - FRESHNESS_YEARS);

  const rorDate = new Date(ror.last_updated);
  if (rorDate < twoYearsAgo) {
    await logConflict(
      ulpin,
      "FRESHNESS",
      { source: "Revenue", date: rorDate.toISOString() },
      "LOW",
    );
  }

  const regDate = new Date(reg.registered_on);
  if (regDate < twoYearsAgo) {
    await logConflict(
      ulpin,
      "FRESHNESS",
      { source: "Registry", date: regDate.toISOString() },
      "LOW",
    );
  }
}
