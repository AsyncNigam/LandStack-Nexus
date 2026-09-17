import { useState } from "react";
import {
  AlertTriangle,
  Satellite,
  Target,
  Maximize,
  Activity,
  MapPin,
  Calendar,
  Cpu,
  ArrowRight,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
} from "lucide-react";

// ─── Detection History Dataset ──────────────────────────────────────

const DETECTION_HISTORY = [
  { id: "DET-001", ulpin: "TN-202-0001", location: "Coimbatore, TN", type: "Encroachment", confidence: 91.4, severity: "HIGH", date: "2026-09-15", ndviDelta: -72.4, areaExpansion: 1420 },
  { id: "DET-002", ulpin: "OD-101-3421", location: "Khordha, OD", type: "Illegal Filling", confidence: 87.2, severity: "HIGH", date: "2026-09-14", ndviDelta: -58.1, areaExpansion: 890 },
  { id: "DET-003", ulpin: "PB-303-1122", location: "Patiala, PB", type: "Boundary Shift", confidence: 76.8, severity: "MEDIUM", date: "2026-09-13", ndviDelta: -31.5, areaExpansion: 320 },
  { id: "DET-004", ulpin: "GJ-401-0089", location: "Ahmedabad, GJ", type: "Encroachment", confidence: 94.1, severity: "CRITICAL", date: "2026-09-12", ndviDelta: -85.3, areaExpansion: 2100 },
  { id: "DET-005", ulpin: "TN-202-0045", location: "Madurai, TN", type: "Deforestation", confidence: 82.5, severity: "HIGH", date: "2026-09-11", ndviDelta: -69.8, areaExpansion: 3400 },
  { id: "DET-006", ulpin: "AS-501-0012", location: "Kamrup, AS", type: "Waterway Encroachment", confidence: 71.3, severity: "MEDIUM", date: "2026-09-10", ndviDelta: -44.2, areaExpansion: 560 },
  { id: "DET-007", ulpin: "OD-101-5590", location: "Ganjam, OD", type: "Mining Activity", confidence: 96.7, severity: "CRITICAL", date: "2026-09-09", ndviDelta: -91.2, areaExpansion: 5200 },
  { id: "DET-008", ulpin: "PB-303-2201", location: "Ludhiana, PB", type: "Illegal Construction", confidence: 88.9, severity: "HIGH", date: "2026-09-08", ndviDelta: -63.7, areaExpansion: 1100 },
  ...Array.from({ length: 25 }).map((_, i) => {
    const states = ["AP", "BH", "CH", "GO", "HR", "TN", "OD", "WB"];
    const types = ["Encroachment", "Illegal Filling", "Boundary Shift", "Deforestation", "Mining Activity"];
    const sevs = ["HIGH", "MEDIUM", "CRITICAL"];
    return {
      id: `DET-${100 + i}`,
      ulpin: `${states[i % states.length]}-${200 + i}-0001`,
      location: `Region ${i}, ${states[i % states.length]}`,
      type: types[i % types.length],
      confidence: 70 + Math.floor(Math.random() * 28),
      severity: sevs[i % sevs.length],
      date: `2026-09-${String(1 + (i % 28)).padStart(2, "0")}`,
      ndviDelta: -(20 + Math.floor(Math.random() * 60)),
      areaExpansion: 500 + Math.floor(Math.random() * 2000),
    };
  }),
];

// ─── Component ──────────────────────────────────────────────────────

export default function AIDetectionTab() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedDetection, setSelectedDetection] = useState(DETECTION_HISTORY[0]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const displayedHistory = showAllHistory ? DETECTION_HISTORY : DETECTION_HISTORY.slice(0, 5);

  return (
    <div className="h-full overflow-y-auto bg-zinc-50/50 p-8 space-y-6">
      {/* ═══ Header ═════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">
            AI Sentinel Earth Observation Engine
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 font-body">
            Sentinel-2 multi-spectral NDVI change detection and automated perimeter encroachment analysis
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white border border-zinc-200 px-3.5 py-1.5 shadow-sm">
          <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-zinc-700 font-mono">SEN2COR L2A ACTIVE</span>
        </div>
      </div>

      {/* ═══ TOP: Summary Stats Bar ══════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Satellite size={14} className="text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-display">Active Scans</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-display">142</div>
          <div className="text-[10px] text-emerald-600 font-medium font-body mt-1">+12 today</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700 font-display">Flags Raised</span>
          </div>
          <div className="text-2xl font-bold text-red-700 font-display">{DETECTION_HISTORY.length}</div>
          <div className="text-[10px] text-red-800 font-medium font-body mt-1">3 critical violations</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-display">Avg Confidence</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-display">86.1%</div>
          <div className="text-[10px] text-zinc-500 font-body mt-1">RF + CNN Ensemble</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-display">Area Affected</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-display">14,990</div>
          <div className="text-[10px] text-zinc-500 font-body mt-1">sqm expansion detected</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ═══ LEFT: Before/After Slider (2 cols) ═════════════════════ */}
        <div className="col-span-2 flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200">
                <Satellite size={16} className="text-zinc-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 font-display">
                  Sentinel-2 L2A Optical &amp; NDVI Differential
                </h3>
                <p className="text-[11px] text-zinc-500 font-body">
                  10m spatial resolution • Band 8 (NIR) / Band 4 (Red) composite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-[11px] text-zinc-800 font-semibold border border-zinc-200">
                {selectedDetection.location}
              </span>
              <button
                type="button"
                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Maximize size={14} />
              </button>
            </div>
          </div>

          {/* Timeline labels */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1">
              <Calendar size={12} className="text-emerald-700" />
              <span className="text-[11px] font-semibold text-emerald-700 font-display">
                JAN 2024 — Baseline
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-px w-8 bg-zinc-200" />
              <ArrowRight size={13} className="text-zinc-400" />
              <div className="h-px w-8 bg-zinc-200" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1">
              <Calendar size={12} className="text-red-700" />
              <span className="text-[11px] font-semibold text-red-700 font-display">
                SEP 2026 — Sentinel Feed
              </span>
            </div>
          </div>

          {/* ── Image Slider ─────────────────────────────────────── */}
          <div className="relative h-[380px] w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-900">
            {/* Image 1: Base (2024) */}
            <img
              src="/satellite_before.jpg"
              alt="Satellite view — January 2024"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            {/* Image 2: Overlay (2026) with clip */}
            <img
              src="/satellite_after.jpg"
              alt="Satellite view — September 2026"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
              }}
              draggable={false}
            />

            {/* Slider divider line */}
            <div
              className="absolute top-0 z-10 h-full w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
              {/* Slider thumb */}
              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-zinc-900 shadow-lg cursor-ew-resize">
                <div className="flex gap-0.5">
                  <div className="h-3.5 w-0.5 rounded-full bg-white" />
                  <div className="h-3.5 w-0.5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Year labels on images */}
            <div className="absolute left-3 top-3 z-10 rounded bg-black/75 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-400">
              2024 BASELINE
            </div>
            <div className="absolute right-3 top-3 z-10 rounded bg-black/75 px-2 py-1 font-mono text-[11px] font-semibold text-red-400">
              2026 RECENT
            </div>

            {/* Range input */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
              aria-label="Before and after satellite comparison slider"
            />
          </div>

          <p className="mt-3 text-center text-[11px] text-zinc-500 font-body">
            Drag slider to inspect temporal NDVI delta • Source: Copernicus Sentinel-2 L2A Multi-Spectral
          </p>
        </div>

        {/* ═══ RIGHT: Diagnostic Panel (1 col) ════════════════════════ */}
        <div className="col-span-1 flex flex-col gap-5">
          {/* ── Alert Card ───────────────────────────────────────── */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 font-display">
                  {selectedDetection.type} Flag
                </h3>
                <p className="font-mono text-xs text-zinc-500">
                  ULPIN {selectedDetection.ulpin}
                </p>
              </div>
            </div>

            {/* Confidence badge */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded px-2.5 py-0.5 font-mono text-xs font-semibold ${
                  selectedDetection.severity === "CRITICAL"
                    ? "bg-red-600 text-white"
                    : selectedDetection.severity === "HIGH"
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-800 text-white"
                }`}
              >
                {selectedDetection.severity} ({selectedDetection.confidence}%)
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Model v3.2.1</span>
            </div>

            {/* Confidence bar */}
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-700"
                style={{ width: `${selectedDetection.confidence}%` }}
              />
            </div>

            {/* Metrics */}
            <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3.5 divide-y divide-zinc-200/40">
              <MetricRow
                label="Vegetation Loss (NDVI)"
                value={`${selectedDetection.ndviDelta}%`}
                valueClass="text-red-600 font-bold"
              />
              <MetricRow
                label="Built-up Area Expansion"
                value={`+${selectedDetection.areaExpansion.toLocaleString()} sqm`}
                valueClass="text-zinc-900 font-semibold"
              />
              <MetricRow
                label="Zoning Violation Risk"
                value={selectedDetection.severity}
                valueClass={selectedDetection.severity === "CRITICAL" ? "text-red-700 font-bold" : "text-amber-700 font-bold"}
              />
              <MetricRow
                label="Land Use Classification"
                value="AGR → URB"
                valueClass="text-zinc-900 font-semibold"
              />
              <MetricRow
                label="Detection Algorithm"
                value="RF + CNN Ensemble"
                valueClass="text-zinc-700"
              />
            </div>
          </div>

          {/* ── Parcel Details ────────────────────────────────────── */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Target size={14} className="text-zinc-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-display">
                Affected Parcel Metadata
              </h4>
            </div>
            <div className="space-y-2 text-xs divide-y divide-zinc-100">
              <DetailRow icon={MapPin} label="Location" value={selectedDetection.location} />
              <DetailRow icon={Maximize} label="Survey Area" value="1.20 acres" />
              <DetailRow icon={Activity} label="Revenue ID" value={`SRV-${selectedDetection.ulpin.slice(0, 6)}`} />
              <DetailRow icon={Cpu} label="Processing" value="GPU Cluster A4" />
              <DetailRow icon={Calendar} label="Detected" value={selectedDetection.date} />
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800"
            >
              <Target size={14} />
              Initiate Ground Inspection
            </button>
            <button
              type="button"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Dismiss (False Positive)
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM: Detection History Table ═══════════════════════════ */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-zinc-50 px-5 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-zinc-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-display">Detection History</h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-semibold font-body">{DETECTION_HISTORY.length} detections recorded</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-50/50 border-b border-zinc-100 font-display">
            <tr>
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">ULPIN</th>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Confidence</th>
              <th className="px-5 py-3 font-semibold">Severity</th>
              <th className="px-5 py-3 font-semibold">NDVI Δ</th>
              <th className="px-5 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-body">
            {displayedHistory.map((det) => (
              <tr
                key={det.id}
                onClick={() => setSelectedDetection(det)}
                className={`transition-colors cursor-pointer ${
                  selectedDetection.id === det.id ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
              >
                <td className="px-5 py-3 font-mono text-xs font-semibold text-zinc-900">{det.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-zinc-700">{det.ulpin}</td>
                <td className="px-5 py-3 text-zinc-500">{det.location}</td>
                <td className="px-5 py-3 font-medium text-zinc-900">{det.type}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${det.confidence}%` }} />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-zinc-800">{det.confidence}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      det.severity === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : det.severity === "HIGH"
                        ? "bg-amber-600 text-white"
                        : "bg-zinc-200 text-zinc-800"
                    }`}
                  >
                    {det.severity}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-red-600 font-semibold">{det.ndviDelta}%</td>
                <td className="px-5 py-3 text-zinc-500 font-mono">{det.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center py-2.5 border-t border-zinc-100">
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            {showAllHistory ? (
              <>
                <ChevronUp size={14} /> Show Less
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Show All {DETECTION_HISTORY.length} Detections
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-400 pb-2">
        AI-assisted change detection is strictly for decision support. Ground verification by a licensed revenue inspector is mandatory before legal enforcement.
      </p>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  valueClass = "text-zinc-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-1.5">
      <span className="text-xs text-zinc-500 font-body">{label}</span>
      <span className={`font-mono text-xs font-semibold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between pt-1.5">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={13} />
        <span className="text-xs font-body">{label}</span>
      </div>
      <span className="font-mono text-xs font-medium text-zinc-900">
        {value}
      </span>
    </div>
  );
}
