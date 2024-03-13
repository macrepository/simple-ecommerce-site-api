const { __ } = require("../../utilities/string-formatter");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const ProductModel = require("./model");

const productModelInstance = new ProductModel();

async function saveProduct(ctx) {
  const productData = ctx.request.body;

  const result = await productModelInstance.save(productData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "product")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getProduct(ctx) {
  const productId = ctx.params.id;

  const product = (await productModelInstance.findByID(productId)).getData();

  if (!product) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    product
  );
}

async function updateProduct(ctx) {
  const productId = ctx.params.id;
  const productData = ctx.request.body;

  const result = await productModelInstance.update(productId, productData);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteProduct(ctx) {
  const productId = ctx.params.id;

  const result = await productModelInstance.delete(productId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
