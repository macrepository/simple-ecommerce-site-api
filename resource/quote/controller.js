const { __ } = require("../../utilities/string-formatter");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const QuoteModel = require("./model");
const quoteModelInstance = new QuoteModel();

async function saveQuote(ctx) {
  const quoteReqData = ctx.request.body;
  const quoteId = await quoteModelInstance.save(quoteReqData);

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
  const quote = await quoteModelInstance.findById(quoteId);

  if (!quote.data?.id) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

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
  const quoteId = ctx.params.id;
  const quoteReqData = ctx.request.body;

  const result = await quoteModelInstance.update(quoteId, quoteReqData);
  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteQuote(ctx) {
  const quoteId = ctx.params.id;

  const result = await quoteModelInstance.delete(quoteId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveQuote,
  getQuote,
  updateQuote,
  deleteQuote,
};
