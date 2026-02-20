// ============================
// context/AnalysisContext.jsx
// ============================

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const AnalysisContext = createContext();

// ── Derived risk helpers ──────────────────────────────────────────
const getRiskLevel = (score) => {
  if (score >= 0.8) return "CRITICAL";
  if (score >= 0.6) return "HIGH";
  if (score >= 0.4) return "MEDIUM";
  return "LOW";
};

const getRiskColor = (score) => {
  if (score >= 0.8) return "var(--red-alert)";
  if (score >= 0.6) return "var(--orange-warn)";
  if (score >= 0.4) return "var(--yellow-flag)";
  return "var(--green-clear)";
};

const getRiskBadgeClass = (score) => {
  if (score >= 0.8) return "badge-critical";
  if (score >= 0.6) return "badge-warning";
  if (score >= 0.4) return "badge-flag";
  return "badge-clear";
};

export { getRiskLevel, getRiskColor, getRiskBadgeClass };

// ── Provider ─────────────────────────────────────────────────────
export const AnalysisProvider = ({ children }) => {

  // ── Core data ──
  const [result,    setResult]    = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // 🔥 NEW — CSV skipped rows
  const [skippedRows, setSkippedRows] = useState([]);

  // ── Graph EDA interaction ──
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode,  setHoveredNode]  = useState(null);
  const [activeRingId, setActiveRingId] = useState(null);
  const [graphFilter,  setGraphFilter]  = useState("ALL");

  // ── AI / Gemini ──
  const [aiExplanation,   setAiExplanation]   = useState(null);
  const [aiLoading,       setAiLoading]       = useState(false);
  const [aiError,         setAiError]         = useState(null);

  // ── Performance panel ──
  const [performance, setPerformance] = useState(null);

  // ── UI state ──
  const [activeTab,       setActiveTab]       = useState("GRAPH");
  const [exploreOpen,     setExploreOpen]     = useState(false);
  const [notification,    setNotification]    = useState(null);

  // ── Derived: enriched graph nodes ──────────────────────────────
  const enrichedNodes = useMemo(() => {
    if (!graphData?.nodes || !result) return graphData?.nodes ?? [];

    const suspiciousMap = {};
    (result.suspicious_accounts ?? []).forEach((acc) => {
      suspiciousMap[acc.account_id] = acc;
    });

    const ringMap = {};
    (result.fraud_rings ?? []).forEach((ring) => {
      (ring.members ?? ring.member_accounts ?? []).forEach((id) => {
        ringMap[id] = ring;
      });
    });

    return graphData.nodes.map((node) => {
      const suspicion = suspiciousMap[node.id] ?? null;
      const ring      = ringMap[node.id]       ?? null;
      return {
        ...node,
        suspicion_score:    suspicion?.suspicion_score    ?? 0,
        detected_patterns:  suspicion?.detected_patterns  ?? [],
        ring_id:            ring?.ring_id                 ?? null,
        ring_pattern:       ring?.pattern_type            ?? null,
        risk_level:         getRiskLevel(suspicion?.suspicion_score ?? 0),
        risk_color:         getRiskColor(suspicion?.suspicion_score ?? 0),
        is_suspicious:      !!suspicion,
        is_in_ring:         !!ring,
        is_outlier:         (suspicion?.suspicion_score ?? 0) >= 0.4 &&
                            (suspicion?.suspicion_score ?? 0) < 0.8,
        raw_suspicion:      suspicion,
      };
    });
  }, [graphData, result]);

  // ── Derived: summary stats ──────────────────────────────────────
  const summaryStats = useMemo(() => {
    if (!result) return null;
    const accounts  = result.suspicious_accounts ?? [];
    const rings     = result.fraud_rings ?? [];

    const critical  = accounts.filter((a) => a.suspicion_score >= 0.8).length;
    const high      = accounts.filter((a) => a.suspicion_score >= 0.6 && a.suspicion_score < 0.8).length;
    const medium    = accounts.filter((a) => a.suspicion_score >= 0.4 && a.suspicion_score < 0.6).length;

    const maxScore  = accounts.length
      ? Math.max(...accounts.map((a) => a.suspicion_score))
      : 0;

    const totalNodes = graphData?.nodes?.length ?? 0;

    const suspiciousRatio = totalNodes
      ? ((accounts.length / totalNodes) * 100).toFixed(1)
      : 0;

    return {
      totalAccounts: accounts.length,
      totalRings: rings.length,
      criticalCount: critical,
      highCount: high,
      mediumCount: medium,
      maxSuspicion: maxScore,
      suspiciousRatio,
      totalNodes,
      totalLinks: graphData?.links?.length ?? 0,
      overallRisk: getRiskLevel(maxScore),
      ...result.summary,
    };
  }, [result, graphData]);

  // ── Actions ────────────────────────────────────────────────────
  const selectNode = useCallback((node) => {
    setSelectedNode(node);
    setExploreOpen(!!node);
  }, []);

  const closeExplore = useCallback(() => {
    setExploreOpen(false);
    setSelectedNode(null);
  }, []);

  const highlightRing = useCallback((ringId) => {
    setActiveRingId((prev) => (prev === ringId ? null : ringId));
  }, []);

  const showNotification = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setGraphData(null);
    setSelectedNode(null);
    setHoveredNode(null);
    setActiveRingId(null);
    setAiExplanation(null);
    setAiError(null);
    setPerformance(null);
    setSkippedRows([]); // 🔥 NEW RESET
    setError(null);
    setExploreOpen(false);
    setActiveTab("GRAPH");
    setGraphFilter("ALL");
  }, []);

  const value = useMemo(() => ({
    result, setResult,
    graphData, setGraphData,
    loading, setLoading,
    error, setError,

    skippedRows, setSkippedRows, // 🔥 NEW

    selectedNode, selectNode,
    hoveredNode, setHoveredNode,
    activeRingId, highlightRing,
    graphFilter, setGraphFilter,
    enrichedNodes,

    aiExplanation, setAiExplanation,
    aiLoading, setAiLoading,
    aiError, setAiError,

    performance, setPerformance,

    activeTab, setActiveTab,
    exploreOpen, closeExplore,
    setExploreOpen,
    notification, showNotification,

    summaryStats,

    getRiskLevel,
    getRiskColor,
    getRiskBadgeClass,

    resetAnalysis,
  }), [
    result, graphData, loading, error,
    skippedRows,
    selectedNode, hoveredNode, activeRingId, graphFilter, enrichedNodes,
    aiExplanation, aiLoading, aiError,
    performance,
    activeTab, exploreOpen, notification,
    summaryStats,
    selectNode, highlightRing, closeExplore, showNotification, resetAnalysis,
  ]);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  return ctx;
};