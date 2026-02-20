const { PAYROLL_MIN_RECEIVERS, PAYROLL_SIMILAR_AMOUNT_TOLERANCE } = require('../../utils/constants');

const identifyPayrollNodes = (adjacency, metrics, nodeSet) => {
  const payrollSenders = new Set();

  for (const node of nodeSet) {
    const m = metrics.get(node);
    if (!m) continue;
    if (m.fanIn > 2) continue;

    const outNeighbors = adjacency.has(node) ? adjacency.get(node) : new Map();
    if (outNeighbors.size < PAYROLL_MIN_RECEIVERS) continue;

    const amounts = [];
    const timestamps = [];
    for (const [, txs] of outNeighbors) {
      for (const tx of txs) {
        amounts.push(tx.amount);
        timestamps.push(new Date(tx.timestamp).getTime());
      }
    }

    if (!amounts.length) continue;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const allSimilar = amounts.every(a => Math.abs(a - avg) / (avg || 1) <= PAYROLL_SIMILAR_AMOUNT_TOLERANCE);

    if (allSimilar) {
      payrollSenders.add(node);
    }
  }

  return payrollSenders;
};

module.exports = { identifyPayrollNodes };