const { httpResponse } = require("../constant/data");
const { joiErrorFormatter } = require("../utilities/joi-error-formatter");
const { response } = require("../utilities/http-response");

function validateReqBody(validator, isValidatePassedKeyOnly = false) {
  return async (ctx, next) => {
    const { error } = validator(ctx.request.body, isValidatePassedKeyOnly);

    if (error) {
      return response(
        ctx,
        httpResponse.badRequest,
        httpResponse.badRequest.message.invalidRequest,
        joiErrorFormatter(error.details)
      );
    }

    await next();
  };
}

function validateReqId(validator) {
  return async (ctx, next) => {
    const id = ctx.params.id;
    const { error } = validator({ id }, true);

    if (error) {
      return response(
        ctx,
        httpResponse.badRequest,
        httpResponse.badRequest.message.invalidRequest,
        joiErrorFormatter(error.details)
      );
    }

    await next();
  };
}

module.exports = {
  validateReqBody,
  validateReqId,
};
