const { __ } = require("../../../utilities/string-formatter");
const { httpResponse } = require("../../../constant/data");
const { response } = require("../../../utilities/http-response");
const QuotePaymentModel = require("./model");

const quotePaymentModelInstance = new QuotePaymentModel();

async function saveQuotePayment(ctx) {
  const quotePaymentData = ctx.request.body;

  const result = await quotePaymentModelInstance.save(quotePaymentData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "quote payment")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getQuotePayment(ctx) {
  const paymentId = ctx.params.id;

  const payment = (
    await quotePaymentModelInstance.findByID(paymentId)
  ).getData();

  if (!payment) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    payment
  );
}

async function updateQuotePayment(ctx) {
  const quotePaymentId = ctx.params.id;
  const quotePaymentData = ctx.request.body;

  const result = await quotePaymentModelInstance.update(
    quotePaymentId,
    quotePaymentData
  );

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteQuotePayment(ctx) {
  const quotePaymentId = ctx.params.id;

  const result = await quotePaymentModelInstance.delete(quotePaymentId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveQuotePayment,
  getQuotePayment,
  updateQuotePayment,
  deleteQuotePayment,
};
