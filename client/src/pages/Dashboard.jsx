// ============================
// Dashboard.jsx — CLEAN STRUCTURE V2
// ============================

import { useAnalysis } from "../context/AnalysisContext";
import GraphView from "../components/GraphView";
import RiskPanel from "../components/RiskPanel";
import DownloadJSONButton from "../components/DownloadJSONButton";
import RingTable from "../components/RingTable";
import Loader from "../components/Loader";

export default function Dashboard() {
  const { result, loading, skippedRows } = useAnalysis();

  if (loading) return <Loader />;
  if (!result) return null;

  return (
    <div className="w-full min-h-screen bg-[#F7F7F5] text-[#111] font-mono">

      {/* ── PAGE WRAPPER ── */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ───────────────── HEADER ───────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* LEFT TITLE */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base sm:text-lg tracking-[0.4em] uppercase font-semibold">
              Analysis Dashboard
            </h1>
          </div>

          {/* RIGHT ACTION */}
          <DownloadJSONButton />
        </header>

        {/* ───────────────── CSV WARNING (CENTERED CARD) ───────────────── */}
        {skippedRows?.length > 0 && (
          <div className="flex justify-center">
            <section
              role="alert"
              className="w-full max-w-[900px]
                         rounded-2xl border border-red-300
                         bg-red-50
                         px-6 py-6
                         shadow-sm
                         text-center"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
                CSV Validation Warning
              </p>

              <p className="text-base text-red-700 mt-3 leading-relaxed">
                {skippedRows.length} rows were skipped due to invalid CSV format or syntax errors.
              </p>

              <p className="text-xs text-red-500 mt-2 opacity-80">
                Check the browser console for row-level validation details.
              </p>
            </section>
          </div>
        )}

        {/* ───────────────── MAIN GRID ───────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* GRAPH CARD */}
          <div className="lg:col-span-2
                          flex flex-col gap-5
                          rounded-2xl border border-black/10
                          bg-white shadow-sm
                          p-6
                          min-h-[520px]">

            <SectionLabel>Transaction Graph</SectionLabel>

            <div className="flex-1 w-full overflow-hidden">
              <GraphView />
            </div>
          </div>

          {/* RISK PANEL */}
          <div className="flex flex-col gap-5
                          rounded-2xl border border-black/10
                          bg-white shadow-sm
                          p-6
                          min-h-[520px]">

            <SectionLabel>Risk Monitor</SectionLabel>

            <div className="flex-1 overflow-y-auto pr-1">
              <RiskPanel accounts={result.suspicious_accounts} />
            </div>
          </div>
        </section>

        {/* ───────────────── RING TABLE ───────────────── */}
        <section className="flex flex-col gap-5
                            rounded-2xl border border-black/10
                            bg-white shadow-sm
                            p-6">
          <SectionLabel>Fraud Ring Analysis</SectionLabel>

          <div className="w-full overflow-x-auto">
            <RingTable rings={result.fraud_rings} />
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.35em] text-black/40 select-none">
      {children}
    </p>
  );
}