const REQUIRED_HEADERS = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'];

const validateHeaders = (headers) => {
  const normalized = headers.map(h => h.trim().toLowerCase());
  const missing = REQUIRED_HEADERS.filter(r => !normalized.includes(r));
  return { valid: missing.length === 0, missing };
};

const validateRow = (row, index) => {
  const errors = [];
  if (!row.transaction_id || row.transaction_id.trim() === '') errors.push(`Row ${index}: missing transaction_id`);
  if (!row.sender_id || row.sender_id.trim() === '') errors.push(`Row ${index}: missing sender_id`);
  if (!row.receiver_id || row.receiver_id.trim() === '') errors.push(`Row ${index}: missing receiver_id`);
  const amount = parseFloat(row.amount);
  if (isNaN(amount) || amount < 0) errors.push(`Row ${index}: invalid amount`);
  const ts = new Date(row.timestamp);
  if (isNaN(ts.getTime())) errors.push(`Row ${index}: invalid timestamp`);
  return errors;
};

module.exports = { validateHeaders, validateRow };