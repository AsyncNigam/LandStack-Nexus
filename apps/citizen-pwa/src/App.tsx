import { useState } from "react";
import axios from "axios";
import type { ParcelResponse } from "./types";
import SearchScreen from "./components/SearchScreen";
import ReadinessCard from "./components/ReadinessCard";

interface ApiResult {
  success: boolean;
  data: ParcelResponse;
  message?: string;
}

function App() {
  const [data, setData] = useState<ParcelResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(searchUlpin: string) {
    setLoading(true);
    try {
      const response = await axios.get<ApiResult>(
        `/api/v1/parcels/${encodeURIComponent(searchUlpin)}`,
      );
      setData(response.data.data);
    } catch (err) {
      console.error("Search failed:", err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        alert("ULPIN not found. Please check the number and try again.");
      } else {
        alert("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setData(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 font-sans">
      {/* Phone shell — looks like a device on desktop, full-screen on mobile */}
      <div className="relative h-[850px] w-full max-w-md overflow-hidden bg-gray-50 shadow-2xl sm:rounded-[2.5rem] sm:border-8 sm:border-gray-900">
        {/* Notch (cosmetic) */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-50 hidden h-7 w-36 -translate-x-1/2 rounded-b-2xl bg-gray-900 sm:block" />

        {data ? (
          <ReadinessCard data={data} onBack={handleBack} />
        ) : (
          <SearchScreen onSearch={handleSearch} loading={loading} />
        )}

        {/* Home bar (cosmetic) */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 hidden h-1 w-32 -translate-x-1/2 rounded-full bg-gray-400 sm:block" />
      </div>
    </div>
  );
}

export default App;
