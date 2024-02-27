/**
 * The function `joiErrorFormatter` formats Joi validation errors into an array of objects containing
 * the field and message of each error.
 * @param {Object} errors 
 * @returns {Object}
 */
function joiErrorFormatter(errors) {
  let formattedError = [];

  errors.forEach((error) => {
    formattedError.push({
      field: error.path[0],
      message: error.message,
    });
  });

  return formattedError;
}

module.exports = {
  joiErrorFormatter,
};
