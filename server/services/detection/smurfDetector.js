const {
  SMURF_FAN_IN_THRESHOLD,
  SMURF_FAN_OUT_THRESHOLD,
  SMURF_TIME_WINDOW_HOURS,
} = require('../../utils/constants');

const { isWithinWindow } = require('../../utils/timeWindow');

/**
 * Bipartite-aware Smurf Detection
 * nodeLevels added for layered optimisation
 */
const detectSmurfing = (
  adjacency,
  reverseAdjacency,
  nodeSet,
  edgeMap,
  nodeLevels = new Map()
) => {
  const smurfNodes = [];

  for (const node of nodeSet) {
    const inNeighbors = reverseAdjacency.has(node)
      ? reverseAdjacency.get(node)
      : new Map();

    const outNeighbors = adjacency.has(node)
      ? adjacency.get(node)
      : new Map();

    const fanIn = inNeighbors.size;
    const fanOut = outNeighbors.size;

    // 🔥 BASIC THRESHOLD CHECK
    if (
      fanIn < SMURF_FAN_IN_THRESHOLD &&
      fanOut < SMURF_FAN_OUT_THRESHOLD
    )
      continue;

    // ===============================
    // 🔥 BIPARTITE CHECK
    // ===============================
    // senderSet vs receiverSet validation
    const senderSet = new Set();
    const receiverSet = new Set();

    for (const sender of inNeighbors.keys()) senderSet.add(sender);
    for (const receiver of outNeighbors.keys()) receiverSet.add(receiver);

    // Simple bipartite heuristic:
    // smurf hubs often sit between different levels
    const nodeLevel = nodeLevels.get(node);

    if (nodeLevel !== undefined) {
      let validLayeredStructure = false;

      for (const s of senderSet) {
        if (nodeLevels.get(s) !== nodeLevel) {
          validLayeredStructure = true;
          break;
        }
      }

      for (const r of receiverSet) {
        if (nodeLevels.get(r) !== nodeLevel) {
          validLayeredStructure = true;
          break;
        }
      }

      // Skip if cluster not behaving like layered bipartite structure
      if (!validLayeredStructure) continue;
    }

    // ===============================
    // 🔥 TEMPORAL WINDOW CHECK
    // ===============================
    const allTimestamps = [];

    for (const [, txs] of inNeighbors)
      for (const tx of txs) allTimestamps.push(tx.timestamp);

    for (const [, txs] of outNeighbors)
      for (const tx of txs) allTimestamps.push(tx.timestamp);

    if (allTimestamps.length < 2) continue;

    const sorted = allTimestamps.sort();
    const windowCount = countWithinWindow(
      sorted,
      SMURF_TIME_WINDOW_HOURS
    );

    if (
      windowCount >=
      Math.max(SMURF_FAN_IN_THRESHOLD, SMURF_FAN_OUT_THRESHOLD)
    ) {
      smurfNodes.push({
        node,
        fanIn,
        fanOut,
        windowTransactions: windowCount,
        bipartite: true,
      });
    }
  }

  return smurfNodes;
};

const countWithinWindow = (sortedTimestamps, windowHours) => {
  let maxCount = 0;

  for (let i = 0; i < sortedTimestamps.length; i++) {
    let count = 1;

    for (let j = i + 1; j < sortedTimestamps.length; j++) {
      if (
        isWithinWindow(
          sortedTimestamps[i],
          sortedTimestamps[j],
          windowHours
        )
      )
        count++;
      else break;
    }

    maxCount = Math.max(maxCount, count);
  }

  return maxCount;
};

module.exports = { detectSmurfing };
