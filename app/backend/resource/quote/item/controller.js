const { __ } = require("../../../utilities/string-formatter");
const { httpResponse } = require("../../../constant/data");
const { response } = require("../../../utilities/http-response");
const QuoteItemModel = require("./model");

const quoteItemModelInstance = new QuoteItemModel();

async function saveQuoteItem(ctx) {
  const quoteItemData = ctx.request.body;

  const result = await quoteItemModelInstance.save(quoteItemData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "quote item")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getQuoteItem(ctx) {
  const itemId = ctx.params.id;

  const item = (await quoteItemModelInstance.findByID(itemId)).getData();

  if (!item) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    item
  );
}

module.exports = {
  saveQuoteItem,
  getQuoteItem,
};
