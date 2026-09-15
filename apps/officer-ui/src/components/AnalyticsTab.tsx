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
const DONUT_COLORS = ["#D97706", "#334155", "#16a34a", "#B91C1C"];

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
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: "8px",
    color: "#334155",
    fontSize: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  itemStyle: { color: "#64748b" },
  labelStyle: { color: "#334155", fontWeight: 600 },
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
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#334155]">
            {value}
          </p>
          {trend && (
            <span className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
              <ArrowUpRight size={12} />
              {trend}
            </span>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
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
          iconColor="text-[#D97706]"
          iconBg="bg-[#D97706]/10"
          trend="+14.2% this month"
        />
        <MetricCard
          label="Active Discrepancies"
          value="4,302"
          icon={AlertTriangle}
          iconColor="text-[#B91C1C]"
          iconBg="bg-[#B91C1C]/10"
          trend="-8% vs last week"
          trendColor="text-emerald-600"
        />
        <MetricCard
          label="AI Sentinel Flags"
          value="112"
          icon={Satellite}
          iconColor="text-[#D97706]"
          iconBg="bg-[#D97706]/10"
          trend="+23 new today"
          trendColor="text-amber-600"
        />
        <MetricCard
          label="States Onboarded"
          value="5 / 28"
          icon={Network}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend="Phase 1 target"
          trendColor="text-slate-400"
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* ── Area Chart: Daily Reconciliations (2 cols) ──────── */}
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#334155]">
                Daily Automated Reconciliations
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Last 7 days • Cross-department record matching
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp size={14} />
              1.10M total
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientOchre" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
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
                stroke="#D97706"
                strokeWidth={2.5}
                fill="url(#gradientOchre)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Donut Chart: Discrepancy Breakdown (1 col) ─────── */}
        <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#334155]">
            Discrepancy Breakdown
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
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
                  <span className="text-slate-500">{entry.name}</span>
                </div>
                <span className="font-semibold text-[#334155]">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bar Chart: State Integration (Full width) ──────────── */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#334155]">
              State DILRMP 3.0 Integration Status
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              API connectivity & data pipeline readiness (%)
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Phase 1 Rollout
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
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
              fill="#16a34a"
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
