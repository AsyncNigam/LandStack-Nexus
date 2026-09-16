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
    iconBg: "bg-emerald-50",
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
    iconColor: "text-[#7A3E14]",
    iconBg: "bg-[#7A3E14]/10",
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
    iconColor: "text-[#B91C1C]",
    iconBg: "bg-[#B91C1C]/10",
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
    iconBg: "bg-blue-50",
  },
  ...Array.from({ length: 40 }).map((_, i) => {
    const roles = ["Revenue Officer", "System Admin", "AI Engine", "Sub-Registrar"];
    const actions = ["Record Updated", "Discrepancy Flagged", "Map Polygon Edited", "Title Transferred", "Tax Arrears Cleared"];
    const ulpins = ["TN", "MH", "KA", "GJ", "UP", "MP"];
    return {
      id: 4 + i,
      timestamp: `1${Math.floor(i % 5)} Sep 2026, ${String(10 + (i % 14)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:12 IST`,
      officer_name: `Officer 00${i}`,
      officer_role: roles[i % roles.length],
      action: actions[i % actions.length],
      action_detail: `Bulk operation or field update completed automatically by batch processor #${i}.`,
      ulpin: `${ulpins[i % ulpins.length]}-202-${String(100 + i).padStart(4, '0')}`,
      tx_hash: `0x${Math.floor(Math.random()*16777215).toString(16)}...${Math.floor(Math.random()*16777215).toString(16).slice(0,4)}`,
      icon: FileText,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100"
    };
  })
];

// ─── Component ──────────────────────────────────────────────────────

export default function AuditTab() {
  return (
    <div className="h-full overflow-y-auto p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#7A3E14]">
              Immutable Audit Trail
            </h2>
            <p className="text-xs text-[#A0845C]">
              Append-only PostgreSQL ledger • Every state change is
              cryptographically referenced
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#F4EBD9] px-3 py-1.5 border border-[#E8DCC8] shadow-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-[#A0845C]">
            {MOCK_AUDIT.length} entries
          </span>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <div className="relative ml-6 border-l-2 border-[#E8DCC8] pl-8">
        {MOCK_AUDIT.map((entry, index) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.id}
              className={`relative pb-10 ${index === MOCK_AUDIT.length - 1 ? "pb-0" : ""}`}
            >
              {/* Timeline node */}
              <div
                className={`absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full ${entry.iconBg} ring-4 ring-[#F4EBD9]`}
              >
                <Icon size={16} className={entry.iconColor} />
              </div>

              {/* Timestamp + Officer */}
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#A0845C]">
                  <Clock size={12} />
                  <span className="font-mono">{entry.timestamp}</span>
                </div>
                <div className="h-3 w-px bg-[#E8DCC8]" />
                <div className="flex items-center gap-1.5 text-xs text-[#A0845C]">
                  <User size={12} />
                  <span className="font-semibold text-[#7A3E14]">
                    {entry.officer_name}
                  </span>
                </div>
              </div>

              {/* Action title */}
              <h4 className="mb-1.5 text-sm font-bold text-[#7A3E14]">
                {entry.action}
              </h4>

              {/* Role */}
              <p className="mb-2.5 text-[11px] text-[#A0845C]">
                {entry.officer_role}
              </p>

              {/* Audit payload card */}
              <div className="rounded-xl border border-[#E8DCC8] bg-[#F4EBD9] p-4 shadow-sm">
                <p className="mb-3 text-xs leading-relaxed text-[#A0845C]">
                  {entry.action_detail}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#EDE3D3] pt-3">
                  {/* ULPIN */}
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-[#C4A882]" />
                    <span className="text-[11px] text-[#A0845C]">ULPIN:</span>
                    <span className="font-mono text-xs font-bold text-[#7A3E14]">
                      {entry.ulpin}
                    </span>
                  </div>

                  {/* TX Hash */}
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#C4A882]" />
                    <span className="text-[11px] text-[#A0845C]">
                      TX Hash:
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-600">
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
      <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-[#E8DCC8] bg-[#F4EBD9] px-4 py-3 shadow-sm">
        <ShieldCheck size={14} className="text-emerald-600" />
        <p className="text-xs text-[#A0845C]">
          All entries are append-only and cryptographically referenced.
          Tampering with this ledger triggers an integrity alert to the
          National Informatics Centre (NIC).
        </p>
      </div>
    </div>
  );
}
