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
    <aside className="flex h-full w-96 flex-col border-r border-[#E8DCC8] bg-[#F4EBD9] text-[#7A3E14]">
      {/* Header */}
      <div className="border-b border-[#E8DCC8] px-5 py-4">
        <h2 className="text-lg font-bold tracking-tight text-[#7A3E14]">
          Discrepancy Queue
        </h2>
        <p className="mt-0.5 text-xs text-[#7A3E14]/60">
          {conflicts.length} unresolved issue{conflicts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C86B28]/30 border-t-[#C86B28]" />
          </div>
        )}

        {error && (
          <div className="px-5 py-8 text-center text-sm text-[#B91C1C]">
            {error}
          </div>
        )}

        {!loading && !error && conflicts.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C86B28]/15">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#7A3E14]">All clear</p>
            <p className="mt-0.5 text-xs text-[#7A3E14]/50">No unresolved conflicts</p>
          </div>
        )}

        {conflicts.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectConflict(c)}
            className={`group w-full border-b border-[#E8DCC8] px-5 py-4 text-left transition-colors hover:bg-[#C86B28]/10 ${
              selectedId === c.id
                ? "bg-[#C86B28]/20 border-l-4 border-l-[#C86B28]"
                : ""
            }`}
          >
            {/* Top row: ULPIN + severity badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-[#7A3E14]">
                {c.ulpin}
              </span>
              <SeverityBadge severity={c.severity} />
            </div>

            {/* Conflict type */}
            <p className="mt-1.5 text-xs font-medium text-[#7A3E14]/70">
              {TYPE_LABELS[c.conflict_type] ?? c.conflict_type}
            </p>

            {/* Bottom row: state + timestamp */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A3E14]/50">
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
      <div className="border-t border-[#E8DCC8] px-5 py-3">
        <p className="text-center text-[10px] uppercase tracking-widest text-[#7A3E14]/50">
          LandStack Nexus • Officer Dashboard
        </p>
      </div>
    </aside>
  );
}
