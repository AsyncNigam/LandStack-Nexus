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
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
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
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15",
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
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
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
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/15",
  },
];

// ─── Component ──────────────────────────────────────────────────────

export default function AuditTab() {
  return (
    <div className="h-full overflow-y-auto p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <ShieldCheck size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Immutable Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Append-only PostgreSQL ledger • Every state change is
              cryptographically referenced
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-400">
            {MOCK_AUDIT.length} entries
          </span>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <div className="relative ml-6 border-l-2 border-slate-800 pl-8">
        {MOCK_AUDIT.map((entry, index) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.id}
              className={`relative pb-10 ${index === MOCK_AUDIT.length - 1 ? "pb-0" : ""}`}
            >
              {/* Timeline node */}
              <div
                className={`absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full ${entry.iconBg} ring-4 ring-slate-950`}
              >
                <Icon size={16} className={entry.iconColor} />
              </div>

              {/* Timestamp + Officer */}
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} />
                  <span className="font-mono">{entry.timestamp}</span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User size={12} />
                  <span className="font-semibold text-slate-300">
                    {entry.officer_name}
                  </span>
                </div>
              </div>

              {/* Action title */}
              <h4 className="mb-1.5 text-sm font-bold text-white">
                {entry.action}
              </h4>

              {/* Role */}
              <p className="mb-2.5 text-[11px] text-slate-500">
                {entry.officer_role}
              </p>

              {/* Audit payload card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-md">
                <p className="mb-3 text-xs leading-relaxed text-slate-400">
                  {entry.action_detail}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-3">
                  {/* ULPIN */}
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-600" />
                    <span className="text-[11px] text-slate-500">ULPIN:</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {entry.ulpin}
                    </span>
                  </div>

                  {/* TX Hash */}
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-slate-600" />
                    <span className="text-[11px] text-slate-500">
                      TX Hash:
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-500">
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
      <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
        <ShieldCheck size={14} className="text-emerald-500" />
        <p className="text-xs text-slate-500">
          All entries are append-only and cryptographically referenced.
          Tampering with this ledger triggers an integrity alert to the
          National Informatics Centre (NIC).
        </p>
      </div>
    </div>
  );
}
