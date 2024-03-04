/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quote", (table) => {
    table.increments("id").primary().comment("Quote ID");
    table
      .integer("customer_id")
      .unsigned()
      .comment("Customer Reference")
      .references("id")
      .inTable("customer")
      .onDelete("CASCADE");
    table
      .boolean("is_active")
      .notNullable()
      .comment("Qoute/Cart Active Status");
    table.string("first_name", 50).notNullable().comment("Customer First Name");
    table.string("last_name", 50).notNullable().comment("Customer Last Name");
    table.date("date_of_birth").comment("Customer Date of Birth");
    table
      .enu("gender", ["male", "female", "others"])
      .comment("Customer Gender");
    table.string("address", 255).notNullable().comment("Customer Address");
    table.string("zip_code", 20).notNullable().comment("Customer Zip Code");
    table
      .string("email", 50)
      .notNullable()
      .unique()
      .comment("Customer Email Address");
    table.float("subtotal", 9, 2).notNullable().comment("Quote/Cart Subtotal");
    table
      .float("grandtotal", 9, 2)
      .notNullable()
      .comment("Quote/Cart Grandtotal");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("payment_item")
    .dropTableIfExists("quote_item")
    .dropTableIfExists("quote");
};
