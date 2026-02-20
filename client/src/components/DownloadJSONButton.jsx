// ============================
// DownloadJSONButton.jsx
// ============================

import { useAnalysis } from "../context/AnalysisContext";

export default function DownloadJSONButton() {
  const { result } = useAnalysis();

  if (!result) return null;

  const downloadJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rift_money_muling_output.json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadJSON}
      className="px-5 py-2 bg-[#1f4d2e] hover:bg-[#184024] rounded-full text-white font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
    >
      ⬇ Download JSON Report
    </button>
  );
}
