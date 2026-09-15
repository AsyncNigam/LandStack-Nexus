import { useState } from "react";
import type { Conflict } from "../types";
import MapViewer from "./MapViewer";
import Sidebar from "./Sidebar";
import EvidenceCard from "./EvidenceCard";

export default function Dashboard() {
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      {/* Left: Discrepancy Queue */}
      <Sidebar
        onSelectConflict={setSelectedConflict}
        selectedId={selectedConflict?.id ?? null}
      />

      {/* Right: Map + evidence overlay */}
      <div className="relative flex-1">
        <MapViewer />

        {selectedConflict && (
          <EvidenceCard
            conflict={selectedConflict}
            onClose={() => setSelectedConflict(null)}
          />
        )}
      </div>
    </div>
  );
}
