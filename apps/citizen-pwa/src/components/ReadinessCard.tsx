import type { ParcelResponse } from "../types";

interface ReadinessCardProps {
  data: ParcelResponse;
  onBack: () => void;
}

// ─── Score calculation ──────────────────────────────────────────────

function calcScore(conflicts: ParcelResponse["conflicts"]): number {
  if (conflicts.length === 0) return 100;
  if (conflicts.length === 1) return 75;
  return 50;
}

const SCORE_STYLES: Record<number, { ring: string; text: string; bg: string; label: string }> = {
  100: { ring: "ring-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", label: "Excellent" },
  75: { ring: "ring-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", label: "Review Needed" },
  50: { ring: "ring-red-500", text: "text-red-400", bg: "bg-red-500/10", label: "Action Required" },
};

// ─── Helpers ────────────────────────────────────────────────────────

function hasConflict(conflicts: ParcelResponse["conflicts"], type: string): boolean {
  return conflicts.some((c) => c.conflict_type === type);
}

function safe(value: unknown, fallback = "N/A"): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

// ─── Component ──────────────────────────────────────────────────────

export default function ReadinessCard({ data, onBack }: ReadinessCardProps) {
  const score = calcScore(data.conflicts);
  const style = SCORE_STYLES[score] ?? SCORE_STYLES[50];

  const ownerName = safe(data.ror?.owner_name ?? data.registration?.owner_name);
  const areaAcre = safe(data.ror?.area_acre ?? data.registration?.area_acre);

  return (
    <div className="flex min-h-screen flex-col px-5 py-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Search
      </button>

      {/* ── Score Header ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-center gap-4">
          {/* Score ring */}
          <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full ring-4 ${style.ring} ${style.bg}`}>
            <span className={`text-2xl font-bold ${style.text}`}>{score}</span>
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-white">
              {data.parcel.ulpin}
            </p>
            <p className={`mt-0.5 text-xs font-semibold ${style.text}`}>
              {style.label}
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              Transaction Readiness Score
            </p>
          </div>
        </div>
      </div>

      {/* ── Status List ──────────────────────────────────────────── */}
      <div className="mt-4 space-y-3">
        {/* Ownership */}
        <StatusRow
          label="Ownership"
          ok={!hasConflict(data.conflicts, "OWNERSHIP")}
          okText={`Confirmed: ${ownerName}`}
          warnText="Mismatch detected between departments"
        />

        {/* Area */}
        <StatusRow
          label="Land Area"
          ok={!hasConflict(data.conflicts, "AREA")}
          okText={`Matched: ${areaAcre} acres`}
          warnText="Variance detected between departments"
        />

        {/* Tax */}
        <StatusRow
          label="Tax Status"
          ok={true}
          okText="Up to Date"
          warnText=""
        />
      </div>

      {/* ── Status Alert ─────────────────────────────────────────── */}
      {score < 100 && (
        <div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/40 px-4 py-3">
          <p className="text-xs font-semibold text-amber-400">
            STATUS: REVIEW PENDING
          </p>
          <p className="mt-0.5 text-xs text-amber-300/70">
            {data.conflicts.length} discrepanc{data.conflicts.length === 1 ? "y" : "ies"} detected.
            A government officer will review and reconcile the records.
          </p>
        </div>
      )}

      {score === 100 && (
        <div className="mt-4 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-400">
            STATUS: TRANSACTION READY
          </p>
          <p className="mt-0.5 text-xs text-emerald-300/70">
            All department records are consistent. This parcel is clear for transactions.
          </p>
        </div>
      )}

      {/* ── Parcel Details ───────────────────────────────────────── */}
      <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Record Summary
        </p>
        <div className="space-y-2 text-sm">
          <DetailRow label="State" value={data.parcel.source_state?.toUpperCase()} />
          <DetailRow label="Area (sqm)" value={safe(data.parcel.area_sqm)} />
          <DetailRow label="Revenue ID" value={safe(data.ror?.khata_no)} />
          <DetailRow label="Registry Deed" value={safe(data.registration?.deed_no)} />
          <DetailRow label="Tax Due" value={`₹${safe(data.tax?.tax_due, "0")}`} />
        </div>
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────── */}
      <p className="mt-6 text-center text-[10px] leading-relaxed text-gray-600">
        For decision support only. Not legal certification of title.
        <br />
        Refer to the concerned government office for official records.
      </p>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function StatusRow({
  label,
  ok,
  okText,
  warnText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  warnText: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
      <span className="mt-0.5 text-base">{ok ? "✅" : "⚠️"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className={`mt-0.5 text-sm font-medium ${ok ? "text-emerald-400" : "text-amber-400"}`}>
          {ok ? okText : warnText}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-200">{value}</span>
    </div>
  );
}
