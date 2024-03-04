const knex = require("../../../database/db");
const {
  returnModelData,
} = require("../../../utilities/object-relation-mapping");
const tableQuoteItem = "quote_item";

class QuoteItemModel {
  constructor(quoteItemData) {
    this.data = quoteItemData;
  }

  /**
   * The `create()` function returns a reference to the `tableQuoteItem` in the `knex` object.
   * @returns A Knex query builder object for the "tableQuoteItem" table is being returned.
   */
  create() {
    return knex(tableQuoteItem);
  }

  /**
   * The `save` function asynchronously inserts a quote item record
   * @param {Object} quoteItem
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {number[]}
   */
  async save(quoteItem, trx = null) {
    let query = this.create().insert(quoteItem);
    if (trx) query.transacting(trx);

    return await query;
  }

  async findByQuoteID(quoteId) {
    const quoteItems = await this.create().where("quote_id", quoteId);
    return returnModelData(QuoteItemModel, quoteItems);
  }
}

module.exports = new QuoteItemModel();
