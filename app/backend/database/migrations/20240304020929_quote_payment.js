/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quote_payment", (table) => {
    table.increments("id").primary().comment("Quote Payment ID");
    table.integer("quote_id").unsigned().comment("Quote Reference");
    table.foreign("quote_id").references("quote.id");
    table.string("method", 10).notNullable().comment("Payment Method Code");
    table.string("name", 50).notNullable().comment("Payment Method Name");
    table.float("grandtotal", 9, 2).notNullable().comment("Grandtotal");
    table.enu("status", ["paid", "declined", "system_error"]).comment("Payment Status");
    table.timestamp(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("quote_payment");
};
