const { __ } = require("../../../utilities/string-formatter");
const { httpResponse } = require("../../../constant/data");
const { response } = require("../../../utilities/http-response");
const OrderItemModel = require("./model");

const orderItemModelInstance = new OrderItemModel();

async function saveOrderItem(ctx) {
  const orderItemData = ctx.request.body;

  const result = await orderItemModelInstance.save(orderItemData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "order item")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getOrderItem(ctx) {
  const itemId = ctx.params.id;

  const item = (await orderItemModelInstance.findByID(itemId)).getData();

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

async function updateOrderItem(ctx) {
  const orderItemId = ctx.params.id;
  const orderItemData = ctx.request.body;

  const result = await orderItemModelInstance.update(
    orderItemId,
    orderItemData
  );

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteOrderItem(ctx) {
  const orderItemId = ctx.params.id;

  const result = await orderItemModelInstance.delete(orderItemId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveOrderItem,
  getOrderItem,
  updateOrderItem,
  deleteOrderItem,
};
