import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db.js";
import { normalizeOdishaData } from "../adapters/odisha.js";
import { normalizeTamilNaduData } from "../adapters/tamilNadu.js";
import { detectConflicts } from "../engine/conflictEngine.js";
import type {
  CommonParcelModel,
  OdishaRawPayload,
  TamilNaduRawPayload,
  ApiResponse,
} from "@landstack/shared";

const router = Router();

// ─── Supported departments ──────────────────────────────────────────
type Department = "revenue" | "registry" | "tax";

const VALID_DEPARTMENTS = new Set<string>(["revenue", "registry", "tax"]);

// ─── Normalise payload via state adapter ────────────────────────────

function normalizeByState(body: Record<string, unknown>): CommonParcelModel {
  const stateCode = body.state_code as string | undefined;

  switch (stateCode) {
    case "OD":
      return normalizeOdishaData(body as unknown as OdishaRawPayload);
    case "TN":
      return normalizeTamilNaduData(body as unknown as TamilNaduRawPayload);
    default:
      throw new Error(`Unsupported state: ${stateCode ?? "missing"}`);
  }
}

// ─── Department-specific DB insert ──────────────────────────────────

async function insertByDepartment(
  department: Department,
  model: CommonParcelModel,
): Promise<void> {
  switch (department) {
    case "revenue":
      await pool.query(
        `INSERT INTO ror_records (ulpin, owner_name, area_acre, khata_no, last_updated)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          model.ulpin,
          model.ownerName,
          model.areaAcre,
          model.sourceId,
          model.lastUpdated,
        ],
      );
      break;

    case "registry":
      await pool.query(
        `INSERT INTO registration_records (ulpin, owner_name, area_acre, deed_no, registered_on)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          model.ulpin,
          model.ownerName,
          model.areaAcre,
          model.sourceId,
          model.lastUpdated,
        ],
      );
      break;

    case "tax":
      await pool.query(
        `INSERT INTO tax_records (ulpin, owner_name, tax_due, last_paid_on)
         VALUES ($1, $2, 0, $3)`,
        [model.ulpin, model.ownerName, model.lastUpdated],
      );
      break;
  }
}

// ─── POST /:department ──────────────────────────────────────────────
// e.g. POST /api/v1/ingest/revenue  { state_code: "OD", ... }

router.post("/:department", async (req: Request<{ department: string }>, res: Response) => {
  const { department } = req.params;

  // Validate department
  if (!VALID_DEPARTMENTS.has(department)) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: `Invalid department "${department}". Must be one of: revenue, registry, tax`,
    };
    res.status(400).json(response);
    return;
  }

  try {
    // 1. Normalise via state adapter
    const model = normalizeByState(req.body as Record<string, unknown>);

    // 2. Insert into department-specific table
    await insertByDepartment(department as Department, model);

    // 3. Fire conflict detection in the background (non-blocking)
    detectConflicts(model.ulpin).catch(console.error);

    // 4. Success
    const response: ApiResponse<{ ulpin: string }> = {
      success: true,
      data: { ulpin: model.ulpin },
      message: `Record ingested into ${department} for ULPIN ${model.ulpin}`,
    };
    res.status(201).json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown ingestion error";

    // FK violation = parcel geometry doesn't exist yet
    const isFkViolation =
      err instanceof Error && "code" in err && (err as { code: string }).code === "23503";

    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: isFkViolation
        ? `Parcel ULPIN not found in parcels table. Seed the parcel geometry first.`
        : message,
    };
    res.status(isFkViolation ? 409 : 400).json(response);
  }
});

export default router;
