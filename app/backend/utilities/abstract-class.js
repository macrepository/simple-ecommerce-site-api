class AbstractClass {
  constructor(data) {
    if (new.target === AbstractClass) {
      throw new TypeError(
        "Cannot construct instances of an abstract class directly."
      );
    }

    this.data = data;
  }

  /**
   * The `getData` function returns the data property if it exists, otherwise it returns null.
   * @returns {Object|null}
   */
  getData() {
    if (!this.data) return null;

    if (Array.isArray(this.data) && this.data.length === 0) return null;

    return this.data;
  }
}

module.exports = AbstractClass;
