const { response } = require("../utilities/http-response");
const { verifyToken } = require("../utilities/json-web-token");
const { httpResponse } = require("../constant/data");

module.exports = function (ctx, next) {
  const token = ctx.get("x-auth-token");

  if (!token)
    return response(
      ctx,
      httpResponse.unauthorized,
      httpResponse.unauthorized.message.noToken
    );

  const customerObject = verifyToken(token);
  if (!customerObject) {
    return response(
      ctx,
      httpResponse.unauthorized,
      httpResponse.unauthorized.message.noToken
    );
  }

  ctx.request.body = { customer: customerObject };
  next();
};
