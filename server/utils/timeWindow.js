const HOURS_MS = 3600000;

const isWithinWindow = (ts1, ts2, hours) => {
  const diff = Math.abs(new Date(ts1).getTime() - new Date(ts2).getTime());
  return diff <= hours * HOURS_MS;
};

const groupByTimeWindow = (transactions, windowHours) => {
  if (!transactions.length) return [];
  const sorted = [...transactions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const groups = [];
  let current = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (isWithinWindow(sorted[0].timestamp, sorted[i].timestamp, windowHours)) {
      current.push(sorted[i]);
    } else {
      groups.push(current);
      current = [sorted[i]];
    }
  }
  if (current.length) groups.push(current);
  return groups;
};

module.exports = { isWithinWindow, groupByTimeWindow };