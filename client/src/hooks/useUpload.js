import { uploadCSV } from "../api/apiClient";
import { useAnalysis } from "../context/AnalysisContext";
import { useNavigate } from "react-router-dom";

/**
 * 🔥 FINAL UPGRADED UPLOAD HOOK (WITH REDIRECT + LOADER FLOW)
 */

export const useUpload = () => {
  const navigate = useNavigate();

  const {
    setResult,
    setGraphData,
    setLoading,
    setPerformance,
    setAiExplanation,
    setSkippedRows,
  } = useAnalysis();

  // ============================================================
  // 🤖 GEMINI FREE RAG EXPLAINABILITY
  // ============================================================
  const runGeminiExplanation = async (result) => {
    try {
      if (!result?.suspicious_accounts?.length) return;

      const top = result.suspicious_accounts[0];

      const prompt = `
You are a financial crime analyst AI.

Explain WHY this account is suspicious:

Account ID: ${top.account_id}
Risk Score: ${top.suspicion_score}
Patterns: ${top.detected_patterns.join(", ")}

Explain money muling behaviour in 2 short lines.
`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const json = await res.json();

      const text =
        json?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      if (text) setAiExplanation(text);
    } catch (err) {
      console.warn("Gemini explainability failed", err);
    }
  };

  // ============================================================
  // 🚀 MAIN UPLOAD FLOW
  // ============================================================
  const uploadFile = async (file) => {
    if (!file) return;

    try {
      // 🔥 GLOBAL LOADER START
      setLoading(true);

      const data = await uploadCSV(file);

      // ======================================
      // 🔥 CORE BACKEND RESPONSE
      // ======================================
      setResult(data.result);
      setGraphData(data.graphData);

      // ======================================
      // 🔥 PERFORMANCE PANEL
      // ======================================
      if (data?.result?.summary) {
        setPerformance(data.result.summary);
      }

      // ======================================
      // 🔥 CSV SKIPPED ROWS UI
      // ======================================
      if (data?.skipped_rows?.length) {
        console.warn("CSV rows skipped:", data.skipped_rows);
        setSkippedRows(data.skipped_rows);
      } else {
        setSkippedRows([]);
      }

      // ======================================
      // 🤖 GEMINI AI EXPLAINABILITY (NON BLOCKING)
      // ======================================
      runGeminiExplanation(data.result);

      // ==================================================
      // 🔥🔥 IMPORTANT — DASHBOARD REDIRECT AFTER SUCCESS
      // ==================================================
      navigate("/dashboard");

    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      // 🔥 GLOBAL LOADER STOP
      setLoading(false);
    }
  };

  return { uploadFile };
};
