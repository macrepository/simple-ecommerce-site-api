const config = require("config");
const { createLogger, format, transports } = require("winston");
const environment = config.get("nodeEnv");

// Create a logger instance with different file transfort
const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => {
      let formattedMessage = `${info.timestamp} ${info.level}: ${info.message}`;
      if (info.stack) {
        // Check if stack trace is available
        formattedMessage += `\nStack Trace:\n${info.stack}`;
      }
      return formattedMessage;
    })
  ),
  transports: [
    // Transport for error level logs
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // Transport for error level logs
    new transports.File({
      filename: "logs/warn.log",
      level: "warn",
    }),
    // Transport for error level logs
    new transports.File({
      filename: "logs/info.log",
      level: "info",
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (environment !== "production") {
  logger.add(new transports.Console());
}

module.exports = logger;
