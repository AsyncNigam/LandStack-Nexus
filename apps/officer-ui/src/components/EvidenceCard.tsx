import { useState } from "react";
import axios from "axios";
import type { Conflict } from "../types";

interface EvidenceCardProps {
  conflict: Conflict;
  onClose: () => void;
  onResolved: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

function safe(value: unknown, fallback = "N/A"): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return String(value);
}

const SEVERITY_BANNER: Record<string, { bg: string; border: string; text: string; label: string }> = {
  HIGH: { bg: "bg-red-50", border: "border-red-200", text: "text-[#B91C1C]", label: "Critical" },
  MEDIUM: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", label: "Warning" },
  LOW: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", label: "Info" },
};

// ─── Component ──────────────────────────────────────────────────────

export default function EvidenceCard({ conflict, onClose, onResolved }: EvidenceCardProps) {
  const [note, setNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const fv = conflict.field_values ?? {};
  const banner = SEVERITY_BANNER[conflict.severity] ?? SEVERITY_BANNER.LOW;

  const isArea = conflict.conflict_type === "AREA";
  const isOwnership = conflict.conflict_type === "OWNERSHIP";
  const isFreshness = conflict.conflict_type === "FRESHNESS";

  // ── Resolve handler ───────────────────────────────────────────────

  async function handleResolve() {
    setIsResolving(true);
    try {
      await axios.post(`/api/v1/conflicts/${conflict.id}/resolve`, {
        officer_id: "DEMO_ADMIN_01",
        action: "MANUAL_RESOLUTION",
        resolution_note: note || "Resolved via dashboard",
      });
      onResolved();
      onClose();
    } catch (err) {
      console.error("Resolution failed:", err);
      alert("Failed to resolve — database transaction was rolled back.");
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <div className="absolute bottom-6 right-6 z-30 w-[500px] rounded-2xl border border-[#E8DCC8] bg-[#F4EBD9]/95 shadow-2xl shadow-[#7A3E14]/10 backdrop-blur-xl">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-[#E8DCC8] px-6 py-4">
        <div>
          <p className="font-mono text-base font-bold text-[#7A3E14]">
            {conflict.ulpin}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[#7A3E14]">
            {conflict.conflict_type} Conflict • {conflict.source_state?.toUpperCase()}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#A0845C] transition-colors hover:bg-[#EDE3D3] hover:text-[#7A3E14]"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Simulated AI Alert (for AREA conflicts) ─────────────── */}
      {isArea && (
        <div className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white">
              AI
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-800">
              AI-Assisted Change Detection
            </span>
          </div>
          <p className="font-mono text-xs leading-relaxed text-emerald-900">
            ⚠️ Sentinel-2 NDVI differencing indicates{" "}
            <span className="font-bold text-emerald-700">18% vegetation loss</span>{" "}
            and potential built-up structure expansion on agricultural zoning.
            Confidence:{" "}
            <span className="font-bold text-emerald-700">91.4%</span>.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-200">
              <div className="h-full w-[91.4%] rounded-full bg-emerald-600" />
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-800">91.4%</span>
          </div>
        </div>
      )}

      {/* ── Side-by-side comparison ─────────────────────────────── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E8DCC8] bg-[#E8DCC8]">
        {/* Left: Revenue Department */}
        <div className="bg-[#F4EBD9] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]">
            Revenue Dept (RoR)
          </p>
          {isOwnership && <DataRow label="Owner" value={safe(fv.ror)} />}
          {isArea && <DataRow label="Area (acre)" value={safe(fv.ror)} />}
          {isFreshness && (
            <>
              <DataRow label="Source" value={safe(fv.source)} />
              <DataRow
                label="Last Updated"
                value={fv.date ? new Date(fv.date as string).toLocaleDateString("en-IN") : "N/A"}
              />
            </>
          )}
          {!isOwnership && !isArea && !isFreshness && (
            <DataRow label="Value" value={safe(fv.ror)} />
          )}
        </div>

        {/* Right: Sub-Registrar */}
        <div className="bg-[#F4EBD9] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]">
            Sub-Registrar (Reg)
          </p>
          {isOwnership && <DataRow label="Owner" value={safe(fv.registration)} />}
          {isArea && <DataRow label="Area (acre)" value={safe(fv.registration)} />}
          {isFreshness && <DataRow label="Status" value="Record is stale (>2 yrs)" />}
          {!isOwnership && !isArea && !isFreshness && (
            <DataRow label="Value" value={safe(fv.registration)} />
          )}
        </div>
      </div>

      {/* ── Alert Banner ────────────────────────────────────────── */}
      <div className={`mx-4 mt-3 rounded-xl border ${banner.border} ${banner.bg} px-4 py-3`}>
        <p className={`text-xs font-semibold ${banner.text}`}>
          {banner.label}: {alertMessage(conflict)}
        </p>
      </div>

      {/* ── Resolution Note ─────────────────────────────────────── */}
      <div className="mx-4 mt-3">
        <label
          htmlFor="resolution-note"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#A0845C]"
        >
          Resolution Note
        </label>
        <textarea
          id="resolution-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the action taken…"
          className="w-full resize-none rounded-xl border border-[#E8DCC8] bg-[#F4EBD9] px-3 py-2 text-sm text-[#7A3E14] placeholder-[#A0845C] outline-none transition-colors focus:border-[#7A3E14] focus:ring-1 focus:ring-[#7A3E14]"
        />
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t border-[#E8DCC8] px-6 py-4 mt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isResolving}
          className="rounded-lg border border-[#E8DCC8] px-4 py-2 text-sm font-medium text-[#7A3E14] transition-colors hover:bg-[#EDE3D3] hover:text-[#7A3E14] disabled:opacity-50"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleResolve}
          disabled={isResolving}
          className="rounded-lg bg-[#7A3E14] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5C2E0A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResolving ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Resolving…
            </span>
          ) : (
            "Resolve Issue"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="text-[10px] uppercase tracking-wider text-[#A0845C]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#7A3E14]">{value}</p>
    </div>
  );
}

function alertMessage(c: Conflict): string {
  const fv = c.field_values ?? {};

  switch (c.conflict_type) {
    case "AREA": {
      const variance = fv.variance as number | undefined;
      const pct = variance ? `${(variance * 100).toFixed(1)}%` : "unknown";
      return `Area differs by ${pct} between Revenue and Registry records (threshold: 3%)`;
    }
    case "OWNERSHIP":
      return `Owner name mismatch — "${safe(fv.ror)}" vs "${safe(fv.registration)}"`;
    case "FRESHNESS":
      return `${safe(fv.source)} record has not been updated in over 2 years`;
    default:
      return `Discrepancy detected between department records`;
  }
}
