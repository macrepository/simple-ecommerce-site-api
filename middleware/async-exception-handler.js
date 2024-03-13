const { handleExceptionRoutes } = require("../utilities/handle-exception");

module.exports.catchErrors = async function (ctx, next) {
  try {
    await next();
  } catch (exception) {
    handleExceptionRoutes(ctx, exception, ctx.request.body);
  }
};
