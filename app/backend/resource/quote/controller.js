const QuoteModel = require("./model");

async function saveQuote(ctx) {
  const quoteReqData = ctx.request.body;

  const result = await QuoteModel.save(quoteReqData);
  ctx.body = result;
}

async function getQuote(ctx) {
  const quoteId = ctx.params.id;
  const quote = await QuoteModel.findById(quoteId);
  const items = await quote.getItems();
  

  const quoteData = {
    ...quote?.data,
    items: items?.data
  };

  ctx.body = quoteData;
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
