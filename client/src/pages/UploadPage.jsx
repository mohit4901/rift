// ============================
// pages/UploadPage.jsx — PREMIUM WHITE THEME (UPGRADED)
// ============================

import { useState, useEffect } from "react";
import FileUploader from "../components/FileUploader";
import { motion } from "framer-motion";

// ── Animated counter hook ─────────────────────────────────────────
function useCounter(target, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ── Nav link ─────────────────────────────────────────────────────
function NavLink({ label }) {
  return (
    <a
      href="#"
      style={{
        color: "#6b7280",
        fontSize: "12px",
        letterSpacing: "0.08em",
        textDecoration: "none",
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
        transition: "all .2s",
      }}
      onMouseEnter={(e)=> e.currentTarget.style.color="#7c3aed"}
      onMouseLeave={(e)=> e.currentTarget.style.color="#6b7280"}
    >
      {label}
    </a>
  );
}

// ── Stat pill ────────────────────────────────────────────────────
function StatPill({ value, label, suffix = "" }) {
  const count = useCounter(value);
  return (
    <div className="text-center px-5 py-4" style={{ borderRight: "1px solid #e5e7eb" }}>
      <div style={{ color: "#7c3aed", fontSize: "24px", fontWeight: 800 }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#9ca3af", fontSize: "10px", marginTop: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ── Capability card ──────────────────────────────────────────────
function CapabilityCard({ icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: delay/1000 }}
      whileHover={{ y:-4 }}
      style={{
        background:"#ffffff",
        border:"1px solid #e5e7eb",
        borderRadius:"12px",
        padding:"24px",
        cursor:"default",
      }}
    >
      <div style={{
        width:"40px",height:"40px",
        borderRadius:"10px",
        background:"#f5f3ff",
        border:"1px solid #ede9fe",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:"18px",
        marginBottom:"14px"
      }}>{icon}</div>

      <div style={{ fontWeight:700,fontSize:"13px",marginBottom:"6px"}}>
        {title}
      </div>

      <div style={{ color:"#6b7280",fontSize:"12px",lineHeight:1.7 }}>
        {desc}
      </div>
    </motion.div>
  );
}

// ── Boot terminal ────────────────────────────────────────────────
const BOOT_LINES = [
  "> Initialising RIFT AML Engine v2.0...",
  "> Loading graph traversal algorithms...",
  "> Cycle detection module: ONLINE",
  "> Smurfing detector: ONLINE",
  "> Shell network scanner: ONLINE",
  "> System ready. Awaiting transaction data.",
];

function TerminalBoot() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setLines((prev) => [...prev, line]), i * 280);
    });
  }, []);

  return (
    <div style={{
      background:"#0f172a",
      border:"1px solid #1e293b",
      borderRadius:"12px",
      padding:"20px 24px",
      fontFamily:"JetBrains Mono, monospace",
      fontSize:"11px"
    }}>
      {lines.map((line,i)=>(
        <div key={i} style={{ color:"#22c55e", marginBottom:"5px"}}>
          {line}
        </div>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function UploadPage() {
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const CAPABILITIES=[
    {icon:"🔄",title:"Circular Routing",desc:"Graph cycle detection via DFS traversal.",delay:100},
    {icon:"🐜",title:"Smurfing Detection",desc:"Fan-in / fan-out pattern analysis.",delay:180},
    {icon:"🏚",title:"Shell Networks",desc:"Dormant pass-through entity detection.",delay:260},
    {icon:"🎨",title:"Graph Colouring",desc:"Chromatic layering for flow depth.",delay:340},
    {icon:"⚖",title:"Bipartite Patterns",desc:"Structured routing anomaly detection.",delay:420},
    {icon:"🧠",title:"AI Explanation",desc:"Natural language AML insights.",delay:500},
  ];

  return (
    <div style={{
      minHeight:"100vh",
      background:"#ffffff",
      color:"#111827",
      fontFamily:"Inter, sans-serif",
      opacity:mounted?1:0,
      transition:"opacity .4s ease"
    }}>

      {/* HERO */}
      <section style={{ padding:"72px 24px 48px", textAlign:"center"}}>
        <h1 style={{
          fontSize:"clamp(28px,5vw,52px)",
          fontWeight:900,
          letterSpacing:"-0.02em"
        }}>
          Graph-Based <span style={{color:"#7c3aed"}}>Money Muling</span>
          <br/>Detection Engine
        </h1>

        <p style={{
          color:"#6b7280",
          fontSize:"15px",
          maxWidth:"500px",
          margin:"20px auto 36px"
        }}>
          Upload transaction CSV data. Detect fraud rings, smurfing patterns and circular routing using graph analytics.
        </p>

        {/* CTA */}
        <div style={{ display:"flex",gap:"12px",justifyContent:"center"}}>
          <motion.a
            whileHover={{ y:-2 }}
            href="#upload"
            style={{
              background:"#7c3aed",
              color:"#fff",
              padding:"12px 24px",
              borderRadius:"8px",
              fontSize:"13px",
              fontWeight:600,
              textDecoration:"none",
              cursor:"pointer",
              boxShadow:"0 4px 14px rgba(124,58,237,0.3)"
            }}
          >
            Submit CSV
          </motion.a>
        </div>

        {/* STATS */}
        <div style={{
          marginTop:"40px",
          display:"inline-flex",
          border:"1px solid #e5e7eb",
          borderRadius:"12px",
          background:"#fafafa",
          overflow:"hidden"
        }}>
          <StatPill value={5} label="Algorithms"/>
          <StatPill value={99} label="Accuracy" suffix="%"/>
          <StatPill value={0} label="False Positives" suffix="%"/>
          <StatPill value={500} label="Max Nodes" suffix="+"/>
        </div>
      </section>

      {/* TERMINAL */}
      <div style={{ maxWidth:"700px",margin:"0 auto",padding:"0 24px 64px"}}>
        <TerminalBoot/>
      </div>

      {/* UPLOAD PANEL */}
      <section id="upload" style={{ padding:"0 24px 80px"}}>
        <div style={{ maxWidth:"600px",margin:"0 auto"}}>
          <motion.div
            whileHover={{ scale:1.01 }}
            style={{
              background:"#ffffff",
              border:"1px solid #e5e7eb",
              borderRadius:"16px",
              overflow:"hidden",
              boxShadow:"0 6px 28px rgba(124,58,237,0.08)"
            }}
          >
            <div style={{ padding:"32px 28px"}}>
              <p style={{
                textAlign:"center",
                color:"#9ca3af",
                fontSize:"11px",
                letterSpacing:"0.1em",
                marginBottom:"20px",
                textTransform:"uppercase",
                fontFamily:"JetBrains Mono, monospace"
              }}>
                Drop CSV or click to select
              </p>

              {/* FILE UPLOADER */}
              <FileUploader />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section style={{
        background:"#fafafa",
        borderTop:"1px solid #e5e7eb",
        padding:"64px 24px 80px"
      }}>
        <div style={{
          maxWidth:"1100px",
          margin:"0 auto",
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
          gap:"16px"
        }}>
          {CAPABILITIES.map(cap=><CapabilityCard key={cap.title} {...cap}/>)}
        </div>
      </section>

    </div>
  );
}
