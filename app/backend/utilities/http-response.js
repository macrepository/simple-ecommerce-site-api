/**
 * The function `response` sets the status, body, and data/error message based on the response code and
 * message provided.
 * @param {Object} ctx
 * @param {Object} response
 * @param {Object|string|null} body
 * @returns
 */
function response(ctx, response, body = null) {
  const { code, status, message } = response;
  ctx.status = status;
  ctx.body = {
    code,
    message,
    ...(code === "success" ? { data: body || null } : { error: body || null }),
  };

  return ctx;
}

module.exports = {
  response,
};
