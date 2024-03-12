const AbstractClass = require("../../utilities/abstract-class");
const knex = require("../../database/db");
const tableCategory = "category";

class CategoryModel extends AbstractClass {
  constructor() {
    super();
  }

  /**
   * The `create()` function returns a reference to the `tableCategory` in the `knex` object.
   * @returns A Knex query builder object for the "tableCategory" table is being returned.
   */
  create() {
    return knex(tableCategory);
  }

  /**
   * The `save` function asynchronously inserts a category record
   * @param {Object} category
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number[]>}
   */
  async save(category, trx = null) {
    let query = this.create().insert(category);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This async function finds an category by its ID and returns the data associated with it.
   * @param {Number} categoryId
   * @returns {Promise<this>}
   */
  async findByID(categoryId) {
    this.data = await this.create().first().where("id", categoryId);
    return this;
  }

  /**
   * The `update` function asynchronously update a category record
   * @param {Number} categoryId
   * @param {Object} category
   * @param {import("knex").Knex.Transaction|null} trx
   * @returns {Promise<Number>}
   */
  async update(categoryId, category, trx = null) {
    let query = this.create().where("id", categoryId).update(category);
    if (trx) query.transacting(trx);

    return await query;
  }

  /**
   * This asynchronous function deletes a record with a specific ID from a database table.
   * @param {Number} categoryId
   * @returns {Promise<Number>}
   */
  async delete(categoryId) {
    return await this.create().where("id", categoryId).delete();
  }
}

module.exports = CategoryModel;
