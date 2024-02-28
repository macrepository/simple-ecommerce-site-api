const { response } = require("../utilities/http-response");
const { verifyToken } = require("../utilities/json-web-token");
const { httpResponse } = require("../constant/data");

module.exports = function (ctx, next) {
  const token = ctx.get("x-auth-token");

  if (!token)
    return response(
      ctx,
      httpResponse.unauthorized,
      "Access denied. No token key provided"
    );

  const customerObject = verifyToken(token);
  if (!customerObject) {
    return response(
      ctx,
      httpResponse.unauthorized,
      "Access denied. No token key provided"
    );
  }

  ctx.request.body = { customer: customerObject };
  next();
};
