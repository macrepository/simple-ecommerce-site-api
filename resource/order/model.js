const _ = require("lodash");
const OrderItemModel = require("./item/model");
const OrderPaymentModel = require("./payment/model");
const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tableOrder = "order";

const orderItemModelInstance = new OrderItemModel();
const orderPaymentModelInstance = new OrderPaymentModel();

class OrderModel extends AbstractClass {
  constructor() {
    super();
    this.item = orderItemModelInstance;
    this.payment = orderPaymentModelInstance;
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
      const payment = orderData?.payment;
      const order = _.omit(orderData, ["items", "payment"]);
      const [orderId] = await trx(tableOrder).insert(order);

      if (items && Array.isArray(items)) {
        const orderItems = items.map((item) => {
          item.order_id = orderId;
          return item;
        });

        await this.item.save(orderItems, trx);
      }

      if (payment) {
        payment.order_id = orderId;

        await this.payment.save(payment, trx);
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
   * Get Order Payment
   * @returns {OrderPaymentModel}
   */
  async getPayment() {
    const orderId = this.data?.id;

    if (!orderId) throw new Error("Order not loaded or does not exist.");

    this.payment = await this.payment.findByOrderID(orderId);
    return this.payment;
  }

  /**
   * The `update` function asynchronously updates a order record with the specified id.
   * @param {Number} orderId
   * @param {Object} orderData
   * @returns {Promise<Boolean>}
   */
  async update(orderId, orderData) {
    return await knex.transaction(async (trx) => {
      const items = orderData?.items;
      const payment = orderData?.payment;
      const order = _.omit(orderData, ["items", "payment"]);

      const updateOrder = await trx(tableOrder)
        .where("id", orderId)
        .update(order);

      if (!updateOrder) return false;

      let updateOrderItems =
        items && Array.isArray(items)
          ? await this.item.bulkUpdate(items, trx)
          : [true];

      if (!updateOrderItems.every((result) => result === 1)) return false;

      return payment
        ? await this.payment.update(payment.id, payment, trx)
        : true;
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
