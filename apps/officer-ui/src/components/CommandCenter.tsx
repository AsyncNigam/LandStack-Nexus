import { useState } from "react";
import {
  Map,
  LandPlot,
  BarChart3,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Database,
  Bell,
  User,
  Shield,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { clsx } from "clsx";
import MapViewer from "./MapViewer";
import AnalyticsTab from "./AnalyticsTab";
import AIDetectionTab from "./AIDetectionTab";
import QueueTab from "./QueueTab";
import AuditTab from "./AuditTab";
import StateIntegrationTab from "./StateIntegrationTab";
import CadastralTab from "./CadastralTab";

// ─── Tab definitions ────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Surveys & Maps",
    items: [
      { id: "map", label: "GIS", icon: Map },
      { id: "cadastral", label: "Cadastral", icon: LandPlot },
    ],
  },
  {
    title: "Reconciliation",
    items: [
      { id: "queue", label: "Discrepancy", icon: AlertTriangle, badge: 3 },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Governance & Audit",
    items: [
      { id: "ai", label: "Detection", icon: Sparkles },
      { id: "audit", label: "Audit", icon: ShieldCheck },
      { id: "integration", label: "Integration", icon: Database },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

const TAB_TITLES: Record<string, string> = {
  map: "GIS Command Map",
  analytics: "Analytics Dashboard",
  queue: "Discrepancy Queue",
  cadastral: "Cadastral Explorer & RoR Reconciler",
  ai: "AI Detection",
  audit: "Immutable Audit Trail",
  integration: "State Integration Hub",
};

// ─── Component ──────────────────────────────────────────────────────

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState("map");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const currentNavItem = ALL_NAV_ITEMS.find((item) => item.id === activeTab);

  return (
    <div className="flex h-screen w-screen bg-[#f4f5f6] text-zinc-900 overflow-hidden font-sans">
      {/* ═══ LEFT SIDEBAR (CLEAN WHITE AESTHETIC WITH LIME-GREEN ACCENT & DARK ICONS) ═══ */}
      <aside
        className={clsx(
          "relative flex flex-col border-r border-zinc-200/90 bg-white text-zinc-800 select-none transition-all duration-200 ease-in-out flex-shrink-0 z-20",
          isCollapsed ? "w-16" : "w-56",
        )}
      >
        {/* Floating Edge Toggle Pill (< >) matching reference image */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95 cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={13} strokeWidth={2.4} /> : <ChevronLeft size={13} strokeWidth={2.4} />}
        </button>

        {/* Brand Header: Lime-Green Rounded Badge + App Title with Chevron */}
        <div className="p-3 pb-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 px-1 py-1 rounded-xl">
              {/* Lime-green app badge */}
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#b8f382] text-zinc-900 shadow-xs">
                <Shield size={18} strokeWidth={2.4} className="text-zinc-900" />
              </div>
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <span className="text-[14px] font-bold text-zinc-900 tracking-tight font-display truncate">
                  LandStack Nexus
                </span>
                <ChevronDown size={14} className="text-zinc-500 flex-shrink-0" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8f382] text-zinc-900 shadow-xs">
                <Shield size={20} strokeWidth={2.4} className="text-zinc-900" />
              </div>
            </div>
          )}
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 py-1">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title || idx}>
              {idx > 0 && <div className="my-2 mx-1 border-t border-zinc-100" />}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      title={item.label}
                      className={clsx(
                        "group relative flex items-center transition-all duration-150 active:scale-[0.98]",
                        isCollapsed
                          ? "h-10 w-10 justify-center mx-auto rounded-xl"
                          : "w-full gap-3 rounded-xl px-3 py-2",
                        isActive
                          ? "bg-[#edf8db] text-zinc-900 font-semibold"
                          : "text-zinc-700 font-medium hover:bg-zinc-100/80 hover:text-zinc-950",
                      )}
                    >
                      {/* Dark Icon */}
                      <item.icon
                        size={isCollapsed ? 18 : 17}
                        strokeWidth={isActive ? 2.4 : 2}
                        className={clsx(
                          "flex-shrink-0 transition-colors",
                          isActive ? "text-zinc-900" : "text-zinc-800 group-hover:text-zinc-950",
                        )}
                      />

                      {/* Label */}
                      {!isCollapsed && (
                        <span
                          className={clsx(
                            "flex-1 text-left tracking-tight truncate text-[13.5px]",
                            isActive ? "text-zinc-900 font-semibold" : "text-zinc-700 group-hover:text-zinc-900",
                          )}
                        >
                          {item.label}
                        </span>
                      )}

                      {/* Badge */}
                      {item.badge && (
                        <span
                          className={clsx(
                            isCollapsed
                              ? "absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold font-mono ring-2 ring-white shadow-xs"
                              : "flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold font-mono shadow-2xs",
                            isActive
                              ? "bg-zinc-900 text-white"
                              : "bg-rose-500 text-white",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on Collapsed Hover matching reference image */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 z-50 hidden group-hover:flex items-center rounded-lg border border-zinc-200/90 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-md whitespace-nowrap pointer-events-none">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Officer Status Footer */}
        <div className="border-t border-zinc-200/80 bg-white p-2 flex justify-center">
          {isCollapsed ? (
            <div
              title="S. Mohapatra (Boudh Tahasildar)"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#b8f382] border border-[#a2e865] text-[11px] font-bold text-zinc-900 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
            >
              SM
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          ) : (
            <div className="flex w-full items-center gap-2.5 rounded-xl bg-zinc-50/90 border border-zinc-200/80 p-2 hover:bg-zinc-100/80 transition-all shadow-2xs cursor-pointer active:scale-[0.98]">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8f382] border border-[#a2e865] text-[11px] font-bold text-zinc-900 shadow-2xs flex-shrink-0">
                SM
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-900 leading-tight">S. Mohapatra</p>
                <p className="truncate text-[10px] text-zinc-500 leading-tight">Boudh Tahasildar</p>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
            </div>
          )}
        </div>
      </aside>

      {/* ═══ MAIN AREA (WHITE DASHBOARD) ════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* ── Top Header Bar with Highlighted Active Page ─────────── */}
        <header className="flex h-10 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3">
          {/* Left: Active page highlight badge with standard green accent */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-zinc-400 text-[11px]">Operations</span>
            <ChevronRight className="h-3 w-3 text-zinc-300" />
            {currentNavItem && (
              <div className="flex items-center gap-1.5 rounded-md bg-[#edf8db] border border-[#d8f0bc] px-2 py-0.5 text-[11.5px] font-semibold text-zinc-900 shadow-2xs">
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded text-zinc-900">
                  <currentNavItem.icon size={12} strokeWidth={2.4} />
                </div>
                <span>{TAB_TITLES[activeTab] ?? activeTab}</span>
              </div>
            )}
          </div>

          {/* Right: Officer profile + notifications */}
          <div className="flex items-center gap-3">
            {/* Live clock */}
            <LiveClock />

            {/* Notification bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Bell size={15} />
                <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden z-50">
                  <div className="bg-zinc-50 px-4 py-2.5 border-b border-zinc-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Alerts</span>
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-zinc-50 transition-colors cursor-pointer">
                      <p className="text-xs font-semibold text-rose-600">AI Sentinel Alert</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">Encroachment detected on TN-202-0001</p>
                      <p className="text-[10px] text-zinc-400 mt-1">2 mins ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-zinc-200" />

            {/* Officer profile */}
            <div className="relative">
              <button 
                className="flex items-center gap-1.5 hover:bg-zinc-100 px-1.5 py-1 rounded transition-colors"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              >
                <div className="h-6 w-6 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px]">
                  RS
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <p className="text-[11px] font-semibold text-zinc-800 leading-none">Inspector R. Sharma</p>
                  <p className="text-[9px] text-zinc-400 leading-none mt-0.5">DILRMP Division</p>
                </div>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden z-50 p-1 space-y-0.5">
                  <button className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition-colors">Profile Settings</button>
                  <button className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition-colors">Security Audit</button>
                  <div className="h-px bg-zinc-100 my-1" />
                  <button className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium">Secure Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────── */}
        <main className="relative flex-1 overflow-hidden">
          {activeTab === "map" && <MapViewer />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "ai" && <AIDetectionTab />}
          {activeTab === "queue" && <QueueTab />}
          <div className={activeTab === "cadastral" ? "block h-full" : "hidden"}>
            <CadastralTab />
          </div>
          {activeTab === "audit" && <AuditTab />}
          {activeTab === "integration" && (
            <StateIntegrationTab onLaunchCadastral={() => setActiveTab("cadastral")} />
          )}

          {activeTab !== "map" &&
            activeTab !== "analytics" &&
            activeTab !== "ai" &&
            activeTab !== "queue" &&
            activeTab !== "cadastral" &&
            activeTab !== "audit" &&
            activeTab !== "integration" && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 shadow-sm">
                {(() => {
                  const item = ALL_NAV_ITEMS.find((n) => n.id === activeTab);
                  if (!item) return null;
                  const Icon = item.icon;
                  return <Icon size={28} className="text-zinc-600" />;
                })()}
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-zinc-900 font-display">
                  {TAB_TITLES[activeTab]}
                </p>
                <p className="mt-1 text-sm text-zinc-500 font-body">
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
    <div className="hidden items-center gap-1.5 rounded-md bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-[11px] font-mono text-zinc-600 sm:flex">
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {time.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
      <span className="text-zinc-400">IST</span>
    </div>
  );
}
