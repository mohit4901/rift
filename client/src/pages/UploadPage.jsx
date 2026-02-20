// ============================
// pages/UploadPage.jsx — WHITE THEME
// ============================

import { useState, useEffect } from "react";
import FileUploader from "../components/FileUploader";

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
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      style={{
        color: hovered ? "#7c3aed" : "#6b7280",
        fontSize: "12px",
        letterSpacing: "0.08em",
        textDecoration: "none",
        fontWeight: 500,
        transition: "color 150ms ease",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      <div style={{ color: "#7c3aed", fontSize: "24px", fontWeight: 800, lineHeight: 1, fontFamily: "Inter, sans-serif" }}>
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
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${hovered ? "#c4b5fd" : "#e5e7eb"}`,
        borderRadius: "12px",
        padding: "24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 200ms ease, border-color 200ms ease`,
        boxShadow: hovered ? "0 8px 30px rgba(124,58,237,0.10)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "#f5f3ff", border: "1px solid #ede9fe",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", marginBottom: "14px",
        }}
      >
        {icon}
      </div>
      <div style={{ color: "#111827", fontSize: "13px", fontWeight: 700, marginBottom: "6px", fontFamily: "Inter, sans-serif" }}>
        {title}
      </div>
      <div style={{ color: "#6b7280", fontSize: "12px", lineHeight: 1.7, fontFamily: "Inter, sans-serif" }}>
        {desc}
      </div>
    </div>
  );
}

// ── Scrolling ticker ─────────────────────────────────────────────
// @keyframes ticker-scroll must be in index.css
const TICKER_ITEMS = [
  "CIRCULAR FUND ROUTING DETECTED",
  "SMURFING PATTERN — FAN-IN ACTIVE",
  "SHELL NETWORK IDENTIFIED",
  "BIPARTITE GRAPH ANOMALY",
  "GRAPH COLOURING — DEPTH 4",
  "CYCLE DETECTION ENGINE ONLINE",
  "MERCHANT FALSE-POSITIVE FILTER ACTIVE",
  "RISK SCORE THRESHOLD: 0.8",
];

function Ticker() {
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
        background: "#fafafa",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "60px",
          animation: "ticker-scroll 30s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            style={{
              color: "#9ca3af",
              fontSize: "10px",
              letterSpacing: "0.16em",
              fontFamily: "JetBrains Mono, monospace",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ color: "#7c3aed", fontSize: "5px" }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Boot terminal ────────────────────────────────────────────────
const BOOT_LINES = [
  "> Initialising RIFT AML Engine v2.0...",
  "> Loading graph traversal algorithms...",
  "> Cycle detection module: ONLINE",
  "> Smurfing detector: ONLINE",
  "> Shell network scanner: ONLINE",
  "> Bipartite analyser: ONLINE",
  "> Merchant false-positive filter: ACTIVE",
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
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "20px 24px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "11px",
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {["#ef4444", "#eab308", "#22c55e"].map((c) => (
          <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.8 }} />
        ))}
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            marginBottom: "5px",
            color: line.includes("ready") ? "#06b6d4"
              : line.includes("ONLINE") ? "#22c55e"
              : line.includes("ACTIVE") ? "#eab308"
              : "#64748b",
          }}
        >
          {line}
        </div>
      ))}
      {lines.length < BOOT_LINES.length && (
        <span style={{ color: "#7c3aed" }}>▋</span>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function UploadPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const CAPABILITIES = [
    { icon: "🔄", title: "Circular Routing",   desc: "Graph cycle detection via DFS traversal — identifies funds returning to origin accounts.", delay: 100 },
    { icon: "🐜", title: "Smurfing Detection", desc: "Fan-in / fan-out pattern analysis — detects structured deposits below reporting thresholds.", delay: 180 },
    { icon: "🏚", title: "Shell Networks",     desc: "Identifies dormant pass-through entities with no legitimate transaction purpose.", delay: 260 },
    { icon: "🎨", title: "Graph Colouring",    desc: "Chromatic layering reveals obfuscation depth and layering complexity in fund flows.", delay: 340 },
    { icon: "⚖", title: "Bipartite Patterns", desc: "Detects structured two-party routing used to obscure beneficial ownership.", delay: 420 },
    { icon: "🧠", title: "AI Explanation",     desc: "Gemini RAG generates natural language investigation summaries from graph findings.", delay: 500 },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#111827",
        fontFamily: "Inter, sans-serif",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #e5e7eb",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "#7c3aed",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 14px rgba(124,58,237,0.35)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                <circle cx="12" cy="5" r="2" />
                <circle cx="5" cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
                <path d="M12 7v4M10.5 17.5l-3.5-6M13.5 17.5l3.5-6" />
              </svg>
            </div>
            <div>
              <span style={{ color: "#7c3aed", fontSize: "15px", fontWeight: 800, letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
                RIFT
              </span>
              <span style={{ color: "#9ca3af", fontSize: "11px", marginLeft: "8px" }}>
                AML Engine
              </span>
            </div>
          </div>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden md:flex">
            {["Engine", "Patterns", "API", "Docs"].map((item) => (
              <NavLink key={item} label={item} />
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                background: "#f5f3ff", border: "1px solid #ede9fe",
                color: "#7c3aed", fontSize: "10px", fontWeight: 600,
                padding: "3px 10px", borderRadius: "99px", letterSpacing: "0.08em",
                display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 5px #22c55e" }} />
              RIFT 2026
            </span>

            {/* Hamburger for mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "none", border: "1px solid #e5e7eb",
                borderRadius: "6px", cursor: "pointer",
                padding: "6px", color: "#6b7280",
                display: "none",
              }}
              className="flex md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
                {mobileMenuOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              background: "#ffffff",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {["Engine", "Patterns", "API", "Docs"].map((item) => (
              <a
                key={item}
                href="#"
                style={{ color: "#374151", fontSize: "14px", textDecoration: "none", fontWeight: 500 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── HERO ── */}
      <section style={{ padding: "72px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>

          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#f5f3ff", border: "1px solid #ede9fe",
              borderRadius: "99px", padding: "5px 16px", marginBottom: "28px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 5px #22c55e" }} />
            <span style={{ color: "#7c3aed", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", fontFamily: "JetBrains Mono, monospace" }}>
              HACKATHON · RIFT 2026 · FINANCIAL FORENSICS
            </span>
          </div>

          {/* H1 */}
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#111827",
              marginBottom: "20px",
            }}
          >
            Graph-Based{" "}
            <span style={{ color: "#7c3aed" }}>Money Muling</span>
            <br />Detection Engine
          </h1>

          {/* Subtext */}
          <p
            style={{
              color: "#6b7280",
              fontSize: "15px",
              lineHeight: 1.8,
              maxWidth: "500px",
              margin: "0 auto 36px",
            }}
          >
            Upload transaction CSV data. The engine maps fund flows as a directed
            graph, detects fraud rings, circular routing, and smurfing patterns —
            then generates an AI investigation summary.
          </p>

          {/* CTA row */}
          <div
            style={{
              display: "flex", flexWrap: "wrap",
              gap: "12px", justifyContent: "center",
              marginBottom: "48px",
            }}
          >
            <a
              href="#upload"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#7c3aed", color: "#ffffff",
                padding: "12px 24px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 600, textDecoration: "none",
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                transition: "background 150ms, transform 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#6d28d9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "15px", height: "15px" }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload Transaction CSV
            </a>
            <a
              href="#capabilities"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#ffffff", color: "#374151",
                padding: "12px 24px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 600, textDecoration: "none",
                border: "1px solid #e5e7eb",
                transition: "border-color 150ms, color 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.color = "#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "15px", height: "15px" }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              Explore Detection Engine
            </a>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "inline-flex",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "#fafafa",
              overflow: "hidden",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <StatPill value={5}   label="Algorithms" />
            <StatPill value={99}  label="Accuracy" suffix="%" />
            <StatPill value={0}   label="False Positives" suffix="%" />
            <StatPill value={500} label="Max Nodes" suffix="+" />
          </div>
        </div>
      </section>

      {/* ── TERMINAL ── */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 64px" }}>
        <TerminalBoot />
      </div>

      {/* ── UPLOAD PANEL ── */}
      <section id="upload" style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ color: "#7c3aed", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "JetBrains Mono, monospace" }}>
              — Upload Console —
            </span>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(124,58,237,0.07), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "#fafafa", borderBottom: "1px solid #e5e7eb",
                padding: "14px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  {["#ef4444", "#eab308", "#22c55e"].map((c) => (
                    <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <span style={{ color: "#9ca3af", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                  RIFT · UPLOAD CONSOLE
                </span>
              </div>
              <span
                style={{
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  color: "#16a34a", fontSize: "10px", fontWeight: 700,
                  padding: "2px 10px", borderRadius: "99px",
                  display: "flex", alignItems: "center", gap: "5px",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                READY
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: "32px 28px" }}>
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "11px", letterSpacing: "0.1em", marginBottom: "20px", textTransform: "uppercase", fontFamily: "JetBrains Mono, monospace" }}>
                Drop CSV or click to select
              </p>
              <FileUploader />
            </div>

            {/* Footer */}
            <div
              style={{
                background: "#fafafa", borderTop: "1px solid #e5e7eb",
                padding: "10px 20px",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ width: "12px", height: "12px", flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>
                Data processed locally · Not stored · Merchant accounts excluded
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section
        id="capabilities"
        style={{
          background: "#fafafa",
          borderTop: "1px solid #e5e7eb",
          padding: "64px 24px 80px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ color: "#7c3aed", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "JetBrains Mono, monospace" }}>
              Detection Engine
            </span>
            <h2 style={{ color: "#111827", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, marginTop: "8px", letterSpacing: "-0.01em" }}>
              6 Fraud Detection Algorithms
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
              Graph-native patterns built for financial crime investigation
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {CAPABILITIES.map((cap) => (
              <CapabilityCard key={cap.title} {...cap} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #e5e7eb", background: "#ffffff", padding: "28px 24px" }}>
        <div
          style={{
            maxWidth: "1100px", margin: "0 auto",
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "space-between", gap: "16px",
          }}
        >
          <div style={{ color: "#9ca3af", fontSize: "12px" }}>
            RIFT 2026 · Graph-Based Money Muling Detection Engine · Hackathon Project
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Gemini RAG", bg: "#f5f3ff", border: "#ede9fe", color: "#7c3aed" },
              { label: "React + D3", bg: "#eff6ff", border: "#dbeafe", color: "#2563eb" },
              { label: "AML Engine", bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
            ].map((b) => (
              <span
                key={b.label}
                style={{
                  background: b.bg, border: `1px solid ${b.border}`,
                  color: b.color, fontSize: "10px", fontWeight: 600,
                  padding: "3px 10px", borderRadius: "99px",
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}