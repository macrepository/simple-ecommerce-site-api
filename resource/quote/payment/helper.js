const _ = require("lodash");
const Joi = require("joi");

const quotePaymentSchema = {
  id: Joi.number().greater(0).label("Quote Payment ID"),
  quote_id: Joi.number().greater(0).required(),
  method: Joi.string().max(10).required(),
  name: Joi.string().max(50).required(),
  grandtotal: Joi.number().greater(0).max(9999999).precision(2).required(),
  status: Joi.string()
    .valid("pending", "paid", "declined", "system_error")
    .required(),
};

function validateQuotePayment(
  quotePaymentData,
  isValidatePassedKeyOnly = false
) {
  let quotePaymentObjectSchema = quotePaymentSchema;
  if (isValidatePassedKeyOnly) {
    quotePaymentObjectSchema = _.pick(
      quotePaymentObjectSchema,
      Object.keys(quotePaymentData)
    );
  }
  const schema = Joi.object(quotePaymentObjectSchema)
    .min(1)
    .required()
    .messages({
      "object.min": "Payload is missing!",
    });

  return schema.validate(quotePaymentData, { abortEarly: false });
}

module.exports = {
  quotePaymentSchema,
  validateQuotePayment,
};
