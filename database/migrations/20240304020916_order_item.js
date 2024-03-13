/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("order_item", (table) => {
    table.increments("id").primary().comment("Order ID");
    table
      .integer("order_id")
      .unsigned()
      .comment("Order Reference")
      .references("id")
      .inTable("order")
      .onDelete("CASCADE");
    table.string("name", 50).notNullable().comment("Product Name");
    table.float("price", 9, 2).notNullable().comment("Product Price");
    table.integer("quantity", 6).notNullable().comment("Product Quantity");
    table.integer("product_id").notNullable().comment("Product ID");
    table
      .float("row_total", 9, 2)
      .notNullable()
      .comment("Order Item Row Total");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_item");
};
