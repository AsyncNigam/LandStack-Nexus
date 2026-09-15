import type {
  TamilNaduRawPayload,
  CommonParcelModel,
} from "@landstack/shared";
import { convertToAcres, generateMockUlpin } from "./utils.js";

/**
 * GoRT Adapter — Tamil Nadu (TN)
 *
 * Transforms a raw Tamil Nadu Revenue payload into the normalised
 * CommonParcelModel used across the rest of LandStack Nexus.
 *
 * Key terminology differences from other states:
 *  - "extent" / "extent_unit" instead of "area" / "area_unit"
 *  - "patta_no" instead of "khata_no"
 *  - "survey_no" instead of "plot_no"
 */
export function normalizeTamilNaduData(
  rawData: TamilNaduRawPayload,
): CommonParcelModel {
  return {
    ulpin: generateMockUlpin("TN", rawData.survey_no),
    sourceState: "tamil_nadu",
    ownerName: rawData.owner_name.trim().toUpperCase(),
    areaAcre: convertToAcres(rawData.extent, rawData.extent_unit),
    sourceId: rawData.patta_no,
    sourceTerminology: "patta",
    sourceDept: "Revenue Department",
    lastUpdated: rawData.updated_at ?? new Date().toISOString(),
  };
}
