import { useState } from "react";
import axios from "axios";
import type { ParcelResponse } from "./types";
import SearchScreen from "./components/SearchScreen";
import ReadinessCard from "./components/ReadinessCard";
import DisputeScreen from "./components/DisputeScreen";

interface ApiResult {
  success: boolean;
  data: ParcelResponse;
  message?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "readiness" | "dispute">("search");
  const [data, setData] = useState<ParcelResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(searchUlpin: string) {
    setLoading(true);
    try {
      // If we scanned the fake QR, mock the response so it works without the backend
      if (searchUlpin.startsWith("QR-SCANNED-")) {
        setTimeout(() => {
          setData({
            parcel: { ulpin: searchUlpin, area_sqm: "1200", source_state: "TN" },
            ror: { owner_name: "Aarav Iyer", khata_no: "K-990", area_acre: "0.29", source_dept: "Revenue" },
            registration: { owner_name: "Aarav Iyer", deed_no: "D-8822", area_acre: "0.29", source_dept: "Sub-Registrar" },
            tax: { owner_name: "Aarav Iyer", tax_due: "0", last_paid_on: "2023-12-01", source_dept: "Municipal" },
            conflicts: []
          });
          setCurrentView("readiness");
          setLoading(false);
        }, 800);
        return;
      }

      const response = await axios.get<ApiResult>(
        `/api/v1/parcels/${encodeURIComponent(searchUlpin)}`,
      );
      setData(response.data.data);
      setCurrentView("readiness");
    } catch (err) {
      console.error("Search failed:", err);
      // Fallback for demo purposes if backend is unreachable
      setData({
        parcel: { ulpin: searchUlpin, area_sqm: "4046", source_state: "OD" },
        ror: { owner_name: "Rajesh Kumar", khata_no: "K-101", area_acre: "1.0", source_dept: "Revenue" },
        registration: { owner_name: "Suresh Patel", deed_no: "D-202", area_acre: "1.2", source_dept: "Sub-Registrar" },
        tax: { owner_name: "Rajesh Kumar", tax_due: "4500", last_paid_on: "2021-05-12", source_dept: "Municipal" },
        conflicts: [
          { id: 1, conflict_type: "OWNERSHIP", severity: "HIGH", field_values: { description: "Name mismatch" } }, 
          { id: 2, conflict_type: "AREA", severity: "MEDIUM", field_values: { description: "Area mismatch" } }
        ]
      });
      setCurrentView("readiness");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 font-sans">
      {/* Phone shell — looks like a device on desktop, full-screen on mobile */}
      <div className="relative h-[850px] w-full max-w-md overflow-hidden bg-gray-50 shadow-2xl sm:rounded-[2.5rem] sm:border-8 sm:border-gray-900">
        {/* Notch (cosmetic) */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-50 hidden h-7 w-36 -translate-x-1/2 rounded-b-2xl bg-gray-900 sm:block" />

        {currentView === "search" && (
          <SearchScreen onSearch={handleSearch} loading={loading} />
        )}
        
        {currentView === "readiness" && data && (
          <ReadinessCard 
            data={data} 
            onBack={() => setCurrentView("search")} 
            onDispute={() => setCurrentView("dispute")}
          />
        )}

        {currentView === "dispute" && data && (
          <DisputeScreen 
            ulpin={data.parcel?.ulpin || "UNKNOWN"} 
            onBack={() => setCurrentView("readiness")} 
            onSubmit={() => setCurrentView("search")}
          />
        )}

        {/* Home bar (cosmetic) */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 hidden h-1 w-32 -translate-x-1/2 rounded-full bg-gray-400 sm:block" />
      </div>
    </div>
  );
}
