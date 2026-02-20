const normalizeTimestamp = (ts) => {
  if (!ts) return null;

  // judge format: YYYY-MM-DD HH:mm:ss
  // convert to ISO friendly
  const fixed = String(ts).replace(' ', 'T');

  const d = new Date(fixed);

  if (isNaN(d.getTime())) return null;

  return d.toISOString();
};

const validateTransaction = (tx) => {
  return (
    tx &&
    typeof tx.transaction_id === 'string' &&
    typeof tx.sender_id === 'string' &&
    typeof tx.receiver_id === 'string' &&
    !isNaN(tx.amount) &&
    tx.amount >= 0 &&
    typeof tx.timestamp === 'string'
  );
};

const sanitizeTransaction = (raw) => {
  const isoTimestamp = normalizeTimestamp(raw.timestamp);

  return {
    transaction_id: String(raw.transaction_id || '').trim(),
    sender_id: String(raw.sender_id || '').trim(),
    receiver_id: String(raw.receiver_id || '').trim(),
    amount: parseFloat(raw.amount),
    timestamp: isoTimestamp,
  };
};

module.exports = { validateTransaction, sanitizeTransaction };