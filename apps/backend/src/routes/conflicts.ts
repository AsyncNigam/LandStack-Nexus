import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db.js";
import type { ApiResponse } from "@landstack/shared";

const router = Router();

// ─── DB row shape ───────────────────────────────────────────────────

interface ConflictRow {
  id: number;
  ulpin: string;
  conflict_type: string;
  field_values: Record<string, unknown>;
  source_timestamps: Record<string, unknown>;
  severity: string;
  status: string;
  detected_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
}

// ─── Request body ───────────────────────────────────────────────────

interface ResolveBody {
  officer_id: string;
  resolution_note: string;
  action: string; // e.g. 'MANUAL_RESOLUTION'
}

// ─── GET / ─────────────────────────────────────────────────────────
// Returns all unresolved conflicts joined with parcel state info
// for the Officer Dashboard "Discrepancy Queue".

interface UnresolvedConflictRow {
  id: number;
  ulpin: string;
  conflict_type: string;
  field_values: Record<string, unknown>;
  source_timestamps: Record<string, unknown>;
  severity: string;
  detected_at: string;
  source_state: string;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<UnresolvedConflictRow>(
      `SELECT
         c.id,
         c.ulpin,
         c.conflict_type,
         c.field_values,
         c.source_timestamps,
         c.severity,
         c.detected_at,
         p.source_state
       FROM conflicts c
       JOIN parcels p ON c.ulpin = p.ulpin
       WHERE c.status = 'UNRESOLVED'
       ORDER BY c.detected_at DESC`,
    );

    const response: ApiResponse<UnresolvedConflictRow[]> = {
      success: true,
      data: result.rows,
    };
    res.status(200).json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch conflicts";
    console.error("❌ Conflicts query failed:", message);

    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: "Failed to fetch conflicts",
    };
    res.status(500).json(response);
  }
});

// ─── POST /:id/resolve ─────────────────────────────────────────────
// Atomically resolves a conflict and writes an immutable audit log.
// If the audit log insert fails, the conflict remains UNRESOLVED.

router.post(
  "/:id/resolve",
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { officer_id, resolution_note, action } = req.body as ResolveBody;

    // Basic validation
    if (!officer_id || !action) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "officer_id and action are required",
      };
      res.status(400).json(response);
      return;
    }

    const client = await pool.connect();

    try {
      // ── BEGIN TRANSACTION ─────────────────────────────────────────
      await client.query("BEGIN");

      // 1. Fetch current conflict state
      const conflictRes = await client.query<ConflictRow>(
        "SELECT * FROM conflicts WHERE id = $1",
        [id],
      );

      if (conflictRes.rows.length === 0) {
        await client.query("ROLLBACK");
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: `Conflict with id ${id} not found`,
        };
        res.status(404).json(response);
        return;
      }

      const oldState = conflictRes.rows[0];

      // Prevent double-resolution
      if (oldState.status === "RESOLVED") {
        await client.query("ROLLBACK");
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: `Conflict ${id} is already resolved`,
        };
        res.status(409).json(response);
        return;
      }

      // 2. Update the conflict to RESOLVED
      await client.query(
        `UPDATE conflicts
            SET status = $1, resolved_at = NOW(), resolution_note = $2
          WHERE id = $3`,
        ["RESOLVED", resolution_note ?? "", id],
      );

      // 3. Build new state snapshot
      const newState = {
        ...oldState,
        status: "RESOLVED",
        resolution_note: resolution_note ?? "",
        resolved_at: new Date().toISOString(),
      };

      // 4. Insert immutable audit log
      await client.query(
        `INSERT INTO audit_logs
           (conflict_id, action_by, action_type, old_state, new_state)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          officer_id,
          action,
          JSON.stringify(oldState),
          JSON.stringify(newState),
        ],
      );

      // ── COMMIT TRANSACTION ────────────────────────────────────────
      await client.query("COMMIT");

      const response: ApiResponse<{ conflictId: string }> = {
        success: true,
        data: { conflictId: id },
        message: "Conflict resolved and audited",
      };
      res.status(200).json(response);
    } catch (err) {
      // ── ROLLBACK on any failure ───────────────────────────────────
      await client.query("ROLLBACK");

      const message =
        err instanceof Error ? err.message : "Unknown transaction error";
      console.error(`❌ Failed to resolve conflict ${id}:`, message);

      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: `Transaction failed: ${message}`,
      };
      res.status(500).json(response);
    } finally {
      // Always return the client to the pool
      client.release();
    }
  },
);

export default router;
