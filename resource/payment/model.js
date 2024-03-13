const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tablePayment = "payment";

class PaymentModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tablePayment` in the `knex` object.
   * @returns A Knex query builder object for the "tablePayment" table is being returned.
   */
  create() {
    return knex(tablePayment);
  }

  /**
   * The `save` function asynchronously inserts a payment record
   * @param {Object} payment
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number[]>}
   */
  async save(payment, trx = null) {
    let query = this.create().insert(payment);
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
   * The `update` function asynchronously update a payment record
   * @param {Number} paymentId
   * @param {Object} payment
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(paymentId, payment, trx = null) {
    let query = this.create().where("id", paymentId).update(payment);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} paymentId
   * @returns {Promise<Number>}
   */
  async delete(paymentId) {
    return await this.create().where("id", paymentId).delete();
  }
}

module.exports = PaymentModel;
