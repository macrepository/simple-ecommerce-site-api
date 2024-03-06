const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tableCustomer = "customer";

class CustomerModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableCustomer` in the `knex` object.
   * @returns A Knex query builder object for the "tableCustomer" table is being returned.
   */
  create() {
    return knex(tableCustomer);
  }

  /**
   * The `save` function asynchronously inserts a customer record after creating a new record.
   * @param {Object} customer
   * @returns {Promise<number[]>}
   */
  async save(customer) {
    return await this.create().insert(customer);
  }

  /**
   * The `findAll` function asynchronously retrieves all customers and returns their data in a specific
   * model format.
   * @returns {Promise<this>}
   */
  async findAll() {
    this.data = await this.create();

    return this;
  }

  /**
   * The function findById asynchronously retrieves a customer by their ID and returns the data in the
   * format specified by the CustomerModel.
   * @param {Number} id
   * @returns {Promise<this>}
   */
  async findById(id) {
    this.data = await this.create().first().where("id", id);

    return this;
  }

  /**
   * The function findByEmail asynchronously retrieves a customer record based on the provided email
   * address and returns the data in the format specified by the CustomerModel.
   * @param {string} email
   * @returns {Promise<this>}
   */
  async findByEmail(email) {
    this.data = await this.create().first().where("email", email);

    return this;
  }

  /**
   * The `update` function asynchronously updates a customer record with the specified id.
   * @param {Number} id
   * @param {Object} customer
   * @returns {Promise<Number>}
   */
  async update(id, customer) {
    return await this.create().where("id", id).update(customer);
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

module.exports = CustomerModel;
