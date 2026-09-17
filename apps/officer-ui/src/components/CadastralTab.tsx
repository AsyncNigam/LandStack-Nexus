import { useState, useEffect, useRef } from "react";
import {
  Layers,
  MapPin,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  ShieldAlert,
  ChevronDown,
  PanelRight,
  PanelRightClose,
} from "lucide-react";
import { clsx } from "clsx";
import axios from "axios";
import type { BhunakshaPlotRecord, BhunakshaVillageResponse } from "@landstack/shared";

interface HierarchyItem {
  code: string;
  name: string;
}

// ─── 30 Official Odisha Districts ──────────────────────────────────
const ODISHA_DISTRICTS: HierarchyItem[] = [
  { code: "1", name: "1 ବାଲେଶ୍ବର" },
  { code: "2", name: "2 ବଲାଙ୍ଗିର" },
  { code: "3", name: "3 କଟକ" },
  { code: "4", name: "4 ଢେଙ୍କାନାଳ" },
  { code: "5", name: "5 ଗଞ୍ଜାମ" },
  { code: "6", name: "6 କଳାହାଣ୍ଡି" },
  { code: "7", name: "7 କେନ୍ଦୁଝର" },
  { code: "8", name: "8 କୋରାପୁଟ" },
  { code: "9", name: "9 ମୟୂରଭଞ୍ଜ" },
  { code: "10", name: "10 କନ୍ଧମାଳ" },
  { code: "11", name: "11 ପୁରୀ" },
  { code: "12", name: "12 ସମ୍ବଲପୁର" },
  { code: "13", name: "13 ସୁନ୍ଦରଗଡ଼" },
  { code: "14", name: "14 ଅନୁଗୋଳ." },
  { code: "15", name: "15 ବରଗଡ଼" },
  { code: "16", name: "16 ଭଦ୍ରକ" },
  { code: "17", name: "17 ଜଗତସିଂହପୁର" },
  { code: "18", name: "18 ଯାଜପୁର" },
  { code: "19", name: "19 କେନ୍ଦ୍ରାପଡ଼ା" },
  { code: "20", name: "20 ଖୋର୍ଦ୍ଧା" },
  { code: "21", name: "21 ନୂଆପଡ଼ା" },
  { code: "22", name: "22 ନୟାଗଡ଼" },
  { code: "23", name: "23 ସୋନପୁର" },
  { code: "24", name: "24 ଗଜପତି" },
  { code: "25", name: "25 ମାଲକାନଗିରି" },
  { code: "26", name: "26 ନବରଙ୍ଗପୁର" },
  { code: "27", name: "27 ରାୟଗଡ଼ା" },
  { code: "28", name: "28 ବୌଦ୍ଧ" },
  { code: "29", name: "29 ଦେବଗଡ଼" },
  { code: "30", name: "30 ଝାରସୁଗୁଡ଼ା" },
];

export default function CadastralTab() {
  // ─── Selected Hierarchy Codes ────────────────────────────────────
  const [selectedDist, setSelectedDist] = useState("28");
  const [selectedTehsil, setSelectedTehsil] = useState("2");
  const [selectedRI, setSelectedRI] = useState("2");
  const [selectedVillage, setSelectedVillage] = useState("81");
  const [selectedSheet, setSelectedSheet] = useState("01");

  // ─── Hierarchy Options & Loading States ──────────────────────────
  const [districts] = useState<HierarchyItem[]>(ODISHA_DISTRICTS);
  const [tehsils, setTehsils] = useState<HierarchyItem[]>([]);
  const [ris, setRis] = useState<HierarchyItem[]>([]);
  const [villages, setVillages] = useState<HierarchyItem[]>([]);
  const [sheets, setSheets] = useState<string[]>(["01", "02", "03"]);

  const [loadingTehsils, setLoadingTehsils] = useState(false);
  const [loadingRIs, setLoadingRIs] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingSheets, setLoadingSheets] = useState(false);

  // ─── Map & Stitch State ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [villageData, setVillageData] = useState<BhunakshaVillageResponse | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<BhunakshaPlotRecord | null>(null);
  const [plotFilter, setPlotFilter] = useState("");
  const [showInspector, setShowInspector] = useState(true);

  // ─── Pan & Zoom State ────────────────────────────────────────────
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // ─── Reconciliation State ────────────────────────────────────────
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  // ─── Initial Load ────────────────────────────────────────────────
  useEffect(() => {
    handleFetchTehsils("28", true);
    handleFetchVillage("28", "2", "2", "81");
  }, []);

  // ─── Cascading Handlers ──────────────────────────────────────────
  const handleFetchTehsils = async (distCode: string, isInitial = false) => {
    setLoadingTehsils(true);
    try {
      const res = await axios.get(`/api/v1/bhunaksha/hierarchy/tehsils?dist=${distCode}`);
      const list: HierarchyItem[] = Array.isArray(res.data) ? res.data : [];
      setTehsils(list);

      if (list.length > 0) {
        const targetTehsil = isInitial && distCode === "28"
          ? (list.find((t) => t.code === "2")?.code || list[0].code)
          : list[0].code;

        setSelectedTehsil(targetTehsil);
        handleFetchRIs(distCode, targetTehsil, isInitial);
      } else {
        setSelectedTehsil("");
        setRis([]);
        setSelectedRI("");
        setVillages([]);
        setSelectedVillage("");
      }
    } catch (err) {
      console.error("Failed to fetch tehsils", err);
      setTehsils([]);
      setSelectedTehsil("");
    } finally {
      setLoadingTehsils(false);
    }
  };

  const handleFetchRIs = async (distCode: string, tehsilCode: string, isInitial = false) => {
    if (!tehsilCode) {
      setRis([]);
      setSelectedRI("");
      return;
    }
    setLoadingRIs(true);
    try {
      const res = await axios.get(
        `/api/v1/bhunaksha/hierarchy/ris?dist=${distCode}&tehsil=${tehsilCode}`,
      );
      const list: HierarchyItem[] = Array.isArray(res.data) ? res.data : [];
      setRis(list);

      if (list.length > 0) {
        const targetRI = isInitial && distCode === "28" && tehsilCode === "2"
          ? (list.find((r) => r.code === "2")?.code || list[0].code)
          : list[0].code;

        setSelectedRI(targetRI);
        handleFetchVillages(distCode, tehsilCode, targetRI, isInitial);
      } else {
        setSelectedRI("");
        setVillages([]);
        setSelectedVillage("");
      }
    } catch (err) {
      console.error("Failed to fetch RIs", err);
      setRis([]);
      setSelectedRI("");
    } finally {
      setLoadingRIs(false);
    }
  };

  const handleFetchVillages = async (
    distCode: string,
    tehsilCode: string,
    riCode: string,
    isInitial = false,
  ) => {
    if (!tehsilCode || !riCode) {
      setVillages([]);
      setSelectedVillage("");
      return;
    }
    setLoadingVillages(true);
    try {
      const res = await axios.get(
        `/api/v1/bhunaksha/hierarchy/villages?dist=${distCode}&tehsil=${tehsilCode}&ri=${riCode}`,
      );
      const list: HierarchyItem[] = Array.isArray(res.data) ? res.data : [];
      setVillages(list);

      if (list.length > 0) {
        const targetVillage = isInitial && distCode === "28" && tehsilCode === "2" && riCode === "2"
          ? (list.find((v) => v.code === "81")?.code || list[0].code)
          : list[0].code;

        setSelectedVillage(targetVillage);
        const sheetsList = await handleFetchSheets(distCode, tehsilCode, riCode, targetVillage);
        const firstSheet = sheetsList && sheetsList.length > 0 ? sheetsList[0] : "01";
        if (!isInitial) {
          handleFetchVillage(distCode, tehsilCode, riCode, targetVillage, firstSheet);
        }
      } else {
        setSelectedVillage("");
        setSheets([]);
        setSelectedSheet("");
      }
    } catch (err) {
      console.error("Failed to fetch villages", err);
      setVillages([]);
      setSelectedVillage("");
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleFetchSheets = async (
    distCode: string,
    tehsilCode: string,
    riCode: string,
    villageCode: string,
  ): Promise<string[]> => {
    setLoadingSheets(true);
    try {
      const res = await axios.get(
        `/api/v1/bhunaksha/hierarchy/sheets?dist=${distCode}&tehsil=${tehsilCode}&ri=${riCode}&village=${villageCode}`,
      );
      const list: string[] = Array.isArray(res.data) && res.data.length > 0
        ? res.data
        : ["01"];
      setSheets(list);
      setSelectedSheet(list[0] || "01");
      return list;
    } catch {
      const fallback = ["01"];
      setSheets(fallback);
      setSelectedSheet("01");
      return fallback;
    } finally {
      setLoadingSheets(false);
    }
  };

  const onDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dCode = e.target.value;
    setSelectedDist(dCode);
    handleFetchTehsils(dCode);
  };

  const onTehsilSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tCode = e.target.value;
    setSelectedTehsil(tCode);
    handleFetchRIs(selectedDist, tCode);
  };

  const onRISelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rCode = e.target.value;
    setSelectedRI(rCode);
    handleFetchVillages(selectedDist, selectedTehsil, rCode);
  };

  const onVillageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vCode = e.target.value;
    setSelectedVillage(vCode);
    const sheetsList = await handleFetchSheets(selectedDist, selectedTehsil, selectedRI, vCode);
    const initialSheet = sheetsList && sheetsList.length > 0 ? sheetsList[0] : "01";
    handleFetchVillage(selectedDist, selectedTehsil, selectedRI, vCode, initialSheet);
  };

  const onSheetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sCode = e.target.value;
    setSelectedSheet(sCode);
    handleFetchVillage(selectedDist, selectedTehsil, selectedRI, selectedVillage, sCode);
  };

  // ─── Fetch Individual Standalone Sheet Map ────────────────────────
  const handleFetchVillage = async (
    dist = selectedDist,
    tehsil = selectedTehsil,
    ri = selectedRI,
    village = selectedVillage,
    sheet = selectedSheet,
  ) => {
    setLoading(true);
    setReconcileResult(null);
    try {
      const res = await axios.post<BhunakshaVillageResponse>("/api/v1/bhunaksha/stitch/village", {
        dist,
        tehsil,
        ri,
        village,
        sheet: sheet || "01",
        force_rescrape: false,
      });
      setVillageData(res.data);
      if (res.data.plots && res.data.plots.length > 0) {
        setSelectedPlot(res.data.plots[0]);
      }
      setScale(1);
      setPan({ x: 0, y: 0 });
    } catch (e) {
      console.error("Failed to fetch sheet map", e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Pan Handlers ────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // ─── Reconciliation Action ───────────────────────────────────────
  const handleReconcilePlot = async (mockConflict: boolean) => {
    if (!selectedPlot) return;
    setReconciling(true);
    try {
      const res = await axios.post("/api/v1/bhunaksha/ingest", {
        plot: selectedPlot,
        ownerName: "DILIP SAHU",
        mockConflict,
      });
      setReconcileResult(res.data.data);
    } catch (e) {
      console.error("Reconciliation failed", e);
    } finally {
      setReconciling(false);
    }
  };

  // Filtered plots
  const filteredPlots = (villageData?.plots || []).filter((p) =>
    plotFilter ? p.plot_no.toLowerCase().includes(plotFilter.toLowerCase()) : true,
  );

  return (
    <div className="flex h-full w-full flex-col bg-white text-zinc-900 overflow-hidden font-sans">
      {/* ═══ 5-Level Cascading Hierarchy Filter Bar (Ultra-Compact Inline Toolbar) ═════════════════════ */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/90 px-3 py-1.5 overflow-x-auto text-xs shrink-0">
        {/* 1. District Dropdown (All 30 Official Districts) */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">Dist:</span>
          <div className="relative">
            <select
              value={selectedDist}
              onChange={onDistrictSelect}
              className="h-7 appearance-none rounded-md border border-zinc-300 bg-white pl-2 pr-6 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
            >
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-2 text-zinc-400" />
          </div>
        </div>

        {/* 2. Tehsil Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">Tehsil:</span>
          <div className="relative">
            <select
              value={selectedTehsil}
              onChange={onTehsilSelect}
              disabled={loadingTehsils}
              className="h-7 appearance-none rounded-md border border-zinc-300 bg-white pl-2 pr-6 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            >
              {tehsils.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-2 text-zinc-400" />
          </div>
        </div>

        {/* 3. RI Circle Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">RI:</span>
          <div className="relative">
            <select
              value={selectedRI}
              onChange={onRISelect}
              disabled={loadingRIs}
              className="h-7 appearance-none rounded-md border border-zinc-300 bg-white pl-2 pr-6 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            >
              {ris.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-2 text-zinc-400" />
          </div>
        </div>

        {/* 4. Village Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">Vill:</span>
          <div className="relative">
            <select
              value={selectedVillage}
              onChange={onVillageSelect}
              disabled={loadingVillages}
              className="h-7 max-w-[140px] truncate appearance-none rounded-md border border-zinc-300 bg-white pl-2 pr-6 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            >
              {villages.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-2 text-zinc-400" />
          </div>
        </div>

        {/* 5. Sheet No Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">Sheet:</span>
          <div className="relative">
            <select
              value={selectedSheet}
              onChange={onSheetSelect}
              disabled={loadingSheets}
              className="h-7 appearance-none rounded-md border border-zinc-300 bg-white pl-2 pr-6 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            >
              {sheets.map((s) => (
                <option key={s} value={s}>
                  Sheet {s}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-2 text-zinc-400" />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleFetchVillage()}
          disabled={loading}
          className="flex h-7 items-center gap-1 rounded-md bg-zinc-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 shadow-sm shrink-0"
        >
          <Search size={12} />
          <span>{loading ? "Fetching..." : "Fetch"}</span>
        </button>

        {/* Right Status Indicator & Toggle Inspector Button */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#d8f0bc] bg-[#edf8db] px-2.5 py-1 text-[11px] text-zinc-900 shadow-2xs font-medium">
            <CheckCircle2 size={13} className="text-zinc-900" />
            <span>NIC Gateway</span>
            {villageData && (
              <span className="text-zinc-600 font-mono font-normal">
                • {villageData.plots.length} Plots
              </span>
            )}
          </div>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className={clsx(
              "flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors shadow-sm",
              showInspector
                ? "border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
            )}
            title={showInspector ? "Hide plots & details to enlarge map" : "Show plots & details inspector"}
          >
            {showInspector ? <PanelRightClose size={13} /> : <PanelRight size={13} />}
            <span className="hidden md:inline">{showInspector ? "Hide Inspector" : "Show Inspector"}</span>
          </button>
        </div>
      </div>

      {/* ═══ Main Content Grid ═════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Map Canvas Viewport (Center) ─────────────────────────── */}
        <div className="relative flex-1 bg-zinc-100 overflow-hidden select-none" ref={containerRef}>
          {/* Zoom Controls Overlay */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-sm">
            <button
              onClick={() => setScale((s) => Math.min(s * 1.25, 5))}
              className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 hover:bg-zinc-100"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(s / 1.25, 0.4))}
              className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 hover:bg-zinc-100"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => {
                setScale(1);
                setPan({ x: 0, y: 0 });
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 hover:bg-zinc-100"
              title="Reset View"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Map Canvas / Draggable View */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing p-2"
          >
            {villageData?.image_url ? (
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  transition: isPanning ? "none" : "transform 0.15s ease-out",
                  transformOrigin: "center center",
                }}
                className="relative max-w-none flex items-center justify-center"
              >
                <img
                  ref={imgRef}
                  src={villageData.image_url}
                  alt="Stitched Cadastral Map"
                  className="rounded border border-zinc-300 shadow-md pointer-events-none max-h-[calc(100vh-95px)] max-w-full object-contain bg-white"
                />

                {/* Selected Plot Highlight */}
                {selectedPlot && selectedPlot.xmin !== null && villageData.union_extent && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${((selectedPlot.xmin! - villageData.union_extent.xmin) / villageData.union_extent.width) * 100}%`,
                      top: `${((villageData.union_extent.ymax - selectedPlot.ymax!) / villageData.union_extent.height) * 100}%`,
                      width: `${((selectedPlot.xmax! - selectedPlot.xmin!) / villageData.union_extent.width) * 100}%`,
                      height: `${((selectedPlot.ymax! - selectedPlot.ymin!) / villageData.union_extent.height) * 100}%`,
                    }}
                    className="border-2 border-indigo-600 bg-indigo-600/20 pointer-events-none animate-pulse"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Layers size={48} className="text-zinc-400 mb-3" />
                <p className="font-semibold text-zinc-800">No Cadastral Map Loaded</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Select a district, tehsil, RI, village, and sheet above and click "Fetch"
                </p>
              </div>
            )}
          </div>

          {/* Canvas Bottom HUD */}
          <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between rounded-md border border-zinc-200 bg-white/95 px-3 py-1.5 text-[11px] text-zinc-700 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium text-zinc-900">
                <MapPin size={12} className="text-zinc-700" />
                Survey BBox:
              </span>
              {villageData?.union_extent ? (
                <span className="font-mono text-[10px] text-zinc-600">
                  [{villageData.union_extent.xmin.toFixed(1)}, {villageData.union_extent.ymin.toFixed(1)}] to [
                  {villageData.union_extent.xmax.toFixed(1)}, {villageData.union_extent.ymax.toFixed(1)}]
                </span>
              ) : (
                <span className="text-zinc-500">Local Cadastral Units</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span>Sheet: <strong className="text-zinc-700">{selectedSheet}</strong></span>
              <span>•</span>
              <span>Zoom: {Math.round(scale * 100)}%</span>
            </div>
          </div>
        </div>

        {/* ─── Right Column (Plot List & Inspector Panel - Collapsible & Slim) ────────────── */}
        {showInspector && (
          <div className="flex w-72 flex-col border-l border-zinc-200 bg-white shrink-0">
            {/* Plot Search Bar */}
            <div className="border-b border-zinc-200 p-2 bg-zinc-50/50">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search plot #..."
                  value={plotFilter}
                  onChange={(e) => setPlotFilter(e.target.value)}
                  className="h-7 w-full rounded-md border border-zinc-300 bg-white pl-7 pr-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Plot List (Scrollable Chips) */}
            <div className="max-h-28 overflow-y-auto border-b border-zinc-200 p-2 bg-white">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Plots ({filteredPlots.length})
                </p>
                <span className="text-[10px] text-zinc-400">Click to inspect</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {filteredPlots.slice(0, 35).map((p) => {
                  const isSelected = selectedPlot?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlot(p);
                        setReconcileResult(null);
                      }}
                      className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                        isSelected
                          ? "bg-[#edf8db] text-zinc-900 font-bold border border-[#cbeaa0]"
                          : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {p.plot_no}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plot Details & Reconciliation Panel */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
              {selectedPlot ? (
                <>
                  {/* Header Card */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                          Survey Record
                        </span>
                        <h3 className="text-base font-bold text-zinc-900 font-display">
                          Plot #{selectedPlot.plot_no}
                        </h3>
                      </div>
                      <span className="rounded bg-[#edf8db] border border-[#d8f0bc] px-2 py-0.5 text-[10px] font-semibold text-zinc-900">
                        {selectedPlot.land_class || "Sarada"}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded border border-zinc-200 bg-white p-2">
                        <span className="text-[9px] uppercase text-zinc-500 font-medium">Area (Acres)</span>
                        <p className="text-xs font-bold text-zinc-900">
                          {selectedPlot.area_acres !== null && selectedPlot.area_acres !== undefined
                            ? `${selectedPlot.area_acres} ac`
                            : "0.94 ac"}
                        </p>
                      </div>

                      <div className="rounded border border-zinc-200 bg-white p-2">
                        <span className="text-[9px] uppercase text-zinc-500 font-medium">Khata No</span>
                        <p className="text-xs font-bold text-zinc-900">
                          {selectedPlot.khata_no || "KH-45"}
                        </p>
                      </div>

                      <div className="col-span-2 rounded border border-zinc-200 bg-white p-1.5">
                        <span className="text-[9px] uppercase text-zinc-500 font-medium">Cadastral Code</span>
                        <p className="font-mono text-[11px] text-zinc-800 truncate">
                          {selectedPlot.gis_code} (Sheet {selectedSheet})
                        </p>
                      </div>
                    </div>

                    {/* RoR Links */}
                    <div className="mt-2.5 space-y-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                        Odisha Bhulekh RoR
                      </span>
                      <div className="flex gap-1.5">
                        <a
                          href={
                            selectedPlot.ror_front ||
                            `https://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode=${selectedDist}&TehCode=${selectedTehsil}&VillCode=${selectedVillage}&KhataNo=${selectedPlot.khata_no || "45"}&type=front`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-300 bg-white py-1 text-[11px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50 shadow-sm"
                        >
                          <FileText size={11} className="text-zinc-600" />
                          RoR Front
                          <ExternalLink size={9} className="text-zinc-400" />
                        </a>
                        <a
                          href={
                            selectedPlot.ror_back ||
                            `https://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode=${selectedDist}&TehCode=${selectedTehsil}&VillCode=${selectedVillage}&KhataNo=${selectedPlot.khata_no || "45"}&type=back`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-300 bg-white py-1 text-[11px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50 shadow-sm"
                        >
                          <FileText size={11} className="text-zinc-600" />
                          RoR Back
                          <ExternalLink size={9} className="text-zinc-400" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Reconciliation Action Box */}
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-zinc-800" />
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 font-display">
                        Reconcile Engine
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-tight">
                      Cross-match revenue cadastral plot against Registration (SRO) & Deeds.
                    </p>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleReconcilePlot(false)}
                        disabled={reconciling}
                        className="flex-1 rounded border border-zinc-300 bg-white py-1.5 text-[11px] font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                      >
                        {reconciling ? "Checking..." : "Clean Match"}
                      </button>
                      <button
                        onClick={() => handleReconcilePlot(true)}
                        disabled={reconciling}
                        className="flex-1 rounded bg-zinc-900 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
                      >
                        {reconciling ? "Checking..." : "Simulate Mismatch"}
                      </button>
                    </div>

                    {/* Reconciliation Result Display */}
                    {reconcileResult && (
                      <div className="mt-2 rounded border border-zinc-200 bg-zinc-50 p-2 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                          <span className="font-semibold text-zinc-900 text-[11px]">
                            ULPIN: {reconcileResult.model.ulpin}
                          </span>
                          {reconcileResult.reconciliation.status === "CONFLICT_DETECTED" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              <AlertCircle size={9} /> Conflict
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <Check size={9} /> Clean
                            </span>
                          )}
                        </div>

                        {reconcileResult.reconciliation.discrepancy ? (
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">RoR Area:</span>
                              <span className="font-mono font-bold text-zinc-900">
                                {reconcileResult.reconciliation.discrepancy.revenue_area} ac
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">SRO Deed:</span>
                              <span className="font-mono font-bold text-rose-600">
                                {reconcileResult.reconciliation.discrepancy.registry_area} ac
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Variance:</span>
                              <span className="font-mono font-bold text-rose-600">
                                {reconcileResult.reconciliation.discrepancy.variance_pct}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                              Area variance exceeds 3% threshold. Conflict logged in queue.
                            </p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-emerald-700">
                            Revenue area matches title deeds exactly. Trust score: 100%.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <MapPin size={24} className="mb-1 text-zinc-300" />
                  <p className="text-xs font-medium text-zinc-600">No plot selected.</p>
                  <p className="text-[10px] mt-0.5">Select a plot chip above or click on map.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

