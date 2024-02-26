/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("customer").del();
  await knex("customer").insert([
    {
      first_name: "john",
      last_name: "boo",
      date_of_birth: "1990-02-24",
      gender: "male",
      address: "cebu city, Philippines",
      zip_code: "6000",
      email: "test@gmail.com",
      password: "41234werfwfvwqertwertwew5g46234523452g33245",
    },
  ]);
};
