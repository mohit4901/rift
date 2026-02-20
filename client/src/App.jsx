// ============================
// App.jsx
// ============================

import UploadPage from "./pages/UploadPage";
import Dashboard from "./pages/Dashboard";
import { useAnalysis } from "./context/AnalysisContext";


export default function App() {
  const { result } = useAnalysis();

  return (
   
   <div className="min-h-screen bg-[#ffffff] text-[#111111]">
      {!result ? <UploadPage /> : <Dashboard />}
    </div>
  
  );
}
