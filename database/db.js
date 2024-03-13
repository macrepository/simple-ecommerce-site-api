const config = require("config");
const knex = require("knex");
const knexFile = require("../knexfile");

const environment = config.get("nodeEnv");

if (!environment) {
  throw new Error("No node environment was set.");
}

module.exports = knex(knexFile[environment]);
