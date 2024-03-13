const { __ } = require("../../utilities/string-formatter");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const PaymentModel = require("./model");

const paymentModelInstance = new PaymentModel();

async function savePayment(ctx) {
  const paymentData = ctx.request.body;

  const result = await paymentModelInstance.save(paymentData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "payment")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getPayment(ctx) {
  const paymentId = ctx.params.id;

  const payment = (await paymentModelInstance.findByID(paymentId)).getData();

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

async function updatePayment(ctx) {
  const paymentId = ctx.params.id;
  const paymentData = ctx.request.body;

  const result = await paymentModelInstance.update(paymentId, paymentData);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deletePayment(ctx) {
  const paymentId = ctx.params.id;

  const result = await paymentModelInstance.delete(paymentId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  savePayment,
  getPayment,
  updatePayment,
  deletePayment,
};
