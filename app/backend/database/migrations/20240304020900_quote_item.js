/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quote_item", (table) => {
    table.increments("id").primary().comment("Quote Item ID");
    table
      .integer("quote_id")
      .unsigned()
      .comment("Quote Reference")
      .references("id")
      .inTable("quote")
      .onDelete("CASCADE");
    table.string("name", 50).notNullable().comment("Product Name");
    table.float("price", 9, 2).notNullable().comment("Product Price");
    table.integer("quantity", 6).notNullable().comment("Product Quantity");
    table.integer("product_id").comment("Product ID");
    table
      .float("row_total", 9, 2)
      .notNullable()
      .comment("Quote Item Row Total");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("quote_item");
};
