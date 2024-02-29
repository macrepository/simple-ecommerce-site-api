const { handleExceptionRoutes } = require("../utilities/handle-exception");

module.exports.catchErrors = function (handler) {
  return async (ctx, next) => {
    try {
      await handler(ctx);
    } catch (exception) {
      handleExceptionRoutes(ctx, exception, ctx.request.body);
      next(exception);
    }
  };
};
