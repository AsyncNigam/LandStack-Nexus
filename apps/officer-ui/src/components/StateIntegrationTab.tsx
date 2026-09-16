import {
  Network,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  AlertTriangle,
  Zap,
  FileText,
  GitMerge,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

// ─── 10-State Node Data ──────────────────────────────────────────────

const STATE_NODES = [
  { id: "OD", name: "Odisha", status: "online", latency: "24ms", records: "1.2M", lastSync: "2 mins ago", uptime: "99.8%", conflicts: 1420, apiVersion: "v3.2", dept: "Revenue & Disaster Management", pipeline: "CDC + Kafka", throughput: "4,200/hr" },
  { id: "TN", name: "Tamil Nadu", status: "online", latency: "35ms", records: "2.4M", lastSync: "5 mins ago", uptime: "99.5%", conflicts: 2100, apiVersion: "v3.1", dept: "Registration & Stamps", pipeline: "REST Poll", throughput: "3,800/hr" },
  { id: "PB", name: "Punjab", status: "degraded", latency: "450ms", records: "620K", lastSync: "1 hr ago", uptime: "87.2%", conflicts: 980, apiVersion: "v2.8", dept: "Revenue, Rehabilitation & DM", pipeline: "SFTP Batch", throughput: "1,200/hr" },
  { id: "GJ", name: "Gujarat", status: "online", latency: "42ms", records: "1.8M", lastSync: "12 mins ago", uptime: "99.1%", conflicts: 1780, apiVersion: "v3.2", dept: "Revenue Department", pipeline: "CDC + Kafka", throughput: "5,100/hr" },
  { id: "AS", name: "Assam", status: "offline", latency: "--", records: "180K", lastSync: "2 days ago", uptime: "62.5%", conflicts: 1100, apiVersion: "v2.5", dept: "Revenue & Disaster Mgmt", pipeline: "Manual Upload", throughput: "0/hr" },
  { id: "MH", name: "Maharashtra", status: "online", latency: "28ms", records: "3.1M", lastSync: "8 mins ago", uptime: "99.7%", conflicts: 1920, apiVersion: "v3.2", dept: "Revenue & Forest Dept", pipeline: "CDC + Kafka", throughput: "6,400/hr" },
  { id: "KA", name: "Karnataka", status: "online", latency: "31ms", records: "2.8M", lastSync: "3 mins ago", uptime: "99.6%", conflicts: 2340, apiVersion: "v3.1", dept: "Bhoomi (Revenue)", pipeline: "CDC + Kafka", throughput: "5,800/hr" },
  { id: "RJ", name: "Rajasthan", status: "online", latency: "55ms", records: "1.5M", lastSync: "15 mins ago", uptime: "98.2%", conflicts: 1680, apiVersion: "v3.0", dept: "Board of Revenue", pipeline: "REST Poll", throughput: "2,900/hr" },
  { id: "UP", name: "Uttar Pradesh", status: "degraded", latency: "380ms", records: "4.2M", lastSync: "45 mins ago", uptime: "91.4%", conflicts: 2010, apiVersion: "v2.9", dept: "Board of Revenue (Bhulekh)", pipeline: "SFTP Batch", throughput: "1,800/hr" },
  { id: "MP", name: "Madhya Pradesh", status: "online", latency: "48ms", records: "1.3M", lastSync: "20 mins ago", uptime: "97.8%", conflicts: 1150, apiVersion: "v3.0", dept: "Revenue Department", pipeline: "REST Poll", throughput: "2,600/hr" },
  { id: "WB", name: "West Bengal", status: "online", latency: "38ms", records: "2.1M", lastSync: "10 mins ago", uptime: "98.9%", conflicts: 1870, apiVersion: "v3.1", dept: "Land & Land Reform", pipeline: "CDC + Kafka", throughput: "4,500/hr" },
];

// ─── Sync Log Data ───────────────────────────────────────────────────

const SYNC_LOGS = [
  { time: "10:58", node: "KA_NODE", msg: "Bhoomi CDC stream: 8,200 mutations ingested.", type: "success" },
  { time: "10:55", node: "MH_NODE", msg: "iSarita sync complete: 6,400 new records.", type: "success" },
  { time: "10:52", node: "OD_NODE", msg: "Bhulekh pipeline ingested 4,200 mutations.", type: "success" },
  { time: "10:48", node: "WB_NODE", msg: "Banglarbhumi API handshake (38ms).", type: "success" },
  { time: "10:41", node: "TN_NODE", msg: "TNSRO registry pull — 3,800 deeds synced.", type: "success" },
  { time: "10:38", node: "GJ_NODE", msg: "AnyRoR connector: 5,100/hr throughput.", type: "success" },
  { time: "10:35", node: "RJ_NODE", msg: "Apna Khata batch poll completed.", type: "info" },
  { time: "10:30", node: "MP_NODE", msg: "Bhu-Abhilekh REST endpoint synced.", type: "info" },
  { time: "10:25", node: "UP_NODE", msg: "Bhulekh SFTP transfer delayed. Latency: 380ms.", type: "warning" },
  { time: "10:15", node: "AS_NODE", msg: "Dharitree API timeout. Retry 3/5 failed.", type: "error" },
  { time: "10:02", node: "PB_NODE", msg: "PLRS batch upload partial: 62% complete.", type: "warning" },
  { time: "09:59", node: "SYS", msg: "Global index compactor finished — 22.1M records indexed.", type: "info" },
  { time: "09:45", node: "SYS", msg: "Conflict detector: 127 new mismatches flagged.", type: "warning" },
  { time: "09:30", node: "SYS", msg: "Daily backup completed: 48.2 GB snapshot.", type: "info" },
];

// ─── Pipeline Stats ─────────────────────────────────────────────────

const PIPELINE_METRICS = [
  { label: "Total Records Synced", value: "22.1M", icon: Database, trend: "+1.2M this week", trendUp: true },
  { label: "Active Pipelines", value: "9/11", icon: Zap, trend: "2 degraded", trendUp: false },
  { label: "Avg Latency", value: "113ms", icon: Activity, trend: "↓ 22ms vs yesterday", trendUp: true },
  { label: "Conflicts Detected", value: "18,350", icon: AlertTriangle, trend: "+127 today", trendUp: false },
  { label: "API Uptime (30d)", value: "96.4%", icon: Shield, trend: "SLA: 99.5%", trendUp: false },
  { label: "Daily Throughput", value: "38,500/hr", icon: BarChart3, trend: "+12% vs avg", trendUp: true },
];

// ─── Component ──────────────────────────────────────────────────────

export default function StateIntegrationTab() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<typeof STATE_NODES[0] | null>(null);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const onlineCount = STATE_NODES.filter(n => n.status === "online").length;
  const degradedCount = STATE_NODES.filter(n => n.status === "degraded").length;
  const offlineCount = STATE_NODES.filter(n => n.status === "offline").length;

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F4EBD9]">
      {/* ═══ Header ═════════════════════════════════════════════════ */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#7A3E14]">DILRMP 3.0 State Integration Hub</h2>
          <p className="mt-1 text-sm text-[#A0845C]">Real-time API connectivity, data pipeline status, and conflict monitoring across {STATE_NODES.length} state land record databases.</p>
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg bg-[#7A3E14] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5a2e0e] disabled:opacity-70"
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing Pipelines..." : "Sync All Nodes"}
        </button>
      </div>

      {/* ═══ Top Metrics Strip ══════════════════════════════════════ */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {PIPELINE_METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E8DCC8] bg-white/50 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={14} className="text-[#7A3E14]" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[#A0845C]">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-[#7A3E14]">{m.value}</div>
            <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${m.trendUp ? "text-emerald-600" : "text-[#B91C1C]"}`}>
              {m.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ═══ Left Column: Connectivity & Logs ═══════════════════════ */}
        <div className="col-span-1 space-y-6">

          {/* Integration Progress */}
          <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-5 shadow-sm backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#7A3E14] uppercase tracking-widest flex items-center gap-2">
              <Network size={16} /> Integration Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A0845C]">Phase 1 Target (28 States)</span>
                  <span className="font-bold text-[#7A3E14]">{Math.round(STATE_NODES.length / 28 * 100)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#EDE3D3]">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-[#C86B28] to-[#15803D]" style={{ width: `${Math.round(STATE_NODES.length / 28 * 100)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg bg-[#FFF8EE] p-3 border border-emerald-200 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{onlineCount}</div>
                  <div className="text-[10px] text-[#A0845C] font-medium">Online</div>
                </div>
                <div className="rounded-lg bg-[#FFF8EE] p-3 border border-amber-200 text-center">
                  <div className="text-2xl font-bold text-amber-600">{degradedCount}</div>
                  <div className="text-[10px] text-[#A0845C] font-medium">Degraded</div>
                </div>
                <div className="rounded-lg bg-[#FFF8EE] p-3 border border-rose-200 text-center">
                  <div className="text-2xl font-bold text-[#B91C1C]">{offlineCount}</div>
                  <div className="text-[10px] text-[#A0845C] font-medium">Offline</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Logs */}
          <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-5 shadow-sm backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#7A3E14] uppercase tracking-widest flex items-center gap-2">
              <Server size={16} /> Live Sync Feed
            </h3>
            <div className="space-y-2.5 text-xs font-mono max-h-[360px] overflow-y-auto pr-1">
              {SYNC_LOGS.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 ${
                  log.type === "success" ? "text-emerald-700" : log.type === "error" ? "text-[#B91C1C]" : log.type === "warning" ? "text-amber-700" : "text-[#A0845C]"
                }`}>
                  <span className="text-[#A0845C] flex-shrink-0">[{log.time}]</span>
                  <span className="font-semibold flex-shrink-0">{log.node}:</span>
                  <span className="break-words">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node Detail Panel */}
          {selectedNode && (
            <div className="rounded-xl border border-[#C86B28]/30 bg-[#FFF8EE] p-5 shadow-md">
              <h3 className="mb-3 text-sm font-semibold text-[#7A3E14] uppercase tracking-widest flex items-center gap-2">
                <GitMerge size={16} /> {selectedNode.name} — Node Details
              </h3>
              <div className="space-y-2 text-sm">
                <DetailRow label="State Department" value={selectedNode.dept} />
                <DetailRow label="API Version" value={selectedNode.apiVersion} />
                <DetailRow label="Pipeline Type" value={selectedNode.pipeline} />
                <DetailRow label="Throughput" value={selectedNode.throughput} />
                <DetailRow label="Uptime (30d)" value={selectedNode.uptime} />
                <DetailRow label="Active Conflicts" value={selectedNode.conflicts.toLocaleString()} />
                <DetailRow label="Total Records" value={selectedNode.records} />
              </div>
            </div>
          )}
        </div>

        {/* ═══ Right Column: Full Node Table ═══════════════════════════ */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-1 shadow-sm backdrop-blur-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF8EE] text-xs uppercase tracking-widest text-[#A0845C]">
                <tr>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">State Node</th>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">Status</th>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">Latency</th>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">Records</th>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">Pipeline</th>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">Uptime</th>
                  <th className="px-4 py-3 font-semibold border-b border-[#E8DCC8]">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]">
                {STATE_NODES.map((node) => (
                  <tr key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`transition-colors cursor-pointer ${selectedNode?.id === node.id ? "bg-[#C86B28]/10" : "hover:bg-[#FFF8EE]"}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7A3E14]/10 font-bold text-xs text-[#7A3E14]">
                          {node.id}
                        </div>
                        <div>
                          <span className="font-semibold text-[#7A3E14]">{node.name}</span>
                          <div className="text-[10px] text-[#A0845C]">{node.dept.slice(0, 25)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {node.status === 'online' && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200"><CheckCircle2 size={12} /> Online</span>}
                      {node.status === 'degraded' && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 border border-amber-200"><Clock size={12} /> Degraded</span>}
                      {node.status === 'offline' && <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 border border-rose-200"><XCircle size={12} /> Offline</span>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#A0845C]">{node.latency}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Database size={12} className="text-[#A0845C]" />
                        <span className="font-semibold text-[#7A3E14]">{node.records}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        node.pipeline.includes("CDC") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        node.pipeline.includes("REST") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        node.pipeline.includes("SFTP") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>{node.pipeline}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-[#EDE3D3]">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: node.uptime }} />
                        </div>
                        <span className="font-mono text-[10px] text-[#A0845C]">{node.uptime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[10px] text-[#A0845C]">{node.lastSync}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ═══ Data Source Registry ═══════════════════════════════════ */}
          <div className="rounded-xl border border-[#E8DCC8] bg-white/50 p-5 shadow-sm backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#7A3E14] uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} /> State Portal Registry
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { state: "Odisha", portal: "Bhulekh", url: "bhulekh.ori.nic.in", type: "ROR" },
                { state: "Tamil Nadu", portal: "TNSRO / Patta Chitta", url: "eservices.tn.gov.in", type: "Registration" },
                { state: "Maharashtra", portal: "iSarita / Mahabhulekh", url: "igrmaharashtra.gov.in", type: "ROR + Reg" },
                { state: "Karnataka", portal: "Bhoomi", url: "landrecords.karnataka.gov.in", type: "ROR" },
                { state: "Uttar Pradesh", portal: "Bhulekh UP", url: "upbhulekh.gov.in", type: "ROR" },
                { state: "West Bengal", portal: "Banglarbhumi", url: "banglarbhumi.gov.in", type: "ROR + Map" },
                { state: "Gujarat", portal: "AnyRoR", url: "anyror.gujarat.gov.in", type: "ROR" },
                { state: "Rajasthan", portal: "Apna Khata", url: "apnakhata.raj.nic.in", type: "ROR" },
                { state: "Punjab", portal: "PLRS (Fard)", url: "plrs.org.in", type: "ROR" },
                { state: "Madhya Pradesh", portal: "Bhu-Abhilekh", url: "mpbhulekh.gov.in", type: "ROR" },
              ].map((src) => (
                <div key={src.state} className="flex items-center gap-3 rounded-lg border border-[#E8DCC8] bg-[#FFF8EE] px-4 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#7A3E14]/10">
                    <Database size={12} className="text-[#7A3E14]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#7A3E14]">{src.state} — {src.portal}</div>
                    <div className="text-[10px] text-[#A0845C] truncate">{src.url} • {src.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#A0845C]">{label}</span>
      <span className="font-mono text-xs font-semibold text-[#7A3E14]">{value}</span>
    </div>
  );
}
