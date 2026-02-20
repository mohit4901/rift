const express = require('express');
const router = express.Router();

const upload = require('../middleware/csvMemoryUpload');
const validateCsvHeaders = require('../middleware/validateHeaders');
const { analyzeCSV } = require('../controllers/analysisController');


router.post(
  '/analyze',
  upload.single('file'),
  validateCsvHeaders,
  analyzeCSV
);

module.exports = router;