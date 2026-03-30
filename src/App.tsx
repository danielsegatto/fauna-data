import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "@/components/ui/Toast";
import HomePage from "@/pages/HomePage";
import MethodologiesPage from "@/pages/MethodologiesPage";
import CollectionPointPage from "@/pages/CollectionPointPage";
import CollectionPointsListPage from "@/pages/CollectionPointsListPage";
import CollectionPointDetailPage from "@/pages/CollectionPointDetailPage";
import DataEntryPage from "@/pages/DataEntryPage";
import RecordDetailPage from "@/pages/RecordDetailPage";
import DashboardPage from "@/pages/DashboardPage";
import ExportPage from "@/pages/ExportPage";

export default function App() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/methodologies/:group" element={<MethodologiesPage />} />
        <Route path="/collection-point/:group/:methodology" element={<CollectionPointPage />} />
        <Route path="/collection-points" element={<Navigate to="/" replace />} />
        <Route path="/collection-points/:group" element={<CollectionPointsListPage />} />
        <Route path="/collection-point/:pointId" element={<CollectionPointDetailPage />} />
        <Route path="/data-entry/:group/:methodology/:pointId" element={<DataEntryPage />} />
        <Route path="/records/:recordId" element={<RecordDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
