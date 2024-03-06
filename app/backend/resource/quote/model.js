const QuoteItemModel = require("./item/model");
const knex = require("../../database/db");
const tableQuote = "quote";

class QuoteModel {
  constructor(quoteData) {
    this.data = quoteData;
    this.item = QuoteItemModel;
  }

  /**
   * The `create()` function returns a reference to the `tableQuote` in the `knex` object.
   * @returns A Knex query builder object for the "tableQuote" table is being returned.
   */
  create() {
    return knex(tableQuote);
  }

  /**
   * Save quote details
   * @param {Object} quoteData
   * @returns {Number}
   */
  async save(quoteData) {
    return await knex.transaction(async (trx) => {
      const { items, ...quote } = quoteData;
      const [quoteId] = await trx(tableQuote).insert(quote);

      if (Array.isArray(items)) {
        const quoteItems = items.map((item) => {
          item.quote_id = quoteId;
          return item;
        });

        await this.item.save(quoteItems, trx);
      }

      return quoteId;
    });
  }

  /**
   * Find Quote details by Quote ID
   * @param {Number} quoteId
   * @returns {this}
   */
  async findById(quoteId) {
    this.data = await this.create().first().where("id", quoteId);
    return this;
  }

  /**
   * The function findByEmail asynchronously retrieves a quote record based on the provided email
   * @param {string} email
   * @returns {Promise<this>}
   */
  async findByEmail(email) {
    this.data = await this.create().first().where("email", email);

    return this;
  }

  /**
   * Get Quote Items
   * @returns {QuoteItemModel}
   */
  async getItems() {
    const quoteId = this.data?.id;

    if (!quoteId) throw new Error("Quote not loaded or does not exist.");

    this.item = await this.item.findByQuoteID(quoteId);
    return this.item;
  }

  /**
   * The `update` function asynchronously updates a quote record with the specified id.
   * @param {Number} quoteId
   * @param {Object} quoteData
   * @returns {Promise<Boolean>}
   */
  async update(quoteId, quoteData) {
    return await knex.transaction(async (trx) => {
      const { items, ...quote } = quoteData;
      const updateQuote = await trx(tableQuote)
        .where("id", quoteId)
        .update(quote);

      let updateQuoteItem = [true];
      if (Array.isArray(items)) {
        updateQuoteItem = await this.item.bulkUpdate(items, trx);
      }

      const result = updateQuote === 1 && updateQuoteItem.every((r) => r === 1);

      if (!result) throw new Error("Unable to update quote data.");

      return result;
    });
  }
}

module.exports = new QuoteModel();
