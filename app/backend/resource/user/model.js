const { hashPassword } = require("../../utilities/password");
const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tableUser = "user";

class UserModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableUser` in the `knex` object.
   * @returns A Knex query builder object for the "tableUser" table is being returned.
   */
  create() {
    return knex(tableUser);
  }

  /**
   * The `save` function asynchronously inserts a user record after creating a new record.
   * @param {Object|Array<Object>} user
   * @returns {Promise<number[]>}
   */
  async save(user) {
    if (Array.isArray(user)) {
      user = await Promise.all(
        user.map(async (cust) => {
          cust.password = await hashPassword(cust.password);
          return cust;
        })
      );
    } else {
      user.password = await hashPassword(user.password);
    }

    return await this.create().insert(user);
  }

  /**
   * The `findAll` function asynchronously retrieves all users and returns their data in a specific
   * model format.
   * @returns {Promise<this>}
   */
  async findAll() {
    this.data = await this.create();

    return this;
  }

  /**
   * The function findById asynchronously retrieves a user by their ID and returns the data in the
   * format specified by the UserModel.
   * @param {Number} id
   * @returns {Promise<this>}
   */
  async findById(id) {
    this.data = await this.create().first().where("id", id);

    return this;
  }

  /**
   * The function findByEmail asynchronously retrieves a user record based on the provided email
   * address and returns the data in the format specified by the UserModel.
   * @param {string} email
   * @returns {Promise<this>}
   */
  async findByEmail(email) {
    this.data = await this.create().first().where("email", email);

    return this;
  }

  /**
   * The `update` function asynchronously updates a user record with the specified id.
   * @param {Number} id
   * @param {Object} user
   * @returns {Promise<Number>}
   */
  async update(id, user) {
    return await this.create().where("id", id).update(user);
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} id
   * @returns {Promise<Number|null>}
   */
  async delete(id) {
    return await this.create().where("id", id).delete();
  }
}

module.exports = UserModel;
