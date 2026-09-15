import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { Conflict } from "../types";
import MapViewer from "./MapViewer";
import Sidebar from "./Sidebar";
import EvidenceCard from "./EvidenceCard";

export default function Dashboard() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  // ── Fetch / refresh conflicts ──────────────────────────────────────

  const fetchConflicts = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get<{ success: boolean; data: Conflict[] }>(
        "/api/v1/conflicts",
      );
      setConflicts(data.data);
    } catch (err) {
      console.error("Failed to fetch conflicts:", err);
      setError("Unable to load discrepancies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  // ── Handlers ──────────────────────────────────────────────────────

  function handleSelectConflict(conflict: Conflict) {
    setSelectedConflict(conflict);
  }

  function handleClose() {
    setSelectedConflict(null);
  }

  function handleResolved() {
    // Refresh the queue — resolved conflict will no longer appear
    fetchConflicts();
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4EBD9] text-[#7A3E14]">
      {/* Left: Discrepancy Queue */}
      <Sidebar
        conflicts={conflicts}
        loading={loading}
        error={error}
        onSelectConflict={handleSelectConflict}
        selectedId={selectedConflict?.id ?? null}
      />

      {/* Right: Map + evidence overlay */}
      <div className="relative flex-1">
        <MapViewer />

        {selectedConflict && (
          <EvidenceCard
            conflict={selectedConflict}
            onClose={handleClose}
            onResolved={handleResolved}
          />
        )}
      </div>
    </div>
  );
}
