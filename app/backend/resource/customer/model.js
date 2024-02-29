const knex = require("../../database/db");
const tableCustomer = "customer";
const { returnModelData } = require("../../utilities/object-relation-mapping");

class CustomerModel {
  constructor(customerData) {
    this.data = customerData;
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
   * @param {*} customer 
   * @returns {Array}
   */
  async save(customer) {
    return await this.create().insert(customer);
  }

  /**
   * The `findAll` function asynchronously retrieves all customers and returns their data in a specific
   * model format.
   * @returns {Array}
   */
  async findAll() {
    const customers = await this.create();

    return returnModelData(CustomerModel, customers);
  }

  /**
   * The function findById asynchronously retrieves a customer by their ID and returns the data in the
   * format specified by the CustomerModel.
   * @param {*} id 
   * @returns {Object}
   */
  async findById(id) {
    const customer = await this.create().first().where("id", id);

    return returnModelData(CustomerModel, customer);
  }

  /**
   * The function findByEmail asynchronously retrieves a customer record based on the provided email
   * address and returns the data in the format specified by the CustomerModel.
   * @param {string} email 
   * @returns {Object}
   */
  async findByEmail(email) {
    const customer = await this.create().first().where("email", email);

    return returnModelData(CustomerModel, customer);
  }


  /**
   * The `update` function asynchronously updates a customer record with the specified id.
   * @param {*} id 
   * @param {Object} customer 
   * @returns {Array}
   */
  async update(id, customer) {
    return await this.create().where("id", id).update(customer);
  }

  
  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {*} id 
   * @returns {Number|null}
   */
  async delete(id) {
    return await this.create().where("id", id).delete();
  }
}

module.exports = new CustomerModel();
