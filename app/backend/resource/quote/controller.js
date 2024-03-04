const { __ } = require("../../utilities/string-formatter");
const { joiErrorFormatter } = require("../../utilities/joi-error-formatter");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const { validateQuote } = require("./helper");
const QuoteModel = require("./model");

async function saveQuote(ctx) {
  const quoteReqData = ctx.request.body;
  const { error } = validateQuote(quoteReqData);

  if (error) {
    return response(
      ctx,
      httpResponse.badRequest,
      httpResponse.badRequest.message.invalidRequest,
      joiErrorFormatter(error.details)
    );
  }

  const quoteId = await QuoteModel.save(quoteReqData);

  if (!quoteId) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "quote")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    quoteId
  );
}

async function getQuote(ctx) {
  const quoteId = ctx.params.id;

  if (!quoteId) {
    return response(
      ctx,
      httpResponse.badRequest,
      __(httpResponse.badRequest.message.notSetKey, "quote ID")
    );
  }
  const quote = await QuoteModel.findById(quoteId);
  const items = await quote.getItems();
  const quoteData = {
    ...quote?.data,
    items: items?.data,
  };

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    quoteData
  );
}

async function updateQuote(ctx) {
  ctx.body = "updateQuote";
}

async function deleteQuote(ctx) {
  ctx.body = "deleteQuote";
}

module.exports = {
  saveQuote,
  getQuote,
  updateQuote,
  deleteQuote,
};
