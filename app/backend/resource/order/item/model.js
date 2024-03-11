const AbstractClass = require("../../../utilities/abstract-class");
const knex = require("../../../database/db");
const tableOrderItem = "order_item";

class OrderItemModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableOrderItem` in the `knex` object.
   * @returns A Knex query builder object for the "tableOrderItem" table is being returned.
   */
  create() {
    return knex(tableOrderItem);
  }

  /**
   * The `save` function asynchronously inserts a order item record
   * @param {Object} orderItem
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number[]>}
   */
  async save(orderItem, trx = null) {
    let query = this.create().insert(orderItem);
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
   * This function retrieves order items based on a given order ID and returns the data in a specific
   * model format.
   * @param {Number} orderId
   * @returns {Promise<this>}
   */
  async findByOrderID(orderId) {
    this.data = await this.create().where("order_id", orderId);
    return this;
  }

  /**
   * The `update` function asynchronously update a order item record
   * @param {Number} itemId
   * @param {Object} orderItem
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(itemId, orderItem, trx = null) {
    let query = this.create().where("id", itemId).update(orderItem);
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
        .andWhere("order_id", item.order_id)
        .update(item);
      if (trx) query.transacting(trx);

      return query;
    });

    return await Promise.all(updateItems);
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} orderItemId
   * @returns {Promise<Number>}
   */
  async delete(orderItemId) {
    return await this.create().where("id", orderItemId).delete();
  }
}

module.exports = OrderItemModel;
