const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    // Don't exit - fallback to continue without DB
    logger.warn('Continuing without MongoDB - results will not be persisted');
  }
};

module.exports = connectDB;