import type { Conflict } from "../types";

interface SidebarProps {
  conflicts: Conflict[];
  loading: boolean;
  error: string | null;
  onSelectConflict: (conflict: Conflict) => void;
  selectedId: number | null;
}

// ─── Severity badge ─────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: "bg-[#B91C1C] text-white ring-1 ring-[#B91C1C]",
  MEDIUM: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  LOW: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
};

function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.LOW;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold shadow-xs ${style}`}
    >
      {severity}
    </span>
  );
}

// ─── Conflict type label ────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  OWNERSHIP: "Ownership Mismatch",
  AREA: "Area Variance",
  FRESHNESS: "Stale Record",
};

// ─── Component ──────────────────────────────────────────────────────

export default function Sidebar({
  conflicts,
  loading,
  error,
  onSelectConflict,
  selectedId,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-96 flex-col border-r border-amber-600/30 bg-[#D97706] text-white">
      {/* Header */}
      <div className="border-b border-white/20 px-5 py-4">
        <h2 className="text-lg font-bold tracking-tight text-white">
          Discrepancy Queue
        </h2>
        <p className="mt-0.5 text-xs text-white/70">
          {conflicts.length} unresolved issue{conflicts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}

        {error && (
          <div className="px-5 py-8 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && conflicts.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/90">All clear</p>
            <p className="mt-0.5 text-xs text-white/60">No unresolved conflicts</p>
          </div>
        )}

        {conflicts.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectConflict(c)}
            className={`group w-full border-b border-amber-600/30 px-5 py-4 text-left transition-colors hover:bg-amber-600/40 ${
              selectedId === c.id
                ? "bg-amber-700/60 border-l-4 border-l-white"
                : ""
            }`}
          >
            {/* Top row: ULPIN + severity badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-white">
                {c.ulpin}
              </span>
              <SeverityBadge severity={c.severity} />
            </div>

            {/* Conflict type */}
            <p className="mt-1.5 text-xs font-medium text-white/80">
              {TYPE_LABELS[c.conflict_type] ?? c.conflict_type}
            </p>

            {/* Bottom row: state + timestamp */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
              <span className="uppercase tracking-wider font-medium">{c.source_state}</span>
              <span>
                {new Date(c.detected_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 px-5 py-3">
        <p className="text-center text-[10px] uppercase tracking-widest text-white/60">
          LandStack Nexus • Officer Dashboard
        </p>
      </div>
    </aside>
  );
}
