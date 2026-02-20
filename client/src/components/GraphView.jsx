// ============================
// GraphView.jsx — RIFT ULTRA INTERACTIVE
// Fraud Detection Network Visualization
// ============================

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useGraphData } from "../hooks/useGraphData";
import { useAnalysis } from "../context/AnalysisContext";

// ─── RISK THRESHOLDS ──────────────────────────────────────────────────────────
const RISK = {
  HIGH:   { min: 40, color: "#ff2d55", glow: "#ff2d55", size: 12, label: "HIGH RISK"   },
  MEDIUM: { min: 25, color: "#ff9500", glow: "#ff9500", size: 8,  label: "MEDIUM RISK" },
  LOW:    { min: 1,  color: "#ffd60a", glow: "#ffd60a", size: 6,  label: "LOW RISK"    },
  CLEAN:  { min: 0,  color: "#30d158", glow: "#30d158", size: 4,  label: "CLEAN"       },
};

const getRiskLevel = (score) => {
  if (score >= 40) return RISK.HIGH;
  if (score >= 25) return RISK.MEDIUM;
  if (score > 0)  return RISK.LOW;
  return RISK.CLEAN;
};

// ─── RING PALETTE ─────────────────────────────────────────────────────────────
const RING_COLORS = [
  "#ff2d55", "#bf5af2", "#0a84ff", "#ff9f0a",
  "#5e5ce6", "#32ade6", "#30d158", "#ff6b35",
];
const getRingColor = (ring_id) => {
  if (!ring_id) return null;
  const idx = parseInt(ring_id.replace(/\D/g, ""), 10) || 0;
  return RING_COLORS[idx % RING_COLORS.length];
};

// ─── MINI SCORE BAR ───────────────────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const risk = getRiskLevel(score);
  const pct  = Math.min(100, score);
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
        <span style={{ color: "#8e8e93" }}>Risk Score</span>
        <span style={{ color: risk.color, fontWeight: 700 }}>{score}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "#2c2c2e", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${risk.color}88, ${risk.color})`,
          transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
};

// ─── PATTERN TAG ─────────────────────────────────────────────────────────────
const PatternTag = ({ label }) => (
  <span style={{
    display: "inline-block", padding: "2px 7px", borderRadius: 99,
    fontSize: 10, fontWeight: 600, letterSpacing: "0.3px",
    background: "#ff2d5520", color: "#ff2d55",
    border: "1px solid #ff2d5540", margin: "2px 2px 0 0",
  }}>
    {label}
  </span>
);

// ─── LEGEND PILL ──────────────────────────────────────────────────────────────
const LegendPill = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
    <div style={{
      width: 10, height: 10, borderRadius: "50%",
      background: color,
      boxShadow: `0 0 6px ${color}`,
    }} />
    <span style={{ fontSize: 11, color: "#aeaeb2", fontFamily: "monospace" }}>{label}</span>
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div style={{
    background: "#1c1c1e", borderRadius: 10, padding: "10px 14px",
    border: `1px solid ${accent}30`,
    display: "flex", flexDirection: "column", gap: 2,
  }}>
    <span style={{ fontSize: 10, color: "#636366", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
    <span style={{ fontSize: 20, fontWeight: 800, color: accent, fontFamily: "monospace" }}>{value}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function GraphView() {
  const graphData    = useGraphData();
  const { result }   = useAnalysis();
  const fgRef        = useRef();

  const [hoveredNode,   setHoveredNode]   = useState(null);
  const [selectedNode,  setSelectedNode]  = useState(null);
  const [filterRing,    setFilterRing]    = useState(null);   // ring_id or null
  const [filterRisk,    setFilterRisk]    = useState("ALL");  // ALL | HIGH | MEDIUM | LOW | CLEAN
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [graphReady,    setGraphReady]    = useState(false);
  const [pulse,         setPulse]         = useState(true);

  // pulse animation ticker
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(id);
  }, []);

  if (!graphData) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 500, color: "#636366", fontFamily: "monospace" }}>
      Awaiting graph data…
    </div>
  );

  // ── ENRICH NODES ────────────────────────────────────────────────────────────
  const enrichedNodes = useMemo(() => {
    const riskMap = new Map();
    result?.suspicious_accounts?.forEach(acc => riskMap.set(acc.account_id, acc));

    return graphData.nodes.map(n => {
      const risk = riskMap.get(n.id);
      return {
        ...n,
        suspicion_score:    risk?.suspicion_score    || 0,
        detected_patterns:  risk?.detected_patterns  || [],
        ring_id:            risk?.ring_id            || null,
        suspicious:         !!risk,
        riskLevel:          getRiskLevel(risk?.suspicion_score || 0),
        ringColor:          getRingColor(risk?.ring_id),
      };
    });
  }, [graphData, result]);

  // ── COLLECT RINGS ──────────────────────────────────────────────────────────
  const allRings = useMemo(() => {
    const s = new Set();
    enrichedNodes.forEach(n => { if (n.ring_id) s.add(n.ring_id); });
    return Array.from(s).sort();
  }, [enrichedNodes]);

  // ── STATS ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     enrichedNodes.length,
    high:      enrichedNodes.filter(n => n.suspicion_score >= 40).length,
    medium:    enrichedNodes.filter(n => n.suspicion_score >= 25 && n.suspicion_score < 40).length,
    rings:     allRings.length,
    totalLinks: graphData.links?.length || 0,
  }), [enrichedNodes, allRings, graphData]);

  // ── FILTER ─────────────────────────────────────────────────────────────────
  const visibleNodeIds = useMemo(() => {
    return new Set(
      enrichedNodes
        .filter(n => {
          if (showOnlySuspicious && !n.suspicious) return false;
          if (filterRing && n.ring_id !== filterRing) return false;
          if (filterRisk !== "ALL") {
            const r = filterRisk;
            if (r === "HIGH"   && n.suspicion_score < 40) return false;
            if (r === "MEDIUM" && (n.suspicion_score < 25 || n.suspicion_score >= 40)) return false;
            if (r === "LOW"    && (n.suspicion_score <= 0 || n.suspicion_score >= 25)) return false;
            if (r === "CLEAN"  && n.suspicion_score > 0) return false;
          }
          if (searchQuery && !n.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
          return true;
        })
        .map(n => n.id)
    );
  }, [enrichedNodes, showOnlySuspicious, filterRing, filterRisk, searchQuery]);

  const filteredGraph = useMemo(() => ({
    nodes: enrichedNodes.filter(n => visibleNodeIds.has(n.id)),
    links: (graphData.links || []).filter(l =>
      visibleNodeIds.has(typeof l.source === "object" ? l.source.id : l.source) &&
      visibleNodeIds.has(typeof l.target === "object" ? l.target.id : l.target)
    ),
  }), [enrichedNodes, graphData.links, visibleNodeIds]);

  // ── NODE CANVAS DRAW ───────────────────────────────────────────────────────
  const drawNode = useCallback((node, ctx, globalScale) => {
    // Guard: skip if position not yet assigned by force simulation
    if (!isFinite(node.x) || !isFinite(node.y)) return;

    const risk     = node.riskLevel;
    const size     = risk.size;
    const isHover  = hoveredNode?.id === node.id;
    const isSelect = selectedNode?.id === node.id;
    const ringCol  = node.ringColor || risk.color;

    // Outer glow for suspicious nodes
    if (node.suspicious || isHover || isSelect) {
      const glowSize = isSelect ? size * 3 : isHover ? size * 2.5 : size * 2;
      const innerR = Math.max(0, size * 0.5);
      const grd = ctx.createRadialGradient(node.x, node.y, innerR, node.x, node.y, glowSize);
      grd.addColorStop(0, `${ringCol}55`);
      grd.addColorStop(1, `${ringCol}00`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // Selection ring
    if (isSelect) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth   = 1.5 / globalScale;
      ctx.stroke();
    }

    // Ring membership outer arc (dashed)
    if (node.ring_id) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 2.5, 0, 2 * Math.PI);
      ctx.strokeStyle = ringCol;
      ctx.lineWidth   = 1.2 / globalScale;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);

    if (node.suspicious) {
      // radial fill
      const grd = ctx.createRadialGradient(node.x - size * 0.3, node.y - size * 0.3, 0, node.x, node.y, size);
      if (isFinite(node.x - size * 0.3) && isFinite(node.y - size * 0.3)) {
        grd.addColorStop(0, `${ringCol}ff`);
        grd.addColorStop(1, `${ringCol}aa`);
        ctx.fillStyle = grd;
      } else {
        ctx.fillStyle = ringCol;
      }
    } else {
      ctx.fillStyle = "#2c2c2e";
    }
    ctx.fill();

    // Inner highlight dot
    if (node.suspicious) {
      ctx.beginPath();
      ctx.arc(node.x - size * 0.25, node.y - size * 0.25, size * 0.25, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();
    }

    // Label — appears when zoomed in enough
    if (globalScale > 1.6 || isSelect || isHover) {
      const fontSize = Math.max(3.5, 9 / globalScale);
      ctx.font       = `600 ${fontSize}px 'SF Mono', monospace`;
      const textW    = ctx.measureText(node.id).width;

      // label bg
      ctx.fillStyle  = "rgba(0,0,0,0.75)";
      ctx.beginPath();
      ctx.roundRect?.(
        node.x - textW / 2 - 2,
        node.y + size + 1,
        textW + 4, fontSize + 3, 2
      );
      ctx.fill();

      ctx.fillStyle  = node.suspicious ? risk.color : "#aeaeb2";
      ctx.textAlign  = "center";
      ctx.fillText(node.id, node.x, node.y + size + fontSize + 2);
      ctx.textAlign  = "start";
    }
  }, [hoveredNode, selectedNode, pulse]);

  // ── LINK DRAW (custom for clarity) ────────────────────────────────────────
  const drawLink = useCallback((link, ctx, globalScale) => {
    const sx = link.source?.x;
    const sy = link.source?.y;
    const tx = link.target?.x;
    const ty = link.target?.y;
    if (!isFinite(sx) || !isFinite(sy) || !isFinite(tx) || !isFinite(ty)) return;

    const ringCol = getRingColor(link.ring_id);
    const isSuspect = !!ringCol;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = isSuspect ? ringCol : "rgba(255,255,255,0.08)";
    ctx.lineWidth   = isSuspect ? (2.5 / globalScale) : (0.5 / globalScale);
    if (!isSuspect) ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // ─── PANEL STYLES ──────────────────────────────────────────────────────────
  const panelStyle = {
    background: "#111111",
    border: "1px solid #2c2c2e",
    borderRadius: 16,
    overflow: "hidden",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: "#f2f2f7",
  };

  const btnBase = {
    padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
    border: "1px solid #2c2c2e", cursor: "pointer", fontFamily: "inherit",
    transition: "all .15s",
    letterSpacing: "0.5px",
  };

  const activeBtnStyle = (isActive, color = "#0a84ff") => ({
    ...btnBase,
    background: isActive ? `${color}22` : "#1c1c1e",
    color: isActive ? color : "#636366",
    borderColor: isActive ? `${color}66` : "#2c2c2e",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#0a0a0a", padding: 16, borderRadius: 20 }}>

      {/* ── TOP STATS BAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
        <StatCard label="Total Accounts" value={stats.total}     accent="#0a84ff" />
        <StatCard label="High Risk"      value={stats.high}      accent="#ff2d55" />
        <StatCard label="Medium Risk"    value={stats.medium}    accent="#ff9500" />
        <StatCard label="Fraud Rings"    value={stats.rings}     accent="#bf5af2" />
        <StatCard label="Transactions"   value={stats.totalLinks} accent="#30d158" />
      </div>

      {/* ── CONTROLS ROW ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        background: "#111111", borderRadius: 12, padding: "10px 14px",
        border: "1px solid #2c2c2e",
      }}>
        {/* Search */}
        <input
          placeholder="Search account ID…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            background: "#1c1c1e", border: "1px solid #3a3a3c",
            borderRadius: 8, padding: "5px 10px", color: "#f2f2f7",
            fontSize: 11, fontFamily: "inherit", outline: "none", width: 160,
          }}
        />

        <div style={{ width: 1, height: 20, background: "#2c2c2e" }} />

        {/* Risk filter */}
        <span style={{ fontSize: 10, color: "#636366", marginRight: 2 }}>RISK</span>
        {["ALL", "HIGH", "MEDIUM", "LOW", "CLEAN"].map(r => (
          <button key={r}
            onClick={() => setFilterRisk(r)}
            style={activeBtnStyle(filterRisk === r,
              r === "HIGH" ? "#ff2d55" : r === "MEDIUM" ? "#ff9500" : r === "LOW" ? "#ffd60a" : r === "CLEAN" ? "#30d158" : "#0a84ff"
            )}
          >{r}</button>
        ))}

        <div style={{ width: 1, height: 20, background: "#2c2c2e" }} />

        {/* Suspicious toggle */}
        <button
          onClick={() => setShowOnlySuspicious(v => !v)}
          style={activeBtnStyle(showOnlySuspicious, "#ff2d55")}
        >⚠ SUSPICIOUS ONLY</button>

        {/* Reset */}
        <button
          onClick={() => { setFilterRing(null); setFilterRisk("ALL"); setShowOnlySuspicious(false); setSearchQuery(""); setSelectedNode(null); }}
          style={{ ...btnBase, background: "#1c1c1e", color: "#636366", marginLeft: "auto" }}
        >RESET</button>

        {/* Fit */}
        <button
          onClick={() => fgRef.current?.zoomToFit(400, 40)}
          style={{ ...btnBase, background: "#0a84ff22", color: "#0a84ff", borderColor: "#0a84ff44" }}
        >⊞ FIT VIEW</button>
      </div>

      {/* ── RING FILTER CHIPS ── */}
      {allRings.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 2 }}>
          <span style={{ fontSize: 10, color: "#636366", alignSelf: "center" }}>RINGS:</span>
          <button onClick={() => setFilterRing(null)} style={activeBtnStyle(!filterRing, "#bf5af2")}>ALL RINGS</button>
          {allRings.map(rid => {
            const c = getRingColor(rid);
            return (
              <button key={rid} onClick={() => setFilterRing(rid === filterRing ? null : rid)}
                style={activeBtnStyle(filterRing === rid, c)}
              >● {rid}</button>
            );
          })}
        </div>
      )}

      {/* ── MAIN GRAPH + SIDEBAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>

        {/* GRAPH */}
        <div style={{ ...panelStyle, height: 580, position: "relative" }}>

          {/* Legend overlay */}
          <div style={{
            position: "absolute", left: 12, top: 12, zIndex: 10,
            background: "#111111dd", border: "1px solid #2c2c2e",
            borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: 9, color: "#636366", marginBottom: 6, letterSpacing: 1, fontWeight: 700 }}>LEGEND</div>
            <LegendPill color="#ff2d55" label="HIGH RISK (≥40)" />
            <LegendPill color="#ff9500" label="MEDIUM RISK (≥25)" />
            <LegendPill color="#ffd60a" label="LOW RISK (>0)" />
            <LegendPill color="#30d158" label="CLEAN ACCOUNT" />
            <div style={{ marginTop: 8, borderTop: "1px solid #2c2c2e", paddingTop: 8 }}>
              <div style={{ fontSize: 9, color: "#636366", marginBottom: 5, letterSpacing: 1, fontWeight: 700 }}>LINKS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: 24, height: 2, background: "rgba(255,255,255,0.12)" }} />
                <span style={{ fontSize: 10, color: "#636366" }}>Transaction</span>
              </div>
              {allRings.slice(0, 5).map(rid => (
                <div key={rid} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 24, height: 2, background: getRingColor(rid) }} />
                  <span style={{ fontSize: 10, color: "#aeaeb2" }}>Ring: {rid}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, borderTop: "1px solid #2c2c2e", paddingTop: 8 }}>
              <div style={{ fontSize: 9, color: "#636366", marginBottom: 4, letterSpacing: 1 }}>INTERACTION</div>
              <div style={{ fontSize: 10, color: "#636366", lineHeight: 1.7 }}>
                🖱 Hover → tooltip<br/>
                🖱 Click → lock detail<br/>
                🖱 Scroll → zoom<br/>
                🖱 Drag → pan / move nodes
              </div>
            </div>
          </div>

          {/* Live filter badge */}
          {(filterRing || filterRisk !== "ALL" || showOnlySuspicious || searchQuery) && (
            <div style={{
              position: "absolute", right: 12, top: 12, zIndex: 10,
              background: "#ff2d5522", border: "1px solid #ff2d5566",
              borderRadius: 8, padding: "5px 10px", fontSize: 10, color: "#ff2d55",
            }}>
              FILTER ACTIVE — {filteredGraph.nodes.length} / {enrichedNodes.length} nodes
            </div>
          )}

          <ForceGraph2D
            ref={fgRef}
            graphData={filteredGraph}
            cooldownTicks={120}
            d3VelocityDecay={0.4}
            d3AlphaDecay={0.025}
            warmupTicks={30}
            nodeRelSize={1}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={0.88}
            linkDirectionalArrowColor={link => getRingColor(link.ring_id) || "rgba(255,255,255,0.2)"}
            linkDirectionalParticles={link => link.ring_id ? 2 : 0}
            linkDirectionalParticleWidth={link => link.ring_id ? 1.5 : 0}
            linkDirectionalParticleColor={link => getRingColor(link.ring_id) || "#ffffff"}
            linkDirectionalParticleSpeed={0.006}
            linkWidth={link => link.ring_id ? 2 : 0.4}
            linkColor={link => getRingColor(link.ring_id) || "rgba(255,255,255,0.07)"}
            linkCurvature={link => link.ring_id ? 0.2 : 0}
            nodeCanvasObject={drawNode}
            nodeCanvasObjectMode={() => "replace"}
            nodeLabel={() => ""}    // We use custom tooltip below
            backgroundColor="#0d0d0d"
            onNodeHover={node => setHoveredNode(node || null)}
            onNodeClick={node => setSelectedNode(prev => prev?.id === node?.id ? null : node)}
            onEngineStop={() => {
              if (!fgRef.current?._centered) {
                fgRef.current._centered = true;
                fgRef.current.zoomToFit(600, 50);
              }
            }}
          />

          {/* HOVER TOOLTIP */}
          {hoveredNode && !selectedNode && (
            <NodeTooltip node={hoveredNode} pos="hover" onClose={() => setHoveredNode(null)} />
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* SELECTED / LOCKED PANEL */}
          {selectedNode ? (
            <div style={{ ...panelStyle, padding: 16, flex: "0 0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#636366", letterSpacing: 1, marginBottom: 3 }}>LOCKED — ACCOUNT DETAIL</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selectedNode.riskLevel.color }}>{selectedNode.id}</div>
                </div>
                <button onClick={() => setSelectedNode(null)}
                  style={{ ...btnBase, background: "#2c2c2e", color: "#8e8e93" }}>✕ CLOSE</button>
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 99,
                background: `${selectedNode.riskLevel.color}22`,
                border: `1px solid ${selectedNode.riskLevel.color}55`,
                fontSize: 10, fontWeight: 700, color: selectedNode.riskLevel.color,
                marginBottom: 10,
              }}>
                <span>●</span> {selectedNode.riskLevel.label}
              </div>

              <ScoreBar score={selectedNode.suspicion_score} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
                <div style={{ background: "#1c1c1e", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: "#636366", marginBottom: 2 }}>FRAUD RING</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selectedNode.ringColor || "#636366" }}>
                    {selectedNode.ring_id || "NONE"}
                  </div>
                </div>
                <div style={{ background: "#1c1c1e", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: "#636366", marginBottom: 2 }}>STATUS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selectedNode.suspicious ? "#ff2d55" : "#30d158" }}>
                    {selectedNode.suspicious ? "SUSPICIOUS" : "CLEAN"}
                  </div>
                </div>
              </div>

              {selectedNode.detected_patterns.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 9, color: "#636366", letterSpacing: 1, marginBottom: 6 }}>DETECTED PATTERNS</div>
                  <div>
                    {selectedNode.detected_patterns.map((p, i) => <PatternTag key={i} label={p} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...panelStyle, padding: 16, flex: "0 0 auto", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#3a3a3c", marginBottom: 6 }}>ACCOUNT DETAIL</div>
              <div style={{ fontSize: 12, color: "#3a3a3c" }}>Click any node to lock its details here</div>
            </div>
          )}

          {/* NODE LIST */}
          <div style={{ ...panelStyle, padding: 14, flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 9, color: "#636366", letterSpacing: 1, marginBottom: 10, fontWeight: 700 }}>
              NODE EXPLORER — {filteredGraph.nodes.length} VISIBLE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredGraph.nodes
                .sort((a, b) => b.suspicion_score - a.suspicion_score)
                .map(n => {
                  const isSelected = selectedNode?.id === n.id;
                  const c = n.ringColor || n.riskLevel.color;
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNode(prev => prev?.id === n.id ? null : n)}
                      onMouseEnter={() => setHoveredNode(n)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${isSelected ? c : "#2c2c2e"}`,
                        background: isSelected ? `${c}18` : "#1c1c1e",
                        transition: "all .12s",
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: c,
                        boxShadow: n.suspicious ? `0 0 5px ${c}` : "none",
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, color: isSelected ? c : "#aeaeb2", fontWeight: isSelected ? 700 : 400, flex: 1 }}>
                        {n.id}
                      </span>
                      {n.suspicion_score > 0 && (
                        <span style={{ fontSize: 10, color: c, fontWeight: 700 }}>{n.suspicion_score}</span>
                      )}
                      {n.ring_id && (
                        <span style={{
                          fontSize: 8, padding: "1px 5px", borderRadius: 99,
                          background: `${c}22`, color: c, border: `1px solid ${c}44`,
                        }}>{n.ring_id}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NODE TOOLTIP ─────────────────────────────────────────────────────────────
function NodeTooltip({ node }) {
  if (!node) return null;
  const risk = node.riskLevel;
  const c    = node.ringColor || risk.color;

  return (
    <div style={{
      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
      zIndex: 50, width: 240,
      background: "#111111ee", border: `1px solid ${c}55`,
      borderRadius: 12, padding: 14, backdropFilter: "blur(12px)",
      boxShadow: `0 8px 40px ${c}22, 0 0 0 1px #2c2c2e`,
      fontFamily: "'SF Mono', monospace",
      pointerEvents: "none",
      transition: "opacity .15s",
    }}>
      <div style={{ fontSize: 9, color: "#636366", letterSpacing: 1, marginBottom: 4 }}>HOVER — ACCOUNT</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: c, marginBottom: 6 }}>{node.id}</div>

      <div style={{
        display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 8px",
        borderRadius: 99, fontSize: 9, fontWeight: 700, color: c,
        background: `${c}22`, border: `1px solid ${c}44`, marginBottom: 10,
      }}>
        ● {risk.label}
      </div>

      <ScoreBar score={node.suspicion_score} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
        <div style={{ background: "#1c1c1e", borderRadius: 6, padding: "6px 8px" }}>
          <div style={{ fontSize: 8, color: "#636366" }}>RING</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: node.ringColor || "#636366", marginTop: 1 }}>
            {node.ring_id || "NONE"}
          </div>
        </div>
        <div style={{ background: "#1c1c1e", borderRadius: 6, padding: "6px 8px" }}>
          <div style={{ fontSize: 8, color: "#636366" }}>STATUS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: node.suspicious ? "#ff2d55" : "#30d158", marginTop: 1 }}>
            {node.suspicious ? "SUSPICIOUS" : "CLEAN"}
          </div>
        </div>
      </div>

      {node.detected_patterns.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 8, color: "#636366", letterSpacing: 1, marginBottom: 4 }}>PATTERNS</div>
          <div>{node.detected_patterns.map((p, i) => <PatternTag key={i} label={p} />)}</div>
        </div>
      )}
    </div>
  );
}