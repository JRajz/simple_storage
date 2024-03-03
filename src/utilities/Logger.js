const winston = require('winston');
require('winston-daily-rotate-file');
const PrettyError = require('pretty-error');

const { format, createLogger, transports } = winston;
const { combine, timestamp, printf, colorize, simple } = format;

let LoggerInstance = null;

/**
 * Initialize logger with the specified log level
 * @param {string} level - The log level to set (default is 'info')
 */
const initLogger = (level = 'info') => {
  const PEInstance = new PrettyError();
  PEInstance.skipNodeFiles(); // Skip node internal files
  PEInstance.skipPackage('winston', 'colors'); // Skip certain packages from stack trace

  // Custom log message format
  // eslint-disable-next-line no-shadow
  const customFormat = printf(({ timestamp, level, message, ...rest }) => {
    const metaString = Object.keys(rest)
      .map((key) => ` [${key}=${rest[key]}]`)
      .join('');
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  });

  LoggerInstance = createLogger({
    level,
    levels: winston.config.syslog.levels,
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      colorize(), // Add colors to console output
      simple(),
      customFormat,
    ),
    transports: [
      // Console transport
      new transports.Console(),
      // File transport for daily log rotation
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m', // Max size of each log file
        maxFiles: '14d', // Retain logs for up to 14 days
      }),
    ],
  });

  LoggerInstance.info('✅ Logger initialized'); // Log initialization message
};

// Custom error formatting using pretty-error
const formatError = (error) => {
  const PEInstance = new PrettyError();
  return PEInstance.render(error);
};

/**
 * Logs a message with the specified log level
 * @param {string} level - The log level
 * @param {string} message - The log message
 * @param {object} meta - Additional metadata
 */
const log = (level, message, meta) => {
  if (meta instanceof Error) {
    // eslint-disable-next-line no-param-reassign
    meta = {
      name: meta.name || '',
      message: meta.message,
      stack: formatError(meta), // Format error stack trace
    };
  }

  LoggerInstance.log(level, message, meta);
};

/**
 * Logs an info message
 * @param {string} message - The info message
 * @param {object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  log('info', message, meta);
};

/**
 * Logs an error message
 * @param {string} message - The error message
 * @param {Error} err - The error object
 */
const error = (message, err) => {
  log('error', message, err);
};

module.exports = { initLogger, info, error };
