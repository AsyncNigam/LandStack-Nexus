import { useState } from "react";
import { Search, Filter, AlertTriangle, ArrowRight, Eye } from "lucide-react";

// ─── Mock Data ──────────────────────────────────────────────────────

interface Conflict {
  id: number;
  ulpin: string;
  state: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  dept_a: string;
  dept_a_val: string;
  dept_b: string;
  dept_b_val: string;
  status: string;
  detected: string;
}

const MOCK_CONFLICTS: Conflict[] = [
  {
    id: 1,
    ulpin: "TN-202-0001",
    state: "Tamil Nadu",
    type: "Area Variance",
    severity: "HIGH",
    dept_a: "Revenue (RoR)",
    dept_a_val: "1.20 acres",
    dept_b: "Sub-Registrar",
    dept_b_val: "1.50 acres",
    status: "UNRESOLVED",
    detected: "15 Sep 2026, 14:32",
  },
  {
    id: 2,
    ulpin: "PB-303-0001",
    state: "Punjab",
    type: "Ownership Mismatch",
    severity: "HIGH",
    dept_a: "Revenue (RoR)",
    dept_a_val: "Gurpreet Singh",
    dept_b: "Sub-Registrar",
    dept_b_val: "Harpreet Kaur",
    status: "UNRESOLVED",
    detected: "15 Sep 2026, 14:32",
  },
  {
    id: 3,
    ulpin: "GJ-404-0012",
    state: "Gujarat",
    type: "Area Variance",
    severity: "MEDIUM",
    dept_a: "Revenue (RoR)",
    dept_a_val: "2.45 acres",
    dept_b: "Sub-Registrar",
    dept_b_val: "2.52 acres",
    status: "UNDER REVIEW",
    detected: "14 Sep 2026, 09:15",
  },
  {
    id: 4,
    ulpin: "AS-505-0003",
    state: "Assam",
    type: "Freshness",
    severity: "LOW",
    dept_a: "Revenue (RoR)",
    dept_a_val: "Last: 2022-03-11",
    dept_b: "Sub-Registrar",
    dept_b_val: "Last: 2026-08-20",
    status: "UNRESOLVED",
    detected: "13 Sep 2026, 16:44",
  },
  {
    id: 5,
    ulpin: "TN-202-0087",
    state: "Tamil Nadu",
    type: "AI Encroachment",
    severity: "MEDIUM",
    dept_a: "Sentinel-2 NDVI",
    dept_a_val: "ΔNDVI: -0.72",
    dept_b: "Ground Truth",
    dept_b_val: "Pending Survey",
    status: "AI FLAGGED",
    detected: "15 Sep 2026, 11:08",
  },
];

const FILTERS = ["All", "Area Variance", "Ownership", "AI Flags"];

// ─── Severity badge ─────────────────────────────────────────────────

const SEV_STYLES: Record<string, string> = {
  HIGH: "bg-[#B91C1C]/10 text-[#B91C1C] ring-[#B91C1C]/20",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  LOW: "bg-sky-50 text-sky-700 ring-sky-200",
};

const STATUS_STYLES: Record<string, string> = {
  UNRESOLVED: "text-[#B91C1C]",
  "UNDER REVIEW": "text-amber-600",
  "AI FLAGGED": "text-[#D97706]",
  RESOLVED: "text-emerald-600",
};

// ─── Component ──────────────────────────────────────────────────────

export default function QueueTab() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = MOCK_CONFLICTS.filter((c) => {
    if (activeFilter === "Area Variance" && c.type !== "Area Variance") return false;
    if (activeFilter === "Ownership" && c.type !== "Ownership Mismatch") return false;
    if (activeFilter === "AI Flags" && c.type !== "AI Encroachment") return false;
    if (search && !c.ulpin.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ULPIN…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-[#334155] placeholder-slate-400 outline-none transition-colors focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 shadow-sm"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
                activeFilter === f
                  ? "border-[#D97706] bg-[#D97706]/10 text-[#D97706]"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-[#334155]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {["ULPIN", "State", "Type", "Severity", "Variance", "Status", "Detected", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                {/* ULPIN */}
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#334155]">
                  {c.ulpin}
                </td>

                {/* State */}
                <td className="px-5 py-3.5 text-xs text-slate-500">{c.state}</td>

                {/* Type */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#334155]">
                    <AlertTriangle size={13} className="text-slate-400" />
                    {c.type}
                  </div>
                </td>

                {/* Severity */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${SEV_STYLES[c.severity]}`}
                  >
                    {c.severity}
                  </span>
                </td>

                {/* Variance */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-slate-500">{c.dept_a_val}</span>
                    <ArrowRight size={12} className="flex-shrink-0 text-slate-300" />
                    <span className="font-semibold text-[#334155]">{c.dept_b_val}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {c.dept_a} → {c.dept_b}
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-semibold ${STATUS_STYLES[c.status] ?? "text-slate-500"}`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Detected */}
                <td className="px-5 py-3.5 text-xs text-slate-400">{c.detected}</td>

                {/* Action */}
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#334155] transition-all hover:border-[#D97706] hover:bg-[#D97706]/5 hover:text-[#D97706]"
                  >
                    <Eye size={13} />
                    Review
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                  No conflicts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing {filtered.length} of {MOCK_CONFLICTS.length} discrepancies
        </span>
        <span className="font-mono">
          Last sync: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
        </span>
      </div>
    </div>
  );
}
