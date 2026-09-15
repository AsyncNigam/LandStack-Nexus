import { useState } from "react";

interface SearchScreenProps {
  onSearch: (ulpin: string) => void;
  loading: boolean;
}

export default function SearchScreen({ onSearch, loading }: SearchScreenProps) {
  const [ulpin, setUlpin] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ulpin.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* Logo / branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          LandStack Nexus
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Citizen Land Record Verification
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label
            htmlFor="ulpin-input"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500"
          >
            Enter ULPIN
          </label>
          <input
            id="ulpin-input"
            type="text"
            value={ulpin}
            onChange={(e) => setUlpin(e.target.value)}
            placeholder="e.g., OD-101-0001"
            autoComplete="off"
            className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-base font-mono text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1.5 text-[11px] text-gray-600">
            14-character Unique Land Parcel Identification Number
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !ulpin.trim()}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Searching…
            </span>
          ) : (
            "Check Land Status"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-12 text-center text-[10px] uppercase tracking-widest text-gray-700">
        Government of India • Digital Public Infrastructure
      </p>
    </div>
  );
}
