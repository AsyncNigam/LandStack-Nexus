import {
  Database,
  AlertTriangle,
  Satellite,
  Network,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// ─── Mock Data ──────────────────────────────────────────────────────

const areaData = [
  { name: "Mon", reconciled: 142_800 },
  { name: "Tue", reconciled: 156_320 },
  { name: "Wed", reconciled: 134_500 },
  { name: "Thu", reconciled: 171_200 },
  { name: "Fri", reconciled: 165_800 },
  { name: "Sat", reconciled: 178_400 },
  { name: "Sun", reconciled: 152_900 },
];

const donutData = [
  { name: "Area Variance", value: 45 },
  { name: "Ownership Mismatch", value: 30 },
  { name: "Tax Arrears", value: 15 },
  { name: "AI Encroachment", value: 10 },
];
const DONUT_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981"];

const barData = [
  { name: "Odisha", integrated: 94 },
  { name: "Tamil Nadu", integrated: 88 },
  { name: "Punjab", integrated: 76 },
  { name: "Gujarat", integrated: 62 },
  { name: "Assam", integrated: 41 },
];

// ─── Shared tooltip style ───────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  itemStyle: { color: "#94a3b8" },
  labelStyle: { color: "#e2e8f0", fontWeight: 600 },
};

// ─── Metric Cards ───────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: string;
  trendColor?: string;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  trendColor = "text-emerald-400",
}: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition-all duration-200 hover:border-slate-700 hover:shadow-xl">
      {/* Subtle corner glow */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/5 to-transparent" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
          {trend && (
            <span className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
              <ArrowUpRight size={12} />
              {trend}
            </span>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 ring-1 ring-slate-700/50">
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function AnalyticsTab() {
  return (
    <div className="h-full overflow-y-auto p-6">
      {/* ── Metric Cards ───────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <MetricCard
          label="Total ULPINs Indexed"
          value="1,245,892"
          icon={Database}
          iconColor="text-indigo-400"
          trend="+14.2% this month"
        />
        <MetricCard
          label="Active Discrepancies"
          value="4,302"
          icon={AlertTriangle}
          iconColor="text-rose-400"
          trend="-8% vs last week"
          trendColor="text-emerald-400"
        />
        <MetricCard
          label="AI Sentinel Flags"
          value="112"
          icon={Satellite}
          iconColor="text-indigo-400"
          trend="+23 new today"
          trendColor="text-amber-400"
        />
        <MetricCard
          label="States Onboarded"
          value="5 / 28"
          icon={Network}
          iconColor="text-emerald-400"
          trend="Phase 1 target"
          trendColor="text-slate-400"
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* ── Area Chart: Daily Reconciliations (2 cols) ──────── */}
        <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Daily Automated Reconciliations
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Last 7 days • Cross-department record matching
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <TrendingUp size={14} />
              1.10M total
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE.contentStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
                itemStyle={TOOLTIP_STYLE.itemStyle}
                formatter={(value) => [Number(value).toLocaleString(), "Records"]}
              />
              <Area
                type="monotone"
                dataKey="reconciled"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#gradientIndigo)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Donut Chart: Discrepancy Breakdown (1 col) ─────── */}
        <div className="col-span-1 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white">
            Discrepancy Breakdown
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            By conflict category
          </p>

          <div className="mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1200}
                  animationEasing="ease-out"
                  stroke="none"
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  formatter={(value) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-1 space-y-2">
            {donutData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[i] }}
                  />
                  <span className="text-slate-400">{entry.name}</span>
                </div>
                <span className="font-semibold text-slate-200">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bar Chart: State Integration (Full width) ──────────── */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              State DILRMP 3.0 Integration Status
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              API connectivity & data pipeline readiness (%)
            </p>
          </div>
          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Phase 1 Rollout
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
              itemStyle={TOOLTIP_STYLE.itemStyle}
              formatter={(value) => [`${value}%`, "Integrated"]}
            />
            <Bar
              dataKey="integrated"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
