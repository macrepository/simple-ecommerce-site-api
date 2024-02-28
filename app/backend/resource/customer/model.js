const knex = require("../../database/db");
const tableCustomer = "customer";
const { returnModelData } = require("../../utilities/object-relation-mapping");

class CustomerModel {
  constructor(customerData) {
    this.data = customerData;
  }

  create() {
    return knex(tableCustomer);
  }

  async save(customer) {
    return await this.create().insert(customer);
  }

  async findAll() {
    const customers = await this.create();

    return returnModelData(CustomerModel, customers);
  }

  async findById(id) {
    const customer = await this.create().first().where("id", id);

    return returnModelData(CustomerModel, customer);
  }

  async findByEmail(email) {
    const customer = await this.create().first().where("email", email);

    return returnModelData(CustomerModel, customer);
  }

  async update(id, customer) {
    return await this.create().where("id", id).update(customer);
  }

  async delete(id) {
    return await this.create().where("id", id).delete();
  }
}

module.exports = new CustomerModel();
