import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "@/components/ui/Toast";
import HomePage from "@/pages/HomePage";
import MethodologiesPage from "@/pages/MethodologiesPage";
import CollectionPointPage from "@/pages/CollectionPointPage";
import DataEntryPage from "@/pages/DataEntryPage";
import RecordsListPage from "@/pages/RecordsListPage";
import RecordDetailPage from "@/pages/RecordDetailPage";
import DashboardPage from "@/pages/DashboardPage";

export default function App() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/methodologies/:group" element={<MethodologiesPage />} />
        <Route path="/collection-point/:group/:methodology" element={<CollectionPointPage />} />
        <Route path="/data-entry/:group/:methodology/:pointId" element={<DataEntryPage />} />
        <Route path="/records" element={<RecordsListPage />} />
        <Route path="/records/:recordId" element={<RecordDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Remaining pages — registered as we build them */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
