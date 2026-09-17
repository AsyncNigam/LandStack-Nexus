import type {
  OdishaRawPayload,
  CommonParcelModel,
  BhunakshaPlotRecord,
} from "@landstack/shared";
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

/**
 * GoRT Adapter — Odisha Bhunaksha Plot Record
 *
 * Transforms a plot scraped from Odisha Bhunaksha (with Kissam and RoR links)
 * into the CommonParcelModel for ingestion and cross-department reconciliation.
 */
export function normalizeOdishaBhunakshaPlot(
  plot: BhunakshaPlotRecord,
  ownerFallback = "REVENUE TENURE HOLDER",
): CommonParcelModel {
  const plotClean = (plot.plot_no || "0").replace(/[^a-zA-Z0-9]/g, "");
  return {
    ulpin: `OD-2026-${plotClean.padStart(4, "0")}`,
    sourceState: "odisha",
    ownerName: ownerFallback.toUpperCase(),
    areaAcre: plot.area_acres ?? 0.25,
    sourceId: plot.khata_no || `PLOT-${plot.plot_no}`,
    sourceTerminology: "khata",
    sourceDept: "Revenue Department",
    lastUpdated: new Date().toISOString(),
  };
}
