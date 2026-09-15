// ═══════════════════════════════════════════════════════════════════
// GoRT (Glossary of Revenue Terms) — Canonical Type Definitions
// ═══════════════════════════════════════════════════════════════════

// ─── Primitives ─────────────────────────────────────────────────────

/** Supported area measurement units across Indian states. */
export type AreaUnit = "acre" | "hectare" | "sqft" | "sqm";

/** State codes for the three pilot states. */
export type StateCode = "OD" | "TN" | "PB";

/** Canonical field names in the GoRT harmonization layer. */
export type GoRTCanonicalField =
  | "parcel_group_id"
  | "parcel_id"
  | "extent"
  | "tenure_holder";

// ─── Source terminology ─────────────────────────────────────────────

/** State-specific terminology for the primary land record identifier. */
export type SourceTerminology = "khata" | "patta" | "khasra";

/** Human-readable source state names (lowercase, snake_case). */
export type SourceState = "odisha" | "tamil_nadu" | "punjab";

/** Department that originally produced the record. */
export type SourceDept =
  | "Revenue Department"
  | "Sub-Registrar Office"
  | "Municipality";

// ─── Common Parcel Model ────────────────────────────────────────────
// The normalised, state-agnostic representation of a land record.
// Every raw state payload is transformed into this shape by an adapter.

export interface CommonParcelModel {
  /** 14-character Unique Land Parcel Identification Number. */
  ulpin: string;

  /** Normalised source state identifier. */
  sourceState: SourceState;

  /** Owner / tenure-holder name — normalised to UPPERCASE. */
  ownerName: string;

  /** Land area normalised to acres. */
  areaAcre: number;

  /** State-specific record identifier (e.g. "KH-101", "TN-202"). */
  sourceId: string;

  /** Which terminology the source state uses for their record ID. */
  sourceTerminology: SourceTerminology;

  /** Department that produced this record. */
  sourceDept: SourceDept;

  /** ISO-8601 date string of the last update from the source system. */
  lastUpdated: string;
}

// ─── Raw State Payloads ─────────────────────────────────────────────
// These mirror the exact shape of data arriving from each state API
// before any normalisation. Adapters consume these and emit
// CommonParcelModel instances.

/** Raw payload from the Odisha Revenue system. */
export interface OdishaRawPayload {
  state_code: "OD";
  khata_no: string;
  plot_no: string;
  owner_name: string;
  area: number;
  area_unit: AreaUnit;
  updated_at?: string;
}

/** Raw payload from the Tamil Nadu Revenue system. */
export interface TamilNaduRawPayload {
  state_code: "TN";
  patta_no: string;
  survey_no: string;
  owner_name: string;
  extent: number;
  extent_unit: AreaUnit;
  updated_at?: string;
}

/** Raw payload from the Punjab Revenue system. */
export interface PunjabRawPayload {
  state_code: "PB";
  khewat_no: string;
  khasra_no: string;
  owner_name: string;
  area: number;
  area_unit: AreaUnit;
  updated_at?: string;
}

/** Discriminated union of all supported raw state payloads. */
export type RawStatePayload =
  | OdishaRawPayload
  | TamilNaduRawPayload
  | PunjabRawPayload;
