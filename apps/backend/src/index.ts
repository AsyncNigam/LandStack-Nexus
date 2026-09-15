import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "./db.js";
import ingestionRouter from "./routes/ingestion.js";
import conflictsRouter from "./routes/conflicts.js";
import type { ApiResponse, LandRecord } from "@landstack/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/v1/ingest", ingestionRouter);
app.use("/api/v1/conflicts", conflictsRouter);

// ─── Schema initialisation ─────────────────────────────────────────
async function initDatabase(): Promise<void> {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("✅ Database schema initialised");
  } catch (err) {
    console.error("❌ Failed to initialise database schema:", err);
    // Don't crash — the server can still serve non-DB endpoints
  }
}

// ─── Health check ───────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    const response: ApiResponse<{ status: string; dbTime: string }> = {
      success: true,
      data: {
        status: "ok",
        dbTime: result.rows[0].server_time,
      },
      message: "LandStack Nexus API is running",
    };
    res.json(response);
  } catch {
    const response: ApiResponse<{ status: string }> = {
      success: false,
      data: { status: "db_unavailable" },
      message: "API is running but database is unreachable",
    };
    res.status(503).json(response);
  }
});

// ─── Dummy land-records endpoint ────────────────────────────────────
app.get("/api/records", (_req, res) => {
  const dummyRecords: LandRecord[] = [
    {
      parcelId: "SRV-001",
      ownerName: "Ramesh Kumar",
      areaSqm: 4500,
      source: "revenue",
    },
    {
      parcelId: "SRV-001",
      ownerName: "Ramesh Kumar",
      areaSqm: 4620,
      source: "registry",
    },
  ];

  const response: ApiResponse<LandRecord[]> = {
    success: true,
    data: dummyRecords,
  };
  res.json(response);
});

// ─── Start server ───────────────────────────────────────────────────
async function main(): Promise<void> {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 LandStack Nexus API running on http://localhost:${PORT}`);
  });
}

main();
