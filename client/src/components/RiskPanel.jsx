// ============================
// RiskPanel.jsx — FRAUD RING SUMMARY TABLE
// Right panel: shows ONLY ring-level aggregated data
// NOT an account list (that's already in GraphView)
// ============================

import { useMemo, useState } from "react";

const RING_COLORS = [
  "#ff2d55","#bf5af2","#0a84ff","#ff9f0a",
  "#5e5ce6","#32ade6","#30d158","#ff6b35",
  "#ac8e68","#ff375f","#64d2ff","#ffd60a",
];

const getRingColor = (ring_id) => {
  if (!ring_id) return "#636366";
  const idx = parseInt(String(ring_id).replace(/\D/g, ""), 10) || 0;
  return RING_COLORS[idx % RING_COLORS.length];
};

const getSeverity = (score) => {
  if (score >= 40) return { label: "CRITICAL", color: "#ff2d55", bg: "#ff2d5518" };
  if (score >= 25) return { label: "HIGH",     color: "#ff9500", bg: "#ff950018" };
  if (score > 0)   return { label: "MEDIUM",   color: "#ffd60a", bg: "#ffd60a18" };
  return               { label: "LOW",      color: "#30d158", bg: "#30d15818" };
};

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────

const SeverityBadge = ({ score }) => {
  const s = getSeverity(score);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 9px", borderRadius:99,
      fontSize:9, fontWeight:800, letterSpacing:1,
      fontFamily:"monospace",
      background:s.bg, color:s.color,
      border:`1px solid ${s.color}50`,
    }}>● {s.label}</span>
  );
};

const MiniBar = ({ score }) => {
  const s = getSeverity(score);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ width:72, height:5, borderRadius:3, background:"#2c2c2e", overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${Math.min(100,score)}%`, borderRadius:3,
          background:`linear-gradient(90deg,${s.color}66,${s.color})`,
        }}/>
      </div>
      <span style={{ fontSize:12, fontWeight:900, color:s.color, fontFamily:"monospace" }}>{score}</span>
    </div>
  );
};

const PatternTag = ({ label, color }) => (
  <span style={{
    display:"inline-block", padding:"2px 7px", borderRadius:6,
    fontSize:9, fontWeight:700,
    background:`${color}18`, color,
    border:`1px solid ${color}40`,
    fontFamily:"monospace",
    margin:"2px 2px 0 0", whiteSpace:"nowrap",
  }}>{label}</span>
);

const MemberChips = ({ members, color, expanded, onToggle }) => {
  const PREVIEW = 3;
  const show = expanded ? members : members.slice(0, PREVIEW);
  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
        {show.map((id,i) => (
          <span key={i} style={{
            padding:"2px 7px", borderRadius:6, fontSize:9, fontWeight:600,
            background:`${color}15`, color, border:`1px solid ${color}35`,
            fontFamily:"monospace",
          }}>{id}</span>
        ))}
        {!expanded && members.length > PREVIEW && (
          <button onClick={onToggle} style={{
            padding:"2px 8px", borderRadius:6, fontSize:9, fontWeight:700,
            background:"#2c2c2e", color:"#aeaeb2", border:"1px solid #3a3a3c",
            cursor:"pointer", fontFamily:"monospace",
          }}>+{members.length - PREVIEW} ▾</button>
        )}
      </div>
      {expanded && members.length > PREVIEW && (
        <button onClick={onToggle} style={{
          marginTop:4, padding:"2px 8px", borderRadius:6, fontSize:9,
          background:"#2c2c2e", color:"#aeaeb2", border:"1px solid #3a3a3c",
          cursor:"pointer", fontFamily:"monospace",
        }}>▴ collapse</button>
      )}
    </div>
  );
};

const StatPill = ({ label, value, color }) => (
  <div style={{
    flex:1, display:"flex", flexDirection:"column", alignItems:"center",
    padding:"10px 8px",
    background:`${color}12`, border:`1px solid ${color}30`, borderRadius:10,
    position:"relative", overflow:"hidden",
  }}>
    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${color},${color}00)` }}/>
    <span style={{ fontSize:22, fontWeight:900, color, fontFamily:"monospace", lineHeight:1 }}>{value}</span>
    <span style={{ fontSize:8, color:"#636366", marginTop:4, letterSpacing:1, textTransform:"uppercase", textAlign:"center" }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function RiskPanel({ accounts }) {
  const [expandedRing, setExpandedRing] = useState(null);
  const [sortKey,      setSortKey]      = useState("max_score");
  const [sortDir,      setSortDir]      = useState("desc");
  const [search,       setSearch]       = useState("");
  const [filterSev,    setFilterSev]    = useState("ALL");

  // ── BUILD RINGS FROM ACCOUNTS DATA ───────────────────────────────────────
  const rings = useMemo(() => {
    if (!accounts?.length) return [];
    const map = new Map();
    accounts.forEach(a => {
      if (!a.ring_id) return;
      if (!map.has(a.ring_id))
        map.set(a.ring_id, { ring_id: a.ring_id, members:[], patterns: new Set(), scores:[] });
      const r = map.get(a.ring_id);
      r.members.push(a.account_id);
      r.scores.push(a.suspicion_score || 0);
      (a.detected_patterns || []).forEach(p => r.patterns.add(p));
    });
    return Array.from(map.values()).map(r => ({
      ring_id:      r.ring_id,
      patterns:     Array.from(r.patterns),
      member_count: r.members.length,
      members:      r.members,
      avg_score:    Math.round(r.scores.reduce((a,b)=>a+b,0) / r.scores.length),
      max_score:    Math.max(...r.scores),
      color:        getRingColor(r.ring_id),
    }));
  }, [accounts]);

  // ── STATS ─────────────────────────────────────────────────────────────────
  const criticalCount = rings.filter(r => r.max_score >= 40).length;
  const highCount     = rings.filter(r => r.max_score >= 25 && r.max_score < 40).length;
  const totalMembers  = rings.reduce((s,r) => s + r.member_count, 0);
  const avgScore      = rings.length ? Math.round(rings.reduce((s,r)=>s+r.avg_score,0)/rings.length) : 0;

  // ── FILTER + SORT ─────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let arr = [...rings];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(r =>
        r.ring_id.toLowerCase().includes(q) ||
        r.members.some(m => m.toLowerCase().includes(q)) ||
        r.patterns.some(p => p.toLowerCase().includes(q))
      );
    }
    if (filterSev !== "ALL")
      arr = arr.filter(r => getSeverity(r.max_score).label === filterSev);

    arr.sort((a,b) => {
      const va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (vb > va ? 1 : -1);
    });
    return arr;
  }, [rings, search, filterSev, sortKey, sortDir]);

  const handleSort = (k) => {
    if (k === sortKey) setSortDir(d => d==="desc"?"asc":"desc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  if (!accounts?.length) return (
    <div style={{ ...wrap, alignItems:"center", justifyContent:"center", minHeight:300 }}>
      <span style={{ color:"#3a3a3c", fontSize:12, fontFamily:"monospace" }}>No data</span>
    </div>
  );

  const SevBtn = ({ s, color }) => (
    <button onClick={() => setFilterSev(s)} style={{
      padding:"4px 10px", borderRadius:6, fontSize:9, fontWeight:700,
      fontFamily:"monospace", letterSpacing:0.5, cursor:"pointer",
      border:`1px solid ${filterSev===s ? color : "#2c2c2e"}`,
      background: filterSev===s ? `${color}22` : "#1c1c1e",
      color: filterSev===s ? color : "#636366",
      transition:"all .12s",
    }}>{s}</button>
  );

  const ColH = ({ k, label, right }) => {
    const active = sortKey === k;
    return (
      <th onClick={()=>handleSort(k)} style={{
        padding:"10px 14px", textAlign: right?"right":"left",
        fontSize:9, fontWeight:700, letterSpacing:1.2,
        color: active ? "#0a84ff" : "#636366",
        cursor:"pointer", userSelect:"none",
        borderBottom:`2px solid ${active?"#0a84ff":"#2c2c2e"}`,
        whiteSpace:"nowrap", fontFamily:"monospace",
        transition:"color .15s",
      }}>
        {label}{active?(sortDir==="desc"?" ↓":" ↑"):""}
      </th>
    );
  };

  return (
    <div style={wrap}>

      {/* ── HEADER + STATS ── */}
      <div style={{ padding:"16px 20px 14px", borderBottom:"1px solid #2c2c2e" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <span style={{ fontSize:11, fontWeight:900, color:"#f2f2f7", letterSpacing:2, fontFamily:"monospace" }}>
            ◈ FRAUD RING SUMMARY TABLE
          </span>
          <span style={{
            fontSize:9, padding:"2px 9px", borderRadius:99,
            background:"#bf5af222", color:"#bf5af2",
            border:"1px solid #bf5af244", fontFamily:"monospace", fontWeight:700,
          }}>{rings.length} RINGS</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <StatPill label="Total Rings"   value={rings.length}  color="#bf5af2" />
          <StatPill label="Critical ≥40"  value={criticalCount} color="#ff2d55" />
          <StatPill label="High 25–39"    value={highCount}     color="#ff9500" />
          <StatPill label="Total Members" value={totalMembers}  color="#0a84ff" />
          <StatPill label="Avg Score"     value={avgScore}      color="#ffd60a" />
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", padding:"10px 16px", borderBottom:"1px solid #2c2c2e" }}>
        <input
          placeholder="Search ring, account ID, pattern…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background:"#1c1c1e", border:"1px solid #3a3a3c", borderRadius:8,
            padding:"6px 12px", color:"#f2f2f7", fontSize:10,
            fontFamily:"monospace", outline:"none", width:230,
          }}
        />
        <SevBtn s="ALL"      color="#0a84ff" />
        <SevBtn s="CRITICAL" color="#ff2d55" />
        <SevBtn s="HIGH"     color="#ff9500" />
        <SevBtn s="MEDIUM"   color="#ffd60a" />
        <SevBtn s="LOW"      color="#30d158" />
        <span style={{ marginLeft:"auto", fontSize:9, color:"#636366", fontFamily:"monospace" }}>
          {displayed.length}/{rings.length} rings
        </span>
      </div>

      {/* ── TABLE ── */}
      <div style={{ overflowY:"auto", flex:1, overflowX:"auto" }}>
        {displayed.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"#3a3a3c", fontSize:12, fontFamily:"monospace" }}>
            No rings match current filter
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead style={{ position:"sticky", top:0, zIndex:2, background:"#0f0f0f" }}>
              <tr>
                <ColH k="ring_id"      label="RING ID" />
                <th style={TH_STYLE}>PATTERN TYPE</th>
                <ColH k="member_count" label="MEMBERS" right />
                <ColH k="avg_score"    label="AVG RISK" right />
                <ColH k="max_score"    label="MAX RISK" right />
                <th style={TH_STYLE}>SEVERITY</th>
                <th style={{ ...TH_STYLE, minWidth:280 }}>MEMBER ACCOUNT IDs</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((ring, i) => {
                const isExp = expandedRing === ring.ring_id;
                const rc    = ring.color;
                const base  = i % 2 === 0 ? "#111111" : "#141414";

                return (
                  <tr key={ring.ring_id}
                    style={{ background:base, verticalAlign:"top", transition:"background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1c1c1e"}
                    onMouseLeave={e => e.currentTarget.style.background = base}
                  >
                    {/* RING ID */}
                    <td style={{ ...TD, whiteSpace:"nowrap" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:3, alignSelf:"stretch", borderRadius:2, background:rc, boxShadow:`0 0 8px ${rc}`, flexShrink:0 }}/>
                        <div>
                          <div style={{ fontSize:12, fontWeight:900, color:rc, fontFamily:"monospace" }}>{ring.ring_id}</div>
                          <div style={{ fontSize:8, color:"#636366", marginTop:1 }}>{ring.member_count} accounts</div>
                        </div>
                      </div>
                    </td>

                    {/* PATTERN TYPE */}
                    <td style={{ ...TD, maxWidth:180 }}>
                      {ring.patterns.length > 0
                        ? ring.patterns.map((p,j)=><PatternTag key={j} label={p} color={rc}/>)
                        : <span style={{ fontSize:9, color:"#3a3a3c" }}>—</span>
                      }
                    </td>

                    {/* MEMBER COUNT */}
                    <td style={{ ...TD, textAlign:"right" }}>
                      <span style={{ fontSize:22, fontWeight:900, color:rc, fontFamily:"monospace" }}>{ring.member_count}</span>
                    </td>

                    {/* AVG RISK */}
                    <td style={{ ...TD }}>
                      <MiniBar score={ring.avg_score}/>
                    </td>

                    {/* MAX RISK */}
                    <td style={{ ...TD }}>
                      <MiniBar score={ring.max_score}/>
                    </td>

                    {/* SEVERITY */}
                    <td style={{ ...TD, whiteSpace:"nowrap" }}>
                      <SeverityBadge score={ring.max_score}/>
                    </td>

                    {/* MEMBER IDs */}
                    <td style={{ ...TD, minWidth:280 }}>
                      <MemberChips
                        members={ring.members}
                        color={rc}
                        expanded={isExp}
                        onToggle={() => setExpandedRing(isExp ? null : ring.ring_id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding:"10px 16px", borderTop:"1px solid #2c2c2e", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", flex:1 }}>
          {rings.slice(0,16).map(r=>(
            <div key={r.ring_id} title={r.ring_id} style={{
              width:8, height:8, borderRadius:"50%",
              background:r.color, boxShadow:`0 0 4px ${r.color}`,
            }}/>
          ))}
          {rings.length>16 && <span style={{ fontSize:9, color:"#636366" }}>+{rings.length-16}</span>}
        </div>
        <div style={{
          padding:"4px 10px", borderRadius:6,
          background:"#bf5af218", color:"#bf5af2",
          fontSize:9, fontWeight:700, border:"1px solid #bf5af244",
          fontFamily:"monospace",
        }}>🤖 AI INSIGHT READY</div>
      </div>
    </div>
  );
}

const wrap = {
  background:"#111111", border:"1px solid #2c2c2e", borderRadius:16,
  overflow:"hidden", fontFamily:"'SF Mono','Fira Code',monospace",
  color:"#f2f2f7", display:"flex", flexDirection:"column",
};

const TH_STYLE = {
  padding:"10px 14px", textAlign:"left",
  fontSize:9, fontWeight:700, letterSpacing:1.2,
  color:"#636366", borderBottom:"2px solid #2c2c2e",
  whiteSpace:"nowrap", fontFamily:"monospace",
};

const TD = {
  padding:"10px 14px", borderBottom:"1px solid #1c1c1e", fontSize:11,
};