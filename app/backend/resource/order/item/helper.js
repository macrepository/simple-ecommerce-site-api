const _ = require("lodash");
const Joi = require("joi");

const orderItemSchema = {
  id: Joi.number().greater(0).label("Order Item ID"),
  order_id: Joi.number().greater(0).required(),
  name: Joi.string().max(50).required(),
  price: Joi.number().greater(0).max(9999999).precision(2).required(),
  quantity: Joi.number().min(1).max(999999).required(),
  product_id: Joi.number().greater(0).required(),
  row_total: Joi.number().greater(0).max(9999999).precision(2).required(),
};

/**
 *
 * @param {Object} orderItemData
 * @param {boolean} isValidatePassedKeyOnly
 * @returns {Object}
 */
function validateOrderItem(orderItemData, isValidatePassedKeyOnly = false) {
  let orderItemObjectSchema = orderItemSchema;
  if (isValidatePassedKeyOnly) {
    orderItemObjectSchema = _.pick(
      orderItemObjectSchema,
      Object.keys(orderItemData)
    );
  }
  const schema = Joi.object(orderItemObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });

  return schema.validate(orderItemData, { abortEarly: false });
}

module.exports = {
  orderItemSchema,
  validateOrderItem,
};
