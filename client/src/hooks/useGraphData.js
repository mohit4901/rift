import { useMemo } from "react";
import { useAnalysis } from "../context/AnalysisContext";

/**
 * 🔥 Enhanced Graph Data Hook
 * - merges backend suspicious_accounts into graph nodes
 * - enables hover details, explore mode, outlier analytics
 */
export const useGraphData = () => {
  const { graphData, result } = useAnalysis();

  const enrichedGraph = useMemo(() => {
    if (!graphData || !result) return graphData;

    const suspiciousMap = new Map();

    // 🔥 Build quick lookup for suspicious accounts
    if (result?.suspicious_accounts) {
      result.suspicious_accounts.forEach((acc) => {
        suspiciousMap.set(acc.account_id, acc);
      });
    }

    const nodes = graphData.nodes.map((node) => {
      const risk = suspiciousMap.get(node.id);

      return {
        ...node,
        suspicious: !!risk,
        suspicion_score: risk?.suspicion_score || 0,
        detected_patterns: risk?.detected_patterns || [],
        ring_id: risk?.ring_id || null,
      };
    });

    return {
      nodes,
      links: graphData.links,
    };
  }, [graphData, result]);

  return enrichedGraph;
};
