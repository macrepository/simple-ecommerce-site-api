const { __ } = require("../../../utilities/string-formatter");
const { httpResponse } = require("../../../constant/data");
const { response } = require("../../../utilities/http-response");
const OrderPaymentModel = require("./model");

const orderPaymentModelInstance = new OrderPaymentModel();

async function saveOrderPayment(ctx) {
  const orderPaymentData = ctx.request.body;

  const result = await orderPaymentModelInstance.save(orderPaymentData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "order payment")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getOrderPayment(ctx) {
  const paymentId = ctx.params.id;

  const payment = (
    await orderPaymentModelInstance.findByID(paymentId)
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

async function updateOrderPayment(ctx) {
  const orderPaymentId = ctx.params.id;
  const orderPaymentData = ctx.request.body;

  const result = await orderPaymentModelInstance.update(
    orderPaymentId,
    orderPaymentData
  );

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteOrderPayment(ctx) {
  const orderPaymentId = ctx.params.id;

  const result = await orderPaymentModelInstance.delete(orderPaymentId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveOrderPayment,
  getOrderPayment,
  updateOrderPayment,
  deleteOrderPayment,
};
