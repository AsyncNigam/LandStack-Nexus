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
  HIGH: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  LOW: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
};

const STATUS_STYLES: Record<string, string> = {
  UNRESOLVED: "text-rose-400",
  "UNDER REVIEW": "text-amber-400",
  "AI FLAGGED": "text-indigo-400",
  RESOLVED: "text-emerald-400",
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ULPIN…"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
                activeFilter === f
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950">
            <tr>
              {["ULPIN", "State", "Type", "Severity", "Variance", "Status", "Detected", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b border-slate-800 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
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
                className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/40"
              >
                {/* ULPIN */}
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-white">
                  {c.ulpin}
                </td>

                {/* State */}
                <td className="px-5 py-3.5 text-xs text-slate-400">{c.state}</td>

                {/* Type */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <AlertTriangle size={13} className="text-slate-500" />
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
                    <span className="text-slate-400">{c.dept_a_val}</span>
                    <ArrowRight size={12} className="flex-shrink-0 text-slate-600" />
                    <span className="font-semibold text-white">{c.dept_b_val}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-600">
                    {c.dept_a} → {c.dept_b}
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-semibold ${STATUS_STYLES[c.status] ?? "text-slate-400"}`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Detected */}
                <td className="px-5 py-3.5 text-xs text-slate-500">{c.detected}</td>

                {/* Action */}
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-400"
                  >
                    <Eye size={13} />
                    Review
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-600">
                  No conflicts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
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
