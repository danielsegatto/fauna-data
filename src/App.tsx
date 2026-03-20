import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "@/components/ui/Toast";
import HomePage from "@/pages/HomePage";

/**
 * App shell.
 * Routes are added here as each page is built, step by step.
 */
export default function App() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Remaining pages — registered as we build them */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
