

const formatOutput = ({
  suspiciousAccounts = [],
  fraudRings = [],
  totalAccounts = 0,
  processingTime = 0,
}) => {

  
  const suspicious_accounts = [...suspiciousAccounts]
    .sort((a, b) => b.suspicion_score - a.suspicion_score)
    .map(a => ({
      account_id: String(a.account_id),

      // strict float formatting
      suspicion_score: Number(
        parseFloat(a.suspicion_score || 0).toFixed(1)
      ),

      detected_patterns: Array.isArray(a.detected_patterns)
        ? a.detected_patterns
        : [],

      ring_id: a.ring_id || null,
    }));


  
  const fraud_rings = [...fraudRings].map(r => ({
    ring_id: String(r.ring_id),

    member_accounts: Array.isArray(r.member_accounts)
      ? r.member_accounts
      : [],

    pattern_type: String(r.pattern_type),

    risk_score: Number(
      parseFloat(r.risk_score || 0).toFixed(1)
    ),
  }));


 
  const summary = {
    total_accounts_analyzed: Number(totalAccounts),
    suspicious_accounts_flagged: suspicious_accounts.length,
    fraud_rings_detected: fraud_rings.length,
    processing_time_seconds: Number(
      parseFloat(processingTime || 0).toFixed(3)
    ),
  };


 
  return {
    suspicious_accounts,
    fraud_rings,
    summary,
  };
};

module.exports = { formatOutput };
