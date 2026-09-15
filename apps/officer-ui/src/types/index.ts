/** Conflict record returned by GET /api/v1/conflicts */
export interface Conflict {
  id: number;
  ulpin: string;
  conflict_type: string;
  field_values: Record<string, unknown>;
  source_timestamps: Record<string, unknown>;
  severity: string;
  detected_at: string;
  source_state: string;
}
