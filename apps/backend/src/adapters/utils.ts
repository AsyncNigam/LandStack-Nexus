import type { AreaUnit } from "@landstack/shared";

// ─── Area conversion factors (to acres) ─────────────────────────────

const ACRE_CONVERSION: Record<AreaUnit, number> = {
  acre: 1,
  hectare: 2.47105,
  sqft: 0.0000229568,
  sqm: 0.000247105,
};

/**
 * Convert an area value from any supported unit to acres.
 *
 * @param value  - The numeric area measurement.
 * @param unit   - The source unit of measurement.
 * @returns        The equivalent area in acres, rounded to 6 decimal places.
 */
export function convertToAcres(value: number, unit: AreaUnit): number {
  const factor = ACRE_CONVERSION[unit];
  return Math.round(value * factor * 1_000_000) / 1_000_000;
}

// ─── ULPIN generator ────────────────────────────────────────────────

/**
 * Generate a mock 14-character ULPIN for development / seeding.
 *
 * Format: `{STATE}-2026-{SANITISED_ID}`
 *
 * @param stateCode  - Two-letter state code (e.g. "OD").
 * @param identifier - State-specific record ID (e.g. plot number).
 * @returns            A deterministic pseudo-ULPIN string.
 */
export function generateMockUlpin(
  stateCode: string,
  identifier: string,
): string {
  const sanitised = identifier.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `${stateCode}-2026-${sanitised}`;
}
