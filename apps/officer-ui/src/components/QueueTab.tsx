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
  {
    id: 4,
    ulpin: "OD-101-3321",
    state: "Odisha",
    type: "Status Mismatch",
    severity: "MEDIUM",
    dept_a: "Revenue (RoR)",
    dept_a_val: "Agricultural",
    dept_b: "Urban Dept",
    dept_b_val: "Commercial",
    status: "INVESTIGATING",
    detected: "14 Sep 2026, 09:15",
  },
  {
    id: 5,
    ulpin: "MH-505-1102",
    state: "Maharashtra",
    type: "Area Variance",
    severity: "HIGH",
    dept_a: "Revenue (RoR)",
    dept_a_val: "4.50 acres",
    dept_b: "Sub-Registrar",
    dept_b_val: "4.15 acres",
    status: "UNRESOLVED",
    detected: "14 Sep 2026, 16:45",
  },
  {
    id: 6,
    ulpin: "KA-606-2291",
    state: "Karnataka",
    type: "Ownership Mismatch",
    severity: "HIGH",
    dept_a: "Bhoomi",
    dept_a_val: "Ramesh Kumar",
    dept_b: "Registration",
    dept_b_val: "Ramesh K.",
    status: "UNRESOLVED",
    detected: "13 Sep 2026, 11:20",
  },
  {
    id: 7,
    ulpin: "UP-707-4432",
    state: "Uttar Pradesh",
    type: "Tax Arrears",
    severity: "LOW",
    dept_a: "Revenue",
    dept_a_val: "Cleared",
    dept_b: "Municipal",
    dept_b_val: "Pending Rs 12,500",
    status: "INVESTIGATING",
    detected: "12 Sep 2026, 08:30",
  },
  {
    id: 8,
    ulpin: "WB-808-5543",
    state: "West Bengal",
    type: "Status Mismatch",
    severity: "MEDIUM",
    dept_a: "Banglarbhumi",
    dept_a_val: "Govt Land",
    dept_b: "Sub-Registrar",
    dept_b_val: "Private",
    status: "UNRESOLVED",
    detected: "11 Sep 2026, 10:10",
  },
  {
    id: 9,
    ulpin: "RJ-909-6654",
    state: "Rajasthan",
    type: "Area Variance",
    severity: "HIGH",
    dept_a: "Apna Khata",
    dept_a_val: "10.00 bigha",
    dept_b: "Sub-Registrar",
    dept_b_val: "11.50 bigha",
    status: "UNRESOLVED",
    detected: "10 Sep 2026, 13:55",
  },
  {
    id: 10,
    ulpin: "MP-111-7765",
    state: "Madhya Pradesh",
    type: "Ownership Mismatch",
    severity: "MEDIUM",
    dept_a: "Revenue",
    dept_a_val: "Joint Family",
    dept_b: "Sub-Registrar",
    dept_b_val: "Single Owner",
    status: "INVESTIGATING",
    detected: "09 Sep 2026, 15:40",
  },
  {
    id: 11,
    ulpin: "AS-222-8876",
    state: "Assam",
    type: "Status Mismatch",
    severity: "LOW",
    dept_a: "Dharitree",
    dept_a_val: "Tea Estate",
    dept_b: "Sub-Registrar",
    dept_b_val: "Agricultural",
    status: "UNRESOLVED",
    detected: "08 Sep 2026, 09:25",
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
  UNRESOLVED: "text-rose-600",
  "UNDER REVIEW": "text-amber-600",
  "AI FLAGGED": "text-indigo-600",
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
    <div className="flex h-full flex-col overflow-hidden p-6 bg-white font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ULPIN…"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-sm"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-zinc-400" />
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
                activeFilter === f
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-50 border-b border-zinc-200">
            <tr>
              {["ULPIN", "State", "Type", "Severity", "Variance", "Status", "Detected", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b border-zinc-200 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="transition-colors hover:bg-zinc-50"
              >
                {/* ULPIN */}
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-zinc-900">
                  {c.ulpin}
                </td>

                {/* State */}
                <td className="px-5 py-3.5 text-xs text-zinc-600">{c.state}</td>

                {/* Type */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-800">
                    <AlertTriangle size={13} className="text-zinc-400" />
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
                    <span className="text-zinc-500">{c.dept_a_val}</span>
                    <ArrowRight size={12} className="flex-shrink-0 text-zinc-400" />
                    <span className="font-semibold text-zinc-900">{c.dept_b_val}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-400 font-body">
                    {c.dept_a} → {c.dept_b}
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-semibold ${STATUS_STYLES[c.status] ?? "text-zinc-500"}`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Detected */}
                <td className="px-5 py-3.5 text-xs text-zinc-500 font-mono">{c.detected}</td>

                {/* Action */}
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-100 hover:text-zinc-900 shadow-sm"
                  >
                    <Eye size={13} />
                    Review
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-zinc-500 font-body">
                  No conflicts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-body">
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
