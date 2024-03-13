/**
 * The function `returnModelData` takes a Model and data as input, and returns a new instance of the
 * Model with the provided data, or null if no data is provided.
 * 
 * @param {Function} Model 
 * @param {Object|null} data 
 * @returns {Object}
 */
function returnModelData(Model, data) {
  if (!data) return null;

  return new Model(data);
}

module.exports = {
  returnModelData,
};
