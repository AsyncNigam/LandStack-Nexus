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
  Layers,
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
  ...["Andhra Pradesh", "Bihar", "Chhattisgarh", "Goa", "Haryana", "Himachal Pradesh", "Jharkhand", "Kerala", "Telangana", "Uttarakhand", "Tripura", "Manipur", "Meghalaya"].map((name, i) => ({
    id: name.slice(0, 2).toUpperCase(),
    name,
    status: (i % 5 === 0) ? "degraded" : "online",
    latency: `${20 + Math.floor(Math.random() * 60)}ms`,
    records: `${(1 + Math.random() * 4).toFixed(1)}M`,
    lastSync: `${Math.floor(Math.random() * 59)} mins ago`,
    uptime: `${(98 + Math.random() * 1.9).toFixed(1)}%`,
    conflicts: 500 + Math.floor(Math.random() * 2000),
    apiVersion: "v3.2",
    dept: "Revenue Department",
    pipeline: i % 2 === 0 ? "CDC + Kafka" : "REST Poll",
    throughput: `${1000 + Math.floor(Math.random() * 5000)}/hr`
  }))
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

interface StateIntegrationTabProps {
  onLaunchCadastral?: () => void;
}

export default function StateIntegrationTab({ onLaunchCadastral }: StateIntegrationTabProps = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<typeof STATE_NODES[0] | null>(null);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const onlineCount = STATE_NODES.filter((n) => n.status === "online").length;
  const degradedCount = STATE_NODES.filter((n) => n.status === "degraded").length;
  const offlineCount = STATE_NODES.filter((n) => n.status === "offline").length;

  return (
    <div className="h-full overflow-y-auto bg-zinc-50/50 p-8 space-y-6">
      {/* ═══ Header ═════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">
            DILRMP 3.0 State Integration Hub
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 font-body">
            Real-time API connectivity, data pipeline status, and conflict monitoring across {STATE_NODES.length} state land record databases
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing Pipelines..." : "Sync All Nodes"}
        </button>
      </div>

      {/* ═══ Top Metrics Strip ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {PIPELINE_METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={14} className="text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-display">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-zinc-900 font-display">{m.value}</div>
            <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium font-body ${m.trendUp ? "text-emerald-600" : "text-amber-600"}`}>
              {m.trendUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Left Column: Connectivity & Logs ═══════════════════════ */}
        <div className="col-span-1 space-y-6">
          {/* Integration Progress */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold text-zinc-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Network size={14} className="text-zinc-600" /> Integration Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-body">
                  <span className="text-zinc-500">National Target (28 States)</span>
                  <span className="font-bold text-zinc-900">{Math.round((STATE_NODES.length / 28) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-zinc-900"
                    style={{ width: `${Math.round((STATE_NODES.length / 28) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-200 text-center">
                  <div className="text-2xl font-bold text-emerald-700 font-display">{onlineCount}</div>
                  <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider font-body">Online</div>
                </div>
                <div className="rounded-lg bg-amber-50/70 p-3 border border-amber-200 text-center">
                  <div className="text-2xl font-bold text-amber-700 font-display">{degradedCount}</div>
                  <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider font-body">Degraded</div>
                </div>
                <div className="rounded-lg bg-red-50/70 p-3 border border-red-200 text-center">
                  <div className="text-2xl font-bold text-red-700 font-display">{offlineCount}</div>
                  <div className="text-[10px] text-red-800 font-semibold uppercase tracking-wider font-body">Offline</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Logs */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold text-zinc-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Server size={14} className="text-zinc-600" /> Live Sync Feed
            </h3>
            <div className="space-y-2.5 text-xs font-mono max-h-[340px] overflow-y-auto pr-1">
              {SYNC_LOGS.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${
                    log.type === "success"
                      ? "text-emerald-700"
                      : log.type === "error"
                      ? "text-red-700"
                      : log.type === "warning"
                      ? "text-amber-700"
                      : "text-zinc-600"
                  }`}
                >
                  <span className="text-zinc-400 flex-shrink-0 font-mono">[{log.time}]</span>
                  <span className="font-semibold text-zinc-800 flex-shrink-0">{log.node}:</span>
                  <span className="break-words font-body text-zinc-600">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node Detail Panel */}
          {selectedNode && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-zinc-900/5">
              <h3 className="mb-3 text-xs font-bold text-zinc-900 uppercase tracking-wider font-display flex items-center gap-2">
                <GitMerge size={14} className="text-zinc-600" /> {selectedNode.name} — Details
              </h3>
              <div className="space-y-2 text-xs divide-y divide-zinc-100">
                <DetailRow label="State Department" value={selectedNode.dept} />
                <DetailRow label="API Version" value={selectedNode.apiVersion} />
                <DetailRow label="Pipeline Type" value={selectedNode.pipeline} />
                <DetailRow label="Throughput" value={selectedNode.throughput} />
                <DetailRow label="Uptime (30d)" value={selectedNode.uptime} />
                <DetailRow label="Active Conflicts" value={selectedNode.conflicts.toLocaleString()} />
                <DetailRow label="Total Records" value={selectedNode.records} />
              </div>

              {selectedNode.id === "OD" && onLaunchCadastral && (
                <button
                  onClick={onLaunchCadastral}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800"
                >
                  <Layers size={14} />
                  Launch Bhunaksha Cadastral Explorer
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ═══ Right Column: Full Node Table ═══════════════════════════ */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 font-display">
                <tr>
                  <th className="px-4 py-3 font-semibold">State Node</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Latency</th>
                  <th className="px-4 py-3 font-semibold">Records</th>
                  <th className="px-4 py-3 font-semibold">Pipeline</th>
                  <th className="px-4 py-3 font-semibold">Uptime</th>
                  <th className="px-4 py-3 font-semibold">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-body">
                {STATE_NODES.map((node) => (
                  <tr
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`transition-colors cursor-pointer ${
                      selectedNode?.id === node.id ? "bg-zinc-100/70" : "hover:bg-zinc-50"
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 font-bold text-xs text-zinc-900 font-mono">
                          {node.id}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900">{node.name}</span>
                          <div className="text-[10px] text-zinc-400">{node.dept.slice(0, 24)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {node.status === "online" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Online
                        </span>
                      )}
                      {node.status === "degraded" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                          <Clock size={11} /> Degraded
                        </span>
                      )}
                      {node.status === "offline" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
                          <XCircle size={11} /> Offline
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-500">{node.latency}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Database size={12} className="text-zinc-400" />
                        <span className="font-semibold text-zinc-800 font-mono">{node.records}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          node.pipeline.includes("CDC")
                            ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                            : node.pipeline.includes("REST")
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {node.pipeline}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: node.uptime }} />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{node.uptime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[10px] text-zinc-400 font-mono">{node.lastSync}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ═══ Data Source Registry ═══════════════════════════════════ */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold text-zinc-900 uppercase tracking-wider font-display flex items-center gap-2">
              <FileText size={14} className="text-zinc-600" /> State Portal Registry
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
                <div key={src.state} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-zinc-200">
                    <Database size={12} className="text-zinc-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-zinc-900">{src.state} — {src.portal}</div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate">{src.url} • {src.type}</div>
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
    <div className="flex items-center justify-between pt-2">
      <span className="text-xs text-zinc-500 font-body">{label}</span>
      <span className="font-mono text-xs font-semibold text-zinc-900">{value}</span>
    </div>
  );
}
