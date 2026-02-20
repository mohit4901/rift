const { SHELL_CHAIN_MIN_LENGTH, SHELL_DEGREE_MIN, SHELL_DEGREE_MAX } = require('../../utils/constants');

const detectShellNetworks = (adjacency, reverseAdjacency, nodeSet, metrics) => {
  const shellChains = [];
  const visited = new Set();

  const isShellNode = (node) => {
    const m = metrics.get(node);
    if (!m) return false;
    return m.degree >= SHELL_DEGREE_MIN && m.degree <= SHELL_DEGREE_MAX;
  };

  const extendChain = (node, chain) => {
    const neighbors = adjacency.has(node) ? adjacency.get(node) : new Map();
    for (const neighbor of neighbors.keys()) {
      if (!chain.includes(neighbor) && isShellNode(neighbor)) {
        chain.push(neighbor);
        extendChain(neighbor, chain);
      }
    }
  };

  for (const node of nodeSet) {
    if (visited.has(node) || !isShellNode(node)) continue;
    const chain = [node];
    extendChain(node, chain);
    if (chain.length >= SHELL_CHAIN_MIN_LENGTH) {
      shellChains.push(chain);
      chain.forEach(n => visited.add(n));
    }
  }

  return shellChains;
};

module.exports = { detectShellNetworks };