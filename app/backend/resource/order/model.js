const _ = require("lodash");
const OrderItemModel = require("./item/model");
const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tableOrder = "order";

const orderItemModelInstance = new OrderItemModel();

class OrderModel extends AbstractClass {
  constructor() {
    super();
    this.item = orderItemModelInstance;
  }

  /**
   * The `create()` function returns a reference to the `tableOrder` in the `knex` object.
   * @returns A Knex query builder object for the "tableOrder" table is being returned.
   */
  create() {
    return knex(tableOrder);
  }

  /**
   * Save order details
   * @param {Object} orderData
   * @returns {Number}
   */
  async save(orderData) {
    return await knex.transaction(async (trx) => {
      const items = orderData?.items;
      const order = _.omit(orderData, ["items"]);
      const [orderId] = await trx(tableOrder).insert(order);

      if (items && Array.isArray(items)) {
        const orderItems = items.map((item) => {
          item.order_id = orderId;
          return item;
        });

        await this.item.save(orderItems, trx);
      }

      return orderId;
    });
  }

  /**
   * Find Order details by Order ID
   * @param {Number} orderId
   * @returns {this}
   */
  async findById(orderId) {
    this.data = await this.create().first().where("id", orderId);
    return this;
  }

  /**
   * The function findByEmail asynchronously retrieves a order record based on the provided email
   * @param {string} email
   * @returns {Promise<this>}
   */
  async findByEmail(email) {
    this.data = await this.create().first().where("email", email);

    return this;
  }

  /**
   * Get Order Items
   * @returns {OrderItemModel}
   */
  async getItems() {
    const orderId = this.data?.id;

    if (!orderId) throw new Error("Order not loaded or does not exist.");

    this.item = await this.item.findByOrderID(orderId);
    return this.item;
  }

  /**
   * The `update` function asynchronously updates a order record with the specified id.
   * @param {Number} orderId
   * @param {Object} orderData
   * @returns {Promise<Boolean>}
   */
  async update(orderId, orderData) {
    return await knex.transaction(async (trx) => {
      const { items, ...order } = orderData;
      const updateOrder = await trx(tableOrder)
        .where("id", orderId)
        .update(order);

      let updateOrderItem = [true];
      if (Array.isArray(items)) {
        updateOrderItem = await this.item.bulkUpdate(items, trx);
      }

      return updateOrder === 1 && updateOrderItem.every((r) => r === 1);
    });
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} orderId
   * @returns {Promise<Number>}
   */
  async delete(orderId) {
    return await this.create().where("id", orderId).delete();
  }
}

module.exports = OrderModel;
