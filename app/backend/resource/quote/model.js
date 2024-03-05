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
   * @returns {number}
   */
  async save(quoteData) {
    return await knex.transaction(async (trx) => {
      const { items, ...quote } = quoteData;
      const [quoteId] = await trx(tableQuote).insert(quote);

      if (Array.isArray(quoteData.items)) {
        const quoteItems = quoteData.items.map((item) => {
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
   * @param {number} quoteId
   * @returns {this}
   */
  async findById(quoteId) {
    this.data = await this.create().first().where("id", quoteId);
    return this;
  }

  /**
   * The function findByEmail asynchronously retrieves a quote record based on the provided email
   * address and returns the data in the format specified by the CustomerModel.
   * @param {string} email 
   * @returns {Object}
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
}

module.exports = new QuoteModel();
