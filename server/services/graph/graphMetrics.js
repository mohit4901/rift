const computeMetrics = (adjacency, reverseAdjacency, nodeSet) => {
  const metrics = new Map();

  // ===============================
  // EXISTING METRICS CALCULATION
  // ===============================
  for (const node of nodeSet) {
    const outNeighbors = adjacency.has(node) ? adjacency.get(node) : new Map();
    const inNeighbors = reverseAdjacency.has(node) ? reverseAdjacency.get(node) : new Map();

    const fanOut = outNeighbors.size;
    const fanIn = inNeighbors.size;
    const degree = fanIn + fanOut;

    let totalOutAmount = 0;
    let totalInAmount = 0;
    let txCount = 0;
    const amounts = [];

    for (const [, txs] of outNeighbors) {
      for (const tx of txs) {
        totalOutAmount += tx.amount;
        amounts.push(tx.amount);
        txCount++;
      }
    }

    for (const [, txs] of inNeighbors) {
      for (const tx of txs) {
        totalInAmount += tx.amount;
        txCount++;
      }
    }

    const avgAmount = amounts.length
      ? amounts.reduce((a, b) => a + b, 0) / amounts.length
      : 0;

    const amountVariance = amounts.length
      ? amounts.reduce((a, b) => a + Math.pow(b - avgAmount, 2), 0) / amounts.length
      : 0;

    metrics.set(node, {
      fanIn,
      fanOut,
      degree,
      totalOutAmount,
      totalInAmount,
      txCount,
      avgAmount,
      amountVariance,
      amountStdDev: Math.sqrt(amountVariance),
    });
  }

  // ===============================
  // 🔥 LAYERED GRAPH COLOURING (BFS)
  // ===============================

  const nodeLevels = new Map();
  const nodeColours = new Map();
  let maxColourK = 0;

  const visited = new Set();

  for (const startNode of nodeSet) {
    if (visited.has(startNode)) continue;

    const queue = [{ node: startNode, level: 0 }];
    visited.add(startNode);
    nodeLevels.set(startNode, 0);
    nodeColours.set(startNode, 0);

    while (queue.length > 0) {
      const { node, level } = queue.shift();

      const neighbors = adjacency.has(node)
        ? adjacency.get(node)
        : new Map();

      for (const neighbor of neighbors.keys()) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);

          const nextLevel = level + 1;

          nodeLevels.set(neighbor, nextLevel);
          nodeColours.set(neighbor, nextLevel);

          maxColourK = Math.max(maxColourK, nextLevel);

          queue.push({ node: neighbor, level: nextLevel });
        } else {
          // 🔥 CONTRADICTION CHECK:
          // If same colour on adjacent nodes, push neighbor deeper
          const currentColour = nodeColours.get(node);
          const neighborColour = nodeColours.get(neighbor);

          if (neighborColour === currentColour) {
            const newLevel = neighborColour + 1;
            nodeLevels.set(neighbor, newLevel);
            nodeColours.set(neighbor, newLevel);
            maxColourK = Math.max(maxColourK, newLevel);
          }
        }
      }
    }
  }

  return {
    metrics,
    nodeLevels,
    nodeColours,
    maxColourK,
  };
};

module.exports = { computeMetrics };
