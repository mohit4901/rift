const buildGraph = (transactions) => {
    const adjacency = new Map();
    const reverseAdjacency = new Map();
    const edgeMap = new Map();
    const nodeSet = new Set();
  
    for (const tx of transactions) {
      const { sender_id, receiver_id, amount, timestamp } = tx;
  
      nodeSet.add(sender_id);
      nodeSet.add(receiver_id);
  
      if (!adjacency.has(sender_id)) adjacency.set(sender_id, new Map());
      if (!adjacency.has(receiver_id)) adjacency.set(receiver_id, new Map());
      if (!reverseAdjacency.has(receiver_id)) reverseAdjacency.set(receiver_id, new Map());
      if (!reverseAdjacency.has(sender_id)) reverseAdjacency.set(sender_id, new Map());
  
      const edgeKey = `${sender_id}|${receiver_id}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, []);
        adjacency.get(sender_id).set(receiver_id, edgeMap.get(edgeKey));
        if (!reverseAdjacency.has(receiver_id)) reverseAdjacency.set(receiver_id, new Map());
        reverseAdjacency.get(receiver_id).set(sender_id, edgeMap.get(edgeKey));
      }
      edgeMap.get(edgeKey).push({ amount: parseFloat(amount), timestamp });
    }
  
    return { adjacency, reverseAdjacency, edgeMap, nodeSet };
  };
  
  module.exports = { buildGraph };