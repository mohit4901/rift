const { buildGraph } = require('../graph/graphBuilder');
const { computeMetrics } = require('../graph/graphMetrics');
const { detectCycles } = require('../detection/cycleDetector');
const { detectSmurfing } = require('../detection/smurfDetector');
const { detectShellNetworks } = require('../detection/shellDetector');
const { identifyMerchants } = require('../behaviour/merchantFilter');
const { identifyPayrollNodes } = require('../behaviour/payrollFilter');
const { scoreAccount } = require('../scoring/riskScoringEngine');
const { formatOutput } = require('../output/jsonFormatter');
const { adaptOutputForJudge } = require('../outputAdapter');
const { generateExplanation } = require('../analysis/explanationEngine'); // 🔥 NEW
const logger = require('../../utils/logger');

const runPipeline = async (transactions) => {
  const start = Date.now();
  logger.info(`Pipeline start: ${transactions.length} transactions`);

  const { adjacency, reverseAdjacency, edgeMap, nodeSet } =
    buildGraph(transactions);

  // ======================================================
  // 🔥 GRAPH METRICS + COLOURING
  // ======================================================
  const { metrics, nodeLevels, nodeColours, maxColourK } =
    computeMetrics(adjacency, reverseAdjacency, nodeSet);

  logger.info(`Layered colouring complete. k = ${maxColourK}`);

  // ======================================================
  // 🔥 DETECTION MODULES
  // ======================================================
  const [cycles, smurfNodes, shellChains] = await Promise.all([
    Promise.resolve(detectCycles(adjacency, nodeSet, nodeColours)),
    Promise.resolve(
      detectSmurfing(
        adjacency,
        reverseAdjacency,
        nodeSet,
        edgeMap,
        nodeLevels
      )
    ),
    Promise.resolve(
      detectShellNetworks(adjacency, reverseAdjacency, nodeSet, metrics)
    ),
  ]);

  // ======================================================
  // 🔥 BEHAVIOUR FILTERS
  // ======================================================
  const merchants = identifyMerchants(metrics, nodeSet);
  const payrollSenders = identifyPayrollNodes(
    adjacency,
    metrics,
    nodeSet
  );

  logger.info(`Merchants: ${[...merchants].join(', ')}`);
  logger.info(`Payroll: ${[...payrollSenders].join(', ')}`);

  const smurfMap = new Map(smurfNodes.map(s => [s.node, s]));

  const shellMap = new Map();
  shellChains.forEach(chain =>
    chain.forEach(node => shellMap.set(node, chain))
  );

  const ringMap = new Map();
  let ringCounter = 1;
  const nodeRingMap = new Map();

  // ======================================================
  // 🔥 CYCLE RINGS (Johnson-style pruning)
  // ======================================================
  const sortedCycles = cycles.sort((a, b) => b.length - a.length);
  const coveredEdges = new Set();

  for (const cycle of sortedCycles) {
    const members = [...new Set(cycle)];

    const edgeSigs = [];
    for (let i = 0; i < members.length; i++) {
      edgeSigs.push(`${members[i]}->${members[(i + 1) % members.length]}`);
    }

    const alreadyCovered = edgeSigs.every(e => coveredEdges.has(e));
    if (alreadyCovered) continue;

    const memberSig = [...members].sort().join('|');
    let duplicate = false;

    for (const [, ring] of ringMap) {
      if (
        ring.pattern_type === 'cycle' &&
        [...ring.member_accounts].sort().join('|') === memberSig
      ) {
        duplicate = true;
        break;
      }
    }

    if (duplicate) continue;

    const ringId = `RING_${String(ringCounter++).padStart(3, '0')}`;

    ringMap.set(ringId, {
      ring_id: ringId,
      member_accounts: members,
      pattern_type: 'cycle',
      risk_score: 0,
    });

    edgeSigs.forEach(e => coveredEdges.add(e));

    members.forEach(n => {
      if (!nodeRingMap.has(n)) nodeRingMap.set(n, ringId);
    });
  }

  // ======================================================
  // 🔥 SMURF RINGS (FULL FAN-IN CLUSTER)
  // ======================================================
  smurfNodes.forEach(s => {
    if (merchants.has(s.node) || payrollSenders.has(s.node)) return;
    if (nodeRingMap.has(s.node)) return;

    const ringId = `RING_${String(ringCounter++).padStart(3, '0')}`;

    const senders = Array.from(
      reverseAdjacency.get(s.node)?.keys() || []
    );

    const members = [...senders, s.node];

    ringMap.set(ringId, {
      ring_id: ringId,
      member_accounts: members,
      pattern_type: 'smurfing',
      risk_score: 0,
    });

    members.forEach(n => nodeRingMap.set(n, ringId));
  });

  // ======================================================
  // 🔥 SHELL RINGS
  // ======================================================
  const seenShellSigs = new Set();

  shellChains.forEach(chain => {
    const sig = [...chain].sort().join('|');
    if (seenShellSigs.has(sig)) return;
    seenShellSigs.add(sig);

    const newMembers = chain.filter(
      n =>
        !nodeRingMap.has(n) &&
        !merchants.has(n) &&
        !payrollSenders.has(n)
    );

    if (newMembers.length === 0) return;

    const ringId = `RING_${String(ringCounter++).padStart(3, '0')}`;

    ringMap.set(ringId, {
      ring_id: ringId,
      member_accounts: chain,
      pattern_type: 'shell',
      risk_score: 0,
    });

    newMembers.forEach(n => nodeRingMap.set(n, ringId));
  });

  // ======================================================
  // 🔥 BUILD SUSPICIOUS NODE SET
  // ======================================================
  const suspiciousNodes = new Set([
    ...cycles.flat(),
    ...smurfNodes.map(s => s.node),
    ...shellChains.flat(),
  ]);

  for (const m of merchants) suspiciousNodes.delete(m);
  for (const p of payrollSenders) suspiciousNodes.delete(p);

  // ======================================================
  // 🔥 SCORING ENGINE + EXPLAINABILITY
  // ======================================================
  const suspiciousAccounts = [];

  for (const node of suspiciousNodes) {
    const { score, patterns } = scoreAccount({
      node,
      cycles,
      smurfData: smurfMap.get(node),
      shellData: shellMap.get(node),
      metrics,
      merchants,
      payrollSenders,
      nodeLevels,
    });

    if (score > 0) {
      const ringId = nodeRingMap.get(node) || null;

      // 🔥 EXPLAINABILITY META
      const meta = {
        txCount: metrics.get(node)?.txCount || 0,
        fanIn: smurfMap.get(node)?.fanIn || 0,
        fanOut: smurfMap.get(node)?.fanOut || 0,
        level: nodeLevels.get(node) || 0,
        cycleCount: cycles.filter(c => c.includes(node)).length,
        minCycleLength:
          Math.min(...cycles.filter(c => c.includes(node)).map(c => c.length)) || 0,
      };

      const explain = generateExplanation({
        account_id: node,
        patterns,
        score,
        meta,
      });

      suspiciousAccounts.push({
        account_id: node,
        suspicion_score: score,
        detected_patterns: patterns,
        ring_id: ringId,
        reasons: explain.reasons,
      });

      if (ringId && ringMap.has(ringId)) {
        const ring = ringMap.get(ringId);
        ring.risk_score = Math.max(ring.risk_score, score);
      }
    }
  }

  // ======================================================
  // 🔥 FINAL RINGS
  // ======================================================
  const suspiciousSet = new Set(
    suspiciousAccounts.map(s => s.account_id)
  );

  const fraudRings = Array.from(ringMap.values()).filter(
    r =>
      r.risk_score > 0 &&
      r.member_accounts.some(m => suspiciousSet.has(m))
  );

  const processingTime = (Date.now() - start) / 1000;
  logger.info(`Pipeline done in ${processingTime}s`);

  const graphData = buildGraphData(transactions, suspiciousSet);

  const rawOutput = formatOutput({
    suspiciousAccounts,
    fraudRings,
    totalAccounts: nodeSet.size,
    processingTime,
  });

  // ======================================================
  // 🔥 JUDGE OUTPUT ADAPTER
  // ======================================================
  const adaptedOutput = adaptOutputForJudge(rawOutput);

  return { result: adaptedOutput, graphData };
};

// ======================================================
// 🔥 GRAPH DATA FOR UI
// ======================================================
const buildGraphData = (transactions, suspiciousSet) => {
  const nodeMap = new Map();
  const edges = [];

  for (const tx of transactions) {
    if (!nodeMap.has(tx.sender_id)) {
      nodeMap.set(tx.sender_id, {
        id: tx.sender_id,
        suspicious: suspiciousSet.has(tx.sender_id),
      });
    }

    if (!nodeMap.has(tx.receiver_id)) {
      nodeMap.set(tx.receiver_id, {
        id: tx.receiver_id,
        suspicious: suspiciousSet.has(tx.receiver_id),
      });
    }

    edges.push({
      source: tx.sender_id,
      target: tx.receiver_id,
      amount: tx.amount,
      timestamp: tx.timestamp,
    });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links: edges,
  };
};

module.exports = { runPipeline };