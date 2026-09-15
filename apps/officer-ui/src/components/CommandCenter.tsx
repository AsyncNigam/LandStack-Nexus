import { useState } from "react";
import {
  Map,
  BarChart2,
  AlertTriangle,
  Satellite,
  Activity,
  Network,
  Bell,
  User,
  Shield,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import MapViewer from "./MapViewer";
import AnalyticsTab from "./AnalyticsTab";
import AIDetectionTab from "./AIDetectionTab";
import QueueTab from "./QueueTab";
import AuditTab from "./AuditTab";

// ─── Tab definitions ────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "map", label: "GIS Command Map", icon: Map },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "queue", label: "Discrepancy Queue", icon: AlertTriangle, badge: 3 },
  { id: "ai", label: "AI Detection", icon: Satellite },
  { id: "audit", label: "Audit Trail", icon: Activity },
  { id: "integration", label: "State Integration", icon: Network },
];

const TAB_TITLES: Record<string, string> = {
  map: "GIS Command Map",
  analytics: "Analytics Dashboard",
  queue: "Discrepancy Queue",
  ai: "AI-Assisted Change Detection",
  audit: "Immutable Audit Trail",
  integration: "State API Integration Hub",
};

// ─── Component ──────────────────────────────────────────────────────

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="flex h-screen w-screen bg-[#F1F5E9] text-[#334155] overflow-hidden font-sans">
      {/* ═══ LEFT SIDEBAR ═══════════════════════════════════════════ */}
      <aside className="flex w-64 flex-col border-r border-[#C8A96E]/30 bg-[#D97706]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/20 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              LandStack Nexus
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/60">
              Command Center
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Operations
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-md" />
                )}

                <item.icon
                  className={clsx(
                    "h-4.5 w-4.5 flex-shrink-0",
                    isActive ? "text-white" : "text-white/50 group-hover:text-white/80",
                  )}
                  size={18}
                />
                <span className="flex-1 text-left">{item.label}</span>

                {/* Badge */}
                {item.badge && (
                  <span
                    className={clsx(
                      "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-[#B91C1C]/80 text-white",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="border-t border-white/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-300 shadow-sm" />
            <span className="text-[11px] font-medium text-white/70">
              System Operational
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-white/50">
            <span>PostGIS ●</span>
            <span>3 Parcels ●</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN AREA ══════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top Header Bar ─────────────────────────────────────── */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          {/* Left: Tab title + breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-400">Operations</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-semibold text-[#334155]">
              {TAB_TITLES[activeTab] ?? activeTab}
            </span>
          </div>

          {/* Right: Officer profile + notifications */}
          <div className="flex items-center gap-4">
            {/* Live clock */}
            <LiveClock />

            {/* Notification bell */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#D97706]"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#B91C1C] ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200" />

            {/* Officer profile */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D97706]/10 ring-2 ring-[#D97706]/30">
                <User size={16} className="text-[#D97706]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#334155]">
                  Inspector R. Sharma
                </p>
                <p className="text-[10px] text-slate-400">DILRMP Division</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────── */}
        <main className="relative flex-1 overflow-hidden">
          {activeTab === "map" && <MapViewer />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "ai" && <AIDetectionTab />}
          {activeTab === "queue" && <QueueTab />}
          {activeTab === "audit" && <AuditTab />}

          {activeTab !== "map" && activeTab !== "analytics" && activeTab !== "ai" && activeTab !== "queue" && activeTab !== "audit" && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
                {(() => {
                  const item = NAV_ITEMS.find((n) => n.id === activeTab);
                  if (!item) return null;
                  const Icon = item.icon;
                  return <Icon size={28} className="text-slate-400" />;
                })()}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-500">
                  {TAB_TITLES[activeTab]}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Module loading — available in next deployment
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Live Clock Sub-component ───────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date());

  // Update every minute
  useState(() => {
    const interval = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(interval);
  });

  return (
    <div className="hidden items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-500 sm:flex">
      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      {time.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
      <span className="text-slate-400">IST</span>
    </div>
  );
}
