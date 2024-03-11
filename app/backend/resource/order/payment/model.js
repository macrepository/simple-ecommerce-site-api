const AbstractClass = require("../../../utilities/abstract-class");
const knex = require("../../../database/db");
const tableOrderPayment = "order_payment";

class OrderPaymentModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableOrderPayment` in the `knex` object.
   * @returns A Knex query builder object for the "tableOrderPayment" table is being returned.
   */
  create() {
    return knex(tableOrderPayment);
  }

  /**
   * The `save` function asynchronously inserts a order payment record
   * @param {Object} orderPayment
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number[]>}
   */
  async save(orderPayment, trx = null) {
    let query = this.create().insert(orderPayment);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This async function finds an payment by its ID and returns the data associated with it.
   * @param {Number} paymentId
   * @returns {Promise<this>}
   */
  async findByID(paymentId) {
    this.data = await this.create().first().where("id", paymentId);
    return this;
  }

  /**
   * This function retrieves order payments based on a given order ID and returns the data in a specific
   * model format.
   * @param {Number} orderId
   * @returns {Promise<this>}
   */
  async findByOrderID(orderId) {
    this.data = await this.create().where("order_id", orderId);
    return this;
  }

  /**
   * The `update` function asynchronously update a order payment record
   * @param {Number} paymentId
   * @param {Object} orderPayment
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(paymentId, orderPayment, trx = null) {
    let query = this.create().where("id", paymentId).update(orderPayment);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} orderPaymentId
   * @returns {Promise<Number>}
   */
  async delete(orderPaymentId) {
    return await this.create().where("id", orderPaymentId).delete();
  }
}

module.exports = OrderPaymentModel;
