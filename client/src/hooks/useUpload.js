import { uploadCSV } from "../api/apiClient";
import { useAnalysis } from "../context/AnalysisContext";

/**
 * 🔥 FINAL STABLE UPLOAD HOOK
 * (STATE BASED NAVIGATION — NO ROUTER)
 */

export const useUpload = () => {

  const {
    setResult,
    setGraphData,
    setLoading,
    setPerformance,
    setAiExplanation,
    setSkippedRows,
  } = useAnalysis();

  // ============================================================
  // 🤖 GEMINI EXPLAINABILITY
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
      setLoading(true);

      const data = await uploadCSV(file);

      setResult(data.result);
      setGraphData(data.graphData);

      if (data?.result?.summary) {
        setPerformance(data.result.summary);
      }

      if (data?.skipped_rows?.length) {
        setSkippedRows(data.skipped_rows);
      } else {
        setSkippedRows([]);
      }

      // NON BLOCKING AI
      runGeminiExplanation(data.result);

    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile };
};
