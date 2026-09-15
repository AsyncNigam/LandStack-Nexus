import type { OdishaRawPayload, CommonParcelModel } from "@landstack/shared";
import { convertToAcres, generateMockUlpin } from "./utils.js";

/**
 * GoRT Adapter — Odisha (OD)
 *
 * Transforms a raw Odisha Revenue payload into the normalised
 * CommonParcelModel used across the rest of LandStack Nexus.
 *
 * Field mapping:
 *  - khata_no  → sourceId   (terminology: "khata")
 *  - plot_no   → used to derive ULPIN
 *  - area      → areaAcre   (converted via area_unit)
 *  - owner_name→ ownerName  (trimmed & uppercased)
 */
export function normalizeOdishaData(
  rawData: OdishaRawPayload,
): CommonParcelModel {
  return {
    ulpin: generateMockUlpin("OD", rawData.plot_no),
    sourceState: "odisha",
    ownerName: rawData.owner_name.trim().toUpperCase(),
    areaAcre: convertToAcres(rawData.area, rawData.area_unit),
    sourceId: rawData.khata_no,
    sourceTerminology: "khata",
    sourceDept: "Revenue Department",
    lastUpdated: rawData.updated_at ?? new Date().toISOString(),
  };
}
