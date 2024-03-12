const { __ } = require("../../utilities/string-formatter");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const CategoryModel = require("./model");

const categoryModelInstance = new CategoryModel();

async function saveCategory(ctx) {
  const categoryData = ctx.request.body;

  const result = await categoryModelInstance.save(categoryData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "category")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

async function getCategory(ctx) {
  const categoryId = ctx.params.id;

  const category = (await categoryModelInstance.findByID(categoryId)).getData();

  if (!category) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    category
  );
}

async function updateCategory(ctx) {
  const categoryId = ctx.params.id;
  const categoryData = ctx.request.body;

  const result = await categoryModelInstance.update(categoryId, categoryData);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

async function deleteCategory(ctx) {
  const categoryId = ctx.params.id;

  const result = await categoryModelInstance.delete(categoryId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

module.exports = {
  saveCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
