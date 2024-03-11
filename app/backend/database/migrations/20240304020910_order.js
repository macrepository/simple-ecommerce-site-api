/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("order", (table) => {
    table.increments("id").primary().comment("Order ID");
    table.integer("customer_id").notNullable().comment("Customer ID");
    table.integer("quote_id").notNullable().comment("Quote ID");
    table
      .enu("status", ["pending", "processing", "complete", "cancelled"])
      .notNullable()
      .comment("Order Status");
    table.string("first_name", 50).notNullable().comment("Customer First Name");
    table.string("last_name", 50).notNullable().comment("Customer Last Name");
    table.date("date_of_birth").comment("Customer Date of Birth");
    table
      .enu("gender", ["male", "female", "others"])
      .comment("Customer Gender");
    table.string("address", 255).notNullable().comment("Customer Address");
    table.string("zip_code", 20).notNullable().comment("Customer Zip Code");
    table.string("email", 50).notNullable().comment("Customer Email Address");
    table.float("subtotal", 9, 2).notNullable().comment("Order Subtotal");
    table.float("grandtotal", 9, 2).notNullable().comment("Order Grandtotal");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order");
};
