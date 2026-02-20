const { CYCLE_MIN_LENGTH, CYCLE_MAX_LENGTH, DFS_DEPTH_LIMIT } = require('../../utils/constants');

/**
 * Johnson-style optimized cycle detection
 * Uses colouring optimisation to prune search space
 */
const detectCycles = (adjacency, nodeSet, nodeColours = new Map()) => {
  const cycles = [];
  const cycleSignatures = new Set();

  // Build adjacency list (plain arrays for speed)
  const graph = new Map();
  for (const node of nodeSet) {
    const neighbors = adjacency.has(node)
      ? Array.from(adjacency.get(node).keys())
      : [];
    graph.set(node, neighbors);
  }

  const blocked = new Set();
  const B = new Map();
  const stack = [];

  const unblock = (u) => {
    blocked.delete(u);
    if (B.has(u)) {
      for (const w of B.get(u)) {
        if (blocked.has(w)) unblock(w);
      }
      B.set(u, new Set());
    }
  };

  const circuit = (startNode, currentNode, depth) => {
    let foundCycle = false;
    stack.push(currentNode);
    blocked.add(currentNode);

    const neighbors = graph.get(currentNode) || [];

    for (const neighbor of neighbors) {
      // 🔥 COLOUR OPTIMISATION:
      // Skip same-layer traversal to reduce redundant cycles
      if (nodeColours && nodeColours.get(neighbor) === nodeColours.get(currentNode)) {
        continue;
      }

      if (neighbor === startNode) {
        if (stack.length >= CYCLE_MIN_LENGTH && stack.length <= CYCLE_MAX_LENGTH) {
          const sig = [...stack].sort().join('|');
          if (!cycleSignatures.has(sig)) {
            cycleSignatures.add(sig);
            cycles.push([...stack]);
          }
        }
        foundCycle = true;
      } else if (
        !blocked.has(neighbor) &&
        stack.length < CYCLE_MAX_LENGTH &&
        depth < DFS_DEPTH_LIMIT
      ) {
        if (circuit(startNode, neighbor, depth + 1)) {
          foundCycle = true;
        }
      }
    }

    if (foundCycle) {
      unblock(currentNode);
    } else {
      for (const neighbor of neighbors) {
        if (!B.has(neighbor)) B.set(neighbor, new Set());
        B.get(neighbor).add(currentNode);
      }
    }

    stack.pop();
    return foundCycle;
  };

  // Johnson-style main loop
  for (const startNode of nodeSet) {
    blocked.clear();
    B.clear();
    stack.length = 0;
    circuit(startNode, startNode, 1);
  }

  return cycles;
};

module.exports = { detectCycles };
