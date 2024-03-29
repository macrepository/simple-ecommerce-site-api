const AbstractClass = require("../../../utilities/abstract-class");
const knex = require("../../../database/db");
const tableQuoteItem = "quote_item";

class QuoteItemModel extends AbstractClass {
  constructor() {
    super();
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
   * @returns {Promise<Number[]>}
   */
  async save(quoteItem, trx = null) {
    let query = this.create().insert(quoteItem);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This async function finds an item by its ID and returns the data associated with it.
   * @param {Number} itemId
   * @returns {Promise<this>}
   */
  async findByID(itemId) {
    this.data = await this.create().first().where("id", itemId);
    return this;
  }

  /**
   * This function retrieves quote items based on a given quote ID and returns the data in a specific
   * model format.
   * @param {Number} quoteId
   * @returns {Promise<this>}
   */
  async findByQuoteID(quoteId) {
    this.data = await this.create().where("quote_id", quoteId);
    return this;
  }

  /**
   * The `update` function asynchronously update a quote item record
   * @param {Number} itemId
   * @param {Object} quoteItem
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(itemId, quoteItem, trx = null) {
    let query = this.create().where("id", itemId).update(quoteItem);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * The `bulkUpdate` function asynchronously updates multiple items in a database transaction if
   * provided.
   * @param {Array<Object>} items
   * @param {import("knex").Knex.Transaction|null} trx
   * @return {Promise<Number[]>}
   */
  async bulkUpdate(items, trx = null) {
    const updateItems = items.map((item) => {
      const itemId = item.id;
      delete item.id;

      const query = this.create()
        .where("id", itemId)
        .andWhere("quote_id", item.quote_id)
        .update(item);
      if (trx) query.transacting(trx);

      return query;
    });

    return await Promise.all(updateItems);
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} quoteItemId
   * @returns {Promise<Number>}
   */
  async delete(quoteItemId) {
    return await this.create().where("id", quoteItemId).delete();
  }
}

module.exports = QuoteItemModel;
