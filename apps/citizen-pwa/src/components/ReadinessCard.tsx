import type { ParcelResponse } from "../types";

interface ReadinessCardProps {
  data: ParcelResponse;
  onBack: () => void;
}

// ─── Score calculation ──────────────────────────────────────────────

function calcScore(conflicts: ParcelResponse["conflicts"]): number {
  if (!conflicts || conflicts.length === 0) return 100;
  if (conflicts.length === 1) return 75;
  return 50;
}

const SCORE_STYLES: Record<number, { ring: string; text: string; bg: string; label: string; gradient: string }> = {
  100: {
    ring: "ring-emerald-400",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Excellent",
    gradient: "from-emerald-500 to-teal-600",
  },
  75: {
    ring: "ring-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50",
    label: "Review Needed",
    gradient: "from-amber-500 to-orange-600",
  },
  50: {
    ring: "ring-red-400",
    text: "text-red-600",
    bg: "bg-red-50",
    label: "Action Required",
    gradient: "from-red-500 to-rose-600",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────

function hasConflict(conflicts: ParcelResponse["conflicts"] | undefined, type: string): boolean {
  return conflicts?.some((c) => c.conflict_type === type) ?? false;
}

function safe(value: unknown, fallback = "N/A"): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

// ─── Component ──────────────────────────────────────────────────────

export default function ReadinessCard({ data, onBack }: ReadinessCardProps) {
  const score = calcScore(data?.conflicts);
  const style = SCORE_STYLES[score] ?? SCORE_STYLES[50];

  const ownerName = safe(data?.ror?.owner_name ?? data?.registration?.owner_name);
  const areaAcre = safe(data?.ror?.area_acre ?? data?.registration?.area_acre);
  const taxDue = parseFloat(safe(data?.tax?.tax_due, "0"));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 px-4 py-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Search
      </button>

      {/* ── Score Header ─────────────────────────────────────────── */}
      <div className={`rounded-2xl bg-gradient-to-br ${style.gradient} p-5 text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          {/* Score ring */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur">
            <span className="text-3xl font-extrabold">{score}</span>
          </div>
          <div>
            <p className="font-mono text-sm font-bold tracking-wide">
              {data?.parcel?.ulpin}
            </p>
            <p className="mt-0.5 text-lg font-bold">
              {style.label}
            </p>
            <p className="mt-0.5 text-xs font-medium text-white/70">
              Transaction Readiness Score
            </p>
          </div>
        </div>
      </div>

      {/* ── Field Status List (Step 8.3) ─────────────────────────── */}
      <ul className="my-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Row 1: Ownership */}
        <li className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Ownership</span>
          </div>
          {hasConflict(data?.conflicts, "OWNERSHIP") ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              ⚠️ Conflict detected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              ✅ {ownerName}
            </span>
          )}
        </li>

        {/* Row 2: Area */}
        <li className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Parcel Area</span>
          </div>
          {hasConflict(data?.conflicts, "AREA") ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              ⚠️ Variance flagged
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              ✅ {areaAcre} acres
            </span>
          )}
        </li>

        {/* Row 3: Taxation */}
        <li className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Property Tax</span>
          </div>
          {taxDue > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              ⚠️ ₹{taxDue.toLocaleString("en-IN")} Due
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              ✅ Up to date
            </span>
          )}
        </li>
      </ul>

      {/* ── Status Alert ─────────────────────────────────────────── */}
      {score < 100 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
              !
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">
                Status: Review Pending
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                {data?.conflicts?.length ?? 0} discrepanc{(data?.conflicts?.length ?? 0) === 1 ? "y" : "ies"}{" "}
                detected across department records. A government officer will review and reconcile.
              </p>
            </div>
          </div>
        </div>
      )}

      {score === 100 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              ✓
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">
                Status: Transaction Ready
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
                All department records are consistent. This parcel is clear for transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Record Summary ───────────────────────────────────────── */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Record Summary
          </p>
        </div>
        <div className="divide-y divide-gray-50 px-4">
          <DetailRow label="State" value={data?.parcel?.source_state?.toUpperCase() ?? "N/A"} />
          <DetailRow label="Area (sqm)" value={safe(data?.parcel?.area_sqm)} />
          <DetailRow label="Revenue ID" value={safe(data?.ror?.khata_no)} />
          <DetailRow label="Registry Deed" value={safe(data?.registration?.deed_no)} />
          <DetailRow label="Tax Due" value={`₹${safe(data?.tax?.tax_due, "0")}`} />
        </div>
      </div>

      {/* ── Legal Disclaimer (Step 8.4) ──────────────────────────── */}
      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
        {/* Info icon */}
        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] font-extrabold text-gray-600">
          i
        </div>
        <p className="text-xs font-medium leading-relaxed text-gray-500">
          <span className="font-bold text-gray-600">DISCLAIMER:</span>{" "}
          This transaction readiness score is for decision support only.
          It highlights data consistency across departments but is{" "}
          <span className="font-bold text-gray-600">NOT</span> a legal
          certification of title.
        </p>
      </div>

      {/* Report Issue button */}
      <button
        type="button"
        className="mt-4 w-full py-2.5 text-center text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
      >
        Report Issue
      </button>

      {/* Footer */}
      <p className="mt-4 pb-2 text-center text-[10px] uppercase tracking-widest text-gray-400">
        Government of India • Digital Public Infrastructure
      </p>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
