// ============================
// services/geminiRAG.js
// RIFT AML — Gemini RAG Service
// ============================

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ── Build investigation prompt ────────────────────────────────────
function buildPrompt({ suspicious_accounts, fraud_rings, summary }) {
  const topAccounts = [...(suspicious_accounts ?? [])]
    .sort((a, b) => (b.suspicion_score ?? 0) - (a.suspicion_score ?? 0))
    .slice(0, 10);

  const ringSummaries = (fraud_rings ?? []).map((ring) => {
    const members = ring.members ?? ring.member_accounts ?? [];
    return `Ring ID: ${ring.ring_id ?? "N/A"} | Pattern: ${ring.pattern_type ?? "N/A"} | Members: ${members.length} | Risk: ${ring.risk_score ?? ring.score ?? "N/A"}`;
  });

  const accountLines = topAccounts.map((acc) =>
    `Account: ${acc.account_id} | Score: ${(acc.suspicion_score * 100).toFixed(0)}% | Patterns: ${(acc.detected_patterns ?? []).join(", ") || "N/A"}`
  );

  return `You are a senior AML (Anti-Money Laundering) investigator and financial forensics expert.

Analyse the following graph-based fraud detection results and provide a professional investigation summary.

## SUSPICIOUS ACCOUNTS (Top ${topAccounts.length} by risk score):
${accountLines.join("\n") || "None detected"}

## FRAUD RINGS DETECTED (${fraud_rings?.length ?? 0} total):
${ringSummaries.join("\n") || "No fraud rings detected"}

## SYSTEM SUMMARY:
${summary ? JSON.stringify(summary, null, 2) : "No summary available"}

## YOUR TASK:
Write a concise, professional investigation report covering:

1. **Overall Threat Assessment** — What is the general risk level and why?
2. **Primary Fraud Patterns** — What specific money laundering techniques are being used?
3. **Key Accounts of Interest** — Which accounts are the most critical and why?
4. **Fund Flow Analysis** — How are funds being routed and layered?
5. **Recommended Actions** — What immediate investigative steps should be taken?

Write in the style of a financial crime investigator filing a Suspicious Activity Report (SAR).
Be specific, technical, and actionable. Use paragraph form. Keep it under 400 words.`;
}

// ── Main export ───────────────────────────────────────────────────
export async function explainFraudBehaviour(data) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // ── Fallback if no API key ────────────────────────────────────
  if (!apiKey) {
    return generateFallbackExplanation(data);
  }

  const prompt = buildPrompt(data);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 600,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Gemini API error: ${response.status}`
    );
  }

  const result = await response.json();
  const text =
    result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

// ── Fallback explanation (no API key) ─────────────────────────────
function generateFallbackExplanation({ suspicious_accounts, fraud_rings }) {
  const accounts  = suspicious_accounts ?? [];
  const rings     = fraud_rings ?? [];
  const critical  = accounts.filter((a) => (a.suspicion_score ?? 0) >= 0.8);
  const patterns  = [...new Set(rings.map((r) => r.pattern_type).filter(Boolean))];
  const topAcc    = [...accounts].sort((a, b) => (b.suspicion_score ?? 0) - (a.suspicion_score ?? 0))[0];

  return `## Overall Threat Assessment

The graph analysis has identified ${accounts.length} suspicious account(s) across ${rings.length} detected fraud ring(s). ${critical.length > 0 ? `${critical.length} account(s) are flagged at CRITICAL risk level (suspicion score ≥ 80%), indicating high-confidence indicators of illicit fund movement.` : "Risk levels are distributed across medium and high categories, suggesting an active but partially obfuscated network."}

## Primary Fraud Patterns

${patterns.length > 0
  ? `The detection engine identified the following pattern types: ${patterns.join(", ")}. These patterns are consistent with layered money muling operations where funds are routed through intermediate accounts to obscure their origin.`
  : "Pattern analysis indicates structured fund routing consistent with known money muling typologies. The graph topology suggests deliberate obfuscation through multiple hops."}

## Key Accounts of Interest

${topAcc
  ? `Account ${topAcc.account_id} presents the highest suspicion score at ${((topAcc.suspicion_score ?? 0) * 100).toFixed(0)}%, with detected patterns including: ${(topAcc.detected_patterns ?? []).join(", ") || "multiple indicators"}. This account should be prioritised for immediate transaction history review.`
  : "All flagged accounts require transaction history review and counterparty analysis."}

## Fund Flow Analysis

Graph topology reveals ${rings.length > 0 ? "circular routing structures" : "linear layering"} consistent with placement-layering-integration phases of money laundering. ${rings.length > 0 ? `${rings.length} ring structure(s) detected, suggesting coordinated muling activity across multiple controlled accounts.` : ""}

## Recommended Actions

Freeze flagged accounts pending full KYC review. File Suspicious Activity Reports (SARs) for all accounts with suspicion score above 0.6. Conduct counterparty analysis on all incoming and outgoing transactions. Escalate to Financial Intelligence Unit (FIU) for cross-institution correlation.

_Note: Add VITE_GEMINI_API_KEY to .env for live AI-powered analysis._`;
}