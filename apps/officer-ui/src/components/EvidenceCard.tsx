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
  HIGH: { bg: "bg-red-950/60", border: "border-red-800", text: "text-red-300", label: "Critical" },
  MEDIUM: { bg: "bg-amber-950/60", border: "border-amber-800", text: "text-amber-300", label: "Warning" },
  LOW: { bg: "bg-sky-950/60", border: "border-sky-800", text: "text-sky-300", label: "Info" },
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
    <div className="absolute bottom-6 right-6 z-30 w-[500px] rounded-2xl border border-gray-800 bg-gray-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-gray-800 px-6 py-4">
        <div>
          <p className="font-mono text-base font-bold text-white">
            {conflict.ulpin}
          </p>
          <p className="mt-0.5 text-xs font-medium text-indigo-400">
            {conflict.conflict_type} Conflict • {conflict.source_state?.toUpperCase()}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Simulated AI Alert (for AREA conflicts) ─────────────── */}
      {isArea && (
        <div className="mx-4 mt-4 rounded-xl border border-green-900/60 bg-slate-900 p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-green-500/20 text-[10px] font-bold text-green-400">
              AI
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-green-500">
              AI-Assisted Change Detection
            </span>
          </div>
          <p className="font-mono text-xs leading-relaxed text-green-400">
            ⚠️ Sentinel-2 NDVI differencing indicates{" "}
            <span className="font-bold text-green-300">18% vegetation loss</span>{" "}
            and potential built-up structure expansion on agricultural zoning.
            Confidence:{" "}
            <span className="font-bold text-green-300">91.4%</span>.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full w-[91.4%] rounded-full bg-gradient-to-r from-green-600 to-green-400" />
            </div>
            <span className="font-mono text-[10px] font-bold text-green-500">91.4%</span>
          </div>
        </div>
      )}

      {/* ── Side-by-side comparison ─────────────────────────────── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-gray-800">
        {/* Left: Revenue Department */}
        <div className="bg-gray-900 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
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
        <div className="bg-gray-900 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
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
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-500"
        >
          Resolution Note
        </label>
        <textarea
          id="resolution-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the action taken…"
          className="w-full resize-none rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        />
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-800 px-6 py-4 mt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isResolving}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleResolve}
          disabled={isResolving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-200">{value}</p>
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
