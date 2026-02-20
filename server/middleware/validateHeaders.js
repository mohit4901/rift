const REQUIRED_HEADERS = [
  "transaction_id",
  "sender_id",
  "receiver_id",
  "amount",
  "timestamp",
];

// 🔥 SUPER SAFE NORMALIZER (judge-proof)
const normalize = (h) =>
  String(h || "")
    .replace(/\ufeff/g, "") // remove BOM
    .replace(/\r/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const validateCsvHeaders = (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No CSV uploaded" });
    }

    const raw = req.file.buffer.toString("utf8");

    // 🔥 handle ALL line endings
    const firstLine = raw.split(/\r?\n/)[0];

    const headers = firstLine.split(",").map(normalize);

    const valid = REQUIRED_HEADERS.every((h) =>
      headers.includes(h)
    );

    if (!valid) {
      console.log("❌ HEADER DEBUG");
      console.log("Expected:", REQUIRED_HEADERS);
      console.log("Received:", headers);

      return res.status(400).json({
        error: "Invalid CSV structure",
        expected: REQUIRED_HEADERS,
        received: headers,
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error: "CSV validation failed",
    });
  }
};

module.exports = validateCsvHeaders;