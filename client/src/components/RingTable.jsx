// ============================
// RingVisualizer.jsx — RIFT ULTRA
// Fraud Ring Intelligence — Judge-Ready
// Shows WHAT each ring is, HOW it works, WHY it's flagged
// ============================

import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const RING_COLORS = [
  "#ff2d55","#bf5af2","#0a84ff","#ff9f0a",
  "#5e5ce6","#32ade6","#30d158","#ff6b35",
  "#ac8e68","#ff375f","#64d2ff","#ffd60a",
];

const getRingColor = (ring_id) => {
  const idx = parseInt(String(ring_id || "0").replace(/\D/g,""),10) || 0;
  return RING_COLORS[idx % RING_COLORS.length];
};

const getSeverity = (score) => {
  if (score >= 40) return { label:"CRITICAL", color:"#ff2d55", bg:"#ff2d5515", tier:4 };
  if (score >= 30) return { label:"HIGH",     color:"#ff9500", bg:"#ff950015", tier:3 };
  if (score >= 20) return { label:"MEDIUM",   color:"#ffd60a", bg:"#ffd60a15", tier:2 };
  return               { label:"LOW",      color:"#30d158", bg:"#30d15815", tier:1 };
};

// ─── PATTERN EXPLANATION MAP ──────────────────────────────────────────────────
// Judges need to understand WHAT each pattern means
const PATTERN_EXPLAIN = {
  cycle_length_5:   { icon:"↺", short:"5-hop cycle",    what:"5 accounts form a closed loop — money exits where it entered, laundered", why:"Circular flow hides origin; short cycles are harder to detect than long ones" },
  cycle_length_3:   { icon:"△", short:"3-hop triangle",  what:"3 accounts rapidly cycle funds in a tight triangle formation", why:"Fastest known laundering pattern — money completes loop in 3 transactions" },
  cycle_length_4:   { icon:"◇", short:"4-hop square",    what:"4-node quadrilateral flow creating a closed money loop", why:"Balances speed and obscurity — common in automated mule networks" },
  layered_depth:    { icon:"⊕", short:"Layered depth",   what:"Funds pass through multiple intermediate accounts before reaching destination", why:"Each layer adds plausible deniability; depth > 3 is a strong laundering signal" },
  fan_out:          { icon:"⊢", short:"Fan-out burst",   what:"Single source rapidly distributes to many receivers simultaneously", why:"Splits large sums to stay under reporting thresholds (smurfing)" },
  fan_in:           { icon:"⊣", short:"Fan-in collect",  what:"Many senders converge funds into a single collector account", why:"Consolidation phase — money is aggregated before final withdrawal" },
  rapid_cycling:    { icon:"⚡", short:"Rapid cycling",   what:"High transaction velocity — multiple round trips in short time window", why:"Speed indicates automation; human mules rarely transact this fast" },
  structuring:      { icon:"⧖", short:"Structuring",     what:"Transactions deliberately kept just below reporting thresholds", why:"Classic smurfing — exploits reporting gaps in financial regulations" },
  default:          { icon:"◈", short:"Complex pattern",  what:"Multi-indicator anomaly not matching a single known template", why:"AI flagged statistical deviation from baseline network behaviour" },
};

const getPattern = (pt) => PATTERN_EXPLAIN[pt] || { ...PATTERN_EXPLAIN.default, short: pt };

// ─── ANIMATED RING CIRCLE ────────────────────────────────────────────────────
const RingOrb = ({ ring, isSelected, isHovered, onClick, onEnter, onLeave, index }) => {
  const color = getRingColor(ring.ring_id);
  const sev   = getSeverity(ring.risk_score);
  const size  = 88 + Math.min(ring.member_count, 20) * 2; // bigger = more members
  const pat   = getPattern(ring.pattern_type);

  return (
    <div
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        cursor:"pointer",
        animation:`fadeSlideIn 0.4s ease both`,
        animationDelay:`${index * 60}ms`,
      }}
    >
      {/* outer pulse ring */}
      <div style={{ position:"relative", width:size+24, height:size+24, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {/* pulse animation ring */}
        {(isHovered || isSelected) && (
          <div style={{
            position:"absolute", inset:0, borderRadius:"50%",
            border:`2px solid ${color}`,
            animation:"pulseRing 1.2s ease-out infinite",
            opacity:0.6,
          }}/>
        )}
        {/* severity glow */}
        <div style={{
          position:"absolute", inset:6, borderRadius:"50%",
          boxShadow: isHovered || isSelected
            ? `0 0 30px ${color}70, 0 0 60px ${color}30`
            : sev.tier >= 4 ? `0 0 16px ${color}40` : "none",
          transition:"box-shadow 0.3s ease",
        }}/>

        {/* main circle */}
        <div style={{
          width:size, height:size, borderRadius:"50%",
          background: isSelected
            ? `radial-gradient(circle at 35% 35%, ${color}44, ${color}18)`
            : `radial-gradient(circle at 35% 35%, ${color}28, #1a1a1a)`,
          border:`2px solid ${isHovered||isSelected ? color : color+"60"}`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:3, position:"relative", overflow:"hidden",
          transition:"all 0.2s ease",
          transform: isSelected ? "scale(1.08)" : isHovered ? "scale(1.05)" : "scale(1)",
        }}>
          {/* subtle grid lines inside */}
          <div style={{
            position:"absolute", inset:0, borderRadius:"50%",
            backgroundImage:`repeating-linear-gradient(0deg,${color}08 0px,transparent 1px,transparent 12px),repeating-linear-gradient(90deg,${color}08 0px,transparent 1px,transparent 12px)`,
          }}/>

          {/* pattern icon */}
          <span style={{ fontSize:18, position:"relative", zIndex:1 }}>{pat.icon}</span>

          {/* ring id */}
          <span style={{
            fontSize:9, fontWeight:900, color, letterSpacing:1,
            fontFamily:"monospace", position:"relative", zIndex:1,
            textAlign:"center", lineHeight:1.2, padding:"0 6px",
          }}>{ring.ring_id}</span>

          {/* score */}
          <span style={{
            fontSize:11, fontWeight:900,
            color: sev.color, fontFamily:"monospace",
            position:"relative", zIndex:1,
          }}>{ring.risk_score}</span>
        </div>

        {/* severity badge top-right */}
        <div style={{
          position:"absolute", top:4, right:4,
          padding:"2px 6px", borderRadius:99,
          fontSize:7, fontWeight:900, letterSpacing:0.8,
          background: sev.bg, color: sev.color,
          border:`1px solid ${sev.color}50`,
          fontFamily:"monospace",
        }}>{sev.label}</div>

        {/* member count badge bottom */}
        <div style={{
          position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)",
          padding:"2px 7px", borderRadius:99,
          fontSize:8, fontWeight:700, letterSpacing:0.5,
          background:"#1c1c1e", color:"#aeaeb2",
          border:"1px solid #3a3a3c",
          fontFamily:"monospace", whiteSpace:"nowrap",
        }}>{ring.member_count} accts</div>
      </div>

      {/* label below */}
      <div style={{ marginTop:6, textAlign:"center" }}>
        <div style={{ fontSize:9, fontWeight:700, color, fontFamily:"monospace", letterSpacing:0.5 }}>
          {pat.short}
        </div>
      </div>
    </div>
  );
};

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
const DetailPanel = ({ ring, onClose }) => {
  const color = getRingColor(ring.ring_id);
  const sev   = getSeverity(ring.risk_score);
  const pat   = getPattern(ring.pattern_type);
  const members = ring.member_accounts || ring.members || [];

  return (
    <div style={{
      background:"#0f0f0f",
      border:`1px solid ${color}50`,
      borderRadius:16,
      overflow:"hidden",
      fontFamily:"'SF Mono','Fira Code',monospace",
      boxShadow:`0 20px 60px ${color}20, 0 0 0 1px #2c2c2e`,
      animation:"slideInRight 0.25s cubic-bezier(.4,0,.2,1)",
    }}>

      {/* header accent bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${color},${color}00)` }}/>

      <div style={{ padding:"18px 20px" }}>

        {/* title row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:8, color:"#636366", letterSpacing:2, marginBottom:4 }}>RING INTELLIGENCE REPORT</div>
            <div style={{ fontSize:20, fontWeight:900, color, lineHeight:1 }}>{ring.ring_id}</div>
          </div>
          <button onClick={onClose} style={{
            width:24, height:24, borderRadius:6, border:"1px solid #3a3a3c",
            background:"#1c1c1e", color:"#636366", cursor:"pointer",
            fontSize:12, display:"flex", alignItems:"center", justifyContent:"center",
          }}>✕</button>
        </div>

        {/* severity + score row */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <div style={{
            flex:1, padding:"10px 14px", borderRadius:10,
            background: sev.bg, border:`1px solid ${sev.color}40`,
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          }}>
            <span style={{ fontSize:22, fontWeight:900, color:sev.color }}>{ring.risk_score}</span>
            <span style={{ fontSize:8, color:"#636366", letterSpacing:1 }}>RISK SCORE</span>
          </div>
          <div style={{
            flex:1, padding:"10px 14px", borderRadius:10,
            background:`${color}12`, border:`1px solid ${color}30`,
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          }}>
            <span style={{ fontSize:22, fontWeight:900, color }}>{members.length}</span>
            <span style={{ fontSize:8, color:"#636366", letterSpacing:1 }}>MEMBERS</span>
          </div>
          <div style={{
            flex:1, padding:"10px 14px", borderRadius:10,
            background:"#1c1c1e", border:"1px solid #2c2c2e",
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          }}>
            <span style={{ fontSize:18, fontWeight:900, color:"#f2f2f7" }}>{pat.icon}</span>
            <span style={{ fontSize:8, color:"#636366", letterSpacing:1 }}>PATTERN</span>
          </div>
        </div>

        {/* WHAT IS THIS RING — explain for judges */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, color:"#636366", letterSpacing:2, marginBottom:6, paddingBottom:4, borderBottom:"1px solid #2c2c2e" }}>
            ◈ WHAT IS THIS RING?
          </div>
          <p style={{ fontSize:10, color:"#c7c7cc", lineHeight:1.7, margin:0 }}>
            A <strong style={{ color }}>{ring.ring_id}</strong> is a coordinated group of{" "}
            <strong style={{ color:"#f2f2f7" }}>{members.length} accounts</strong> that form a{" "}
            <strong style={{ color }}>{pat.short}</strong>. These accounts are connected through
            structured money transfers designed to obscure the origin and destination of funds.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, color:"#636366", letterSpacing:2, marginBottom:6, paddingBottom:4, borderBottom:"1px solid #2c2c2e" }}>
            ⚙ HOW IT WORKS
          </div>
          <div style={{
            padding:"10px 14px", borderRadius:8,
            background:`${color}0c`, border:`1px solid ${color}25`,
          }}>
            <p style={{ fontSize:10, color:"#c7c7cc", lineHeight:1.7, margin:0 }}>
              {pat.what}
            </p>
          </div>
        </div>

        {/* WHY FLAGGED */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, color:"#636366", letterSpacing:2, marginBottom:6, paddingBottom:4, borderBottom:"1px solid #2c2c2e" }}>
            ⚠ WHY AI FLAGGED THIS
          </div>
          <div style={{
            padding:"10px 14px", borderRadius:8,
            background:"#ff2d5508", border:"1px solid #ff2d5530",
            display:"flex", gap:10, alignItems:"flex-start",
          }}>
            <span style={{ fontSize:14, flexShrink:0 }}>🚩</span>
            <p style={{ fontSize:10, color:"#c7c7cc", lineHeight:1.7, margin:0 }}>
              {pat.why}
            </p>
          </div>
        </div>

        {/* pattern type */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, color:"#636366", letterSpacing:2, marginBottom:6 }}>DETECTED PATTERN</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{
              padding:"4px 12px", borderRadius:99, fontSize:10, fontWeight:700,
              background:`${color}18`, color, border:`1px solid ${color}45`,
            }}>{pat.icon} {ring.pattern_type || "complex_pattern"}</span>
            <span style={{ fontSize:9, color:"#636366" }}>{pat.short}</span>
          </div>
        </div>

        {/* member accounts */}
        <div>
          <div style={{ fontSize:8, color:"#636366", letterSpacing:2, marginBottom:6 }}>
            MEMBER ACCOUNT IDs ({members.length})
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, maxHeight:120, overflowY:"auto" }}>
            {members.map((m, i) => (
              <span key={i} style={{
                padding:"3px 8px", borderRadius:6, fontSize:9, fontWeight:600,
                background:`${color}15`, color, border:`1px solid ${color}35`,
                fontFamily:"monospace",
              }}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function RingVisualizer({ rings }) {
  const [hovered,  setHovered]  = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("ALL");

  if (!rings?.length) return (
    <div style={{ background:"#111", border:"1px solid #2c2c2e", borderRadius:16, padding:40, textAlign:"center", color:"#3a3a3c", fontFamily:"monospace", fontSize:12 }}>
      No fraud rings detected
    </div>
  );

  const sorted = [...rings].sort((a,b) => b.risk_score - a.risk_score);

  const filtered = sorted.filter(r => {
    if (filter === "ALL") return true;
    return getSeverity(r.risk_score).label === filter;
  });

  const critical = rings.filter(r => r.risk_score >= 40).length;
  const high     = rings.filter(r => r.risk_score >= 30 && r.risk_score < 40).length;

  const handleClick = (r) => setSelected(prev => prev?.ring_id === r.ring_id ? null : r);

  return (
    <div style={{
      background:"#0d0d0d", border:"1px solid #2c2c2e", borderRadius:20,
      overflow:"hidden", fontFamily:"'SF Mono','Fira Code',monospace", color:"#f2f2f7",
    }}>
      <style>{`
        @keyframes pulseRing {
          0%   { transform:scale(1);   opacity:0.7; }
          100% { transform:scale(1.6); opacity:0; }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:#1c1c1e; }
        ::-webkit-scrollbar-thumb { background:#3a3a3c; border-radius:2px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding:"20px 24px 0", borderBottom:"1px solid #2c2c2e" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:8, color:"#636366", letterSpacing:3, marginBottom:4 }}>RIFT · FRAUD DETECTION ENGINE</div>
            <h2 style={{ fontSize:16, fontWeight:900, margin:0, letterSpacing:2, color:"#f2f2f7" }}>
              FRAUD RING INTELLIGENCE
            </h2>
            <p style={{ fontSize:10, color:"#636366", margin:"6px 0 0", lineHeight:1.6 }}>
              Each circle = one coordinated mule ring. Size = member count. Score = AI risk rating.
              <br/>Click any ring to see exactly what it is and why it was flagged.
            </p>
          </div>
          {/* live counters */}
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <div style={{ padding:"8px 14px", borderRadius:10, background:"#ff2d5515", border:"1px solid #ff2d5530", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#ff2d55", lineHeight:1 }}>{critical}</div>
              <div style={{ fontSize:8, color:"#636366", marginTop:2 }}>CRITICAL</div>
            </div>
            <div style={{ padding:"8px 14px", borderRadius:10, background:"#ff950015", border:"1px solid #ff950030", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#ff9500", lineHeight:1 }}>{high}</div>
              <div style={{ fontSize:8, color:"#636366", marginTop:2 }}>HIGH</div>
            </div>
            <div style={{ padding:"8px 14px", borderRadius:10, background:"#bf5af215", border:"1px solid #bf5af230", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#bf5af2", lineHeight:1 }}>{rings.length}</div>
              <div style={{ fontSize:8, color:"#636366", marginTop:2 }}>TOTAL</div>
            </div>
          </div>
        </div>

        {/* filter tabs */}
        <div style={{ display:"flex", gap:6, paddingBottom:14 }}>
          {[
            { k:"ALL",      label:`All Rings (${rings.length})`,  color:"#0a84ff" },
            { k:"CRITICAL", label:`Critical (${critical})`,        color:"#ff2d55" },
            { k:"HIGH",     label:`High (${high})`,                color:"#ff9500" },
            { k:"MEDIUM",   label:`Medium`,                        color:"#ffd60a" },
          ].map(({ k, label, color }) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding:"5px 12px", borderRadius:8, fontSize:9, fontWeight:700,
              fontFamily:"monospace", letterSpacing:0.5, cursor:"pointer",
              border:`1px solid ${filter===k ? color : "#2c2c2e"}`,
              background: filter===k ? `${color}22` : "#1c1c1e",
              color: filter===k ? color : "#636366",
              transition:"all .15s",
            }}>{label}</button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:9, color:"#636366", alignSelf:"center" }}>
            {filtered.length} rings shown · hover = preview · click = full detail
          </span>
        </div>
      </div>

      {/* ── HOW TO READ THIS ── tiny explainer for judges */}
      <div style={{
        margin:"14px 24px 0",
        padding:"10px 16px", borderRadius:10,
        background:"#0a84ff0c", border:"1px solid #0a84ff25",
        display:"flex", gap:16, flexWrap:"wrap",
      }}>
        {[
          { icon:"⬤ Size",   desc:"Larger circle = more member accounts in the ring" },
          { icon:"⬤ Score",  desc:"Number inside = AI suspicion score (0–100)" },
          { icon:"⬤ Color",  desc:"Each ring gets a unique color for identification" },
          { icon:"⬤ Badge",  desc:"CRITICAL/HIGH badge = severity of money laundering risk" },
        ].map((h,i)=>(
          <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:10, color:"#0a84ff", fontWeight:700 }}>{h.icon}</span>
            <span style={{ fontSize:9, color:"#636366" }}>{h.desc}</span>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID + DETAIL PANEL ── */}
      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap:0, transition:"grid-template-columns 0.3s ease" }}>

        {/* Ring Orbs Grid */}
        <div style={{ padding:"24px", overflowY:"auto", maxHeight:560 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", color:"#3a3a3c", fontSize:12, padding:40 }}>No rings match filter</div>
          ) : (
            <div style={{
              display:"grid",
              gridTemplateColumns:`repeat(auto-fill, minmax(140px, 1fr))`,
              gap:"28px 20px",
              justifyItems:"center",
            }}>
              {filtered.map((r, i) => (
                <RingOrb
                  key={r.ring_id}
                  ring={r}
                  index={i}
                  isSelected={selected?.ring_id === r.ring_id}
                  isHovered={hovered?.ring_id === r.ring_id}
                  onClick={() => handleClick(r)}
                  onEnter={() => setHovered(r)}
                  onLeave={() => setHovered(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ borderLeft:"1px solid #2c2c2e", padding:16, overflowY:"auto", maxHeight:560 }}>
            <DetailPanel ring={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>

      {/* ── HOVER QUICK PREVIEW (when nothing selected) ── */}
      {hovered && !selected && (
        <div style={{
          margin:"0 24px 16px",
          padding:"12px 16px", borderRadius:10,
          background:`${getRingColor(hovered.ring_id)}12`,
          border:`1px solid ${getRingColor(hovered.ring_id)}35`,
          display:"flex", gap:20, alignItems:"center",
          animation:"fadeSlideIn 0.15s ease",
        }}>
          <span style={{ fontSize:22 }}>{getPattern(hovered.pattern_type).icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", gap:8, alignItems:"baseline", marginBottom:3 }}>
              <span style={{ fontSize:13, fontWeight:900, color:getRingColor(hovered.ring_id) }}>{hovered.ring_id}</span>
              <span style={{ fontSize:9, color:getSeverity(hovered.risk_score).color, fontWeight:700 }}>
                {getSeverity(hovered.risk_score).label}
              </span>
              <span style={{ fontSize:9, color:"#636366" }}>score: {hovered.risk_score}</span>
            </div>
            <p style={{ fontSize:10, color:"#aeaeb2", margin:0, lineHeight:1.5 }}>
              {getPattern(hovered.pattern_type).what}
            </p>
          </div>
          <div style={{
            padding:"6px 12px", borderRadius:8, fontSize:9, fontWeight:700,
            background:"#1c1c1e", color:"#636366", border:"1px solid #2c2c2e",
            cursor:"pointer", whiteSpace:"nowrap",
          }} onClick={() => setSelected(hovered)}>
            Click for full detail →
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        padding:"10px 24px", borderTop:"1px solid #2c2c2e",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{ display:"flex", gap:5, flex:1 }}>
          {rings.slice(0,20).map(r => (
            <div key={r.ring_id} title={r.ring_id} style={{
              width:7, height:7, borderRadius:"50%",
              background:getRingColor(r.ring_id),
              boxShadow:`0 0 4px ${getRingColor(r.ring_id)}`,
              cursor:"pointer",
              opacity: selected?.ring_id === r.ring_id ? 1 : 0.5,
              transition:"opacity .15s",
            }} onClick={() => setSelected(r)}/>
          ))}
          {rings.length > 20 && <span style={{ fontSize:8, color:"#636366", alignSelf:"center" }}>+{rings.length-20}</span>}
        </div>
        <span style={{ fontSize:9, color:"#636366" }}>
          Total suspicious transactions routed through rings: <strong style={{ color:"#f2f2f7" }}>{rings.reduce((s,r)=>(s + (r.member_accounts?.length||r.members?.length||r.member_count||0)),0)}</strong> accounts
        </span>
      </div>
    </div>
  );
}