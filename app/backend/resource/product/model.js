const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tableProduct = "product";

class ProductModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableProduct` in the `knex` object.
   * @returns A Knex query builder object for the "tableProduct" table is being returned.
   */
  create() {
    return knex(tableProduct);
  }

  /**
   * The `save` function asynchronously inserts a product record
   * @param {Object} product
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number[]>}
   */
  async save(product, trx = null) {
    if (product && Array.isArray(product)) {
      product = product.map((p) => this.#convertGalleryToString(p));
    } else {
      product = this.#convertGalleryToString(product);
    }

    let query = this.create().insert(product);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This async function finds an product by its ID and returns the data associated with it.
   * @param {Number} productId
   * @returns {Promise<this>}
   */
  async findByID(productId) {
    const product = await this.create().first().where("id", productId);
    const gallery = product?.gallery;

    if (gallery) {
      product.gallery = gallery.split(",");
    }

    this.data = product;

    return this;
  }

  /**
   * The `update` function asynchronously update a product record
   * @param {Number} productId
   * @param {Object} product
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(productId, product, trx = null) {
    product = this.#convertGalleryToString(product);

    let query = this.create().where("id", productId).update(product);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} productId
   * @returns {Promise<Number>}
   */
  async delete(productId) {
    return await this.create().where("id", productId).delete();
  }

  #convertGalleryToString(product) {
    if (product?.gallery && Array.isArray(product.gallery)) {
      product.gallery = product.gallery.join(",");
    }
    return product;
  }
}

module.exports = ProductModel;
