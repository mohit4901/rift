const mongoose = require('mongoose');

const AnalysisRunSchema = new mongoose.Schema({
  filename: String,
  total_transactions: Number,
  total_accounts_analyzed: Number,
  suspicious_accounts_flagged: Number,
  fraud_rings_detected: Number,
  processing_time_seconds: Number,
  result: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AnalysisRun', AnalysisRunSchema);