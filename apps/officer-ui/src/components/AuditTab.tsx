import {
  ShieldCheck,
  User,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Cpu,
  ArrowDownRight,
} from "lucide-react";

// ─── Mock Data ──────────────────────────────────────────────────────

interface AuditEntry {
  id: number;
  timestamp: string;
  officer_name: string;
  officer_role: string;
  action: string;
  action_detail: string;
  ulpin: string;
  tx_hash: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: 1,
    timestamp: "15 Sep 2026, 14:48:32 IST",
    officer_name: "Inspector R. Sharma",
    officer_role: "DILRMP Division — Revenue",
    action: "Manual Resolution Override",
    action_detail:
      "Area variance between Revenue (1.20 ac) and Registry (1.50 ac) resolved after physical field survey confirmed 1.22 acres. Revenue record updated.",
    ulpin: "TN-202-0001",
    tx_hash: "0x8f4a7c2e1b93d0f5a6e8...2c9b",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border border-emerald-200",
  },
  {
    id: 2,
    timestamp: "15 Sep 2026, 11:22:08 IST",
    officer_name: "AI Sentinel Engine v3.2",
    officer_role: "Automated Detection Pipeline",
    action: "AI Encroachment Flag Generated",
    action_detail:
      "Sentinel-2 NDVI differencing detected 72.4% vegetation loss on agricultural zoning parcel. Built-up structure expansion of +1,420 sqm identified. Confidence: 91.4%.",
    ulpin: "TN-202-0087",
    tx_hash: "0x3d91b4f8e72c0a16d5b7...a4e1",
    icon: Cpu,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border border-amber-200",
  },
  {
    id: 3,
    timestamp: "14 Sep 2026, 16:05:19 IST",
    officer_name: "Deputy Collector M. Patel",
    officer_role: "DILRMP Division — Consolidation",
    action: "Ownership Conflict Escalated",
    action_detail:
      "Ownership mismatch between Revenue (Gurpreet Singh) and Sub-Registrar (Harpreet Kaur) escalated to District Magistrate for adjudication under Section 34 of Registration Act.",
    ulpin: "PB-303-0001",
    tx_hash: "0xb2e6d8f41a573c90e4f2...7d3a",
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-50 border border-red-200",
  },
  {
    id: 4,
    timestamp: "13 Sep 2026, 09:30:00 IST",
    officer_name: "System — Batch Processor",
    officer_role: "Automated Ingestion Pipeline",
    action: "Bulk Data Ingestion Complete",
    action_detail:
      "Batch ingestion of 14,892 records from Odisha Revenue Department API completed. 3 new conflicts detected. Conflict Engine executed in 2.4s.",
    ulpin: "SYSTEM",
    tx_hash: "0x1f7c3a4b8d920e56f3a1...c8b2",
    icon: ArrowDownRight,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border border-blue-200",
  },
  ...Array.from({ length: 25 }).map((_, i) => {
    const roles = ["Revenue Officer", "System Admin", "AI Engine", "Sub-Registrar"];
    const actions = ["Record Updated", "Discrepancy Flagged", "Map Polygon Edited", "Title Transferred", "Tax Arrears Cleared"];
    const ulpins = ["OD", "TN", "MH", "KA", "GJ", "UP", "MP"];
    return {
      id: 5 + i,
      timestamp: `1${Math.floor(i % 5)} Sep 2026, ${String(10 + (i % 14)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:12 IST`,
      officer_name: `Revenue Inspector 0${i + 1}`,
      officer_role: roles[i % roles.length],
      action: actions[i % actions.length],
      action_detail: `Bulk verification entry committed automatically to immutable audit ledger by batch worker node #${i + 1}.`,
      ulpin: `${ulpins[i % ulpins.length]}-202-${String(100 + i).padStart(4, "0")}`,
      tx_hash: `0x${Math.floor(Math.random() * 16777215).toString(16)}...${Math.floor(Math.random() * 16777215).toString(16).slice(0, 4)}`,
      icon: FileText,
      iconColor: "text-zinc-600",
      iconBg: "bg-zinc-100 border border-zinc-200",
    };
  }),
];

// ─── Component ──────────────────────────────────────────────────────

export default function AuditTab() {
  return (
    <div className="h-full overflow-y-auto bg-zinc-50/50 p-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm">
            <ShieldCheck size={20} className="text-zinc-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">
              Immutable Audit Trail
            </h2>
            <p className="text-xs text-zinc-500 font-body mt-0.5">
              Append-only PostgreSQL ledger • Every state change is cryptographically sealed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 border border-zinc-200 shadow-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-zinc-700 font-mono">
            {MOCK_AUDIT.length} ENTRIES
          </span>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <div className="relative ml-5 border-l-2 border-zinc-200 pl-8 space-y-8">
        {MOCK_AUDIT.map((entry) => {
          const Icon = entry.icon;
          return (
            <div key={entry.id} className="relative group">
              {/* Timeline node */}
              <div
                className={`absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full ${entry.iconBg} ring-4 ring-zinc-50 shadow-sm transition-transform duration-150 group-hover:scale-105`}
              >
                <Icon size={15} className={entry.iconColor} />
              </div>

              {/* Timestamp + Officer */}
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <Clock size={12} />
                  <span>{entry.timestamp}</span>
                </div>
                <div className="h-3 w-px bg-zinc-200" />
                <div className="flex items-center gap-1.5 text-xs">
                  <User size={12} className="text-zinc-400" />
                  <span className="font-semibold text-zinc-900 font-body">
                    {entry.officer_name}
                  </span>
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 font-body">
                  {entry.officer_role}
                </span>
              </div>

              {/* Action title */}
              <h4 className="mb-1 text-sm font-bold text-zinc-900 font-display">
                {entry.action}
              </h4>

              {/* Audit payload card */}
              <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-zinc-300">
                <p className="mb-3 text-xs leading-relaxed text-zinc-600 font-body">
                  {entry.action_detail}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-100 pt-3">
                  {/* ULPIN */}
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-zinc-400" />
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-body">ULPIN:</span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-900">
                      {entry.ulpin}
                    </span>
                  </div>

                  {/* TX Hash */}
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={13} className="text-zinc-400" />
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-body">
                      Cryptographic TX:
                    </span>
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-700">
                      {entry.tx_hash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 shadow-sm">
        <ShieldCheck size={16} className="text-zinc-900" />
        <p className="text-xs text-zinc-600 font-body">
          All records are cryptographically verified and permanently locked in the append-only ledger according to Section 34 of the Land Records Modernization Act.
        </p>
      </div>
    </div>
  );
}
