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
} from "lucide-react";

// ─── Component ──────────────────────────────────────────────────────

export default function AIDetectionTab() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="grid h-full grid-cols-1 gap-5 overflow-y-auto p-6 lg:grid-cols-3 bg-[#F1F5E9]">
      {/* ═══ LEFT: Before/After Slider (2 cols) ═════════════════════ */}
      <div className="col-span-2 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-md">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D97706]/10">
              <Satellite size={16} className="text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#334155]">
                Sentinel-2 L2A Optical &amp; NDVI Differential
              </h3>
              <p className="text-[11px] text-slate-500">
                10m spatial resolution • Band 8 (NIR) / Band 4 (Red) composite
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600 border border-slate-200">
              11.016°N, 76.955°E
            </span>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#334155]"
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
            <div className="h-px w-8 bg-slate-300" />
            <ArrowRight size={14} className="text-slate-400" />
            <div className="h-px w-8 bg-slate-300" />
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-2.5 py-1">
            <Calendar size={12} className="text-[#B91C1C]" />
            <span className="text-[11px] font-semibold text-[#B91C1C]">
              SEP 2026 — Post-Change
            </span>
          </div>
        </div>

        {/* ── Image Slider ─────────────────────────────────────── */}
        <div className="relative mt-1 h-[480px] w-full overflow-hidden rounded-lg border border-slate-200">
          {/* Image 1: Base (2024 - green agriculture) */}
          <img
            src="https://images.unsplash.com/photo-1518331647614-7a1f04cd34ce?q=80&w=2000&auto=format&fit=crop"
            alt="Satellite view — January 2024"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />

          {/* Image 2: Overlay (2026 - urban/dry) with clip */}
          <img
            src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=2000&auto=format&fit=crop"
            alt="Satellite view — September 2026"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
            }}
            draggable={false}
          />

          {/* Slider divider line */}
          <div
            className="absolute top-0 z-10 h-full w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)]"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            {/* Slider thumb */}
            <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#D97706] shadow-lg">
              <div className="flex gap-0.5">
                <div className="h-4 w-0.5 rounded-full bg-white/90" />
                <div className="h-4 w-0.5 rounded-full bg-white/90" />
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
        <p className="mt-2.5 text-center text-[10px] text-slate-500">
          Drag slider to compare temporal imagery • Source: Copernicus
          Sentinel-2 • Processing: Sen2Cor L2A
        </p>
      </div>

      {/* ═══ RIGHT: Diagnostic Panel (1 col) ════════════════════════ */}
      <div className="col-span-1 flex flex-col gap-5">
        {/* ── Alert Card ───────────────────────────────────────── */}
        <div className="rounded-xl border border-[#B91C1C]/30 bg-white p-5 shadow-md">
          {/* Alert header */}
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B91C1C]/10">
              <AlertTriangle size={18} className="text-[#B91C1C]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#334155]">
                Encroachment Flag
              </h3>
              <p className="font-mono text-xs text-slate-500">
                ULPIN TN-202-0001
              </p>
            </div>
          </div>

          {/* Confidence badge */}
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-md bg-[#B91C1C] px-2.5 py-1 font-mono text-xs font-bold text-white shadow-sm">
              HIGH CONFIDENCE (91.4%)
            </span>
            <span className="text-[10px] text-slate-500">Model v3.2.1</span>
          </div>

          {/* Confidence bar */}
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B91C1C] to-red-500 transition-all duration-1000"
              style={{ width: "91.4%" }}
            />
          </div>

          {/* Metrics */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <MetricRow
              label="Vegetation Loss (NDVI)"
              value="-72.4%"
              valueClass="text-[#B91C1C] font-bold"
            />
            <MetricRow
              label="Built-up Area Expansion"
              value="+1,420 sqm"
              valueClass="text-[#D97706] font-semibold"
            />
            <MetricRow
              label="Zoning Violation Risk"
              value="CRITICAL"
              valueClass="text-[#B91C1C] font-bold"
            />
            <div className="my-2 border-t border-slate-200" />
            <MetricRow
              label="Land Use Classification"
              value="AGR → URB"
              valueClass="text-[#D97706] font-semibold"
            />
            <MetricRow
              label="Detection Algorithm"
              value="RF + CNN Ensemble"
              valueClass="text-[#334155]"
            />
            <MetricRow
              label="Temporal Baseline"
              value="18 months"
              valueClass="text-[#334155]"
            />
          </div>
        </div>

        {/* ── Parcel Details ────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <Target size={14} className="text-[#D97706]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#334155]">
              Affected Parcel
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <DetailRow icon={MapPin} label="Location" value="Coimbatore, TN" />
            <DetailRow icon={Maximize} label="Survey Area" value="1.20 acres" />
            <DetailRow icon={Activity} label="Revenue ID" value="SRV-TN-202" />
            <DetailRow icon={Cpu} label="Processing" value="GPU Cluster A4" />
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────── */}
        <div className="space-y-2.5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#b45309]"
          >
            <Target size={16} />
            Initiate Ground Inspection
          </button>
          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            Dismiss (False Positive)
          </button>
        </div>

        {/* ── Disclaimer ────────────────────────────────────────── */}
        <p className="text-center text-[10px] leading-relaxed text-slate-500">
          AI-assisted change detection is for decision support only. Ground
          verification by a licensed surveyor is mandatory before enforcement
          action.
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  valueClass = "text-[#334155]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
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
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={13} />
        <span className="text-xs">{label}</span>
      </div>
      <span className="font-mono text-xs font-medium text-[#334155]">
        {value}
      </span>
    </div>
  );
}
