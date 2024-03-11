const AbstractClass = require("../../../utilities/abstract-class");
const knex = require("../../../database/db");
const tableQuotePayment = "quote_payment";

class QuotePaymentModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableQuotePayment` in the `knex` object.
   * @returns A Knex query builder object for the "tableQuotePayment" table is being returned.
   */
  create() {
    return knex(tableQuotePayment);
  }

  /**
   * The `save` function asynchronously inserts a quote payment record
   * @param {Object} quotePayment
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number[]>}
   */
  async save(quotePayment, trx = null) {
    let query = this.create().insert(quotePayment);
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
   * This function retrieves quote payments based on a given quote ID and returns the data in a specific
   * model format.
   * @param {Number} quoteId
   * @returns {Promise<this>}
   */
  async findByQuoteID(quoteId) {
    this.data = await this.create().where("quote_id", quoteId);
    return this;
  }

  /**
   * The `update` function asynchronously update a quote payment record
   * @param {Number} paymentId
   * @param {Object} quotePayment
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(paymentId, quotePayment, trx = null) {
    let query = this.create().where("id", paymentId).update(quotePayment);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} quotePaymentId
   * @returns {Promise<Number>}
   */
  async delete(quotePaymentId) {
    return await this.create().where("id", quotePaymentId).delete();
  }
}

module.exports = QuotePaymentModel;
