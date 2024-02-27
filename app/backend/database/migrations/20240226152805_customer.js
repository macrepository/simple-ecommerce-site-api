/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("customer", (table) => {
    table.increments("id").primary().comment("Customer ID");
    table.string("first_name", 50).notNullable().comment("Customer First Name");
    table.string("last_name", 50).notNullable().comment("Customer Last Name");
    table.date("date_of_birth").comment("Customer Date of Birth");
    table
      .enu("gender", ["male", "female", "others"])
      .comment("Customer Gender");
    table.string("address", 255).comment("Customer Address");
    table.string("zip_code", 20).comment("Customer Zip Code");
    table
      .string("email", 50)
      .notNullable()
      .unique()
      .comment("Customer Email Address");
    table
      .string("password", 255)
      .notNullable()
      .comment("Customer Login Password");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("customer");
};
