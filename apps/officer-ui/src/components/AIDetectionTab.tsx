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
  ...Array.from({ length: 30 }).map((_, i) => {
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
      date: `2026-09-${String(1 + (i % 28)).padStart(2, '0')}`,
      ndviDelta: -(20 + Math.floor(Math.random() * 60)),
      areaExpansion: 500 + Math.floor(Math.random() * 2000)
    };
  })
];

// ─── Component ──────────────────────────────────────────────────────

export default function AIDetectionTab() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedDetection, setSelectedDetection] = useState(DETECTION_HISTORY[0]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const displayedHistory = showAllHistory ? DETECTION_HISTORY : DETECTION_HISTORY.slice(0, 4);

  return (
    <div className="h-full overflow-y-auto bg-[#F4EBD9]">
      {/* ═══ TOP: Summary Stats Bar ══════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4 p-6 pb-0">
        <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Satellite size={14} className="text-[#7A3E14]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]">Active Scans</span>
          </div>
          <div className="text-2xl font-bold text-[#7A3E14]">142</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">+12 today</div>
        </div>
        <div className="rounded-xl border border-[#B91C1C]/30 bg-white/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#B91C1C]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]">Flags Raised</span>
          </div>
          <div className="text-2xl font-bold text-[#B91C1C]">{DETECTION_HISTORY.length}</div>
          <div className="text-[10px] text-[#B91C1C] font-medium mt-1">3 critical</div>
        </div>
        <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-[#C86B28]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]">Avg Confidence</span>
          </div>
          <div className="text-2xl font-bold text-[#7A3E14]">86.1%</div>
          <div className="text-[10px] text-[#A0845C] font-medium mt-1">RF + CNN Ensemble</div>
        </div>
        <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-[#7A3E14]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]">Area Affected</span>
          </div>
          <div className="text-2xl font-bold text-[#7A3E14]">14,990</div>
          <div className="text-[10px] text-[#A0845C] font-medium mt-1">sqm total expansion</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-3">
        {/* ═══ LEFT: Before/After Slider (2 cols) ═════════════════════ */}
        <div className="col-span-2 flex flex-col rounded-xl border border-[#E8DCC8] bg-[#F4EBD9] p-5 shadow-md">
          {/* Header */}
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7A3E14]/10">
                <Satellite size={16} className="text-[#7A3E14]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#7A3E14]">
                  Sentinel-2 L2A Optical &amp; NDVI Differential
                </h3>
                <p className="text-[11px] text-[#A0845C]">
                  10m spatial resolution • Band 8 (NIR) / Band 4 (Red) composite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EDE3D3] px-2 py-1 font-mono text-[10px] text-[#7A3E14] border border-[#E8DCC8]">
                {selectedDetection.location}
              </span>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#A0845C] transition-colors hover:bg-[#EDE3D3] hover:text-[#7A3E14]"
              >
                <Maximize size={14} />
              </button>
            </div>
          </div>

          {/* Timeline labels */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1">
              <Calendar size={12} className="text-emerald-700" />
              <span className="text-[11px] font-semibold text-emerald-700">
                JAN 2024 — Pre-Change
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-px w-8 bg-[#C4A882]" />
              <ArrowRight size={14} className="text-[#A0845C]" />
              <div className="h-px w-8 bg-[#C4A882]" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-2.5 py-1">
              <Calendar size={12} className="text-[#B91C1C]" />
              <span className="text-[11px] font-semibold text-[#B91C1C]">
                SEP 2026 — Post-Change
              </span>
            </div>
          </div>

          {/* ── Image Slider ─────────────────────────────────────── */}
          <div className="relative mt-1 h-[380px] w-full overflow-hidden rounded-lg border border-[#E8DCC8]">
            {/* Image 1: Base (2024 - green agriculture) */}
            <img
              src="/satellite_before.jpg"
              alt="Satellite view — January 2024"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            {/* Image 2: Overlay (2026 - urban/dry) with clip */}
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
              className="absolute top-0 z-10 h-full w-0.5 bg-[#F4EBD9] shadow-[0_0_8px_rgba(0,0,0,0.3)]"
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
              {/* Slider thumb */}
              <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#7A3E14] shadow-lg">
                <div className="flex gap-0.5">
                  <div className="h-4 w-0.5 rounded-full bg-[#F4EBD9]/90" />
                  <div className="h-4 w-0.5 rounded-full bg-[#F4EBD9]/90" />
                </div>
              </div>
            </div>

            {/* Year labels on images */}
            <div className="absolute left-3 top-3 z-10 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] font-bold text-emerald-400 backdrop-blur-sm">
              2024
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] font-bold text-rose-400 backdrop-blur-sm">
              2026
            </div>

            {/* Invisible range input */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
              aria-label="Before/after satellite comparison slider"
            />
          </div>

          {/* Slider footer */}
          <p className="mt-2.5 text-center text-[10px] text-[#A0845C]">
            Drag slider to compare temporal imagery • Source: Copernicus
            Sentinel-2 • Processing: Sen2Cor L2A
          </p>
        </div>

        {/* ═══ RIGHT: Diagnostic Panel (1 col) ════════════════════════ */}
        <div className="col-span-1 flex flex-col gap-5">
          {/* ── Alert Card ───────────────────────────────────────── */}
          <div className="rounded-xl border border-[#B91C1C]/30 bg-[#F4EBD9] p-5 shadow-md">
            {/* Alert header */}
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B91C1C]/10">
                <AlertTriangle size={18} className="text-[#B91C1C]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#7A3E14]">
                  {selectedDetection.type} Flag
                </h3>
                <p className="font-mono text-xs text-[#A0845C]">
                  ULPIN {selectedDetection.ulpin}
                </p>
              </div>
            </div>

            {/* Confidence badge */}
            <div className="mb-4 flex items-center justify-between">
              <span className={`rounded-md px-2.5 py-1 font-mono text-xs font-bold text-white shadow-sm ${
                selectedDetection.severity === "CRITICAL" ? "bg-[#7f1d1d]" : "bg-[#B91C1C]"
              }`}>
                {selectedDetection.severity} ({selectedDetection.confidence}%)
              </span>
              <span className="text-[10px] text-[#A0845C]">Model v3.2.1</span>
            </div>

            {/* Confidence bar */}
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#EDE3D3] border border-[#E8DCC8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B91C1C] to-red-500 transition-all duration-1000"
                style={{ width: `${selectedDetection.confidence}%` }}
              />
            </div>

            {/* Metrics */}
            <div className="space-y-2 rounded-lg border border-[#E8DCC8] bg-[#F4EBD9] p-3.5">
              <MetricRow
                label="Vegetation Loss (NDVI)"
                value={`${selectedDetection.ndviDelta}%`}
                valueClass="text-[#B91C1C] font-bold"
              />
              <MetricRow
                label="Built-up Area Expansion"
                value={`+${selectedDetection.areaExpansion.toLocaleString()} sqm`}
                valueClass="text-[#7A3E14] font-semibold"
              />
              <MetricRow
                label="Zoning Violation Risk"
                value={selectedDetection.severity}
                valueClass={selectedDetection.severity === "CRITICAL" ? "text-[#7f1d1d] font-bold" : "text-[#B91C1C] font-bold"}
              />
              <div className="my-2 border-t border-[#E8DCC8]" />
              <MetricRow
                label="Land Use Classification"
                value="AGR → URB"
                valueClass="text-[#7A3E14] font-semibold"
              />
              <MetricRow
                label="Detection Algorithm"
                value="RF + CNN Ensemble"
                valueClass="text-[#7A3E14]"
              />
              <MetricRow
                label="Temporal Baseline"
                value="18 months"
                valueClass="text-[#7A3E14]"
              />
            </div>
          </div>

          {/* ── Parcel Details ────────────────────────────────────── */}
          <div className="rounded-xl border border-[#E8DCC8] bg-[#F4EBD9] p-5 shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <Target size={14} className="text-[#7A3E14]" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#7A3E14]">
                Affected Parcel
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <DetailRow icon={MapPin} label="Location" value={selectedDetection.location} />
              <DetailRow icon={Maximize} label="Survey Area" value="1.20 acres" />
              <DetailRow icon={Activity} label="Revenue ID" value={`SRV-${selectedDetection.ulpin.slice(0, 6)}`} />
              <DetailRow icon={Cpu} label="Processing" value="GPU Cluster A4" />
              <DetailRow icon={Calendar} label="Detected" value={selectedDetection.date} />
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <div className="space-y-2.5">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7A3E14] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#5C2E0A]"
            >
              <Target size={16} />
              Initiate Ground Inspection
            </button>
            <button
              type="button"
              className="w-full rounded-lg border border-[#E8DCC8] bg-[#F4EBD9] px-4 py-2.5 text-sm font-medium text-[#7A3E14] transition-colors hover:border-[#C4A882] hover:bg-[#EDE3D3]"
            >
              Dismiss (False Positive)
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM: Detection History Table ═══════════════════════════ */}
      <div className="mx-6 mb-6 rounded-xl border border-[#E8DCC8] bg-white/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between bg-[#FFF8EE] px-5 py-3 border-b border-[#E8DCC8]">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[#7A3E14]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#7A3E14]">Detection History</h3>
          </div>
          <span className="text-[10px] text-[#A0845C] font-semibold">{DETECTION_HISTORY.length} detections this week</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-[#A0845C] bg-[#F4EBD9]/50">
            <tr>
              <th className="px-5 py-2.5 font-semibold">ID</th>
              <th className="px-5 py-2.5 font-semibold">ULPIN</th>
              <th className="px-5 py-2.5 font-semibold">Location</th>
              <th className="px-5 py-2.5 font-semibold">Type</th>
              <th className="px-5 py-2.5 font-semibold">Confidence</th>
              <th className="px-5 py-2.5 font-semibold">Severity</th>
              <th className="px-5 py-2.5 font-semibold">NDVI Δ</th>
              <th className="px-5 py-2.5 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DCC8]">
            {displayedHistory.map((det) => (
              <tr
                key={det.id}
                onClick={() => setSelectedDetection(det)}
                className={`transition-colors cursor-pointer ${
                  selectedDetection.id === det.id ? "bg-[#C86B28]/10" : "hover:bg-[#FFF8EE]"
                }`}
              >
                <td className="px-5 py-3 font-mono text-xs font-semibold text-[#7A3E14]">{det.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#7A3E14]">{det.ulpin}</td>
                <td className="px-5 py-3 text-xs text-[#A0845C]">{det.location}</td>
                <td className="px-5 py-3 text-xs font-medium text-[#7A3E14]">{det.type}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#EDE3D3]">
                      <div className="h-1.5 rounded-full bg-[#B91C1C]" style={{ width: `${det.confidence}%` }} />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-[#7A3E14]">{det.confidence}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    det.severity === "CRITICAL" ? "bg-[#7f1d1d] text-white" :
                    det.severity === "HIGH" ? "bg-[#B91C1C] text-white" :
                    "bg-amber-100 text-amber-800"
                  }`}>{det.severity}</span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-[#B91C1C] font-semibold">{det.ndviDelta}%</td>
                <td className="px-5 py-3 text-xs text-[#A0845C]">{det.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center py-2 border-t border-[#E8DCC8]">
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="flex items-center gap-1 text-xs font-semibold text-[#7A3E14] hover:text-[#C86B28] transition-colors"
          >
            {showAllHistory ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Show All {DETECTION_HISTORY.length} Detections</>}
          </button>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <p className="text-center text-[10px] leading-relaxed text-[#A0845C] pb-6 px-6">
        AI-assisted change detection is for decision support only. Ground
        verification by a licensed surveyor is mandatory before enforcement
        action.
      </p>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  valueClass = "text-[#7A3E14]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#A0845C]">{label}</span>
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#A0845C]">
        <Icon size={13} />
        <span className="text-xs">{label}</span>
      </div>
      <span className="font-mono text-xs font-medium text-[#7A3E14]">
        {value}
      </span>
    </div>
  );
}
