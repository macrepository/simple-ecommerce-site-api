/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("order_payment", (table) => {
    table.increments("id").primary().comment("Order Payment ID");
    table
      .integer("order_id")
      .unsigned()
      .comment("Order Reference")
      .references("id")
      .inTable("order")
      .onDelete("CASCADE");
    table.string("method", 10).notNullable().comment("Payment Method Code");
    table.string("name", 50).notNullable().comment("Payment Method Name");
    table.float("grandtotal", 9, 2).notNullable().comment("Payment Grandtotal");
    table
      .enu("status", ["paid", "declined", "system_error"])
      .notNullable()
      .comment("Payment Status");
    table.timestamp(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_payment");
};
