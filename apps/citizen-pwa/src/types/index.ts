/** Shape returned by GET /api/v1/parcels/:ulpin */
export interface ParcelResponse {
  parcel: {
    ulpin: string;
    source_state: string;
    area_sqm: string;
  };
  ror: {
    owner_name: string;
    area_acre: string;
    khata_no: string;
    source_dept: string;
  } | null;
  registration: {
    owner_name: string;
    area_acre: string;
    deed_no: string;
    source_dept: string;
  } | null;
  tax: {
    owner_name: string;
    tax_due: string;
    last_paid_on: string;
    source_dept: string;
  } | null;
  conflicts: {
    id: number;
    conflict_type: string;
    severity: string;
    field_values: Record<string, unknown>;
  }[];
}
