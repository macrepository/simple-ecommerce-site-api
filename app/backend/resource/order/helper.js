const { orderItemSchema } = require("./item/helper");
const { orderPaymentSchema } = require("./payment/helper");
const moment = require("moment");
const Joi = require("joi");
const _ = require("lodash");

const orderSchema = {
  id: Joi.number().greater(0).label("Order ID"),
  customer_id: Joi.number().greater(0).required(),
  quote_id: Joi.number().greater(0).required(),
  status: Joi.string()
    .valid("pending", "processing", "complete", "cancelled")
    .required(),
  first_name: Joi.string().max(50).required(),
  last_name: Joi.string().max(50).required(),
  date_of_birth: Joi.custom((value, helpers) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      return helpers.message("{{#label}} must be in YYYY-MM-DD format.");
    }

    if (moment(value).isAfter(moment().startOf("day"))) {
      return helpers.message("{{#label}} must be not in future.");
    }

    return value;
  }),
  gender: Joi.string().valid("male", "female", "others"),
  address: Joi.string().max(255).required(),
  zip_code: Joi.string().max(20).required(),
  email: Joi.string().max(50).email({ allowFullyQualified: true }).required(),
  subtotal: Joi.number().greater(0).max(9999999).precision(2).required(),
  grandtotal: Joi.number().greater(0).max(9999999).precision(2).required(),
  items: Joi.array().items({
    ...orderItemSchema,
    order_id: Joi.number().greater(0),
  }),
  payment: Joi.object({
    ...orderPaymentSchema,
    order_id: Joi.number().greater(0),
  }),
};

/**
 * Validate order data
 * @param {Object} orderData
 * @param {boolean} isValidatePassedKeyOnly
 * @returns {Object}
 */
function validateOrder(orderData, isValidatePassedKeyOnly = false) {
  let orderObjectSchema = orderSchema;
  if (isValidatePassedKeyOnly) {
    orderObjectSchema = _.pick(orderObjectSchema, Object.keys(orderData));
  }
  const schema = Joi.object(orderObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });
  return schema.validate(orderData, { abortEarly: false });
}

module.exports = {
  validateOrder,
};
