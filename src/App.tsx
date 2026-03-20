import { Routes, Route } from "react-router-dom";

/**
 * App shell.
 * Routes are added here as each page is built, step by step.
 */
export default function App() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <Routes>
        {/* Pages are registered here as we build them */}
        <Route
          path="*"
          element={
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl">
                🦜
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Fauna Data</h1>
              <p className="text-gray-500 text-center text-sm">
                Fundação pronta. Construindo peça por peça...
              </p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
