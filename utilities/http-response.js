/**
 * The function `response` generates a response object with status, message, and optional data or error
 * based on the provided response code.
 * @param {Object} ctx
 * @param {Object} response
 * @param {string} message
 * @param {Object|string|null} body
 * @returns {Object}
 */
function response(ctx, response, message, body = null) {
  const { code, status } = response;
  ctx.status = status;
  ctx.body = {
    code,
    message,
    body
  };

  return ctx;
}

module.exports = {
  response,
};
