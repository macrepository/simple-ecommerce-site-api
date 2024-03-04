/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("product", (table) => {
    table.increments("id").primary().comment("Product ID");
    table
      .integer("category_id")
      .unsigned()
      .comment("Category Reference")
      .references("id")
      .inTable("order");
    table.string("name", 50).notNullable().comment("Product Name");
    table.float("price", 9, 2).notNullable().comment("Product Price");
    table.integer("quantity", 6).notNullable().comment("Product Quantity");
    table.text("description").comment("Product Description");
    table.boolean("is_active").notNullable().comment("Product Active Status");
    table.string("thumbnail", 50).notNullable().comment("Product Thumbnail");
    table.text("gallery").comment("Product Gallery Path in JSON Format");
    table.timestamp(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product");
};
