import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ScanLine,
  Clock,
  ArrowRight,
  MapPin,
  Shield,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

interface SearchScreenProps {
  onSearch: (ulpin: string) => void;
  loading: boolean;
}

const generateRecent = () => {
  return Array.from({ length: 15 }).map((_, i) => {
    const states = ["Odisha", "Tamil Nadu", "Punjab", "Gujarat", "Maharashtra", "Karnataka", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "West Bengal"];
    const labels = ["Residential Plot", "Agricultural Land", "Commercial Space", "Empty Lot", "Mixed Use"];
    const isClean = Math.random() > 0.4;
    return {
      ulpin: `${states[i % states.length].substring(0,2).toUpperCase()}-${100 + i}-${Math.floor(1000 + Math.random() * 9000)}`,
      state: states[i % states.length],
      label: `${labels[i % labels.length]}, Region ${i + 1}`,
      status: isClean ? "Clean" : "Review",
      statusColor: isClean ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50",
    };
  });
};

// ─── Component ──────────────────────────────────────────────────────

export default function SearchScreen({ onSearch, loading }: SearchScreenProps) {
  const [ulpin, setUlpin] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentData, setRecentData] = useState(generateRecent());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ulpin.trim();
    if (trimmed) onSearch(trimmed);
  }

  function handleScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onSearch(`QR-SCANNED-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 2000);
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50">
      {/* ── Status bar (mock) ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-4 pb-1">
        <span className="text-xs font-semibold text-gray-400">
          {new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-4 rounded-sm border border-gray-400 relative">
            <div className="absolute inset-0.5 rounded-[1px] bg-emerald-500" style={{ width: "70%" }} />
          </div>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-8"
      >
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Government of India
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          LandStack Portal
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Verify land records across departments in seconds.
        </p>
      </motion.div>

      {/* ── Search Input ──────────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="px-6 mt-8"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={ulpin}
              onChange={(e) => setUlpin(e.target.value)}
              placeholder="Enter 14-digit ULPIN"
              autoComplete="off"
              className="flex-1 bg-transparent py-2 text-base font-medium text-gray-900 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !ulpin.trim()}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 disabled:opacity-40 disabled:shadow-none"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* ── OR divider ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 px-6 mt-6"
      >
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </motion.div>

      {/* ── QR Scanner Button ─────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="px-6 mt-6"
      >
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4 font-semibold text-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
        >
          <ScanLine size={22} className={isScanning ? "animate-spin" : "animate-pulse"} />
          {isScanning ? "Scanning Bhu-Aadhaar QR..." : "Scan Bhu-Aadhaar QR"}
        </button>
      </motion.div>

      {/* ── Recent Activity ───────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-8 flex-1 px-6 pb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-gray-400" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Recent Activity
          </h3>
        </div>

        <div className="space-y-3">
          {recentData.map((item) => (
            <button
              key={item.ulpin}
              type="button"
              onClick={() => onSearch(item.ulpin)}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <MapPin size={18} className="text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="font-mono text-sm font-bold text-gray-900">
                    {item.ulpin}
                  </p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    item.status === "Clean" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                  }`}
                >
                  {item.status}
                </span>
                <ArrowRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-6 pb-6 text-center">
        <p className="text-[10px] text-gray-400">
          Digital Public Infrastructure • DILRMP 3.0
        </p>
      </div>
    </div>
  );
}
