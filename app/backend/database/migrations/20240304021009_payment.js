/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("payment", (table) => {
    table.increments("id").primary().comment("Payment ID");
    table
      .boolean("is_active")
      .notNullable()
      .comment("Payment Method Active Status");
    table.string("method", 10).notNullable().comment("Payment Method Code");
    table.string("name", 50).notNullable().comment("Payment Method Name");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("payment");
};
