const config = require("config");
const knex = require("knex");
const knexFile = require("../knexfile");
const logger = require("../utilities/logger");

const environment = config.get("nodeEnv");

if (!environment) {
  logger.error("No node environment was set.");
}

module.exports = knex(knexFile[environment]);
