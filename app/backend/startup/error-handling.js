const logger = require("../utilities/logger");

// Error Handler

module.exports = function (app) {
  app.on("error", (err) => {
    logger.error("error", err);
  });

  process.on("uncaughtException", (ex) => {
    logger.error("uncaughtException", ex);
  });

  process.on("unhandledRejection", (ex) => {
    logger.error("unhandledRejection", ex);
  });
};
