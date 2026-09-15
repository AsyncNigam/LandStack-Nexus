// ─── Data Source Identifiers ────────────────────────────────────────
/** The three mock government databases that feed into reconciliation. */
export type DataSource = "revenue" | "registry" | "tax";

// ─── Land Record ────────────────────────────────────────────────────
/** Canonical land-parcel record shared across all services. */
export interface LandRecord {
  /** Unique parcel identifier (survey number). */
  parcelId: string;
  /** Full name of the current owner. */
  ownerName: string;
  /** Area in square metres. */
  areaSqm: number;
  /** Which government database this record originated from. */
  source: DataSource;
}

// ─── Conflict ───────────────────────────────────────────────────────
/** A detected mismatch between two data-source records for the same parcel. */
export interface Conflict {
  /** UUID for this conflict. */
  id: string;
  /** The parcel both records refer to. */
  parcelId: string;
  /** Human-readable description of the mismatch (e.g. "Area differs by 120 sqm"). */
  description: string;
  /** Which field is in conflict. */
  field: keyof LandRecord;
  /** Values from each source that disagree. */
  values: Record<DataSource, string | number | undefined>;
  /** Current review status. */
  status: "open" | "resolved" | "dismissed";
}

// ─── API Payloads ───────────────────────────────────────────────────
/** Response wrapper used by all REST endpoints. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
