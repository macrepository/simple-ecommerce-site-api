/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("category", (table) => {
    table.increments("id").primary().comment("Category ID");
    table.string("name", 50).notNullable().comment("Category Name");
    table.string("thumbnail", 50).notNullable().comment("Category Thumbnail");
    table.boolean("is_active").notNullable().comment("Category Status");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("category");
};
