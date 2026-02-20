

import UploadPage from "./pages/UploadPage";
import Dashboard from "./pages/Dashboard";
import Loader from "./components/Loader";
import { useAnalysis } from "./context/AnalysisContext";

export default function App() {
  const { result, loading } = useAnalysis();

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#111111] relative">

      {loading && <Loader />}

      {!result ? <UploadPage /> : <Dashboard />}

    </div>
  );
}
