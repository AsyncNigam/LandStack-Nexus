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
    <div className="min-h-screen bg-gray-950 max-w-md mx-auto shadow-xl shadow-black/40 overflow-hidden">
      {data ? (
        <ReadinessCard data={data} onBack={handleBack} />
      ) : (
        <SearchScreen onSearch={handleSearch} loading={loading} />
      )}
    </div>
  );
}

export default App;
