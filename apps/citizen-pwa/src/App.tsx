import type { LandRecord } from "@landstack/shared";

function App() {
  // Demonstrates importing the shared LandRecord type
  const placeholder: LandRecord = {
    parcelId: "SRV-042",
    ownerName: "Priya Sharma",
    areaSqm: 2200,
    source: "revenue",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-brand-500">
          LandStack Nexus
        </h1>
        <p className="text-lg text-gray-400">Citizen Portal (PWA)</p>
        <pre className="mt-6 max-w-lg mx-auto rounded-xl bg-slate-900 p-4 text-left text-sm text-gray-300 overflow-auto">
          {JSON.stringify(placeholder, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
