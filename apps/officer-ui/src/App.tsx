import type { Conflict } from "@landstack/shared";

function App() {
  // Demonstrates importing the shared Conflict type
  const placeholder: Conflict = {
    id: "demo-001",
    parcelId: "SRV-001",
    description: "Area differs by 120 sqm between Revenue and Registry",
    field: "areaSqm",
    values: { revenue: 4500, registry: 4620, tax: undefined },
    status: "open",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-brand-500">
          LandStack Nexus
        </h1>
        <p className="text-lg text-gray-400">Officer Dashboard</p>
        <pre className="mt-6 max-w-lg mx-auto rounded-xl bg-gray-900 p-4 text-left text-sm text-gray-300 overflow-auto">
          {JSON.stringify(placeholder, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
