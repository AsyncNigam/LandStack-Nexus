import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db.js";
import type { ApiResponse } from "@landstack/shared";

const router = Router();

// ─── DB row shapes ──────────────────────────────────────────────────

interface ParcelRow {
  ulpin: string;
  source_state: string;
  area_sqm: string;
}

interface GeoJsonParcelRow extends ParcelRow {
  geometry: string; // ST_AsGeoJSON returns a JSON string
}

// ─── GET /geojson ───────────────────────────────────────────────────
// Returns all parcels as a GeoJSON FeatureCollection for MapLibre.
// MUST be defined before /:ulpin so Express doesn't match "geojson"
// as a dynamic parameter.

router.get("/geojson", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<GeoJsonParcelRow>(
      `SELECT ulpin, source_state, area_sqm, ST_AsGeoJSON(geom) AS geometry
         FROM parcels`,
    );

    const features = result.rows
      .filter((row) => row.geometry !== null)
      .map((row) => ({
        type: "Feature" as const,
        geometry: JSON.parse(row.geometry) as Record<string, unknown>,
        properties: {
          ulpin: row.ulpin,
          source_state: row.source_state,
          area_sqm: parseFloat(row.area_sqm),
        },
      }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch GeoJSON";
    console.error("❌ GeoJSON query failed:", message);

    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message,
    };
    res.status(500).json(response);
  }
});

// ─── GET /:ulpin ────────────────────────────────────────────────────
// Returns a parcel's full profile: base record + all department
// records + unresolved conflicts.

router.get(
  "/:ulpin",
  async (req: Request<{ ulpin: string }>, res: Response) => {
    const { ulpin } = req.params;

    try {
      // 1. Fetch the base parcel
      const parcelResult = await pool.query<ParcelRow>(
        `SELECT ulpin, source_state, area_sqm
           FROM parcels
          WHERE ulpin = $1`,
        [ulpin],
      );

      if (parcelResult.rows.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: `Parcel with ULPIN "${ulpin}" not found`,
        };
        res.status(404).json(response);
        return;
      }

      // 2. Fetch all department records + unresolved conflicts in parallel
      const [rorResult, regResult, taxResult, conflictsResult] =
        await Promise.all([
          pool.query("SELECT * FROM ror_records WHERE ulpin = $1", [ulpin]),
          pool.query(
            "SELECT * FROM registration_records WHERE ulpin = $1",
            [ulpin],
          ),
          pool.query("SELECT * FROM tax_records WHERE ulpin = $1", [ulpin]),
          pool.query(
            "SELECT * FROM conflicts WHERE ulpin = $1 AND status = $2",
            [ulpin, "UNRESOLVED"],
          ),
        ]);

      const response: ApiResponse<{
        parcel: ParcelRow;
        ror: Record<string, unknown> | null;
        registration: Record<string, unknown> | null;
        tax: Record<string, unknown> | null;
        conflicts: Record<string, unknown>[];
      }> = {
        success: true,
        data: {
          parcel: parcelResult.rows[0],
          ror: rorResult.rows[0] ?? null,
          registration: regResult.rows[0] ?? null,
          tax: taxResult.rows[0] ?? null,
          conflicts: conflictsResult.rows,
        },
      };
      res.json(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch parcel";
      console.error(`❌ Parcel query failed for ${ulpin}:`, message);

      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message,
      };
      res.status(500).json(response);
    }
  },
);

export default router;
