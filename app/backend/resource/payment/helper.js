const _ = require("lodash");
const Joi = require("joi");

const paymentSchema = {
  id: Joi.number().greater(0).label("Payment ID"),
  is_active: Joi.boolean().required(),
  method: Joi.string().max(10).required(),
  name: Joi.string().max(50).required(),
};

function validatePayment(paymentData, isValidatePassedKeyOnly = false) {
  let paymentObjectSchema = paymentSchema;
  if (isValidatePassedKeyOnly) {
    paymentObjectSchema = _.pick(paymentObjectSchema, Object.keys(paymentData));
  }
  const schema = Joi.object(paymentObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });

  return schema.validate(paymentData, { abortEarly: false });
}

module.exports = {
  validatePayment,
};
