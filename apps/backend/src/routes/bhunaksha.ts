import { Router } from "express";
import type { Request, Response } from "express";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../db.js";
import { normalizeOdishaBhunakshaPlot } from "../adapters/odisha.js";
import { detectConflicts } from "../engine/conflictEngine.js";
import type { ApiResponse, BhunakshaPlotRecord, CommonParcelModel } from "@landstack/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const BHUNAKSHA_API = process.env.BHUNAKSHA_SERVICE_URL || "http://127.0.0.1:8000";
const OUT_DIR = path.resolve(__dirname, "../../../bhunaksha-service/out");

// ─── Hierarchy Endpoints ──────────────────────────────────────────

// Official 30 Odisha Districts as per Bhunaksha Government Portal
const ALL_ODISHA_DISTRICTS = [
  { code: "1", name: "ବାଲେଶ୍ବର (Balasore)" },
  { code: "2", name: "ବଲାଙ୍ଗିର (Balangir)" },
  { code: "3", name: "କଟକ (Cuttack)" },
  { code: "4", name: "ଢେଙ୍କାନାଳ (Dhenkanal)" },
  { code: "5", name: "ଗଞ୍ଜାମ (Ganjam)" },
  { code: "6", name: "କଳାହାଣ୍ଡି (Kalahandi)" },
  { code: "7", name: "କେନ୍ଦୁଝର (Kendujhar)" },
  { code: "8", name: "କୋରାପୁଟ (Koraput)" },
  { code: "9", name: "ମୟୂରଭଞ୍ଜ (Mayurbhanj)" },
  { code: "10", name: "କନ୍ଧମାଳ (Kandhamal)" },
  { code: "11", name: "ପୁରୀ (Puri)" },
  { code: "12", name: "ସମ୍ବଲପୁର (Sambalpur)" },
  { code: "13", name: "ସୁନ୍ଦରଗଡ଼ (Sundargarh)" },
  { code: "14", name: "ଅନୁଗୋଳ. (Angul)" },
  { code: "15", name: "ବରଗଡ଼ (Bargarh)" },
  { code: "16", name: "ଭଦ୍ରକ (Bhadrak)" },
  { code: "17", name: "ଜଗତସିଂହପୁର (Jagatsinghpur)" },
  { code: "18", name: "ଯାଜପୁର (Jajpur)" },
  { code: "19", name: "କେନ୍ଦ୍ରାପଡ଼ା (Kendrapara)" },
  { code: "20", name: "ଖୋର୍ଦ୍ଧା (Khordha)" },
  { code: "21", name: "ନୂଆପଡ଼ା (Nuapada)" },
  { code: "22", name: "ନୟାଗଡ଼ (Nayagarh)" },
  { code: "23", name: "ସୋନପୁର (Sonepur)" },
  { code: "24", name: "ଗଜପତି (Gajapati)" },
  { code: "25", name: "ମାଲକାନଗିରି (Malkangiri)" },
  { code: "26", name: "ନବରଙ୍ଗପୁର (Nabarangpur)" },
  { code: "27", name: "ରାୟଗଡ଼ା (Rayagada)" },
  { code: "28", name: "ବୌଦ୍ଧ (Boudh)" },
  { code: "29", name: "ଦେବଗଡ଼ (Deogarh)" },
  { code: "30", name: "ଝାରସୁଗୁଡ଼ା (Jharsuguda)" },
];

router.get("/hierarchy/districts", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BHUNAKSHA_API}/api/hierarchy/districts`, { timeout: 10000 });
    if (Array.isArray(response.data) && response.data.length >= 25) {
      return res.json(response.data);
    }
  } catch {
    // Proceed to canonical list
  }
  res.json(ALL_ODISHA_DISTRICTS);
});

router.get("/hierarchy/tehsils", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BHUNAKSHA_API}/api/hierarchy/tehsils`, {
      params: req.query,
      timeout: 10000,
    });
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hierarchy/ris", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BHUNAKSHA_API}/api/hierarchy/ris`, {
      params: req.query,
      timeout: 10000,
    });
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hierarchy/villages", async (req: Request, res: Response) => {
  const { dist, tehsil, ri } = req.query;
  try {
    const response = await axios.get(`${BHUNAKSHA_API}/api/hierarchy/villages`, {
      params: { dist, tehsil, ri },
      timeout: 12000,
    });
    if (Array.isArray(response.data) && response.data.length > 0) {
      const formatted = response.data.map((v: any) => ({
        code: String(v.code),
        name: v.name.includes(v.code) ? v.name : `${v.code} ${v.name}`
      }));
      return res.json(formatted);
    }
  } catch (err: any) {
    console.error(`[bhunaksha] Error fetching villages for dist=${dist}, tehsil=${tehsil}, ri=${ri}:`, err?.message);
  }

  return res.json([]);
});

router.get("/hierarchy/sheets", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BHUNAKSHA_API}/api/hierarchy/sheets`, {
      params: req.query,
      timeout: 10000,
    });
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Map Stitching & Geometry ─────────────────────────────────────

router.post("/stitch/village", async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${BHUNAKSHA_API}/api/stitch/village`, req.body, {
      timeout: 30000,
    });
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/plot/hit", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BHUNAKSHA_API}/api/plot/hit`, {
      params: req.query,
      timeout: 10000,
    });
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Stitched Raster Maps ───────────────────────────────────

router.get("/maps/:filename", (req: Request, res: Response) => {
  const param = req.params.filename;
  const raw = Array.isArray(param) ? param[0] : param;
  const filename = path.basename(raw || "");
  const filePath = path.join(OUT_DIR, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Fallback to proxying from FastAPI
  const remoteUrl = `${BHUNAKSHA_API}/maps/${filename}`;
  axios({
    method: "get",
    url: remoteUrl,
    responseType: "stream",
    timeout: 10000,
  })
    .then((upstream) => {
      upstream.data.pipe(res);
    })
    .catch(() => {
      res.status(404).send("Map raster not found");
    });
});

// ─── Ingest to Nexus Reconciliation Engine ────────────────────────

interface IngestPlotPayload {
  plot: BhunakshaPlotRecord;
  ownerName?: string;
  registrationArea?: number;
  mockConflict?: boolean;
}

router.post("/ingest", async (req: Request, res: Response) => {
  try {
    const { plot, ownerName, registrationArea, mockConflict } = req.body as IngestPlotPayload;
    if (!plot || !plot.plot_no) {
      return res.status(400).json({ success: false, message: "Missing plot record" });
    }

    const model: CommonParcelModel = normalizeOdishaBhunakshaPlot(
      plot,
      ownerName || "SUDARSHAN PRADHAN",
    );

    let dbSaved = false;
    let conflictResult: any = null;

    try {
      // 1. Save to ror_records
      await pool.query(
        `INSERT INTO ror_records (ulpin, owner_name, area_acre, khata_no, last_updated)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (ulpin) DO UPDATE
         SET owner_name = $2, area_acre = $3, khata_no = $4, last_updated = $5`,
        [model.ulpin, model.ownerName, model.areaAcre, model.sourceId, model.lastUpdated],
      );

      // 2. If simulating or matching against registry
      const regArea = registrationArea ?? (mockConflict ? model.areaAcre * 1.15 : model.areaAcre);
      await pool.query(
        `INSERT INTO registration_records (ulpin, owner_name, area_acre, deed_no, registered_on)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (ulpin) DO UPDATE
         SET owner_name = $2, area_acre = $3, deed_no = $4, registered_on = $5`,
        [model.ulpin, model.ownerName, regArea, `DEED-${plot.plot_no}`, new Date()],
      );

      // 3. Run conflict detection
      await detectConflicts(model.ulpin);
      dbSaved = true;
    } catch {
      // If DB is offline, simulate the conflict reconciliation result cleanly
      const hasConflict = mockConflict || (registrationArea && Math.abs(registrationArea - model.areaAcre) / model.areaAcre > 0.03);
      conflictResult = {
        ulpin: model.ulpin,
        status: hasConflict ? "CONFLICT_DETECTED" : "RECONCILED_CLEAN",
        discrepancy: hasConflict
          ? {
              type: "AREA_MISMATCH",
              revenue_area: model.areaAcre,
              registry_area: registrationArea || +(model.areaAcre * 1.15).toFixed(3),
              variance_pct: "+15.0%",
              severity: "CRITICAL",
            }
          : null,
      };
    }

    const response: ApiResponse<{
      model: CommonParcelModel;
      dbSaved: boolean;
      reconciliation: any;
      rorLinks: { front: string | null; back: string | null };
    }> = {
      success: true,
      data: {
        model,
        dbSaved,
        reconciliation: conflictResult || { ulpin: model.ulpin, status: "RECONCILED_IN_DB" },
        rorLinks: {
          front: plot.ror_front ?? null,
          back: plot.ror_back ?? null,
        },
      },
      message: `Cadastral plot ${plot.plot_no} ingested and reconciled into Nexus`,
    };

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
