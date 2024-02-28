const config = require("config");

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql",
    connection: {
      host: config.get("db.dbHost"),
      user: config.get("db.dbUser"),
      password: config.get("db.dbPassword"),
      database: config.get("db.dbName"),
    },
    migrations: {
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
  production: {
    client: "mysql",
    connection: {
      host: config.get("db.dbHost"),
      user: config.get("db.dbUser"),
      password: config.get("db.dbPassword"),
      database: config.get("db.dbName"),
    },
    migrations: {
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
};
