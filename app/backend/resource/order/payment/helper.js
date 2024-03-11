const _ = require("lodash");
const Joi = require("joi");

const orderPaymentSchema = {
  id: Joi.number().greater(0).label("Order Payment ID"),
  order_id: Joi.number().greater(0).required(),
  method: Joi.string().max(10).required(),
  name: Joi.string().max(50).required(),
  grandtotal: Joi.number().greater(0).max(9999999).precision(2).required(),
  status: Joi.string()
    .valid("pending", "paid", "declined", "system_error")
    .required(),
};

function validateOrderPayment(
  orderPaymentData,
  isValidatePassedKeyOnly = false
) {
  let orderPaymentObjectSchema = orderPaymentSchema;
  if (isValidatePassedKeyOnly) {
    orderPaymentObjectSchema = _.pick(
      orderPaymentObjectSchema,
      Object.keys(orderPaymentData)
    );
  }
  const schema = Joi.object(orderPaymentObjectSchema)
    .min(1)
    .required()
    .messages({
      "object.min": "Payload is missing!",
    });

  return schema.validate(orderPaymentData, { abortEarly: false });
}

module.exports = {
  orderPaymentSchema,
  validateOrderPayment,
};
