/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user", (table) => {
    table.increments("id").primary().comment("User ID");
    table.string("first_name", 50).notNullable().comment("User First Name");
    table.string("last_name", 50).notNullable().comment("User Last Name");
    table
      .string("email", 50)
      .notNullable()
      .unique()
      .comment("User Email Address");
    table.string("username", 20).notNullable().comment("User Username");
    table.string("password", 255).notNullable().comment("User Login Password");
    table.enu("role", ["admin", "order_management", "product_management"]).notNullable().comment("User Admin Role");
    table.timestamp(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("user");
};
