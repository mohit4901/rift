const { parse } = require('csv-parse/sync');
const { sanitizeTransaction, validateTransaction } = require('../../utils/validators/dataValidator');
const logger = require('../../utils/logger');

const parseCSVBuffer = (buffer) => {
  const content = buffer.toString('utf8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
  });

  const transactions = [];
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const raw = records[i];

      const sanitized = sanitizeTransaction(raw);

      if (validateTransaction(sanitized) && sanitized.timestamp) {
        transactions.push(sanitized);
      } else {
        errors.push({
          row: i + 2,
          message: "Invalid transaction format",
        });
      }
    } catch (e) {
      errors.push({
        row: i + 2,
        message: e.message,
      });
    }
  }

  if (errors.length > 0) {
    logger.warn(`CSV parse warnings: ${errors.length} rows skipped`);
  }

  // 🔥 VERY IMPORTANT — RETURN OBJECT NOT ARRAY
  return {
    transactions,
    errors,
  };
};

module.exports = { parseCSVBuffer };