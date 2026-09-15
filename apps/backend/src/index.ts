import express from "express";
import cors from "cors";
import type { ApiResponse, LandRecord } from "@landstack/shared";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ─── Health check ───────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: "ok" },
    message: "LandStack Nexus API is running",
  };
  res.json(response);
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

app.listen(PORT, () => {
  console.log(`🚀 LandStack Nexus API running on http://localhost:${PORT}`);
});
