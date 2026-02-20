const {
  SCORE_WEIGHTS,
  SCORE_PENALTIES,
  MAX_SCORE,
  MIN_SCORE,
} = require('../../utils/constants');

/**
 * Enhanced scoring engine
 * - Johnson cycle depth bonus
 * - Bipartite smurf confidence
 * - Layered colouring influence
 * - 🔥 Explainability meta support
 */
const scoreAccount = ({
  node,
  cycles,
  smurfData,
  shellData,
  metrics,
  merchants,
  payrollSenders,
  nodeLevels = new Map(),
}) => {

  // ======================================================
  // 🔥 HARD FALSE POSITIVE FILTER
  // ======================================================
  if (merchants.has(node) || payrollSenders.has(node)) {
    return {
      score: 0,
      patterns: [],
      meta: {
        txCount: 0,
        fanIn: 0,
        fanOut: 0,
        level: 0,
        cycleCount: 0,
      },
    };
  }

  const m = metrics.get(node) || {};
  let score = 0;
  const patterns = [];

  // ===============================
  // 🔥 CYCLE SCORING
  // ===============================
  const nodeCycles = cycles.filter(c => c.includes(node));
  let minLen = null;

  if (nodeCycles.length > 0) {
    minLen = Math.min(...nodeCycles.map(c => c.length));
    const depthBonus = minLen === 3 ? 1 : 0.7;

    score +=
      SCORE_WEIGHTS.cycle *
      Math.min(nodeCycles.length / 3, 1) *
      depthBonus;

    patterns.push(`cycle_length_${minLen}`);
  }

  // ===============================
  // 🔥 SMURF SCORING
  // ===============================
  if (smurfData) {
    let smurfScore = Math.min(
      SCORE_WEIGHTS.smurf *
        ((smurfData.fanIn + smurfData.fanOut) / 30),
      SCORE_WEIGHTS.smurf
    );

    if (smurfData.bipartite) {
      smurfScore *= 1.1;
      patterns.push('bipartite_pattern');
    }

    score += smurfScore;

    if (smurfData.fanIn >= 10) patterns.push('high_fan_in');
    if (smurfData.fanOut >= 10) patterns.push('high_fan_out');

    patterns.push('smurfing');
  }

  // ===============================
  // 🔥 SHELL NETWORK
  // ===============================
  if (shellData) {
    score += SCORE_WEIGHTS.shell * Math.min(shellData.length / 5, 1);
    patterns.push('shell_chain');
  }

  // ===============================
  // 🔥 VELOCITY
  // ===============================
  const velocity = (m.txCount || 0) / 100;
  if (velocity > 0.5) {
    score += SCORE_WEIGHTS.velocity * Math.min(velocity, 1);
    patterns.push('high_velocity');
  }

  // ===============================
  // 🔥 LAYERED DEPTH BONUS
  // ===============================
  const level = nodeLevels.get(node);
  if (level !== undefined && level >= 2) {
    score += Math.min(level * 1.5, 5);
    patterns.push('layered_depth');
  }

  // ===============================
  // 🔥 OPTIONAL PENALTIES
  // ===============================
  if (merchants.has(node)) score -= SCORE_PENALTIES.merchant;
  if (payrollSenders.has(node)) score -= SCORE_PENALTIES.payroll;

  const finalScore = Math.min(
    MAX_SCORE,
    Math.max(MIN_SCORE, parseFloat(score.toFixed(1)))
  );

  // ======================================================
  // 🔥 NEW: EXPLAINABILITY META DATA
  // ======================================================
  const meta = {
    txCount: m.txCount || 0,
    fanIn: smurfData?.fanIn || 0,
    fanOut: smurfData?.fanOut || 0,
    level: level || 0,
    cycleCount: nodeCycles.length || 0,
    minCycleLength: minLen || 0,
  };

  return {
    score: finalScore,
    patterns: [...new Set(patterns)],
    meta,
  };
};

module.exports = { scoreAccount };