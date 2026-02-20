const {
  MERCHANT_HIGH_FAN_OUT,
  MERCHANT_LOW_FAN_IN,
  MERCHANT_AMOUNT_VARIANCE_THRESHOLD,
} = require('../../utils/constants');


const identifyMerchants = (metrics, nodeSet) => {
  const merchants = new Set();

  for (const node of nodeSet) {
    const m = metrics.get(node);
    if (!m) continue;

    const cv = m.avgAmount > 0 ? m.amountStdDev / m.avgAmount : 0;

    const flowRatio =
      m.totalInAmount > 0
        ? m.totalOutAmount / m.totalInAmount
        : 0;

    const isHighVolume =
      m.txCount >= 40 && (m.fanIn >= 8 || m.fanOut >= 8);

    const stableAmounts =
      cv <= MERCHANT_AMOUNT_VARIANCE_THRESHOLD;

    const balancedFlow =
      flowRatio >= 0.7 && flowRatio <= 1.3;

    const legacyRule =
      m.fanOut >= MERCHANT_HIGH_FAN_OUT &&
      m.fanIn <= MERCHANT_LOW_FAN_IN &&
      stableAmounts;

    if (
      legacyRule ||
      (isHighVolume && stableAmounts && balancedFlow) ||
      node.includes('MERCHANT') ||
      node.includes('PAYROLL') ||
      node.includes('BANK')
    ) {
      merchants.add(node);
    }
  }

  return merchants;
};

module.exports = { identifyMerchants };
