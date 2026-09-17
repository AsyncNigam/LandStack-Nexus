import { useState } from "react";
import {
  Database,
  AlertTriangle,
  Satellite,
  Network,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
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

// ─── Mock Data Generators ───────────────────────────────────────────

const generateAreaData = () => [
  { name: "Mon", reconciled: 130000 + Math.random() * 20000 },
  { name: "Tue", reconciled: 140000 + Math.random() * 20000 },
  { name: "Wed", reconciled: 130000 + Math.random() * 20000 },
  { name: "Thu", reconciled: 160000 + Math.random() * 20000 },
  { name: "Fri", reconciled: 150000 + Math.random() * 20000 },
  { name: "Sat", reconciled: 170000 + Math.random() * 20000 },
  { name: "Sun", reconciled: 140000 + Math.random() * 20000 },
];

const generateDonutData = () => {
  const base = [
    { name: "Area Variance", value: 35 + Math.floor(Math.random() * 15) },
    { name: "Ownership Mismatch", value: 20 + Math.floor(Math.random() * 15) },
    { name: "Tax Arrears", value: 10 + Math.floor(Math.random() * 10) },
  ];
  const remainder = 100 - base.reduce((acc, curr) => acc + curr.value, 0);
  base.push({ name: "AI Encroachment", value: remainder });
  return base;
};

const generateBarData = () => [
  { name: "Odisha", integrated: 88 },
  { name: "Maharashtra", integrated: 85 },
  { name: "Karnataka", integrated: 78 },
  { name: "Gujarat", integrated: 75 },
  { name: "Tamil Nadu", integrated: 70 },
  { name: "West Bengal", integrated: 65 },
  { name: "Punjab", integrated: 60 },
  { name: "Rajasthan", integrated: 55 },
  { name: "Madhya Pradesh", integrated: 50 },
  { name: "Uttar Pradesh", integrated: 45 },
  { name: "Assam", integrated: 32 },
];

const DONUT_COLORS = ["#18181b", "#52525b", "#16a34a", "#dc2626"];

// ─── Shared tooltip style ───────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#ffffff",
    borderColor: "#e4e4e7",
    borderRadius: "8px",
    color: "#09090b",
    fontSize: "12px",
    boxShadow: "0 4px 16px -2px rgba(0, 0, 0, 0.08)",
    fontFamily: "var(--font-body)",
  },
  itemStyle: { color: "#52525b" },
  labelStyle: { color: "#09090b", fontWeight: 600 },
};

// ─── Metric Cards ───────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
  trendColor?: string;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendColor = "text-emerald-600",
}: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-display">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 font-display">
            {value}
          </p>
          {trend && (
            <span className={`mt-1.5 flex items-center gap-0.5 text-xs font-medium font-body ${trendColor}`}>
              <ArrowUpRight size={13} />
              {trend}
            </span>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-100 ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function AnalyticsTab() {
  const [areaData, setAreaData] = useState(generateAreaData());
  const [donutData, setDonutData] = useState(generateDonutData());
  const [barData, setBarData] = useState(generateBarData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAreaData(generateAreaData());
      setDonutData(generateDonutData());
      setBarData(generateBarData());
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-50/50 p-8 space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">
            National Land Analytics & Audit Ledger
          </h2>
          <p className="text-xs text-zinc-500 font-body mt-0.5">
            Real-time synchronization metrics across Revenue, Cadastral, and Registry departments
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Syncing..." : "Sync Analytics"}
        </button>
      </div>

      {/* ── Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total ULPINs Indexed"
          value="1,245,892"
          icon={Database}
          iconColor="text-zinc-900"
          iconBg="bg-zinc-100"
          trend="+14.2% this month"
          trendColor="text-emerald-600"
        />
        <MetricCard
          label="Active Discrepancies"
          value="4,302"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          trend="-8% vs last week"
          trendColor="text-emerald-600"
        />
        <MetricCard
          label="AI Sentinel Flags"
          value="112"
          icon={Satellite}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend="+23 flagged today"
          trendColor="text-amber-600"
        />
        <MetricCard
          label="States Onboarded"
          value="5 / 28"
          icon={Network}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend="Phase 1 Rollout"
          trendColor="text-zinc-600"
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Area Chart: Daily Reconciliations (2 cols) ──────── */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 font-display">
                Daily Automated Reconciliations
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500 font-body">
                Last 7 days • Cross-department multi-layer parcel verification
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp size={13} />
              1.10M verified
            </div>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="zincReconGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE.contentStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
                itemStyle={TOOLTIP_STYLE.itemStyle}
                formatter={(value) => [Number(value).toLocaleString(), "Parcels"]}
              />
              <Area
                type="monotone"
                dataKey="reconciled"
                stroke="#18181b"
                strokeWidth={2}
                fill="url(#zincReconGrad)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Donut Chart: Discrepancy Breakdown (1 col) ─────── */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 font-display">
            Discrepancy Breakdown
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500 font-body">
            By conflict category & validation layer
          </p>

          <div className="mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                  stroke="none"
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
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
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
            {donutData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  <span className="text-zinc-600 font-body">{entry.name}</span>
                </div>
                <span className="font-semibold text-zinc-900 font-mono">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bar Chart: State Integration (Full width) ──────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-display">
              State DILRMP 3.0 Integration Status
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 font-body">
              API connectivity & data pipeline synchronization score (%)
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-700 font-body">
            Phase 1 Rollout
          </span>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
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
              fill="#18181b"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
