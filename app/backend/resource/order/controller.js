const { __ } = require("../../utilities/string-formatter");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const OrderModel = require("./model");
const orderModelInstance = new OrderModel();

async function saveOrder(ctx) {
  const orderReqData = ctx.request.body;
  const orderId = await orderModelInstance.save(orderReqData);

  if (!orderId) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "order")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    orderId
  );
}

async function getOrder(ctx) {
  const orderId = ctx.params.id;
  const order = await orderModelInstance.findById(orderId);

  if (!order.data?.id) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  const items = await order.getItems();
  const orderData = {
    ...order?.data,
    items: items?.data,
  };

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    orderData
  );
}

async function updateOrder(ctx) {
  const orderId = ctx.params.id;
  const orderReqData = ctx.request.body;

  const result = await orderModelInstance.update(orderId, orderReqData);
  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteOrder(ctx) {
  const orderId = ctx.params.id;

  const result = await orderModelInstance.delete(orderId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveOrder,
  getOrder,
  updateOrder,
  deleteOrder,
};
