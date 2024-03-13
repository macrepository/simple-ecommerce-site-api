/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quote_payment", (table) => {
    table.increments("id").primary().comment("Quote Payment ID");
    table
      .integer("quote_id")
      .unsigned()
      .unique()
      .comment("Quote Reference")
      .references("id")
      .inTable("quote")
      .onDelete("CASCADE");
    table.string("method", 10).notNullable().comment("Payment Method Code");
    table.string("name", 50).notNullable().comment("Payment Method Name");
    table.float("grandtotal", 9, 2).notNullable().comment("Grandtotal");
    table
      .enu("status", ["pending", "paid", "declined", "system_error"])
      .notNullable()
      .comment("Payment Status");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("quote_payment");
};
