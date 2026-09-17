// ─── GoRT Parcel Types ──────────────────────────────────────────────
export type {
  AreaUnit,
  StateCode,
  GoRTCanonicalField,
  SourceTerminology,
  SourceState,
  SourceDept,
  CommonParcelModel,
  OdishaRawPayload,
  TamilNaduRawPayload,
  PunjabRawPayload,
  RawStatePayload,
} from "./types/parcel.js";

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

// ─── Bhunaksha Cadastral Types ─────────────────────────────────────
export interface BhunakshaHierarchyItem {
  code: string;
  name: string;
}

export interface BhunakshaPlotRecord {
  id: string;
  gis_code: string;
  plot_no: string;
  khata_no?: string | null;
  ror_front?: string | null;
  ror_back?: string | null;
  land_class?: string | null;
  area_acres?: number | null;
  info?: string | null;
  xmin?: number | null;
  ymin?: number | null;
  xmax?: number | null;
  ymax?: number | null;
  source?: "cache" | "live";
}

export interface BhunakshaVillageResponse {
  status: string;
  village_gis: string;
  sheet?: string;
  sheets: string[];
  image_url: string;
  union_extent?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    width: number;
    height: number;
  };
  sheet_extents?: Record<string, any>;
  plots: BhunakshaPlotRecord[];
}
