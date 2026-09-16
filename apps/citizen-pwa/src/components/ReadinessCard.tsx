import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Scale,
  User,
  Banknote,
  ChevronRight,
  Info,
} from "lucide-react";
import type { ParcelResponse } from "../types";

// ─── Props ──────────────────────────────────────────────────────────

interface ReadinessCardProps {
  data: ParcelResponse;
  onBack: () => void;
  onDispute?: () => void;
}

// ─── Score logic ────────────────────────────────────────────────────

function calcScore(conflicts: ParcelResponse["conflicts"]): number {
  if (!conflicts || conflicts.length === 0) return 100;
  if (conflicts.length === 1) return 75;
  return 50;
}

function hasConflict(conflicts: ParcelResponse["conflicts"] | undefined, type: string): boolean {
  return conflicts?.some((c) => c.conflict_type === type) ?? false;
}

function safe(value: unknown, fallback = "Not Available"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

// ─── Score theme ────────────────────────────────────────────────────

interface ScoreTheme {
  label: string;
  ringColor: string;
  ringTrack: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}

const SCORE_THEMES: Record<number, ScoreTheme> = {
  100: {
    label: "Excellent",
    ringColor: "#10b981",
    ringTrack: "#d1fae5",
    textColor: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  75: {
    label: "Review Needed",
    ringColor: "#3b82f6",
    ringTrack: "#dbeafe",
    textColor: "text-blue-600",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  50: {
    label: "Action Required",
    ringColor: "#ef4444",
    ringTrack: "#fee2e2",
    textColor: "text-red-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
};

// ─── SVG Ring Constants ─────────────────────────────────────────────

const RING_SIZE = 200;
const STROKE_WIDTH = 14;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Component ──────────────────────────────────────────────────────

export default function ReadinessCard({ data, onBack, onDispute }: ReadinessCardProps) {
  const score = calcScore(data?.conflicts);
  const theme = SCORE_THEMES[score] ?? SCORE_THEMES[50];
  const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const ownerName = safe(data?.ror?.owner_name ?? data?.registration?.owner_name, "Pending Verification");
  const areaAcre = safe(data?.ror?.area_acre ?? data?.registration?.area_acre, "Unknown Area");
  const taxDue = parseFloat(safe(data?.tax?.tax_due, "0"));

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50">
      {/* ── Header Bar ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between px-5 pt-10 pb-2"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-500">
          Bhu-Aadhaar Status
        </span>
        <div className="w-9" /> {/* spacer */}
      </motion.div>

      {/* ── ULPIN pill ────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mx-auto mt-2"
      >
        <span className="inline-block rounded-full bg-white px-4 py-1.5 font-mono text-xs font-bold text-gray-700 shadow-sm ring-1 ring-gray-100">
          {data?.parcel?.ulpin}
        </span>
      </motion.div>

      {/* ── Score Ring ────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 14 }}
        className="relative mx-auto mt-6 flex items-center justify-center"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="absolute inset-0 -rotate-90"
        >
          {/* Glow filter */}
          <defs>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={theme.ringTrack}
            strokeWidth={STROKE_WIDTH}
          />

          {/* Animated score arc */}
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={theme.ringColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            filter="url(#ring-glow)"
          />
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`text-5xl font-extrabold ${theme.textColor}`}
          >
            {score}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-0.5 text-xs font-medium text-gray-400"
          >
            out of 100
          </motion.span>
        </div>
      </motion.div>

      {/* ── Score Label ───────────────────────────────────────── */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center"
      >
        <span className="text-lg font-bold text-gray-900">{theme.label}</span>
        <p className="mt-0.5 text-xs text-gray-500">
          Transaction Readiness Score
        </p>
      </motion.div>

      {/* ── Data Consistency Cards ────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 px-5"
      >
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Data Consistency Check
        </h3>

        {/* Ownership Card */}
        <CheckCard
          icon={User}
          label="Ownership"
          isConflict={hasConflict(data?.conflicts, "OWNERSHIP")}
          goodValue={`✅ ${ownerName}`}
          badValue="⚠️ Mismatch detected"
          delay={0.7}
        />

        {/* Area Card */}
        <CheckCard
          icon={Scale}
          label="Parcel Area"
          isConflict={hasConflict(data?.conflicts, "AREA")}
          goodValue={`✅ ${areaAcre} acres`}
          badValue="⚠️ Variance detected"
          subLink={hasConflict(data?.conflicts, "AREA") ? "Review spatial discrepancy →" : undefined}
          delay={0.8}
        />

        {/* Tax Card */}
        <CheckCard
          icon={Banknote}
          label="Property Tax"
          isConflict={taxDue > 0}
          goodValue="✅ Up to date"
          badValue={`⚠️ ₹${taxDue.toLocaleString("en-IN")} due`}
          delay={0.9}
        />
      </motion.div>

      {/* ── Status Alert ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mx-5 mt-5"
      >
        {score < 100 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 backdrop-blur-sm">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                Review Pending
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                {data?.conflicts?.length ?? 0} discrepanc{(data?.conflicts?.length ?? 0) === 1 ? "y" : "ies"} detected. A government officer will reconcile the records.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 backdrop-blur-sm">
            <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-800">
                Transaction Ready
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
                All department records are consistent. This parcel is clear for transactions.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Record Summary ────────────────────────────────────── */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mx-5 mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 px-4 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Record Summary
          </p>
        </div>
        <div className="divide-y divide-gray-50 px-4">
          <DetailRow label="State" value={data?.parcel?.source_state?.toUpperCase() ?? "N/A"} />
          <DetailRow label="Area (sqm)" value={safe(data?.parcel?.area_sqm)} />
          <DetailRow label="Revenue ID" value={safe(data?.ror?.khata_no)} />
          <DetailRow label="Registry Deed" value={safe(data?.registration?.deed_no)} />
        </div>
      </motion.div>

      {/* ── Action Button ─────────────────────────────────────── */}
      {score < 100 && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mx-5 mt-6"
        >
          <button
            type="button"
            onClick={onDispute}
            className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] hover:bg-blue-700"
          >
            File a Dispute
          </button>
        </motion.div>
      )}

      {/* ── Legal Disclaimer ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mx-5 mt-5 mb-8 flex items-start gap-2.5 rounded-xl bg-gray-100/80 p-3.5"
      >
        <Info size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
        <p className="text-[10px] leading-relaxed text-gray-500">
          <span className="font-bold text-gray-600">DISCLAIMER:</span>{" "}
          This score is for decision support only. It is{" "}
          <span className="font-bold text-gray-600">NOT</span> a legal
          certification of title.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function CheckCard({
  icon: Icon,
  label,
  isConflict,
  goodValue,
  badValue,
  subLink,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  isConflict: boolean;
  goodValue: string;
  badValue: string;
  subLink?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className={`relative mb-3 overflow-hidden rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md ${
        isConflict ? "border-amber-200" : "border-gray-100"
      }`}
    >
      {/* Subtle glow strip */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isConflict ? "bg-amber-400" : "bg-emerald-400"
        }`}
      />

      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isConflict ? "bg-amber-50" : "bg-emerald-50"
            }`}
          >
            <Icon
              size={18}
              className={isConflict ? "text-amber-600" : "text-emerald-600"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p
              className={`text-xs font-medium ${
                isConflict ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {isConflict ? badValue : goodValue}
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </div>

      {subLink && (
        <p className="mt-2 pl-14 text-xs font-semibold text-blue-600">
          {subLink}
        </p>
      )}
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
  );
}
